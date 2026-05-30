import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ChatBot.css';

/* ── Types ── */
type Action = { label: string; msg?: string; href?: string; page?: string };
type Msg = {
  id: number;
  texte: string;
  de: 'bot' | 'user';
  actions?: Action[];
  sources?: string[];
};
type Response = {
  keywords: string[];
  reply: string;
  actions?: Action[];
  sources?: string[];
};

/* ── Thèmes ── */
const THEMES = {
  green: {
    primary: '#4A7A5C', dark: '#2E5A3F', gradFrom: '#4A7A5C', gradTo: '#2E5A3F',
    light: '#EDF4F0', border: '#C8DDD0',
    chipBg: '#EDF4F0', chipText: '#4A7A5C', chipBorder: '#C8DDD0',
    msgBg: '#F7FAF8', userBubble: '#4A7A5C',
  },
  orange: {
    primary: '#E87D50', dark: '#C05A30', gradFrom: '#E87D50', gradTo: '#C05A30',
    light: '#FFF5F0', border: '#FDBA8C',
    chipBg: '#FFF5F0', chipText: '#E87D50', chipBorder: '#FDBA8C',
    msgBg: '#FFFAF7', userBubble: '#E87D50',
  },
  blue: {
    primary: '#111827', dark: '#1F2937', gradFrom: '#1F2937', gradTo: '#111827',
    light: '#F3F4F6', border: '#D1D5DB',
    chipBg: '#F3F4F6', chipText: '#111827', chipBorder: '#D1D5DB',
    msgBg: '#F9FAFB', userBubble: '#111827',
  },
};

/* ── Réponses client ── */
const RESPONSES_CLIENT: Response[] = [
  { keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou'],
    reply: "Bonjour ! Je suis l'assistant BATINNOV. Je suis là pour répondre à toutes vos questions sur nos services.",
    actions: [{ label: 'Demander un devis gratuit', href: '/devis' }, { label: 'Nos services disponibles', msg: 'Quels services proposez-vous ?' }] },
  { keywords: ['devis', 'prix', 'tarif', 'coût', 'combien'],
    reply: "Pour obtenir un devis gratuit, remplissez notre formulaire en ligne. Un artisan qualifié vous répond sous 48h !",
    actions: [{ label: 'Demander un devis', href: '/devis' }],
    sources: ['batinnov.fr/devis'] },
  { keywords: ['rénovation', 'renovation', 'cuisine', 'salle de bain', 'ravalement', 'extension'],
    reply: "Notre service Rénovation couvre : cuisine, salle de bain, extension, ravalement de façade… Nos artisans interviennent dans toute la région Auvergne.",
    actions: [{ label: 'En savoir plus sur la rénovation', href: '/services/renovation' }, { label: 'Obtenir un devis', href: '/devis' }] },
  { keywords: ['irve', 'borne', 'recharge', 'électrique', 'wallbox', 'véhicule'],
    reply: "Nous installons des bornes de recharge (7,4 kW, 11 kW, 22 kW) à domicile par des électriciens certifiés IRVE. Dévis gratuit sous 48h !",
    actions: [{ label: 'Installation IRVE', href: '/services/irve' }, { label: 'Quel puissance choisir ?', msg: 'Quelle puissance de borne choisir ?' }],
    sources: ['Certification IRVE', 'Norme NF C 15-100'] },
  { keywords: ['aide', 'personne', 'pmr', 'handicap', 'mobilité', 'senior', 'domicile'],
    reply: "Notre service Aide à la personne propose l'adaptation de votre logement : douche plain-pied, barres d'appui, rampes d'accès. Prestations remboursables.",
    actions: [{ label: 'Service Aide', href: '/services/aide' }] },
  { keywords: ['courtage', 'financement', 'prêt', 'crédit', 'éco-ptz'],
    reply: "Notre service Courtage vous aide à financer vos travaux : prêt travaux, rachat de crédit, éco-PTZ. Nos courtiers négocient pour vous.",
    actions: [{ label: 'Service Courtage', href: '/services/courtage' }] },
  { keywords: ['délai', 'durée', 'quand', 'temps', 'rapidement'],
    reply: "Vous recevez vos premiers devis sous 48h. Les délais de réalisation dépendent du type de travaux : de quelques jours pour une borne IRVE à plusieurs semaines pour une rénovation complète.",
    sources: ['Engagement BATINNOV : devis sous 48h'] },
  { keywords: ['artisan', 'qualité', 'certifié', 'garantie', 'vérifié'],
    reply: "Tous nos artisans sont vérifiés, assurés et certifiés avant référencement. Nous contrôlons : Kbis, assurance décennale, certifications métier.",
    actions: [{ label: 'Notre processus de sélection', msg: 'Comment vérifiez-vous les artisans ?' }] },
  { keywords: ['inscription', 'compte', 'créer', 'enregistrer'],
    reply: "Créez votre compte gratuitement depuis la page de connexion. Vous pouvez ensuite suivre vos demandes, devis et chantiers en temps réel.",
    actions: [{ label: 'Créer un compte', href: '/inscription-client' }] },
  { keywords: ['contact', 'téléphone', 'email', 'joindre', 'support'],
    reply: "Contactez-nous via notre formulaire de devis ou à support@batinnov.fr. Un conseiller vous rappelle sous 24h en jours ouvrés.",
    actions: [{ label: 'Nous contacter', href: '/devis' }] },
];

/* ── Réponses pro ── */
const RESPONSES_PRO: Response[] = [
  { keywords: ['bonjour', 'salut', 'hello', 'bonsoir'],
    reply: "Bonjour ! Je suis votre assistant Prestataire BATINNOV. Comment puis-je vous aider aujourd'hui ?",
    actions: [{ label: 'Voir mes leads', msg: 'Comment gérer mes leads ?' }, { label: 'Mes chantiers', msg: 'Comment mettre à jour mes chantiers ?' }] },
  { keywords: ['lead', 'client', 'nouveau', 'demande', 'opportunité'],
    reply: "Vos nouveaux leads apparaissent dans l'onglet « Leads ». Répondez rapidement — les premières réponses ont 3× plus de chances d'être retenues.",
    actions: [{ label: 'Accéder à mes leads', msg: 'Comment envoyer un devis depuis un lead ?' }],
    sources: ['Tableau de bord Pro'] },
  { keywords: ['devis', 'envoyer', 'proposer', 'créer'],
    reply: "Pour envoyer un devis, ouvrez le lead concerné et cliquez « Envoyer un devis ». Vous pouvez y ajouter des lignes, TVA et conditions. Le client le reçoit instantanément.",
    actions: [{ label: 'Créer un devis', msg: 'Que doit contenir un bon devis ?' }] },
  { keywords: ['facture', 'facturation', 'paiement', 'encaissement'],
    reply: "Gérez vos factures dans l'onglet « Facturation ». Vous pouvez suivre les paiements en attente et relancer automatiquement vos clients.",
    sources: ['Tableau de bord Pro · Facturation'] },
  { keywords: ['chantier', 'avancement', 'étape', 'travaux', 'suivi'],
    reply: "Mettez à jour l'avancement de vos chantiers dans « Chantiers » en cliquant sur les étapes. Le client et l'admin sont notifiés en temps réel.",
    actions: [{ label: 'Voir mes chantiers', msg: 'Comment ajouter des photos de chantier ?' }] },
  { keywords: ['document', 'certif', 'kbis', 'assurance', 'qualification', 'validation'],
    reply: "Vos documents sont dans l'onglet « Documents ». Maintenez-les à jour (Kbis, assurance décennale, certifications) pour rester actif sur la plateforme.",
    sources: ['Conformité prestataire BATINNOV'] },
  { keywords: ['rdv', 'rendez-vous', 'créneau', 'planifier'],
    reply: "Proposez des créneaux depuis l'onglet « Agenda ». L'admin les validera avant de les transmettre au client.",
    actions: [{ label: 'Mon agenda', msg: 'Comment proposer un créneau ?' }] },
  { keywords: ['message', 'client', 'contacter', 'communication'],
    reply: "Échangez avec vos clients dans l'onglet « Messages ». Les échanges sont centralisés par chantier pour un suivi clair." },
  { keywords: ['note', 'avis', 'évaluation', 'notation'],
    reply: "Votre note est visible sur votre profil public. Les avis sont déposés par les clients après chaque chantier terminé. Soignez la qualité pour améliorer votre scoring." },
  { keywords: ['contact', 'support', 'aide', 'problème', 'incident'],
    reply: "Pour toute assistance, contactez le support BATINNOV via l'onglet « Centre d'aide ». Notre équipe répond sous 24h en jours ouvrés.",
    actions: [{ label: 'Ouvrir le support', msg: 'Mon compte a un problème' }] },
];

/* ── Réponses admin ── */
const RESPONSES_ADMIN: Response[] = [
  { keywords: ['bonjour', 'salut', 'hello', 'bonsoir'],
    reply: "Bonjour ! Je suis l'assistant Admin BATINNOV. Je peux vous guider sur tous les modules du tableau de bord.",
    actions: [{ label: 'Validation pros en attente', msg: 'Comment valider un prestataire ?' }, { label: 'Leads à traiter', msg: 'Comment gérer les leads ?' }] },
  { keywords: ['validation', 'dossier', 'prestataire', 'valider', 'activer'],
    reply: "Les dossiers en attente sont dans « Validation pros ». Vérifiez chaque pièce (Kbis, assurance décennale, certifications), puis activez ou refusez le prestataire.",
    actions: [{ label: 'Voir les validations en attente', msg: 'Quels documents vérifier ?' }],
    sources: ['Module Validation pros'] },
  { keywords: ['lead', 'prospect', 'crm', 'pipeline'],
    reply: "La section « Leads » centralise tous les prospects avec leur statut (Nouveau, Contacté, À relancer, Qualifié, Converti, Perdu). Filtrez par priorité et source.",
    actions: [{ label: 'Accéder aux leads', msg: 'Comment convertir un lead en client ?' }],
    sources: ['Module CRM · Leads'] },
  { keywords: ['demande', 'suivi', 'lifecycle', 'étape', 'pipeline demande'],
    reply: "La section « Demandes » suit chaque demande de Reçue → Validation admin → Devis envoyés → Décision client → Paiement. Cliquez sur une carte pour faire avancer l'étape.",
    actions: [{ label: 'Voir les demandes', msg: 'Quelle étape nécessite mon action ?' }],
    sources: ['Module Demandes'] },
  { keywords: ['devis', 'créer', 'proposer', 'négociation'],
    reply: "Dans « Devis », créez des propositions avec lignes TVA détaillées, transmettez au client et actez la décision. Les devis acceptés débloquent le paiement.",
    actions: [{ label: 'Gérer les devis', msg: 'Comment acter un devis accepté ?' }],
    sources: ['Module Devis admin'] },
  { keywords: ['utilisateur', 'compte', 'client', 'suspendre', 'gestion'],
    reply: "Gérez les comptes depuis « Utilisateurs ». Vous pouvez filtrer (clients / pros), rechercher par nom ou email, et suspendre / réactiver un compte.",
    sources: ['Module Utilisateurs'] },
  { keywords: ['facture', 'finance', 'paiement', 'ca', 'chiffre', 'revenue'],
    reply: "Le suivi financier est dans « Finance » : CA mensuel en graphique, factures avec statut (payé / attente / retard), bouton Relancer pour les impayés.",
    sources: ['Module Finance'] },
  { keywords: ['rdv', 'rendez-vous', 'coordonner', 'créneau', 'agenda'],
    reply: "Coordinateurs les RDV dans « RDV ». Chaque créneau proposé par un prestataire doit être validé avant d'être transmis au client.",
    sources: ['Module RDV'] },
  { keywords: ['service', 'chantier', 'bloqué', 'opération', 'avancement'],
    reply: "Suivez tous les services dans « Services ». Cliquez un chantier pour voir le stepper d'étapes, les photos Avant/Pendant/Après, et relancer le prestataire si bloqué.",
    actions: [{ label: 'Voir les services', msg: 'Comment débloquer un chantier bloqué ?' }],
    sources: ['Module Services · Chantiers'] },
  { keywords: ['statistiques', 'kpi', 'tableau', 'bord', 'dashboard'],
    reply: "Le tableau de bord affiche les KPIs en temps réel : leads à traiter, demandes en cours, devis à acter, dossiers en attente, RDV à coordonner.",
    sources: ['Accueil Admin'] },
  { keywords: ['contact', 'support', 'aide', 'technique'],
    reply: "Pour une assistance technique, contactez l'équipe développement à support@batinnov.fr. Précisez l'URL et le contexte de l'erreur.",
    actions: [{ label: 'Envoyer un email support', msg: 'Je signale un bug sur le dashboard' }] },
];

/* ── Suggestions par contexte ── */
const SUGGESTIONS = {
  client: ['Obtenir un devis', 'Installation IRVE', "Délais d'intervention", 'Certifications artisans'],
  pro:    ['Gérer mes leads', 'Créer un devis', 'Mes chantiers en cours', 'Mes documents'],
  admin:  ['Valider un prestataire', 'Leads du jour', 'Devis à acter', 'Chantiers bloqués'],
};

/* ── Quick chips par contexte ── */
const QUICK_CHIPS = {
  client: [
    { emoji: '⚡', label: 'Borne IRVE',      msg: 'irve' },
    { emoji: '🔨', label: 'Rénovation',       msg: 'rénovation' },
    { emoji: '📋', label: 'Obtenir un devis', msg: 'devis' },
  ],
  pro: [
    { emoji: '⚡', label: 'Nouveau lead',     msg: 'lead' },
    { emoji: '🔨', label: 'Mes chantiers',    msg: 'chantier' },
    { emoji: '📄', label: 'Créer un devis',   msg: 'devis' },
  ],
  admin: [
    { emoji: '✅', label: 'Validation pro',   msg: 'validation' },
    { emoji: '🎯', label: 'Leads',            msg: 'lead' },
    { emoji: '📊', label: 'Finances',         msg: 'finance' },
  ],
};

/* ── Messages par défaut ── */
const DEFAULT_MSG = {
  client: "Je n'ai pas bien compris 😊 Posez-moi une question sur nos services, tarifs, délais ou devis !",
  pro:    "Je n'ai pas bien compris. Demandez-moi de l'aide sur vos leads, chantiers, factures ou documents.",
  admin:  "Je n'ai pas bien compris. Demandez-moi de l'aide sur la validation, les leads, les devis ou les finances.",
};

const GREETINGS = {
  client: "Bonjour ! Je suis l'assistant BATINNOV 🏠\nComment puis-je vous aider ?",
  pro:    "Bonjour ! Je suis votre assistant Prestataire BATINNOV.\nComment puis-je vous aider ?",
  admin:  "Bonjour ! Je suis l'assistant Admin BATINNOV.\nQue puis-je faire pour vous ?",
};

/* ── Ollama config ── */
const AI_SERVER = 'http://127.0.0.1:8787';

const PAGE_TO_ROUTE: Record<string, string> = {
  contactSupport: '/devis',
  helpCenter: '/dashboard-client',
  messages: '/dashboard-client',
  devis: '/devis',
  demandes: '/dashboard-client',
  chantiers: '/dashboard-client',
  agenda: '/dashboard-client',
  factures: '/dashboard-client',
  proLeads: '/dashboard-pro',
  proChantiers: '/dashboard-pro',
  proAgenda: '/dashboard-pro',
  adminDashboard: '/dashboard-admin',
  adminSuivi: '/dashboard-admin',
};

async function callAIServer(payload: { role: string; message: string; history: { role: string; content: string }[]; context: object }): Promise<{ answer: string; actions: Action[]; sources: string[] } | null> {
  try {
    const res = await fetch(`${AI_SERVER}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const d = data?.data;
    if (!d?.answer) return null;
    const actions: Action[] = Array.isArray(d.actions)
      ? d.actions.map((a: { label: string; page?: string }) => ({ label: a.label, page: a.page }))
      : [];
    return { answer: d.answer, actions, sources: Array.isArray(d.sources) ? d.sources : [] };
  } catch {
    return null;
  }
}

function getReply(text: string, responses: Response[], defaultMsg: string): { reply: string; actions?: Action[]; sources?: string[] } {
  const lower = text.toLowerCase();
  for (const r of responses) {
    if (r.keywords.some(k => lower.includes(k))) {
      return { reply: r.reply, actions: r.actions, sources: r.sources };
    }
  }
  return { reply: defaultMsg };
}

let _id = 1;

/* ── Icône Sparkle ── */
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function ChatBot() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCtx = (): 'client' | 'pro' | 'admin' => {
    if (location.pathname.startsWith('/dashboard-pro')) return 'pro';
    if (location.pathname.startsWith('/dashboard-admin')) return 'admin';
    return 'client';
  };

  const ctx = getCtx();
  const themeName = ctx === 'pro' ? 'orange' : ctx === 'admin' ? 'blue' : 'green';
  const t = THEMES[themeName];
  const responses = ctx === 'pro' ? RESPONSES_PRO : ctx === 'admin' ? RESPONSES_ADMIN : RESPONSES_CLIENT;

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: _id++, texte: GREETINGS[ctx], de: 'bot' },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  /* Vérifier si le serveur Ollama est disponible */
  useEffect(() => {
    fetch(`${AI_SERVER}/health`, { signal: AbortSignal.timeout(2000) })
      .then(r => r.ok ? r.json() : null)
      .then(d => setOllamaOk(!!d?.ok))
      .catch(() => setOllamaOk(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  /* Reset si changement de contexte */
  const prevCtx = useRef(ctx);
  useEffect(() => {
    if (prevCtx.current !== ctx) {
      prevCtx.current = ctx;
      _id = 1;
      setMsgs([{ id: _id++, texte: GREETINGS[ctx], de: 'bot' }]);
      setOpen(false);
    }
  }, [ctx]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const userText = text.trim();
    setMsgs(prev => [...prev, { id: _id++, texte: userText, de: 'user' }]);
    setDraft('');
    setTyping(true);
    historyRef.current.push({ role: 'user', content: userText });

    /* Essai Ollama — fallback mots-clés si indisponible */
    const aiResult = await callAIServer({ role: ctx, message: userText, history: historyRef.current.slice(-8), context: { page: location.pathname } });

    let texte: string;
    let actions: Action[] | undefined;
    let sources: string[] | undefined;

    if (aiResult) {
      setOllamaOk(true);
      texte = aiResult.answer;
      actions = aiResult.actions.length > 0 ? aiResult.actions : undefined;
      sources = aiResult.sources.length > 0 ? aiResult.sources : undefined;
    } else {
      if (ollamaOk !== false) setOllamaOk(false);
      const result = getReply(userText, responses, DEFAULT_MSG[ctx]);
      texte = result.reply;
      actions = result.actions;
      sources = result.sources;
    }

    historyRef.current.push({ role: 'assistant', content: texte });
    if (historyRef.current.length > 16) historyRef.current = historyRef.current.slice(-16);

    setTyping(false);
    setMsgs(prev => [...prev, { id: _id++, texte, de: 'bot', actions, sources }]);
  };

  const runAction = (action: Action) => {
    if (action.page && PAGE_TO_ROUTE[action.page]) {
      navigate(PAGE_TO_ROUTE[action.page]);
      setOpen(false);
    } else if (action.href) {
      navigate(action.href);
      setOpen(false);
    } else if (action.msg) {
      send(action.msg);
    }
  };

  const showSuggestions = msgs.length <= 1;
  const unread = !open && msgs.filter(m => m.de === 'bot').length > 1;

  return (
    <>
      {open && (
        <div className="cb-window">
          {/* HEADER */}
          <div className="cb-header" style={{ background: `linear-gradient(135deg, ${t.gradFrom} 0%, ${t.gradTo} 100%)` }}>
            <div className="cb-header-info">
              <div className="cb-avatar-gradient" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 100%)` }}>
                <SparkleIcon />
              </div>
              <div>
                <strong className="cb-header-title">Assistant Batinnov</strong>
                <span className="cb-status">
                  <span className="cb-dot" style={ollamaOk === true ? { background: '#4ade80' } : ollamaOk === false ? { background: '#f87171' } : {}} />
                  {ollamaOk === true ? 'IA Ollama · actif' : ollamaOk === false ? (ctx === 'pro' ? 'Espace Pro' : ctx === 'admin' ? 'Espace Admin' : 'Mode standard') : 'Connexion…'}
                </span>
              </div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)} aria-label="Fermer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div className="cb-messages" style={{ background: t.msgBg }}>
            <div className="cb-date-separator">Aujourd'hui</div>

            {msgs.map(m => (
              <div key={m.id} className={`cb-msg-wrap ${m.de}`}>
                {m.de === 'bot' && (
                  <div className="cb-msg-avatar" style={{ background: `linear-gradient(135deg, ${t.gradFrom} 0%, ${t.gradTo} 100%)` }}>
                    <SparkleIcon />
                  </div>
                )}
                <div className="cb-bubble-wrap">
                  <div className="cb-bubble" style={m.de === 'user' ? { background: t.userBubble } : {}}>
                    {m.texte.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    {m.actions && m.actions.length > 0 && (
                      <div className="cb-actions">
                        {m.actions.map((a, i) => (
                          <button key={i} className="cb-action-btn" onClick={() => runAction(a)}>
                            <span>{a.label}</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="cb-sources">
                      Source : {m.sources.slice(0, 2).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="cb-msg-wrap bot">
                <div className="cb-msg-avatar" style={{ background: `linear-gradient(135deg, ${t.gradFrom} 0%, ${t.gradTo} 100%)` }}>
                  <SparkleIcon />
                </div>
                <div className="cb-bubble cb-typing">
                  <span style={{ background: t.primary }} />
                  <span style={{ background: t.primary }} />
                  <span style={{ background: t.primary }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* SUGGESTIONS INITIALES */}
          {showSuggestions && (
            <div className="cb-suggestions" style={{ background: t.msgBg, borderTopColor: t.border }}>
              {SUGGESTIONS[ctx].map(s => (
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

          {/* QUICK CHIPS */}
          {!showSuggestions && (
            <div className="cb-quick-chips" style={{ borderTopColor: t.border }}>
              {QUICK_CHIPS[ctx].map(c => (
                <button
                  key={c.label}
                  className="cb-quick-chip"
                  style={{ borderColor: t.border }}
                  onClick={() => send(c.msg)}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div className="cb-input-bar">
            <input
              ref={inputRef}
              placeholder="Votre question…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(draft)}
              disabled={typing}
              style={{ '--focus-color': t.primary } as React.CSSProperties}
              className="cb-input-themed"
            />
            <button
              className="cb-send"
              style={{ background: !draft.trim() || typing ? '#E5E7EB' : `linear-gradient(135deg, ${t.gradFrom} 0%, ${t.gradTo} 100%)` }}
              onClick={() => send(draft)}
              disabled={!draft.trim() || typing}
              aria-label="Envoyer"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* BOUTON FLOTTANT */}
      <button
        className={`cb-fab ${open ? 'open' : ''}`}
        style={{ background: open ? t.dark : `linear-gradient(135deg, ${t.gradFrom} 0%, ${t.gradTo} 100%)`, boxShadow: `0 4px 20px ${t.primary}60` }}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {unread && <span className="cb-fab-dot" />}
      </button>
    </>
  );
}
