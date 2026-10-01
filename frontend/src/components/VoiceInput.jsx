import { useMemo, useRef, useState } from 'react';

function findMatches(text, symptoms) {
  const transcript = text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!transcript) return [];
  const matches = new Set(symptoms.filter((symptom) => {
    const name = symptom.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    return name && ` ${transcript} `.includes(` ${name} `);
  }));
  // Direct equivalents only; each target must already exist in the model list.
  const hindiAliases = [{ phrases: ['बुखार', 'bukhar'], symptom: 'fever' }];
  hindiAliases.forEach(({ phrases, symptom }) => {
    if (symptoms.includes(symptom) && phrases.some((phrase) => ` ${transcript} `.includes(` ${phrase} `))) matches.add(symptom);
  });
  return [...matches];
}

export default function VoiceInput({ symptoms, selected, onAdd }) {
  const recognitionRef = useRef(null);
  const [language, setLanguage] = useState('en-IN');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [checked, setChecked] = useState([]);
  const [message, setMessage] = useState('');
  const [unsupported, setUnsupported] = useState(false);

  const matches = useMemo(() => findMatches(transcript, symptoms), [transcript, symptoms]);

  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setUnsupported(true);
      setMessage('Voice input is not supported in this browser. Try Chrome or Edge, or use symptom search.');
      return;
    }

    setUnsupported(false);
    setMessage('');
    setTranscript('');
    setChecked([]);
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const words = Array.from(event.results).map((result) => result[0].transcript).join(' ');
      setTranscript(words.trim());
      setChecked(findMatches(words, symptoms));
    };
    recognition.onerror = (event) => {
      setListening(false);
      const errors = {
        'not-allowed': 'Microphone access was denied. Allow microphone access in your browser settings and try again.',
        'service-not-allowed': 'Speech recognition is blocked by this browser or device.',
        'no-speech': 'No speech was heard. Try again and speak a little closer to your microphone.',
        network: 'Voice recognition needs an internet connection in this browser. Please try again or search manually.',
        'audio-capture': 'No microphone was found. Connect a microphone or use symptom search.',
      };
      if (event.error !== 'aborted') setMessage(errors[event.error] || 'Voice recognition stopped. Please try again or search manually.');
    };
    recognition.onend = () => setListening(false);

    try { recognition.start(); }
    catch { setListening(false); setMessage('Could not start the microphone. Please try again.'); }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function toggleMatch(symptom) {
    setChecked((items) => items.includes(symptom) ? items.filter((item) => item !== symptom) : [...items, symptom]);
  }

  function addConfirmed() {
    const additions = checked.filter((symptom) => !selected.includes(symptom));
    additions.forEach(onAdd);
    setMessage(additions.length
      ? `${additions.length} symptom${additions.length === 1 ? '' : 's'} added to your selection.`
      : 'Those symptoms are already selected.');
    setChecked([]);
  }

  return <div className="voice-input">
    <div className="voice-controls">
      <div className="voice-copy"><strong>Say your symptoms</strong><small>We’ll match names from the list below.</small></div>
      <label className="voice-language">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} disabled={listening}><option value="en-IN">English</option><option value="hi-IN">हिन्दी</option></select></label>
      <button type="button" className={`voice-button${listening ? ' listening' : ''}`} onClick={listening ? stopListening : startListening} aria-label={listening ? 'Stop voice input' : 'Start voice input'}><span aria-hidden="true">🎤</span>{listening ? 'Listening…' : 'Speak'}</button>
    </div>
    {unsupported && <p className="voice-message" role="status">{message}</p>}
    {listening && <p className="voice-message voice-listening" role="status">Listening now. Speak clearly, then pause to finish.</p>}
    {transcript && <div className="voice-transcript"><small>TRANSCRIPT</small><p>{transcript}</p></div>}
    {transcript && matches.length > 0 && <div className="voice-matches"><strong>Confirm the symptoms we found</strong>{matches.map((symptom) => <label key={symptom}><input type="checkbox" checked={checked.includes(symptom)} onChange={() => toggleMatch(symptom)} />{symptom}</label>)}<small className="voice-match-note">Only direct matches are selected. Please choose any other symptoms from the list yourself.</small><button type="button" className="voice-add" onClick={addConfirmed} disabled={!checked.length}>Add selected symptoms</button></div>}
    {transcript && matches.length === 0 && <p className="voice-message" role="status">{language === 'hi-IN' ? 'Your Hindi transcript is shown above. Symptom choices use the names in the list, so select the matching items below.' : 'No exact symptom names from the list were recognized. Select the matching items below.'}</p>}
    {message && !unsupported && !listening && <p className="voice-message" role="status">{message}</p>}
  </div>;
}
