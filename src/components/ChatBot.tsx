import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatBot.css';

type Msg = { id: number; texte: string; de: 'bot' | 'user' };

/* ── Thèmes ── */
const THEMES = {
  green: {
    primary: '#4A7A5C', dark: '#2E5A3F',
    light: '#EDF4F0', border: '#C8DDD0',
    chipBg: '#EDF4F0', chipText: '#4A7A5C', chipBorder: '#C8DDD0',
    msgBg: '#F7FAF8',
  },
  orange: {
    primary: '#E87D50', dark: '#C05A30',
    light: '#FFF5F0', border: '#FDBA8C',
    chipBg: '#FFF5F0', chipText: '#E87D50', chipBorder: '#FDBA8C',
    msgBg: '#FFFAF7',
  },
  blue: {
    primary: '#111827', dark: '#1F2937',
    light: '#F3F4F6', border: '#D1D5DB',
    chipBg: '#F3F4F6', chipText: '#111827', chipBorder: '#D1D5DB',
    msgBg: '#F9FAFB',
  },
};

/* ── Réponses par contexte ── */
const RESPONSES_CLIENT = [
  { keywords: ['bonjour', 'salut', 'hello', 'bonsoir'], reply: "Bonjour ! Je suis l'assistant BATINNOV. Comment puis-je vous aider ?" },
  { keywords: ['devis', 'prix', 'tarif', 'coût', 'combien'], reply: "Pour obtenir un devis gratuit, cliquez sur « Demander un devis ». Un artisan qualifié vous répond sous 48h !" },
  { keywords: ['rénovation', 'renovation', 'cuisine', 'salle de bain', 'ravalement'], reply: "Notre service Rénovation couvre : cuisine, salle de bain, extension, ravalement de façade... Nos artisans interviennent dans toute la région." },
  { keywords: ['irve', 'borne', 'recharge', 'électrique', 'wallbox'], reply: "Nous installons des bornes de recharge (7kW, 11kW) à domicile par des électriciens certifiés IRVE. Devis gratuit en 48h !" },
  { keywords: ['aide', 'personne', 'pmr', 'handicap', 'mobilité', 'senior'], reply: "Notre service Aide à la personne propose l'adaptation de votre logement : douche plain-pied, barres d'appui, rampes d'accès..." },
  { keywords: ['courtage', 'financement', 'prêt', 'crédit'], reply: "Notre service Courtage vous aide à financer vos travaux : prêt travaux, rachat de crédit, éco-PTZ..." },
  { keywords: ['délai', 'durée', 'quand', 'temps'], reply: "Vous recevez vos premiers devis sous 48h. Les délais de réalisation dépendent du type de travaux et de l'artisan sélectionné." },
  { keywords: ['artisan', 'qualité', 'certifié', 'garantie'], reply: "Tous nos artisans sont vérifiés, assurés et certifiés. Nous contrôlons leurs qualifications avant tout référencement." },
  { keywords: ['contact', 'téléphone', 'email', 'joindre'], reply: "Vous pouvez nous contacter via le formulaire de devis. Un conseiller BATINNOV vous rappelle sous 24h." },
  { keywords: ['inscription', 'compte', 'créer'], reply: "Créez votre compte gratuitement en cliquant sur « Créer un compte » depuis la page de connexion. Rapide et gratuit !" },
];

const RESPONSES_PRO = [
  { keywords: ['bonjour', 'salut', 'hello'], reply: "Bonjour ! Je suis votre assistant prestataire BATINNOV. Comment puis-je vous aider ?" },
  { keywords: ['lead', 'client', 'nouveau', 'demande'], reply: "Vos nouveaux leads apparaissent dans l'onglet « Leads ». Répondez rapidement pour maximiser vos chances d'acceptation !" },
  { keywords: ['devis', 'envoyer', 'proposer'], reply: "Pour envoyer un devis, rendez-vous dans « Leads » et cliquez sur « Envoyer un devis ». Le client le reçoit instantanément." },
  { keywords: ['facture', 'facturation', 'paiement'], reply: "Créez et gérez vos factures dans l'onglet « Facturation ». Vous pouvez suivre les paiements en attente et les relancer." },
  { keywords: ['chantier', 'avancement', 'étape', 'travaux'], reply: "Mettez à jour l'avancement de vos chantiers dans l'onglet « Chantiers » en cliquant sur les étapes. Le client est notifié en temps réel." },
  { keywords: ['document', 'certif', 'kbis', 'assurance', 'qualification'], reply: "Vos documents professionnels sont dans l'onglet « Documents ». Maintenez-les à jour pour rester actif sur la plateforme." },
  { keywords: ['profil', 'informations', 'modifier'], reply: "Modifiez vos informations professionnelles dans « Mon profil » accessible en haut à droite." },
  { keywords: ['message', 'client', 'contacter'], reply: "Communiquez avec vos clients depuis l'onglet « Messages ». Les échanges sont centralisés par chantier." },
  { keywords: ['note', 'avis', 'évaluation'], reply: "Votre note est visible sur votre profil. Les avis sont déposés par vos clients après chaque chantier terminé." },
  { keywords: ['contact', 'support', 'aide', 'problème'], reply: "Pour toute assistance, contactez le support BATINNOV. Notre équipe vous répond sous 24h en jours ouvrés." },
];

const RESPONSES_ADMIN = [
  { keywords: ['bonjour', 'salut', 'hello'], reply: "Bonjour ! Je suis l'assistant administrateur BATINNOV. Comment puis-je vous aider ?" },
  { keywords: ['validation', 'dossier', 'prestataire', 'valider'], reply: "Les dossiers en attente sont dans « Validation pros ». Vérifiez les documents, puis activez ou refusez le prestataire." },
  { keywords: ['utilisateur', 'compte', 'client', 'suspendre'], reply: "Gérez les comptes depuis « Utilisateurs ». Vous pouvez suspendre ou réactiver un compte au survol de chaque ligne." },
  { keywords: ['facture', 'finance', 'paiement', 'ca', 'chiffre'], reply: "Le suivi financier est dans « Finance » : CA mensuel, factures, relances. Filtrez par statut (payé, attente, retard)." },
  { keywords: ['rdv', 'rendez-vous', 'coordonner', 'créneau'], reply: "Coordinateurs les rendez-vous dans « RDV ». Validez ou refusez chaque créneau pour notifier les deux parties." },
  { keywords: ['service', 'chantier', 'bloqué', 'opération'], reply: "Suivez tous les services actifs dans « Services ». Les chantiers bloqués sont mis en rouge pour action rapide." },
  { keywords: ['statistiques', 'kpi', 'tableau', 'bord'], reply: "Le tableau de bord affiche les KPIs en temps réel : services en cours, dossiers en attente, RDV à coordonner." },
  { keywords: ['contact', 'support', 'aide'], reply: "Pour une assistance technique, contactez l'équipe développement BATINNOV à support@batinnov.fr." },
];

const SUGGESTIONS_CLIENT = ['Obtenir un devis', 'Nos services', "Délais d'intervention", 'Contacter BATINNOV'];
const SUGGESTIONS_PRO    = ['Gérer mes leads', 'Créer une facture', 'Mes chantiers', 'Mettre à jour mes docs'];
const SUGGESTIONS_ADMIN  = ['Valider un dossier', 'Gérer les utilisateurs', 'Voir les finances', 'Coordonner un RDV'];

const DEFAULT_CLIENT = "Je n'ai pas bien compris 😊 Posez-moi une question sur nos services, tarifs, délais ou devis !";
const DEFAULT_PRO    = "Je n'ai pas bien compris. Demandez-moi de l'aide sur vos leads, chantiers, factures ou documents.";
const DEFAULT_ADMIN  = "Je n'ai pas bien compris. Demandez-moi de l'aide sur la validation, les utilisateurs ou les finances.";

function getReply(text: string, responses: typeof RESPONSES_CLIENT, defaultMsg: string): string {
  const lower = text.toLowerCase();
  for (const r of responses) {
    if (r.keywords.some(k => lower.includes(k))) return r.reply;
  }
  return defaultMsg;
}

let _id = 1;

export default function ChatBot() {
  const location = useLocation();

  const getContext = () => {
    if (location.pathname.startsWith('/dashboard-pro')) return 'pro';
    if (location.pathname.startsWith('/dashboard-admin')) return 'admin';
    return 'green';
  };

  const ctx = getContext();
  const themeName = ctx === 'pro' ? 'orange' : ctx === 'admin' ? 'blue' : 'green';
  const t = THEMES[themeName];

  const responses   = ctx === 'pro' ? RESPONSES_PRO   : ctx === 'admin' ? RESPONSES_ADMIN   : RESPONSES_CLIENT;
  const suggestions = ctx === 'pro' ? SUGGESTIONS_PRO : ctx === 'admin' ? SUGGESTIONS_ADMIN : SUGGESTIONS_CLIENT;
  const defaultMsg  = ctx === 'pro' ? DEFAULT_PRO      : ctx === 'admin' ? DEFAULT_ADMIN      : DEFAULT_CLIENT;

  const greetings: Record<string, string> = {
    green: "Bonjour ! Je suis l'assistant BATINNOV 🏠\nComment puis-je vous aider ?",
    orange: "Bonjour ! Je suis votre assistant Prestataire BATINNOV.\nComment puis-je vous aider ?",
    blue: "Bonjour ! Je suis l'assistant Admin BATINNOV.\nQue puis-je faire pour vous ?",
  };

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: _id++, texte: greetings[themeName], de: 'bot' }
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  /* Reset si on change de contexte (navigation entre dashboards) */
  const prevTheme = useRef(themeName);
  useEffect(() => {
    if (prevTheme.current !== themeName) {
      prevTheme.current = themeName;
      _id = 1;
      setMsgs([{ id: _id++, texte: greetings[themeName], de: 'bot' }]);
      setOpen(false);
    }
  }, [themeName]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(prev => [...prev, { id: _id++, texte: text, de: 'user' }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, { id: _id++, texte: getReply(text, responses, defaultMsg), de: 'bot' }]);
    }, 900);
  };

  return (
    <>
      {open && (
        <div className="cb-window">
          {/* HEADER */}
          <div className="cb-header" style={{ background: t.primary }}>
            <div className="cb-header-info">
              <div className="cb-avatar" style={{ background: `rgba(255,255,255,0.2)` }}>B</div>
              <div>
                <strong>Assistant BATINNOV</strong>
                <span className="cb-status">
                  <span className="cb-dot" />
                  {ctx === 'pro' ? 'Espace Pro' : ctx === 'admin' ? 'Espace Admin' : 'En ligne'}
                </span>
              </div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div className="cb-messages" style={{ background: t.msgBg }}>
            {msgs.map(m => (
              <div key={m.id} className={`cb-msg-wrap ${m.de}`}>
                {m.de === 'bot' && (
                  <div className="cb-msg-avatar" style={{ background: t.primary }}>B</div>
                )}
                <div className="cb-bubble" style={m.de === 'user' ? { background: t.primary } : {}}>
                  {m.texte.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="cb-msg-wrap bot">
                <div className="cb-msg-avatar" style={{ background: t.primary }}>B</div>
                <div className="cb-bubble cb-typing">
                  <span style={{ background: t.primary }} />
                  <span style={{ background: t.primary }} />
                  <span style={{ background: t.primary }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* SUGGESTIONS */}
          {msgs.length <= 2 && (
            <div className="cb-suggestions" style={{ background: t.msgBg, borderTopColor: t.border }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  className="cb-suggestion"
                  style={{ background: t.chipBg, color: t.chipText, borderColor: t.chipBorder }}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div className="cb-input-bar">
            <input
              placeholder="Votre question..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(draft)}
              autoFocus
              style={{ '--focus-color': t.primary } as React.CSSProperties}
              className="cb-input-themed"
            />
            <button
              className="cb-send"
              style={{ background: t.primary }}
              onClick={() => send(draft)}
              disabled={!draft.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* BOUTON FLOTTANT */}
      <button
        className={`cb-fab ${open ? 'open' : ''}`}
        style={{ background: open ? t.dark : t.primary, boxShadow: `0 4px 20px ${t.primary}70` }}
        onClick={() => setOpen(o => !o)}
        aria-label="Chat"
      >
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
