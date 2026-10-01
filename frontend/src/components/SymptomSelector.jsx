import { useMemo, useState } from 'react';
import VoiceInput from './VoiceInput.jsx';
export default function SymptomSelector({ symptoms, selected, onToggle, onClear }) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => { const q = query.trim().toLowerCase(); return q ? symptoms.filter((s) => s.toLowerCase().includes(q)) : symptoms; }, [query, symptoms]);
  return <section className="card symptom-card" aria-labelledby="symptom-heading"><div className="section-heading"><div><div className="eyebrow">STEP 01 <span>·</span> YOUR SYMPTOMS</div><h2 id="symptom-heading">What are you experiencing?</h2><p>Choose all symptoms that apply. Search the full list.</p></div><div className="selected-count" aria-live="polite"><b>{selected.length}</b><small>selected</small></div></div>
    <VoiceInput symptoms={symptoms} selected={selected} onAdd={onToggle}/>
    <label className="search-box"><span aria-hidden="true">⌕</span><span className="sr-only">Search symptoms</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search symptoms, e.g. headache"/>{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}</label>
    {selected.length > 0 && <div className="selected-panel"><b>Selected symptoms</b><div className="selected-chips">{selected.map((s) => <button className="selected-chip" type="button" key={s} onClick={() => onToggle(s)} aria-label={`Remove ${s}`}>{s}<span>×</span></button>)}<button className="text-button" type="button" onClick={onClear}>Clear all</button></div></div>}
    <div className="symptom-list" role="group" aria-label="Available symptoms">{visible.length ? visible.map((s) => { const checked = selected.includes(s); return <label className={`symptom-option${checked ? ' selected' : ''}`} key={s}><input type="checkbox" checked={checked} onChange={() => onToggle(s)}/><span className="check" aria-hidden="true">{checked ? '✓' : ''}</span><span>{s}</span></label>; }) : <p className="no-results">No symptoms match “{query}”. Try another search.</p>}</div>
    <div className="list-footer">Showing {visible.length} of {symptoms.length} symptoms <span>· Scroll this list or search to browse all symptoms</span></div>
  </section>;
}

