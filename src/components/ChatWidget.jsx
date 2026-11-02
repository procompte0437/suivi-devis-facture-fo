import { useEffect, useState } from 'react';
import { api } from '../api';

const STARTER = [
  'Bonjour, que permet Orée ?',
  'Comment créer un compte ?',
  'Quels modèles de devis ?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('oree_chat') || '');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', body: 'Bonjour. Je réponds même sans compte : vision, inscription, devis, factures, Gantt ou budget.' },
  ]);

  useEffect(() => {
    if (token) localStorage.setItem('oree_chat', token);
  }, [token]);

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
      setMessages((current) => [...current, { role: 'assistant', body: 'Le salon est momentanément indisponible. Réessayez dans un instant.' }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="chat-dock no-print">
      {open ? (
        <section className="chat-panel" aria-label="Conversation avec Orée">
          <header>
            <div>
              <strong>Atelier</strong>
              <span>Sans compte, déjà</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le chat">×</button>
          </header>
          <div className="chat-log">
            {messages.map((item, index) => (
              <p key={index} className={item.role}>{item.body}</p>
            ))}
          </div>
          <div className="chat-starters">
            {STARTER.map((item) => (
              <button key={item} type="button" onClick={() => send(item)}>{item}</button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); send(); }}>
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Votre message" aria-label="Message" />
            <button type="submit" disabled={pending}>{pending ? '…' : 'Envoyer'}</button>
          </form>
        </section>
      ) : null}
      <button className="chat-launch" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? 'Fermer' : 'Discuter'}
      </button>
    </div>
  );
}
