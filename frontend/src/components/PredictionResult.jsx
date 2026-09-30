export default function PredictionResult({ result, loading, error }) {
  return (
    <section
      className={`card result-card${result ? ' has-result' : ''}`}
      aria-labelledby="result-heading"
      aria-live="polite"
    >
      <div className="eyebrow">STEP 02 <span>·</span> YOUR RESULT</div>
      <h2 id="result-heading">Prediction</h2>

      {loading ? (
        <div className="result-state">
          <i className="spinner" />
          Analyzing selected symptoms…
        </div>
      ) : error ? (
        <div className="result-state error" role="alert">
          <b>!</b>
          <span>{error}</span>
        </div>
      ) : result ? (
        <div className="prediction-output">
          <div>Predicted Disease</div>

          <strong>{result.predicted_disease}</strong>

          {result.information?.description && (
            <div className="disease-info">
              <h3>About this condition</h3>
              <p>{result.information.description}</p>
            </div>
          )}

          {result.information?.symptoms?.length > 0 && (
            <div className="disease-info">
              <h3>Common Symptoms</h3>
              <ul>
                {result.information.symptoms.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.information?.causes?.length > 0 && (
            <div className="disease-info">
              <h3>Causes</h3>
              <ul>
                {result.information.causes.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.information?.risk_factors?.length > 0 && (
            <div className="disease-info">
              <h3>Risk Factors</h3>
              <ul>
                {result.information.risk_factors.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.information?.prevention?.length > 0 && (
            <div className="disease-info">
              <h3>Prevention</h3>
              <ul>
                {result.information.prevention.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.information?.specialist && (
            <div className="disease-info">
              <h3>Recommended Specialist</h3>
              <p>{result.information.specialist}</p>
            </div>
          )}

          {result.information?.when_to_seek_help && (
            <div className="disease-info">
              <h3>When to Seek Help</h3>
              <p>{result.information.when_to_seek_help}</p>
            </div>
          )}

          {result.disclaimer && (
            <p className="prediction-disclaimer">
              {result.disclaimer}
            </p>
          )}
        </div>
      ) : (
        <div className="result-state empty">
          <span className="result-icon">⌕</span>
          <b>Your prediction will appear here</b>
          <small>Select symptoms to get started</small>
        </div>
      )}
    </section>
  );
}