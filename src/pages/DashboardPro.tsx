import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI, prestationsAPI, demandesAPI, paiementsAPI, conversationsAPI, rendezVousAPI, notificationsAPI, normalizeDate, normalizeMontant } from '../services/api';
import './DashboardPro.css';

// ─── Notifications Pro ────────────────────────────────────────────────────────
type ProNotifType = 'message' | 'job_update' | 'quote_request' | 'payment' | 'review';

const NOTIF_PRO_CONFIG: Record<ProNotifType, { label: string; color: string; soft: string; icon: React.ReactNode }> = {
  message:       { label: 'Message',       color: '#E87D50', soft: '#FFF5F0', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  job_update:    { label: 'Chantier',      color: '#8B5CF6', soft: '#F5F3FF', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  quote_request: { label: 'Nouveau lead',  color: '#3B82F6', soft: '#EFF6FF', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  payment:       { label: 'Paiement',      color: '#10B981', soft: '#ECFDF5', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  review:        { label: 'Avis reçu',     color: '#EC4899', soft: '#FDF2F8', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
};

const NOTIF_FILTERS_PRO = [
  { id: 'toutes',        label: 'Toutes' },
  { id: 'unread',        label: 'Non lues' },
  { id: 'quote_request', label: 'Leads' },
  { id: 'message',       label: 'Messages' },
  { id: 'job_update',    label: 'Chantiers' },
  { id: 'payment',       label: 'Paiements' },
  { id: 'review',        label: 'Avis' },
];

const initProNotifs: { id: string; type: ProNotifType; title: string; body: string; createdAt: string; read: boolean }[] = [
  { id: 'p1', type: 'quote_request', title: 'Nouveau lead — Wallbox 11kW Chamalières', body: "Antoine B. recherche un électricien IRVE. Budget estimé : 1 600 €. Répondez rapidement !", createdAt: new Date(Date.now() - 2*60000).toISOString(),       read: false },
  { id: 'p2', type: 'message',       title: 'Message de Marie L.',                     body: "Bonjour, est-ce que vous pouvez venir mercredi matin ? La porte sera ouverte à 8h30.",  createdAt: new Date(Date.now() - 30*60000).toISOString(),      read: false },
  { id: 'p3', type: 'payment',       title: 'Paiement reçu — 1 200 €',                 body: "Le paiement de Pierre R. pour la facture F-2026-005 a été validé.",                     createdAt: new Date(Date.now() - 3*3600000).toISOString(),     read: false },
  { id: 'p4', type: 'job_update',    title: 'Chantier #P2 — statut mis à jour',        body: "Le chantier de Thomas D. (Wallbox 11kW Riom) a été marqué En cours.",                  createdAt: new Date(Date.now() - 24*3600000).toISOString(),    read: true  },
  { id: 'p5', type: 'review',        title: 'Nouvel avis 5★ de Pierre R.',             body: "\"Très professionnel, installation rapide et soignée. Je recommande vivement !\"",      createdAt: new Date(Date.now() - 2*24*3600000).toISOString(),  read: true  },
];

function proFormatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function DashboardPro() {
  const [activePage, setActivePage] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };
  const [menuOpen, setMenuOpen] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type?: 'error' } | null>(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const showNotif = (msg: string, type?: 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  };

  /* ── Profil (depuis API) ── */
  const [proForm, setProForm] = useState({
    prenom: user?.prenom ?? '', nom: user?.nom ?? '',
    email: user?.email ?? '',
    tel: '', societe: '', siret: '', ville: ''
  });

  const pro = {
    nom:       `${proForm.prenom} ${proForm.nom}`.trim() || user?.email || '—',
    entreprise: proForm.societe || '—',
    metier:    '—',
    ville:     proForm.ville || '—',
    note:      0,
    avis:      0,
    avatar:    proForm.prenom[0]?.toUpperCase() + (proForm.nom[0]?.toUpperCase() ?? '')
  };

  const [stats, setStats] = useState([
    { label: 'Chantiers en cours', value: '—', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, trend: '', page: 'chantiers' },
    { label: 'Devis en attente',   value: '—', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, trend: '', page: 'leads' },
    { label: 'Revenus ce mois',    value: '—', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, trend: '', page: 'facturation' },
    { label: 'Nouveaux leads',     value: '—', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, trend: '', page: 'leads' }
  ]);

  const [chantiers, setChantiers] = useState<any[]>([]);

  const handleUpdateStep = (id: any, stepIndex: number) => {
    setChantiers(prev => prev.map((c: any) => {
      if (c.id !== id) return c;
      const isLast = stepIndex === c.steps.length - 1;
      return { ...c, currentStep: stepIndex, statut: isLast ? 'termine' : stepIndex === 0 ? 'planifie' : 'en_cours' };
    }));
    prestationsAPI.changerStatut(id, stepIndex === 0 ? 'planifiee' : 'en_cours').catch(() => {});
    showNotif('Avancement mis à jour ✓');
  };

  const [leads, setLeads] = useState<any[]>([]);

  // ── Agenda Pro ──
  interface RdvPro { id: any; client: string; service: string; dateStr: string; dayIdx: number; heure: string; duree: string; statut: 'confirme' | 'a_confirmer' | 'refuse'; avatar: string; }
  const [agendaRdv, setAgendaRdv] = useState<RdvPro[]>([]);
  const [agendaDay, setAgendaDay] = useState(0);
  const WEEK_DAYS = (() => {
    const days: string[] = [];
    const now = new Date();
    const DAY_NAMES = ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i);
      days.push(`${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return days;
  })();
  const handleConfirmRdv = (id: any) => {
    setAgendaRdv(prev => prev.map(r => r.id === id ? { ...r, statut: 'confirme' } : r));
    showNotif('RDV confirmé ✓');
  };
  const handleRefuseRdv = (id: any) => {
    setAgendaRdv(prev => prev.map(r => r.id === id ? { ...r, statut: 'refuse' } : r));
    showNotif('RDV refusé', 'error');
  };

  const [selectedChantier, setSelectedChantier] = useState<any | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [draft, setDraft] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDraftChange = (val: string) => {
    setDraft(val);
    if (!isTyping) setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const sendMessage = () => {
    if (!draft.trim() || selectedConv === null) return;
    const now = new Date();
    const heure = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setConversations(prev => prev.map(c =>
      c.id === selectedConv
        ? { ...c, lu: true, messages: [...c.messages, { id: Date.now(), texte: draft, de: 'moi', heure, date: "Aujourd'hui" }] }
        : c
    ));
    setDraft('');
    setIsTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedConv]);

  /* ── Fetch données réelles ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authAPI.me();
      const profil = me?.profil ?? me;
      setProForm({
        prenom:  profil?.prenom          ?? me?.prenom ?? '',
        nom:     profil?.nom             ?? me?.nom    ?? '',
        email:   me?.email               ?? '',
        tel:     profil?.telephone       ?? '',
        societe: profil?.raisonSociale   ?? '',
        siret:   profil?.siret           ?? '',
        ville:   profil?.ville           ?? '',
      });

      /* Chantiers / prestations */
      try {
        const raw = await prestationsAPI.getAll();
        const list = Array.isArray(raw) ? raw : [];
        setChantiers(list.map((p: any) => ({
          id:          p.id,
          ref:         `#${p.id?.slice(0,6) ?? 'P'}`,
          client:      p.client?.nom ?? p.client?.prenom ?? '—',
          service:     p.ligneDevis?.typePrestation?.libelle ?? '—',
          titre:       p.ligneDevis?.designation ?? 'Prestation',
          adresse:     `${p.villeIntervention ?? ''} (${p.codePostalIntervention ?? ''})`,
          date:        normalizeDate(p.datePrevue),
          statut:      p.statut === 'terminee' ? 'termine' : p.statut === 'en_cours' ? 'en_cours' : 'planifie',
          montant:     normalizeMontant(p.ligneDevis?.montantHT),
          currentStep: p.statut === 'terminee' ? 3 : p.statut === 'en_cours' ? 1 : 0,
          steps:       ['Visite', 'Intervention', 'Contrôle', 'Livraison'],
        })));
        const enCours = list.filter((p: any) => p.statut === 'en_cours').length;
        setStats(prev => prev.map((s, i) => i === 0 ? { ...s, value: String(enCours) } : s));
      } catch {}

      /* Leads (demandes à assigner) */
      try {
        const raw = await demandesAPI.list();
        const list = Array.isArray(raw) ? raw : [];
        setLeads(list.filter((d: any) => d.statut === 'validee' || d.statut === 'devis_emis').map((d: any) => ({
          id:       d.id,
          client:   d.client?.nom ?? d.client?.prenom ?? '—',
          service:  d.typePrestation?.libelle ?? '—',
          adresse:  `${d.villeIntervention ?? ''} (${d.codePostalIntervention ?? ''})`,
          budget:   '—',
          date:     normalizeDate(d.creeLe),
          urgent:   false,
          repondu:  false,
        })));
        setStats(prev => prev.map((s, i) => i === 1 ? { ...s, value: String(list.filter((d: any) => d.statut === 'validee').length) } : s));
      } catch {}

      /* Factures / paiements */
      try {
        const raw = await paiementsAPI.getAll();
        const list = Array.isArray(raw) ? raw : [];
        setFactures(list.map((p: any) => ({
          id:      p.id,
          num:     p.reference ?? `PAY-${p.id?.slice(0,8)}`,
          client:  p.devis?.client?.nom ?? '—',
          date:    normalizeDate(p.datePaiement ?? p.creeLe),
          montant: normalizeMontant(p.montant),
          ok:      p.statut === 'paye',
        })));
      } catch {}

      /* RDV */
      try {
        const raw = await rendezVousAPI.list();
        const list = Array.isArray(raw) ? raw : [];
        const DAY_NAMES = ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'];
        setAgendaRdv(list.map((r: any) => {
          const d = r.dateDebut ? new Date(r.dateDebut) : null;
          const dayDiff = d ? Math.round((d.getTime() - Date.now()) / 86400000) : 99;
          return {
            id:      r.id,
            client:  r.client?.nom ?? r.client?.prenom ?? '—',
            service: r.notes ?? r.type ?? '—',
            dateStr: d ? `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}` : '—',
            dayIdx:  Math.max(0, Math.min(5, dayDiff)),
            heure:   d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
            duree:   r.dureeMinutes ? `${r.dureeMinutes}min` : '—',
            statut:  r.statut === 'confirme' ? 'confirme' : r.statut === 'annule' ? 'refuse' : 'a_confirmer',
            avatar:  (r.client?.nom ?? r.client?.prenom ?? 'C')[0]?.toUpperCase() ?? 'C',
          };
        }));
      } catch {}

      /* Conversations */
      try {
        const raw = await conversationsAPI.list('pro');
        const list = Array.isArray(raw) ? raw : [];
        setConversations(list.map((c: any) => ({
          id:       c.id,
          nom:      c.client?.nom ?? c.client?.prenom ?? 'Client',
          avatar:   (c.client?.nom ?? c.client?.prenom ?? 'C')[0]?.toUpperCase() ?? 'C',
          lu:       !c.nonLus || c.nonLus === 0,
          service:  c.sujet ?? '—',
          chantier: c.sujet ?? '—',
          messages: (c.messages ?? []).map((m: any) => ({
            id:    m.id,
            texte: m.contenu ?? '',
            de:    m.expediteurId === me?.id ? 'moi' : 'eux',
            heure: m.envoyeLe ? new Date(m.envoyeLe).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
            date:  normalizeDate(m.envoyeLe),
          })),
        })));
      } catch {}

    } catch (err: any) {
      console.error('[DashboardPro] fetchData:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const convActive = conversations.find(c => c.id === selectedConv);
  const filteredConvs = conversations.filter(c =>
    c.nom.toLowerCase().includes(convSearch.toLowerCase()) ||
    c.service?.toLowerCase().includes(convSearch.toLowerCase())
  );

  /* ── Handlers leads ── */
  const handleEnvoyerDevis = (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, repondu: true } : l));
    showNotif(`Devis envoyé à ${lead?.client} ✓`);
  };

  const handleRefuserLead = (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    showNotif(`Lead de ${lead?.client} refusé`, 'error');
  };

  /* ── Handlers documents ── */
  const handleMettreAJourDoc = (docId: number) => {
    showNotif('Sélectionnez un fichier pour mettre à jour ce document');
  };

  /* ── Handlers facturation ── */
  const handleNouvelleFacture = () => {
    const newId = factures.length + 1;
    const newFacture = {
      id: newId,
      num: `F-2026-00${newId + 5}`,
      client: 'Nouveau client',
      date: 'Aujourd\'hui',
      montant: '—',
      ok: false
    };
    setFactures(prev => [newFacture, ...prev]);
    showNotif('Nouvelle facture créée — complétez les informations');
  };

  /* ── Handler profil ── */
  const handleSauvegarderProfil = () => {
    showNotif('Profil sauvegardé avec succès ✓');
  };

  /* ── Notifications Pro ── */
  const [proNotifications, setProNotifications] = useState(initProNotifs);
  const [proNotifFilter, setProNotifFilter] = useState('toutes');
  const handleMarkProNotifRead = (id: string) =>
    setProNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllProRead = () =>
    setProNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#E87D50', bg: '#FFF5F0' },
    planifie: { label: 'Planifié', color: '#6366F1', bg: '#F0F0FF' },
    termine: { label: 'Terminé', color: '#22C55E', bg: '#F0FDF4' }
  };

  const leadsActifs = leads.filter(l => !l.repondu);

  const filteredProNotifs = proNotifFilter === 'toutes'
    ? proNotifications
    : proNotifFilter === 'unread'
      ? proNotifications.filter(n => !n.read)
      : proNotifications.filter(n => n.type === (proNotifFilter as ProNotifType));

  const rdvPending = agendaRdv.filter(r => r.statut === 'a_confirmer').length;

  const navItems = [
    { id: 'dashboard',   label: 'Tableau de bord' },
    { id: 'leads',       label: 'Leads',     badge: leadsActifs.length },
    { id: 'chantiers',   label: 'Chantiers' },
    { id: 'agenda',      label: 'Agenda',    badge: rdvPending },
    { id: 'messages',    label: 'Messages',  badge: conversations.filter(c => !c.lu).length },
    { id: 'documents',   label: 'Documents' },
    { id: 'facturation', label: 'Facturation' },
  ];

  const pageTitle = {
    dashboard:   'Tableau de bord',
    leads:       'Mes leads',
    chantiers:   'Mes chantiers',
    agenda:      'Agenda',
    messages:    'Messages',
    profil:      'Mon profil',
    documents:   'Documents',
    facturation: 'Facturation'
  }[activePage] || '';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16, background: '#FFF8F5' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #F3E8E4', borderTopColor: '#E87D50', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6B7280', fontSize: 14 }}>Chargement de votre espace pro…</p>
    </div>
  );

  return (
    <div className="dp-layout">

      {/* ── NAVBAR ── */}
      <header className="dp-navbar">
        <div className="dp-navbar-inner">

          <Link to="/" className="dp-logo-link">
            <span className="dp-logo-name">BATINNOV</span>
            <span className="dp-pro-tag">PRO</span>
          </Link>

          <nav className={`dp-nav ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`dp-nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => { setActivePage(item.id); setMenuOpen(false); }}
              >
                {item.label}
                {item.badge > 0 && <span className="dp-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="dp-navbar-right">
            <Link to="/" className="dp-client-link">Voir site client</Link>

            <button className="dp-notif-bell" onClick={() => setActivePage('notifications')} title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {proNotifications.filter(n => !n.read).length > 0 && (
                <span className="dp-notif-badge">{proNotifications.filter(n => !n.read).length}</span>
              )}
            </button>

            <button className="dp-avatar-btn" onClick={() => setActivePage('profil')}>
              <div className="dp-avatar">{pro.avatar}</div>
              <div className="dp-avatar-info">
                <strong>{pro.nom}</strong>
                <span>{pro.metier}</span>
              </div>
            </button>

            <button className="dp-burger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="dp-main">
        <div className="dp-content-wrap">

          {/* Toast */}
          {notif && (
            <div style={{
              position: 'fixed', bottom: 24, right: 24,
              background: notif.type === 'error' ? '#DC2626' : '#111827',
              color: '#fff', padding: '12px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 500, display: 'flex', gap: 12,
              alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              zIndex: 1000, maxWidth: 360, animation: 'notif-in 0.2s ease'
            }}>
              <span>{notif.msg}</span>
              <button onClick={() => setNotif(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer' }}>×</button>
            </div>
          )}

          <div className="dp-page-title">
            <h1>{pageTitle}</h1>
            {activePage === 'dashboard' && (
              <p>Bonjour {pro.nom.split(' ')[0]} · <svg style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} width="13" height="13" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{pro.note}/5 · {pro.avis} avis · {pro.ville}</p>
            )}
          </div>

          {/* ── DASHBOARD ── */}
          {activePage === 'dashboard' && (
            <div className="dp-page">
              <div className="dp-stats">
                {stats.map((s, i) => (
                  <div key={i} className="dp-stat-card" style={{ cursor: 'pointer' }} onClick={() => setActivePage(s.page)}>
                    <div className="dp-stat-top">
                      <span className="dp-stat-icon">{s.icon}</span>
                      <span className="dp-stat-value">{s.value}</span>
                    </div>
                    <p className="dp-stat-label">{s.label}</p>
                    <p className="dp-stat-trend">{s.trend}</p>
                  </div>
                ))}
              </div>

              <div className="dp-grid-2">
                <div className="dp-card">
                  <div className="dp-card-head">
                    <h3>Chantiers récents</h3>
                    <button className="dp-link" onClick={() => setActivePage('chantiers')}>Voir tout →</button>
                  </div>
                  {chantiers.slice(0, 3).map(c => (
                    <div key={c.id} className="dp-row">
                      <div className="dp-row-info">
                        <strong>{c.client}</strong>
                        <span>{c.service} · {c.adresse}</span>
                      </div>
                      <div className="dp-row-right">
                        <span className="dp-tag" style={{ color: statutConfig[c.statut].color, background: statutConfig[c.statut].bg }}>
                          {statutConfig[c.statut].label}
                        </span>
                        <strong>{c.montant}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dp-card">
                  <div className="dp-card-head">
                    <h3>Nouveaux leads</h3>
                    <button className="dp-link" onClick={() => setActivePage('leads')}>Voir tout →</button>
                  </div>
                  {leadsActifs.slice(0, 3).map(l => (
                    <div key={l.id} className="dp-lead-row">
                      {l.urgent && <span className="dp-urgent"><span className="dp-urgent-dot" />Urgent</span>}
                      <strong>{l.service}</strong>
                      <span>{l.adresse} · {l.budget}</span>
                      <span className="dp-time">{l.date}</span>
                      <button className="dp-btn-sm" onClick={() => setActivePage('leads')}>Répondre →</button>
                    </div>
                  ))}
                  {leadsActifs.length === 0 && (
                    <p style={{ fontSize: 13, color: '#9CA3AF', padding: '12px 0' }}>Aucun lead en attente</p>
                  )}
                </div>
              </div>

              <div className="dp-card">
                <div className="dp-card-head">
                  <h3>Messages récents</h3>
                  <button className="dp-link" onClick={() => setActivePage('messages')}>Voir tout →</button>
                </div>
                {conversations.map(c => (
                  <div
                    key={c.id}
                    className={`dp-msg-row ${!c.lu ? 'unread' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setActivePage('messages'); setSelectedConv(c.id); }}
                  >
                    <div className="dp-msg-avatar">{c.avatar}</div>
                    <div className="dp-msg-body">
                      <strong>{c.nom}</strong>
                      <span>{c.messages.at(-1)?.texte}</span>
                    </div>
                    <span className="dp-time">{c.messages.at(-1)?.heure}</span>
                    {!c.lu && <span className="dp-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LEADS ── */}
          {activePage === 'leads' && (
            <div className="dp-page">
              <div className="dp-card">
                <div className="dp-card-head">
                  <h3>Leads disponibles ({leadsActifs.length})</h3>
                </div>
                {leadsActifs.map(l => (
                  <div key={l.id} className="dp-lead-card">
                    {l.urgent && <span className="dp-urgent"><span className="dp-urgent-dot" />Urgent</span>}
                    <div className="dp-lead-info">
                      <h4>{l.service}</h4>
                      <p className="dp-lead-meta">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {l.adresse}
                      </p>
                      <p className="dp-lead-meta">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Budget : {l.budget}
                      </p>
                      <p className="dp-lead-meta">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {l.client} · {l.date}
                      </p>
                    </div>
                    <div className="dp-lead-actions">
                      <button className="dp-btn-primary" onClick={() => handleEnvoyerDevis(l.id)}>
                        Envoyer un devis
                      </button>
                      <button className="dp-btn-ghost" onClick={() => handleRefuserLead(l.id)}>
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
                {leadsActifs.length === 0 && (
                  <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun lead disponible pour le moment</p>
                )}
              </div>
            </div>
          )}

          {/* ── CHANTIERS ── */}
          {activePage === 'chantiers' && (
            <div className="dp-page">
              {selectedChantier === null ? (
                <>
                  <div className="dp-page-head">
                    <h1>Mes chantiers</h1>
                    <span className="dp-page-head-sub">{chantiers.filter(c => c.statut === 'en_cours').length} en cours · {chantiers.filter(c => c.statut === 'planifie').length} planifiés</span>
                  </div>
                  <div className="dp-chantiers-list">
                    {chantiers.map(c => {
                      const pct = c.steps.length <= 1 ? 100 : Math.round((c.currentStep / (c.steps.length - 1)) * 100);
                      return (
                        <div key={c.id} className="dp-chantier-card" onClick={() => setSelectedChantier(c.id)} style={{ cursor: 'pointer' }}>
                          <div className="dp-chantier-top">
                            <span className="dp-chantier-ref">{c.service} · {c.ref}</span>
                            <span className="dp-tag" style={{ color: statutConfig[c.statut].color, background: statutConfig[c.statut].bg }}>
                              {statutConfig[c.statut].label}
                            </span>
                          </div>
                          <h3 className="dp-chantier-titre">{c.titre}</h3>
                          <p className="dp-chantier-meta">{c.client} · {c.adresse}</p>
                          <div className="dp-chantier-bar-track">
                            <div className="dp-chantier-bar-fill" style={{ width: `${pct}%`, background: statutConfig[c.statut].color }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>
                              Étape {c.currentStep + 1}/{c.steps.length} : <strong>{c.steps[c.currentStep]}</strong>
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: statutConfig[c.statut].color }}>{pct}%</span>
                          </div>
                          <div className="dp-chantier-footer">
                            <span>Client : <strong>{c.client}</strong></span>
                            <span>{c.montant} · <span style={{ color: '#9CA3AF' }}>{c.date}</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (() => {
                const c = chantiers.find(x => x.id === selectedChantier);
                if (!c) return null;
                const pct = c.steps.length <= 1 ? 100 : Math.round((c.currentStep / (c.steps.length - 1)) * 100);
                return (
                  <div className="pro-job-detail">
                    <button className="dp-back-btn" onClick={() => setSelectedChantier(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                      Retour aux chantiers
                    </button>

                    {/* Hero */}
                    <div className="pro-job-hero">
                      <div className="pro-job-hero-info">
                        <span className="pro-job-ref">{c.service} · {c.ref}</span>
                        <h2>{c.titre}</h2>
                        <p>{c.client} · {c.adresse} · {c.date}</p>
                      </div>
                      <div className="pro-job-hero-pct" style={{ color: statutConfig[c.statut].color }}>
                        <span>{pct}%</span>
                        <div className="pro-job-hero-bar"><div style={{ width: `${pct}%`, background: statutConfig[c.statut].color }} /></div>
                        <small>{statutConfig[c.statut].label}</small>
                      </div>
                    </div>

                    {/* Phases verticales */}
                    <div className="pro-job-section-title">Phases du chantier</div>
                    <div className="pro-job-phases">
                      {c.steps.map((step, i) => {
                        const done    = i < c.currentStep;
                        const current = i === c.currentStep;
                        const color   = done ? '#22C55E' : current ? '#E87D50' : '#9CA3AF';
                        return (
                          <div key={i} className="pro-job-phase-row">
                            {/* Ligne verticale */}
                            <div className="pro-job-phase-connector">
                              <div className="pro-job-phase-dot" style={{ background: color, borderColor: color }}>
                                {done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                {current && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                              </div>
                              {i < c.steps.length - 1 && <div className="pro-job-phase-line" style={{ background: done ? '#22C55E30' : '#E5E7EB' }} />}
                            </div>
                            {/* Contenu */}
                            <div className={`pro-job-phase-card ${done ? 'done' : current ? 'current' : ''}`}>
                              <div className="pro-job-phase-card-top">
                                <div>
                                  <span className="pro-job-phase-num" style={{ color }}>Étape {i + 1}</span>
                                  <strong className="pro-job-phase-label">{step}</strong>
                                </div>
                                <span className="dp-tag" style={{ color, background: color + '18', fontSize: 11 }}>
                                  {done ? 'Terminé' : current ? 'En cours' : 'À faire'}
                                </span>
                              </div>
                              {current && (
                                <div className="pro-job-phase-actions">
                                  <button className="pro-job-photo-btn" onClick={() => showNotif('Ajout photo — bientôt disponible')}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                    Ajouter une photo
                                  </button>
                                  {i < c.steps.length - 1 && (
                                    <button className="pro-job-next-btn" onClick={() => { handleUpdateStep(c.id, i + 1); }}>
                                      Valider et passer à : <strong>{c.steps[i + 1]}</strong> →
                                    </button>
                                  )}
                                  {i === c.steps.length - 1 && (
                                    <button className="pro-job-next-btn" style={{ background: '#22C55E' }} onClick={() => { handleUpdateStep(c.id, i); setSelectedChantier(null); }}>
                                      ✓ Marquer le chantier comme terminé
                                    </button>
                                  )}
                                </div>
                              )}
                              {!done && !current && (
                                <p className="pro-job-phase-todo">Cette étape démarrera après la validation de l'étape précédente.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Photos */}
                    <div className="pro-job-section-title" style={{ marginTop: 24 }}>Photos du chantier</div>
                    <div className="pro-job-photos-grid">
                      {[...Array(4)].map((_, i) => (
                        <button key={i} className="pro-job-photo-tile" onClick={() => showNotif('Galerie photos — bientôt disponible')}>
                          <div className="pro-job-photo-tile-inner" style={{ background: `linear-gradient(140deg, ${['#1B5E41','#2E7D55','#C45A28','#9D3F1F'][i]} 0%, #0a1a12 100%)` }}>
                            {i === 3 ? (
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700 }}>+ Ajouter</span>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            )}
                          </div>
                          <span className="pro-job-photo-label">{['Avant','Phase 1','Phase 2','Ajouter'][i]}</span>
                        </button>
                      ))}
                    </div>

                    {/* Actions bas */}
                    <div className="pro-job-bottom-actions">
                      <button className="pro-job-msg-btn" onClick={() => { setSelectedChantier(null); setActivePage('messages'); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Contacter le client
                      </button>
                      <button className="pro-job-rdv-btn" onClick={() => { setSelectedChantier(null); setActivePage('agenda'); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Voir l'agenda
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── AGENDA PRO ── */}
          {activePage === 'agenda' && (
            <div className="dp-page">
              <div className="dp-page-head">
                <h1>Agenda</h1>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6B7280' }}>
                  <span><strong style={{ color: '#111827' }}>{agendaRdv.filter(r => r.statut === 'confirme').length}</strong> confirmés</span>
                  <span><strong style={{ color: '#E87D50' }}>{rdvPending}</strong> en attente</span>
                </div>
              </div>

              {/* Semaine */}
              <div className="pro-agenda-week">
                {WEEK_DAYS.map((day, i) => {
                  const events = agendaRdv.filter(r => r.dayIdx === i && r.statut !== 'refuse');
                  return (
                    <button key={i} className={`pro-agenda-day-btn ${agendaDay === i ? 'selected' : ''}`} onClick={() => setAgendaDay(i)}>
                      <span className="pro-agenda-day-name">{day.split(' ')[0]}</span>
                      <span className="pro-agenda-day-date">{day.split(' ')[1]}</span>
                      {events.length > 0 && (
                        <div className="pro-agenda-day-dots">
                          {events.slice(0, 3).map((e, j) => (
                            <span key={j} className="pro-agenda-day-dot" style={{ background: e.statut === 'a_confirmer' ? '#E87D50' : '#22C55E' }} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* RDV à confirmer */}
              {rdvPending > 0 && (
                <div className="pro-agenda-pending-section">
                  <div className="pro-agenda-pending-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E87D50" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {rdvPending} demande{rdvPending > 1 ? 's' : ''} de RDV en attente de confirmation
                  </div>
                  {agendaRdv.filter(r => r.statut === 'a_confirmer').map(rdv => (
                    <div key={rdv.id} className="pro-agenda-pending-card">
                      <div className="pro-agenda-rdv-avatar">{rdv.avatar}</div>
                      <div className="pro-agenda-rdv-info">
                        <strong>{rdv.client}</strong>
                        <span>{rdv.service}</span>
                        <span style={{ color: '#E87D50', fontWeight: 600 }}>{rdv.dateStr} · {rdv.heure} · {rdv.duree}</span>
                      </div>
                      <div className="pro-agenda-rdv-actions">
                        <button className="pro-agenda-confirm-btn" onClick={() => handleConfirmRdv(rdv.id)}>✓ Confirmer</button>
                        <button className="pro-agenda-refuse-btn" onClick={() => handleRefuseRdv(rdv.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline du jour sélectionné */}
              <div className="pro-agenda-day-section">
                <div className="pro-agenda-day-title">{WEEK_DAYS[agendaDay]}</div>
                {agendaRdv.filter(r => r.dayIdx === agendaDay && r.statut !== 'refuse').length === 0 ? (
                  <div className="notif-empty" style={{ marginTop: 16 }}>
                    <div className="notif-empty-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <strong>Journée libre</strong>
                    <span>Aucun RDV prévu ce jour</span>
                  </div>
                ) : (
                  <div className="pro-agenda-timeline">
                    {agendaRdv.filter(r => r.dayIdx === agendaDay && r.statut !== 'refuse').sort((a,b) => a.heure.localeCompare(b.heure)).map(rdv => (
                      <div key={rdv.id} className={`pro-agenda-event ${rdv.statut === 'a_confirmer' ? 'pending' : 'confirmed'}`}>
                        <div className="pro-agenda-event-time">
                          <strong>{rdv.heure}</strong>
                          <small>{rdv.duree}</small>
                        </div>
                        <div className="pro-agenda-event-bar" style={{ background: rdv.statut === 'a_confirmer' ? '#E87D50' : '#22C55E' }} />
                        <div className="pro-agenda-event-info">
                          <div className="pro-agenda-rdv-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{rdv.avatar}</div>
                          <div>
                            <strong>{rdv.client}</strong>
                            <span>{rdv.service}</span>
                          </div>
                          <span className="dp-tag" style={{ marginLeft: 'auto', color: rdv.statut === 'a_confirmer' ? '#E87D50' : '#22C55E', background: rdv.statut === 'a_confirmer' ? '#FFF5F0' : '#F0FDF4', fontSize: 11 }}>
                            {rdv.statut === 'a_confirmer' ? 'À confirmer' : 'Confirmé'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {activePage === 'messages' && (
            <div className="dp-page">
              <div className="chat-layout">

                {/* ── SIDEBAR ── */}
                <div className="chat-sidebar">
                  <div className="dp-chat-sidebar-head">
                    <span>Messages <strong>{conversations.filter(c => !c.lu).length > 0 ? `(${conversations.filter(c => !c.lu).length} non lu)` : ''}</strong></span>
                  </div>
                  <div className="dp-chat-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      className="dp-chat-search"
                      placeholder="Rechercher..."
                      value={convSearch}
                      onChange={e => setConvSearch(e.target.value)}
                    />
                  </div>
                  {filteredConvs.map(conv => (
                    <button
                      key={conv.id}
                      className={`chat-conv-item ${selectedConv === conv.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedConv(conv.id);
                        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, lu: true } : c));
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div className="chat-conv-avatar pro">{conv.avatar}</div>
                        {!conv.lu && <span className="dp-chat-avatar-dot" />}
                      </div>
                      <div className="chat-conv-info">
                        <div className="chat-conv-name">
                          <strong>{conv.nom}</strong>
                          <span className="dp-chat-conv-time">{conv.messages.at(-1)?.heure}</span>
                        </div>
                        <span className="dp-chat-conv-service">{conv.service}</span>
                        <span className={`chat-conv-preview ${!conv.lu ? 'unread' : ''}`}>
                          {conv.messages.at(-1)?.de === 'moi' ? 'Vous : ' : ''}{conv.messages.at(-1)?.texte}
                        </span>
                      </div>
                    </button>
                  ))}
                  {filteredConvs.length === 0 && (
                    <p style={{ fontSize: 13, color: '#9CA3AF', padding: '20px 18px' }}>Aucune conversation trouvée</p>
                  )}
                </div>

                {/* ── FENÊTRE ── */}
                <div className="chat-window">
                  {!convActive ? (
                    <div className="chat-empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <p>Sélectionnez une conversation</p>
                      <span style={{ fontSize: 12, color: '#D1D5DB' }}>Vos échanges avec les clients apparaissent ici</span>
                    </div>
                  ) : (
                    <>
                      {/* HEADER enrichi */}
                      <div className="chat-header">
                        <div className="chat-conv-avatar pro" style={{ width: 40, height: 40, fontSize: 13 }}>{convActive.avatar}</div>
                        <div className="dp-chat-header-info">
                          <strong>{convActive.nom}</strong>
                          <span>{convActive.service} · {convActive.chantier}</span>
                        </div>
                        <button
                          className="dp-chat-header-action"
                          onClick={() => setActivePage('chantiers')}
                        >
                          Voir le chantier →
                        </button>
                      </div>

                      {/* MESSAGES avec séparateurs de date */}
                      <div className="chat-messages">
                        {(() => {
                          let lastDate = '';
                          const msgs = convActive.messages;
                          return msgs.map((msg, idx) => {
                            const showDate = msg.date !== lastDate;
                            lastDate = msg.date;
                            const isLastSent = msg.de === 'moi' && idx === msgs.length - 1;
                            return (
                              <div key={msg.id}>
                                {showDate && (
                                  <div className="dp-chat-date-sep">
                                    <span>{msg.date}</span>
                                  </div>
                                )}
                                <div className={`chat-bubble-wrap ${msg.de === 'moi' ? 'moi' : 'eux'}`}>
                                  <div className="chat-bubble">
                                    <p>{msg.texte}</p>
                                    <span className="chat-time">
                                      {msg.heure}
                                      {msg.de === 'moi' && (
                                        <svg style={{ marginLeft: 4, display: 'inline', verticalAlign: 'middle' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                      )}
                                    </span>
                                  </div>
                                  {isLastSent && <span className="chat-read-receipt">Lu ✓</span>}
                                </div>
                              </div>
                            );
                          });
                        })()}
                        {isTyping && (
                          <div className="chat-bubble-wrap eux">
                            <div className="chat-bubble chat-typing-bubble">
                              <span className="chat-typing-dot" /><span className="chat-typing-dot" /><span className="chat-typing-dot" />
                            </div>
                            <span className="chat-typing-label">{convActive.nom} est en train d'écrire…</span>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* INPUT BAR */}
                      <div className="chat-input-bar">
                        <button
                          className="dp-chat-attach-btn"
                          title="Joindre un fichier"
                          onClick={() => showNotif('Sélectionnez un fichier à joindre (PDF, image...)')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <input
                          type="text"
                          placeholder={`Message à ${convActive.nom}...`}
                          value={draft}
                          onChange={e => handleDraftChange(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="chat-send-btn" onClick={sendMessage} disabled={!draft.trim()}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activePage === 'documents' && (
            <div className="dp-page">
              <div className="dp-card">
                <div className="dp-card-head"><h3>Mes documents</h3></div>
                {docs.map(doc => (
                  <div key={doc.id} className="dp-doc-row">
                    <span className="dp-doc-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </span>
                    <div className="dp-doc-info">
                      <strong>{doc.name}</strong>
                      <span className={doc.ok ? 'dp-ok' : 'dp-pending'}>
                        {doc.ok ? 'Validé' : 'En attente'}
                      </span>
                    </div>
                    <span className="dp-time">Expire : {doc.date}</span>
                    <button className="dp-btn-ghost" onClick={() => handleMettreAJourDoc(doc.id)}>
                      Mettre à jour
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FACTURATION ── */}
          {activePage === 'facturation' && (
            <div className="dp-page">
              <div className="dp-stats" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Ce mois', value: '4 200 €' },
                  { label: 'En attente', value: '2 800 €' },
                  { label: 'Total 2026', value: '18 400 €' }
                ].map((s, i) => (
                  <div key={i} className="dp-stat-card">
                    <span className="dp-stat-value">{s.value}</span>
                    <p className="dp-stat-label">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="dp-card">
                <div className="dp-card-head">
                  <h3>Mes factures</h3>
                  <button className="dp-btn-primary" onClick={handleNouvelleFacture}>
                    + Nouvelle facture
                  </button>
                </div>
                <table className="dp-table">
                  <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
                  <tbody>
                    {factures.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.num}</strong></td>
                        <td>{f.client}</td>
                        <td>{f.date}</td>
                        <td><strong>{f.montant}</strong></td>
                        <td>
                          <span className="dp-tag" style={{ color: f.ok ? '#22C55E' : '#E87D50', background: f.ok ? '#F0FDF4' : '#FFF5F0' }}>
                            {f.ok ? 'Payée' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activePage === 'notifications' && (
            <div className="dp-page">
              <div className="notif-header-row">
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                  Notifications
                  {proNotifications.filter(n => !n.read).length > 0 && (
                    <span className="notif-header-badge">{proNotifications.filter(n => !n.read).length} non lues</span>
                  )}
                </h1>
                {proNotifications.filter(n => !n.read).length > 0 && (
                  <button className="notif-mark-all-btn" style={{ background: '#FFF3EE', color: '#E87D50' }} onClick={handleMarkAllProRead}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="notif-filters">
                {NOTIF_FILTERS_PRO.map(f => {
                  const count = f.id === 'toutes' ? proNotifications.length
                    : f.id === 'unread' ? proNotifications.filter(n => !n.read).length
                    : proNotifications.filter(n => n.type === f.id).length;
                  return (
                    <button key={f.id} className={`notif-pill pro ${proNotifFilter === f.id ? 'active' : ''}`} onClick={() => setProNotifFilter(f.id)}>
                      {f.label}
                      <span className="notif-pill-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="notif-list">
                {filteredProNotifs.length === 0 ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <strong>Aucune notification</strong>
                    <span>Vous êtes à jour. On vous tiendra au courant ici.</span>
                  </div>
                ) : (
                  filteredProNotifs.map(n => {
                    const cfg = NOTIF_PRO_CONFIG[n.type];
                    return (
                      <div key={n.id} className={`notif-card pro ${!n.read ? 'unread' : ''}`} onClick={() => handleMarkProNotifRead(n.id)}>
                        <div className="notif-icon-box" style={{ background: cfg.soft, color: cfg.color }}>{cfg.icon}</div>
                        <div className="notif-content">
                          <div className="notif-top-row">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="notif-type-label" style={{ color: cfg.color }}>{cfg.label}</span>
                              <strong className="notif-title">{n.title}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <span className="notif-time">{proFormatRelative(n.createdAt)}</span>
                              {!n.read && <div className="notif-unread-dot" style={{ background: '#E87D50' }} />}
                            </div>
                          </div>
                          <p className="notif-body">{n.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── PROFIL ── */}
          {activePage === 'profil' && (
            <div className="dp-page">
              <div className="dp-card" style={{ maxWidth: 640 }}>
                <div className="dp-profil-head">
                  <div className="dp-profil-avatar">{pro.avatar}</div>
                  <div>
                    <h2>{pro.nom}</h2>
                    <p>{pro.entreprise} · {pro.ville}</p>
                    <p style={{ color: '#FFB800', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {pro.note}/5 · {pro.avis} avis
                    </p>
                  </div>
                </div>
                <div className="dp-form-grid">
                  <div className="dp-form-group">
                    <label>Prénom</label>
                    <input value={proForm.prenom} onChange={e => setProForm(f => ({ ...f, prenom: e.target.value }))} />
                  </div>
                  <div className="dp-form-group">
                    <label>Nom</label>
                    <input value={proForm.nom} onChange={e => setProForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                  <div className="dp-form-group">
                    <label>Email</label>
                    <input value={proForm.email} onChange={e => setProForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="dp-form-group">
                    <label>Téléphone</label>
                    <input value={proForm.tel} onChange={e => setProForm(f => ({ ...f, tel: e.target.value }))} />
                  </div>
                  <div className="dp-form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Raison sociale</label>
                    <input value={proForm.societe} onChange={e => setProForm(f => ({ ...f, societe: e.target.value }))} />
                  </div>
                  <div className="dp-form-group">
                    <label>SIRET</label>
                    <input value={proForm.siret} onChange={e => setProForm(f => ({ ...f, siret: e.target.value }))} />
                  </div>
                  <div className="dp-form-group">
                    <label>Ville</label>
                    <input value={proForm.ville} onChange={e => setProForm(f => ({ ...f, ville: e.target.value }))} />
                  </div>
                </div>
                <div className="profil-save-row" style={{ marginTop: 8 }}>
                  <button className="dp-btn-primary" onClick={handleSauvegarderProfil}>
                    Sauvegarder
                  </button>
                  <button onClick={handleLogout} className="btn-deconnexion">Se déconnecter</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default DashboardPro;
