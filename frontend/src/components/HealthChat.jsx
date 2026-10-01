import { useEffect, useRef, useState } from 'react';
import { sendHealthChat } from '../services/api.js';

const starterQuestions = [
  'My hands are itchy. What can I do right now?',
  'I have a mild headache. What might help?',
  'I touched something irritating. What should I do?',
];

export default function HealthChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const conversationEnd = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    conversationEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  async function send(text = draft) {
    const content = text.trim();
    if (!content || busy) return;
    setDraft('');
    setError('');
    setBusy(true);
    setMessages((current) => [...current, { role: 'user', content }]);
    try {
      const history = messages.slice(-8).map(({ role, content: oldContent }) => ({ role, content: oldContent }));
      const data = await sendHealthChat(content, history);
      if (typeof data?.reply !== 'string' || !data.reply.trim()) throw new Error('The assistant returned an empty response. Please try again.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply, urgent: data.urgent }]);
    } catch (requestError) {
      setDraft(content);
      setError(requestError instanceof TypeError ? 'Could not reach the API. Check that the backend is running.' : requestError.message || 'The assistant could not reply. Please try again.');
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  }

  function clearConversation() {
    setMessages([]);
    setError('');
    setDraft('');
    input.current?.focus();
  }

  return (
    <section className="health-chat-section" id="health-chat" aria-labelledby="health-chat-title">
      <div className="health-chat-heading">
        <div><div className="eyebrow">GENTLE GUIDANCE</div><h2 id="health-chat-title">Ask about a symptom</h2><p>Get practical, general self-care ideas and guidance on when to seek help.</p></div>
        <div className="chat-status"><i /> AI assistant</div>
      </div>

      <div className="chat-window" aria-live="polite" aria-relevant="additions text">
        <div className="chat-message assistant-message">
          <span className="chat-avatar" aria-hidden="true">✚</span>
          <div className="chat-bubble"><p>Hi, I can share general ways to feel more comfortable and help you think about when to get medical care. What’s bothering you?</p><small>Oye-Tabiyat health guide</small></div>
        </div>
        {messages.map((message, index) => (
          <div className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`} key={`${index}-${message.role}`}>
            {message.role === 'assistant' && <span className="chat-avatar" aria-hidden="true">✚</span>}
            <div className={`chat-bubble${message.urgent ? ' urgent-bubble' : ''}`}><p>{message.content}</p>{message.role === 'assistant' && <small>{message.urgent ? 'Urgent guidance' : 'General information · not a diagnosis'}</small>}</div>
          </div>
        ))}
        {busy && <div className="chat-message assistant-message"><span className="chat-avatar" aria-hidden="true">✚</span><div className="chat-bubble typing-bubble"><i /><i /><i /><span className="sr-only">Preparing a reply</span></div></div>}
        <div ref={conversationEnd} />
      </div>

      {messages.length === 0 && <div className="chat-starters" aria-label="Example questions">{starterQuestions.map((question) => <button type="button" key={question} onClick={() => send(question)} disabled={busy}>{question}</button>)}</div>}
      {error && <p className="chat-error" role="alert">{error} Your message remains in the box so you can retry.</p>}
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
        <label className="sr-only" htmlFor="health-chat-input">Describe what you’re feeling</label>
        <textarea id="health-chat-input" ref={input} value={draft} onChange={(event) => setDraft(event.target.value.slice(0, 1200))} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="For example: I have itching on my hands…" rows={2} maxLength={1200} disabled={busy} />
        <button className="chat-send-button" type="submit" disabled={busy || !draft.trim()} aria-label="Send message">{busy ? <i className="button-spinner" /> : <span aria-hidden="true">↑</span>}</button>
      </form>
      <div className="chat-footer"><p><strong>Not for emergencies.</strong> If symptoms feel severe or are getting worse, seek urgent medical help now.</p><div><span>Messages are sent to Groq for replies and aren’t saved in this app. Avoid sharing names or other identifying details.</span>{messages.length > 0 && <button type="button" onClick={clearConversation}>Clear chat</button>}</div></div>
    </section>
  );
}
