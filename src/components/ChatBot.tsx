import { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

type Msg = { id: number; texte: string; de: 'bot' | 'user'; };

const RESPONSES: { keywords: string[]; reply: string }[] = [
  { keywords: ['bonjour', 'salut', 'hello', 'bonsoir'],
    reply: "Bonjour ! 👋 Je suis l'assistant BATINNOV. Comment puis-je vous aider ?" },
  { keywords: ['devis', 'prix', 'tarif', 'coût', 'combien'],
    reply: "Pour obtenir un devis gratuit et personnalisé, cliquez sur « Demander un devis » en haut de la page. Un artisan qualifié vous répond sous 48h !" },
  { keywords: ['rénovation', 'renovation', 'cuisine', 'salle de bain', 'ravalement'],
    reply: "Notre service Rénovation couvre : cuisine, salle de bain, extension, ravalement de façade... Nos artisans certifiés interviennent dans toute la région." },
  { keywords: ['irve', 'borne', 'recharge', 'électrique', 'wallbox'],
    reply: "Nous installons des bornes de recharge (Wallbox 7kW, 11kW) à domicile. L'installation est réalisée par des électriciens certifiés IRVE. Devis gratuit en 48h !" },
  { keywords: ['aide', 'personne', 'pmr', 'handicap', 'mobilité', 'senior'],
    reply: "Notre service Aide à la personne propose l'adaptation de votre logement : douche plain-pied, barres d'appui, rampes d'accès... pour votre confort et sécurité." },
  { keywords: ['courtage', 'financement', 'prêt', 'crédit', 'pret'],
    reply: "Notre service Courtage vous aide à financer vos travaux : prêt travaux, rachat de crédit, éco-PTZ... Nos conseillers trouvent la meilleure solution pour vous." },
  { keywords: ['délai', 'durée', 'quand', 'temps'],
    reply: "Les délais varient selon le type de travaux. En général, vous recevez vos premiers devis sous 48h. La réalisation dépend de l'artisan sélectionné." },
  { keywords: ['artisan', 'qualité', 'certifié', 'confiance', 'garantie'],
    reply: "Tous nos artisans sont vérifiés, assurés et certifiés. Nous contrôlons leurs qualifications, avis clients et assurances avant tout référencement." },
  { keywords: ['contact', 'téléphone', 'appel', 'email', 'joindre'],
    reply: "Vous pouvez nous contacter via le formulaire de devis ou par email. Un conseiller BATINNOV vous rappelle sous 24h." },
  { keywords: ['inscription', 'compte', 'créer', 'enregistrer'],
    reply: "Créez votre compte gratuitement en cliquant sur « Créer un compte » depuis la page de connexion. C'est rapide et gratuit !" },
];

const DEFAULT = "Je n'ai pas bien compris votre question 😊 Vous pouvez me demander des infos sur nos services, les tarifs, les délais ou comment obtenir un devis !";

const SUGGESTIONS = ['Obtenir un devis', 'Nos services', 'Délais d\'intervention', 'Contacter BATINNOV'];

function getReply(text: string): string {
  const lower = text.toLowerCase();
  for (const r of RESPONSES) {
    if (r.keywords.some(k => lower.includes(k))) return r.reply;
  }
  return DEFAULT;
}

let _id = 1;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: _id++, texte: "Bonjour ! Je suis l'assistant BATINNOV 🏠\nComment puis-je vous aider ?", de: 'bot' }
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: _id++, texte: text, de: 'user' };
    setMsgs(prev => [...prev, userMsg]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, { id: _id++, texte: getReply(text), de: 'bot' }]);
    }, 900);
  };

  return (
    <>
      {/* FENÊTRE */}
      {open && (
        <div className="cb-window">
          <div className="cb-header">
            <div className="cb-header-info">
              <div className="cb-avatar">B</div>
              <div>
                <strong>Assistant BATINNOV</strong>
                <span className="cb-status"><span className="cb-dot" />En ligne</span>
              </div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="cb-messages">
            {msgs.map(m => (
              <div key={m.id} className={`cb-msg-wrap ${m.de}`}>
                {m.de === 'bot' && <div className="cb-msg-avatar">B</div>}
                <div className="cb-bubble">
                  {m.texte.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="cb-msg-wrap bot">
                <div className="cb-msg-avatar">B</div>
                <div className="cb-bubble cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* SUGGESTIONS */}
          {msgs.length <= 2 && (
            <div className="cb-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="cb-suggestion" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="cb-input-bar">
            <input
              placeholder="Votre question..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(draft)}
              autoFocus
            />
            <button className="cb-send" onClick={() => send(draft)} disabled={!draft.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* BOUTON FLOTTANT */}
      <button className={`cb-fab ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Chat">
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {!open && msgs.filter(m => m.de === 'bot').length > 0 && (
          <span className="cb-fab-dot" />
        )}
      </button>
    </>
  );
}
