import { useState } from 'react';
import { isAuthConfigured, requestEmailCode, verifyEmailCode } from '../services/auth.js';

export default function AuthGate({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function sendCode(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try { await requestEmailCode(email); setSent(true); setNotice('Check your inbox for the sign-in code.'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function confirmCode(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const session = await verifyEmailCode(email, code); onAuthenticated(session); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
    <section className="auth-card">
      <a className="brand auth-brand" href="#home"><span className="brand-mark">✚</span><span>Oye<span className="brand-accent">-Tabiyat</span></span></a>
      <div className="auth-kicker"><i /> A LITTLE CLARITY, WHEN YOU NEED IT</div>
      <h1>Body ka scene?<br /><span>Hum decode karein.</span></h1>
      <p className="auth-intro">Sign in with a one-time email code to use your symptom checker and revisit your prediction history.</p>
      {!isAuthConfigured() && <div className="auth-message auth-error">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>frontend/.env</code>, then restart Vite.</div>}
      {!sent ? <form className="auth-form" onSubmit={sendCode}>
        <label htmlFor="auth-email">Email address</label>
        <input id="auth-email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="auth-submit" disabled={busy || !isAuthConfigured()}>{busy ? 'Sending code…' : 'Email me a sign-in code'} <span>→</span></button>
      </form> : <form className="auth-form" onSubmit={confirmCode}>
        <label htmlFor="auth-code">Your email code</label>
        <input id="auth-code" inputMode="numeric" autoComplete="one-time-code" required minLength="6" maxLength="8" placeholder="Enter the code from your email" value={code} onChange={e => setCode(e.target.value)} />
        <button className="auth-submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify and sign in'} <span>→</span></button>
        <button type="button" className="auth-resend" disabled={busy} onClick={sendCode}>Send a new code</button>
      </form>}
      {notice && <p className="auth-message auth-notice" role="status">{notice}</p>}{error && <p className="auth-message auth-error" role="alert">{error}</p>}
      <div className="auth-footnote"><span>◈</span> Your account is securely managed by Supabase Auth.</div>
    </section>
    <p className="auth-disclaimer">General health information only · Not a medical diagnosis</p>
  </main>;
}
