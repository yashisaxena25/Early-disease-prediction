import { useEffect, useState } from "react";
import { fetchPredictionHistory } from '../services/api.js';

export default function History({ accessToken, refreshKey }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await fetchPredictionHistory(accessToken);
        setItems(data.items || []);
      } catch (err) {
        setError("Could not load history.");
      }
    }
    fetchHistory();
  }, [accessToken, refreshKey]);

  return (
    <section className="history-section" id="history">
      <div className="history-heading"><div><div className="eyebrow">YOUR ACTIVITY</div><h2>Prediction history</h2><p>Your latest checks, saved to your account.</p></div><span className="history-count">{items.length}<small>recent</small></span></div>
      {error && <p className="care-message error">{error}</p>}
      {items.length === 0 ? <div className="history-empty">No predictions saved yet. Your results will appear here.</div> : (
        <div className="history-list">{items.map((h) => (
          <article className="history-item" key={h.id}>
            <span className="history-mark">✓</span><div className="history-details"><strong>{h.predicted_disease}</strong><p>{(Array.isArray(h.symptoms) ? h.symptoms : JSON.parse(h.symptoms || '[]')).slice(0, 4).join(' · ')}{h.symptoms?.length > 4 ? ' …' : ''}</p></div><time>{new Date(h.created_at).toLocaleDateString()}</time>
          </article>
        ))}</div>
      )}
    </section>
  );
}
