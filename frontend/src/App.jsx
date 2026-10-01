import { useEffect, useState } from 'react';
import AuthGate from './components/AuthGate.jsx';
import Header from './components/Header.jsx';
import SymptomSelector from './components/SymptomSelector.jsx';
import PredictionResult from './components/PredictionResult.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import History from './components/History.jsx';
import Consultants from './components/Consultants.jsx';
import HealthChat from './components/HealthChat.jsx';
import { symptoms } from './data/symptoms.js';
import { predictSymptoms } from './services/api.js';
import { getSession, signOutSession } from './services/auth.js';

const FEATURES = [
  { id: 'predict', icon: '✳', number: '01', title: 'Know your symptoms', description: 'Explore a possible condition based on what you’re feeling.', action: 'Check symptoms', tone: 'mint' },
  { id: 'chat', icon: '✧', number: '02', title: 'Talk to the health guide', description: 'Get practical, general steps for mild symptoms and know when to seek care.', action: 'Start a chat', tone: 'blue' },
  { id: 'care', icon: '⌖', number: '03', title: 'Find care nearby', description: 'Search clinics and hospitals around a location you choose.', action: 'Explore nearby care', tone: 'violet' },
  { id: 'history', icon: '◷', number: '04', title: 'Your recent checks', description: 'Pick up where you left off and review past symptom checks.', action: 'View history', tone: 'amber' },
];

export default function App() {
  const [session, setSession] = useState(undefined);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState('dashboard');

  useEffect(() => { getSession().then(setSession); }, []);

  if (session === undefined) return <div className="auth-loading">Opening your health space…</div>;
  if (!session) return <AuthGate onAuthenticated={setSession} />;

  const toggle = (symptom) => {
    setSelected((items) => items.includes(symptom) ? items.filter((item) => item !== symptom) : [...items, symptom]);
    setResult(null);
    setError('');
  };

  async function predict(event) {
    event.preventDefault();
    if (loading) return;
    if (!selected.length) {
      setResult(null);
      setError('Choose at least one symptom to continue.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await predictSymptoms(selected, session.access_token);
      if (typeof data?.predicted_disease !== 'string' || !data.predicted_disease.trim()) throw new Error('The prediction service returned an incomplete result. Please try again.');
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Could not reach the prediction service. Check that the API is running and its CORS settings allow this frontend.'
        : requestError.message || 'Something went wrong while requesting a prediction.');
    } finally { setLoading(false); }
  }

  function openPage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPage() {
    if (page === 'dashboard') return <>
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <div className="hero-kicker"><i /> A LITTLE CLARITY, WHEN YOU NEED IT</div>
          <h1>Body ka scene?<br /><span>Hum decode karein.</span></h1>
          <p>Start with what you’re feeling. We’ll help you explore possible next steps and nearby care.</p>
          <button type="button" className="hero-cta" onClick={() => openPage('predict')}>Start a symptom check <span>↗</span></button>
        </div>
        <div className="dashboard-orbit" aria-hidden="true"><div className="orbit-line orbit-one"/><div className="orbit-line orbit-two"/><div className="orbit-core">✚</div><span className="orbit-dot dot-one">✦</span><span className="orbit-dot dot-two">+</span></div>
        <div className="dashboard-greeting"><span className="greeting-avatar">{(session.user?.email || 'U').charAt(0).toUpperCase()}</span><span><small>YOUR PERSONAL HEALTH SPACE</small><strong>{session.user?.email?.split('@')[0] || 'Welcome back'}</strong></span></div>
      </section>
      <section className="feature-section" aria-labelledby="feature-heading">
        <div className="feature-heading"><div><div className="eyebrow">HOW CAN WE HELP?</div><h2 id="feature-heading">Choose your next step</h2><p>Pick what feels useful right now. You can come back here anytime.</p></div><span className="feature-heading-mark">✳</span></div>
        <div className="feature-grid">{FEATURES.map((feature) => <button type="button" key={feature.id} className={`feature-card ${feature.tone}`} onClick={() => openPage(feature.id)}><div className="feature-card-top"><span className="feature-icon">{feature.icon}</span><span className="feature-number">{feature.number}</span></div><h3>{feature.title}</h3><p>{feature.description}</p><span className="feature-action">{feature.action}<b>→</b></span><span className="feature-glow" aria-hidden="true" /></button>)}</div>
      </section>
      <Disclaimer />
    </>;

    if (page === 'predict') return <>
      <PageHeading eyebrow="SYMPTOM CHECK" title="Let’s make sense of it" description="Choose the symptoms you’re experiencing to explore a possible condition." onBack={() => openPage('dashboard')} />
      <form className="workspace" onSubmit={predict}>
        <SymptomSelector symptoms={symptoms} selected={selected} onToggle={toggle} onClear={() => { setSelected([]); setResult(null); setError(''); }} />
        <div className="right-column"><PredictionResult result={result} loading={loading} error={error} /><button className="predict-button" type="submit" disabled={loading}>{loading ? <><i className="button-spinner" />Checking…</> : <>Explore result <span>→</span></>}</button><p className="button-hint">Your result is general information, not a diagnosis.</p></div>
      </form>
      <Disclaimer />
      {result && <div className="result-next-step"><span>✧</span><div><strong>Want to talk it through?</strong><p>Ask the health guide or find a care provider near you.</p></div><button type="button" onClick={() => openPage('care')}>Find nearby care <b>→</b></button><button type="button" className="subtle-next" onClick={() => openPage('chat')}>Chat now</button></div>}
    </>;

    if (page === 'chat') return <><PageHeading eyebrow="HERE TO HELP" title="Talk to the health guide" description="Ask about a symptom and get calm, practical general guidance." onBack={() => openPage('dashboard')} /><HealthChat /></>;
    if (page === 'care') return <><PageHeading eyebrow="CARE NEAR YOU" title="Find a doctor nearby" description="Enter a place or use your location to see clinics and hospitals in the area." onBack={() => openPage('dashboard')} /><Consultants result={result} /></>;
    return <><PageHeading eyebrow="YOUR ACTIVITY" title="Recent symptom checks" description="Review the predictions saved to your account." onBack={() => openPage('dashboard')} /><History accessToken={session.access_token} refreshKey={result?.id} /></>;
  }

  return <div className="app-shell" id="home">
    <Header userEmail={session.user?.email} activePage={page} onHome={() => openPage('dashboard')} onSignOut={async () => { await signOutSession(); setSession(null); }} />
    <main className={page === 'dashboard' ? 'dashboard-main' : 'feature-main'}>{renderPage()}</main>
    <footer className="footer"><span>Oye-Tabiyat · Your everyday health companion</span><span>Take care, one step at a time.</span></footer>
  </div>;
}

function PageHeading({ eyebrow, title, description, onBack }) {
  return <div className="page-heading"><button type="button" className="back-home" onClick={onBack}>← <span>All tools</span></button><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>;
}
