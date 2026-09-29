import { useState } from 'react';
import Header from './components/Header.jsx';
import SymptomSelector from './components/SymptomSelector.jsx';
import PredictionResult from './components/PredictionResult.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import { symptoms } from './data/symptoms.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export default function App() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toggle = (symptom) => {
    setSelected((items) => items.includes(symptom) ? items.filter((item) => item !== symptom) : [...items, symptom]);
    setResult(''); setError('');
  };
  async function predict(event) {
    event.preventDefault();
    if (loading) return;
    if (!selected.length) { setResult(''); setError('Select at least one symptom before requesting a prediction.'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      const response = await fetch(`${API_URL}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symptoms: selected }) });
      if (!response.ok) throw new Error(`The prediction service returned an error (HTTP ${response.status}). Please try again.`);
      let data;
      try { data = await response.json(); } catch { throw new Error('The prediction service returned an unreadable response. Please try again.'); }
      if (typeof data?.predicted_disease !== 'string' || !data.predicted_disease.trim()) throw new Error('The prediction service response was missing a valid predicted disease.');
      setResult(data.predicted_disease.trim());
    } catch (requestError) {
      setError(requestError instanceof TypeError ? 'Could not reach the prediction service. Check that FastAPI is running and that its CORS settings allow this frontend.' : requestError.message || 'Something went wrong while requesting a prediction.');
    } finally { setLoading(false); }
  }
  return <div className="app-shell" id="home">
    <Header />
    <main>
      <section className="hero"><div className="hero-copy"><div className="hero-kicker"><i /> SYMPTOM-BASED ML TOOL</div><h1>Understand your symptoms<span>.</span></h1><p>A learning project exploring how machine learning can find patterns between symptoms and possible conditions.</p></div><div className="hero-art" aria-hidden="true"><div className="art-ring"/><div className="art-ring inner"/><div className="art-card"><b>⌁</b><i/><i/><i/></div><span>✳</span></div></section>
      <div className="workspace-heading" id="predict"><div><div className="eyebrow">SYMPTOM CHECKER</div><h2>Let’s get started</h2></div><div className="privacy-note">◈ Your selections are only used for this prediction</div></div>
      <form className="workspace" onSubmit={predict}>
        <SymptomSelector symptoms={symptoms} selected={selected} onToggle={toggle} onClear={() => { setSelected([]); setResult(''); setError(''); }} />
        <div className="right-column"><PredictionResult result={result} loading={loading} error={error}/><button className="predict-button" type="submit" disabled={loading}>{loading ? <><i className="button-spinner"/>Predicting…</> : <>Predict Disease <span>→</span></>}</button><p className="button-hint">Select one or more symptoms to continue</p></div>
      </form>
      <Disclaimer />
    </main>
    <footer className="footer"><span>Healthwise · Disease Prediction System</span><span>Built as a college machine learning project</span></footer>
  </div>;
}
