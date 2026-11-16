import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const STARTERS = [
  'Que permet DOUKOU ?',
  'Comment créer un compte ?',
  'Quels modèles de devis ?',
  'Comment marche le Gantt ?',
  'Essayer la démo',
];

const WELCOME = 'Bonjour ! Je réponds même sans compte : vision, inscription, modèles de devis et de facture, Gantt, budget ou espace client.';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('oree_chat') || '');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', body: WELCOME }]);
  const log = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    if (token) localStorage.setItem('oree_chat', token);
  }, [token]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  async function send(value) {
    const message = (value ?? text).trim();
    if (!message || pending) return;
    setText('');
    setMessages((current) => [...current, { role: 'user', body: message }]);
    setPending(true);
    try {
      const data = await api('/chat', { method: 'POST', body: { message, token: token || null } });
      setToken(data.token);
      setMessages((current) => [...current, { role: 'assistant', body: data.reply }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', body: 'Le service est momentanément indisponible. Réessayez dans un instant.' }]);
    } finally {
      setPending(false);
    }
  }

  const asked = messages.some((item) => item.role === 'user');

  return (
    <div className={`chat-dock no-print${open ? ' is-open' : ''}`}>
      {open ? (
        <section className="chat-panel" role="dialog" aria-label="Discuter avec DOUKOU">
          <header>
            <span className="chat-avatar" aria-hidden="true">D</span>
            <div>
              <strong>Assistant DOUKOU</strong>
              <span><i className="chat-online" />Répond sans compte</span>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Fermer la discussion">×</button>
          </header>
          <div className="chat-log" ref={log} aria-live="polite">
            {messages.map((item, index) => (
              <p key={index} className={item.role}>{item.body}</p>
            ))}
            {pending ? <p className="assistant typing" aria-label="L’assistant écrit"><i /><i /><i /></p> : null}
          </div>
          {!asked ? (
            <div className="chat-starters">
              {STARTERS.map((item) => (
                <button key={item} type="button" onClick={() => send(item)}>{item}</button>
              ))}
            </div>
          ) : null}
          <form onSubmit={(event) => { event.preventDefault(); send(); }}>
            <input ref={input} value={text} onChange={(event) => setText(event.target.value)} placeholder="Écrivez votre question…" aria-label="Votre message" maxLength={1000} />
            <button type="submit" disabled={pending || !text.trim()} aria-label="Envoyer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-6 16-3-7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </section>
      ) : null}
      <button className="chat-launch" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H9l-4 4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        {open ? 'Fermer' : 'Discuter'}
      </button>
    </div>
  );
}
