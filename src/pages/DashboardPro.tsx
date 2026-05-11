import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardPro.css';

function DashboardPro() {
  const [activePage, setActivePage] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };
  const [menuOpen, setMenuOpen] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type?: 'error' } | null>(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const showNotif = (msg: string, type?: 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  };

  const pro = {
    nom: 'Marc Dupont',
    entreprise: 'SARL Dupont BTP',
    metier: 'Électricien IRVE',
    ville: 'Clermont-Ferrand',
    note: 4.8,
    avis: 24,
    avatar: 'MD'
  };

  const [proForm, setProForm] = useState({
    prenom: 'Marc', nom: 'Dupont', email: 'marc@dupont-btp.fr',
    tel: '04 73 12 34 56', societe: 'SARL Dupont BTP',
    siret: '123 456 789 00012', ville: 'Clermont-Ferrand'
  });

  const stats = [
    { label: 'Chantiers en cours', value: '3', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, trend: '+1 cette semaine', page: 'chantiers' },
    { label: 'Devis en attente', value: '5', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>, trend: '2 à répondre', page: 'leads' },
    { label: 'Revenus ce mois', value: '4 200 €', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, trend: '+12% vs mois dernier', page: 'facturation' },
    { label: 'Nouveaux leads', value: '8', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, trend: '3 non lus', page: 'leads' }
  ];

  const chantiers = [
    { id: 1, client: 'Marie L.', service: 'Borne IRVE', adresse: 'Aubière (63)', date: '12 mai 2026', statut: 'en_cours', montant: '1 400 €' },
    { id: 2, client: 'Thomas D.', service: 'Borne IRVE', adresse: 'Riom (63)', date: '15 mai 2026', statut: 'planifie', montant: '1 600 €' },
    { id: 3, client: 'Sophie M.', service: 'Rénovation', adresse: 'Clermont-Ferrand', date: '20 mai 2026', statut: 'planifie', montant: '2 200 €' },
    { id: 4, client: 'Pierre R.', service: 'Borne IRVE', adresse: 'Issoire (63)', date: '2 mai 2026', statut: 'termine', montant: '1 200 €' },
    { id: 5, client: 'Julie K.', service: 'Borne IRVE', adresse: 'Cournon (63)', date: '28 avr. 2026', statut: 'termine', montant: '1 800 €' }
  ];

  const [leads, setLeads] = useState([
    { id: 1, client: 'Antoine B.', service: 'Borne IRVE Wallbox 11kW', adresse: 'Chamalières (63)', budget: '1 600 €', date: 'Il y a 2h', urgent: true, repondu: false },
    { id: 2, client: 'Nadia F.', service: 'Borne IRVE Wallbox 7kW', adresse: 'Aubière (63)', budget: '1 200 €', date: 'Il y a 5h', urgent: false, repondu: false },
    { id: 3, client: 'Robert V.', service: 'Rénovation électrique', adresse: 'Riom (63)', budget: '800 €', date: 'Hier', urgent: false, repondu: false }
  ]);

  const [docs, setDocs] = useState([
    { id: 1, name: 'K-bis', statut: 'valide', date: '01/01/2026', ok: true },
    { id: 2, name: 'Assurance décennale', statut: 'valide', date: '01/01/2026', ok: true },
    { id: 3, name: 'Carte BTP', statut: 'en_attente', date: '—', ok: false }
  ]);

  const [factures, setFactures] = useState([
    { id: 1, num: 'F-2026-005', client: 'Pierre R.', date: '2 mai 2026', montant: '1 200 €', ok: true },
    { id: 2, num: 'F-2026-004', client: 'Julie K.', date: '28 avr.', montant: '1 800 €', ok: true },
    { id: 3, num: 'F-2026-003', client: 'Marie L.', date: '12 mai 2026', montant: '1 400 €', ok: false }
  ]);

  const [conversations, setConversations] = useState([
    {
      id: 1, nom: 'Marie L.', avatar: 'ML', lu: false,
      service: 'Borne IRVE', chantier: 'Installation Borne IRVE',
      messages: [
        { id: 1, texte: "Bonjour, est-ce que vous pouvez venir mercredi matin ?", de: 'eux', heure: '10:18', date: "Aujourd'hui" },
        { id: 2, texte: "La porte de garage sera ouverte à partir de 8h30.", de: 'eux', heure: '10:32', date: "Aujourd'hui" },
      ]
    },
    {
      id: 2, nom: 'Thomas D.', avatar: 'TD', lu: false,
      service: 'Borne IRVE', chantier: 'Wallbox 7kW Riom',
      messages: [
        { id: 1, texte: "Merci pour le devis, je l'accepte !", de: 'eux', heure: '09:15', date: 'Hier' },
        { id: 2, texte: "Parfait Thomas ! Je confirme le rendez-vous pour le 15.", de: 'moi', heure: '09:20', date: 'Hier' },
        { id: 3, texte: "Super, à mardi alors !", de: 'eux', heure: '09:28', date: 'Hier' },
      ]
    },
    {
      id: 3, nom: 'Pierre R.', avatar: 'PR', lu: true,
      service: 'Borne IRVE', chantier: 'Borne Issoire',
      messages: [
        { id: 1, texte: "Le chantier s'est très bien passé, merci.", de: 'eux', heure: '16:40', date: '2 mai' },
        { id: 2, texte: "Parfait, à bientôt !", de: 'moi', heure: '17:05', date: '2 mai' },
      ]
    }
  ]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [draft, setDraft] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedConv]);

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

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#E87D50', bg: '#FFF5F0' },
    planifie: { label: 'Planifié', color: '#6366F1', bg: '#F0F0FF' },
    termine: { label: 'Terminé', color: '#22C55E', bg: '#F0FDF4' }
  };

  const leadsActifs = leads.filter(l => !l.repondu);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'leads', label: 'Leads', badge: leadsActifs.length },
    { id: 'chantiers', label: 'Chantiers' },
    { id: 'messages', label: 'Messages', badge: conversations.filter(c => !c.lu).length },
    { id: 'documents', label: 'Documents' },
    { id: 'facturation', label: 'Facturation' },
  ];

  const pageTitle = {
    dashboard: 'Tableau de bord',
    leads: 'Mes leads',
    chantiers: 'Mes chantiers',
    messages: 'Messages',
    profil: 'Mon profil',
    documents: 'Documents',
    facturation: 'Facturation'
  }[activePage] || '';

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

            <div className="dp-notif" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotifPanelOpen(o => !o)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {leadsActifs.length > 0 && <span className="dp-notif-dot" />}
              {notifPanelOpen && (
                <div style={{
                  position: 'absolute', top: 32, right: 0, background: '#fff',
                  border: '1px solid #E5E7EB', borderRadius: 10, width: 260,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 200, padding: '8px 0'
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', padding: '4px 16px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Notifications
                  </p>
                  {leadsActifs.length > 0
                    ? leadsActifs.map(l => (
                      <div key={l.id} style={{ padding: '8px 16px', fontSize: 13, borderTop: '1px solid #F3F4F6' }}>
                        <strong>{l.client}</strong> — {l.service}
                        <p style={{ color: '#9CA3AF', margin: '2px 0 0', fontSize: 12 }}>{l.date}</p>
                      </div>
                    ))
                    : <p style={{ padding: '8px 16px', fontSize: 13, color: '#9CA3AF' }}>Aucune nouvelle notification</p>
                  }
                </div>
              )}
            </div>

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
              <div className="dp-card">
                <div className="dp-card-head"><h3>Tous mes chantiers</h3></div>
                <table className="dp-table">
                  <thead>
                    <tr><th>Client</th><th>Service</th><th>Adresse</th><th>Date</th><th>Montant</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {chantiers.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.client}</strong></td>
                        <td>{c.service}</td>
                        <td>{c.adresse}</td>
                        <td>{c.date}</td>
                        <td><strong>{c.montant}</strong></td>
                        <td>
                          <span className="dp-tag" style={{ color: statutConfig[c.statut].color, background: statutConfig[c.statut].bg }}>
                            {statutConfig[c.statut].label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                          return convActive.messages.map(msg => {
                            const showDate = msg.date !== lastDate;
                            lastDate = msg.date;
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
                                </div>
                              </div>
                            );
                          });
                        })()}
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
                          onChange={e => setDraft(e.target.value)}
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
