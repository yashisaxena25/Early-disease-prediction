import { useMemo, useState } from 'react';
import { searchNearbyCare } from '../services/api.js';

function specialistTerms(label = '') {
  const terms = label.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 3);
  const aliases = {
    cardiologist: ['cardiology', 'cardiologist', 'heart'], dermatologist: ['dermatology', 'dermatologist', 'skin'],
    neurologist: ['neurology', 'neurologist'], pulmonologist: ['pulmonology', 'pulmonologist', 'respiratory'],
    gastroenterologist: ['gastroenterology', 'gastroenterologist'], orthopedist: ['orthopedic', 'orthopaedic', 'orthopedist'],
    psychiatrist: ['psychiatry', 'psychiatrist', 'mental health'], gynecologist: ['gynecology', 'gynaecology', 'gynecologist'],
    urologist: ['urology', 'urologist'], ophthalmologist: ['ophthalmology', 'ophthalmologist', 'eye'],
  };
  return [...new Set([...terms, ...Object.entries(aliases).filter(([, values]) => values.some((v) => label.toLowerCase().includes(v))).flatMap(([, values]) => values)])];
}

export default function Consultants({ result }) {
  const [location, setLocation] = useState('');
  const [origin, setOrigin] = useState(null);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [searchNote, setSearchNote] = useState('');
  const [lastSearch, setLastSearch] = useState(null);
  const recommended = result?.information?.specialist || '';
  const terms = useMemo(() => specialistTerms(recommended), [recommended]);

  async function searchNearby(query = location, coordinates = null) {
    if (!query.trim()) { setError('Enter a city, address or postal code to search.'); return; }
    setLastSearch({ query, coordinates });
    setStatus('loading'); setError(''); setSearchNote(''); setPlaces([]);
    try {
      const data = await searchNearbyCare(coordinates
        ? { latitude: coordinates.lat, longitude: coordinates.lon }
        : { location: query.trim() });
      const point = { lat: data.origin.latitude, lon: data.origin.longitude };
      setOrigin({ ...point, label: data.origin.label });
      const found = (data.places || []).map((place) => {
        const searchable = `${place.name} ${place.type} ${place.tags?.speciality || ''} ${place.tags?.['healthcare:speciality'] || ''}`.toLowerCase();
        return { ...place, specialtyMatch: terms.some((term) => searchable.includes(term)) };
      }).sort((a, b) => Number(b.specialtyMatch) - Number(a.specialtyMatch) || a.distance - b.distance).slice(0, 30);
      setPlaces(found);
      setSearchNote(data.stale ? 'Live map servers are unavailable; showing a saved search from this past hour.' : data.cached ? 'Showing a recent cached search.' : data.fallback_used ? 'The primary map server was busy; results came from a backup.' : '');
      setStatus('done');
    } catch (requestError) {
      setStatus('error'); setError(requestError.message || 'Could not search nearby care locations.');
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError('This browser does not support location access. Enter your location instead.'); return; }
    setError(''); setStatus('loading');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLocation(`${coords.latitude}, ${coords.longitude}`);
      searchNearby('Your location', { lat: coords.latitude, lon: coords.longitude });
    }, () => { setStatus('idle'); setError('Location access was not available. Enter your city or postal code instead.'); }, { enableHighAccuracy: false, timeout: 10000 });
  }

  return (
    <section className="care-section" id="nearby-care">
      <div className="care-heading">
        <div><div className="eyebrow">CARE NEAR YOU</div><h2>Find nearby care</h2><p>Search clinics and hospitals near you, with {recommended ? 'your recommended specialty highlighted.' : 'specialists ranked when a prediction is available.'}</p></div>
        <span className="care-heading-icon" aria-hidden="true">⌖</span>
      </div>
      <form className="location-search" onSubmit={(event) => { event.preventDefault(); searchNearby(); }}>
        <label className="location-input"><span aria-hidden="true">⌕</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, address or postal code" aria-label="Your location" /></label>
        <button className="search-care-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Searching…' : 'Search nearby'}</button>
        <button className="use-location-button" type="button" onClick={useMyLocation} disabled={status === 'loading'}>◎ <span>Use my location</span></button>
      </form>
      {recommended && <div className="specialty-context"><span>✳</span><div><small>Suggested specialty based on your result</small><strong>{recommended}</strong></div></div>}
      {error && <div className="care-search-error"><p className="care-message error" role="alert">{error}</p>{status === 'error' && lastSearch && <button type="button" onClick={() => searchNearby(lastSearch.query, lastSearch.coordinates)}>Try again</button>}</div>}
      {status === 'idle' && <div className="care-empty"><span>⌖</span><strong>Start with a location</strong><p>We’ll look for listed care facilities within about 10 km.</p></div>}
      {status === 'loading' && <div className="care-empty"><i className="spinner"/><strong>Looking nearby…</strong><p>Searching OpenStreetMap care listings.</p></div>}
      {status === 'done' && <>
        <div className="results-caption"><span>{places.length ? `${places.length} care locations` : 'No care locations found'} {origin && `near ${origin.label}`}</span><small>Within 10 km</small></div>
        {searchNote && <p className="care-search-note">{searchNote}</p>}
        {places.length ? <div className="care-results">{places.map((place) => {
          const address = [place.tags['addr:street'], place.tags['addr:city'] || place.tags['addr:suburb']].filter(Boolean).join(', ');
          const mapsUrl = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=17/${place.lat}/${place.lon}`;
          return <article className="care-result" key={place.id}>
            <div className="facility-icon">✚</div><div className="facility-details"><div className="facility-title"><h3>{place.name}</h3>{place.specialtyMatch && <span>Specialty match</span>}</div><p>{place.type}{address ? ` · ${address}` : ''}</p><div className="facility-meta"><span>{place.distance.toFixed(1)} km away</span>{place.tags.phone && <a href={`tel:${place.tags.phone}`}>{place.tags.phone}</a>}</div></div><a className="map-link" href={mapsUrl} target="_blank" rel="noreferrer" aria-label={`Open ${place.name} in OpenStreetMap`}>↗</a>
          </article>;
        })}</div> : <div className="care-empty compact"><strong>No listings in this area yet</strong><p>Try a nearby town or a larger city. OpenStreetMap coverage varies by area.</p></div>}
      </>}
      <p className="map-attribution">Your location is sent to OpenStreetMap to find listings. Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Check details and availability directly with each facility.</p>
    </section>
  );
}
