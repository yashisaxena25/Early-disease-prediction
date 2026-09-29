export default function PredictionResult({ result, loading, error }) {
  return <section className={`card result-card${result ? ' has-result' : ''}`} aria-labelledby="result-heading" aria-live="polite"><div className="eyebrow">STEP 02 <span>·</span> YOUR RESULT</div><h2 id="result-heading">Prediction</h2>
    {loading ? <div className="result-state"><i className="spinner"/>Analyzing selected symptoms…</div> : error ? <div className="result-state error" role="alert"><b>!</b><span>{error}</span></div> : result ? <div className="prediction-output"><div>Predicted Disease</div><strong>{result}</strong><p>This is a machine learning prediction based on the symptoms selected.</p></div> : <div className="result-state empty"><span className="result-icon">⌁</span><b>Your prediction will appear here</b><small>Select symptoms to get started</small></div>}
  </section>;
}
