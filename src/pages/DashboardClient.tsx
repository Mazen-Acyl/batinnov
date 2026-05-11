import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardClient.css';

function DashboardClient() {
  const [activePage, setActivePage] = useState('accueil');
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const [notif, setNotif] = useState<{ msg: string; type?: 'error' } | null>(null);
  const showNotif = (msg: string, type?: 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  };

  const client = {
    prenom: 'Marie',
    nom: 'Laurent',
    email: 'marie.laurent@email.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue des Lilas, 63000 Clermont-Ferrand',
    avatar: 'ML'
  };

  const [clientForm, setClientForm] = useState({
    prenom: 'Marie', nom: 'Laurent',
    email: 'marie.laurent@email.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue des Lilas, 63000 Clermont-Ferrand'
  });

  const demandes = [
    { id: 1, service: 'Rénovation', sousService: 'Rénovation salle de bain', statut: 'en_cours', date: '2 mai 2026', devis: 3, budget: '5 000 € - 15 000 €' },
    { id: 2, service: 'Borne IRVE', sousService: 'Wallbox 11kW', statut: 'devis_recu', date: '28 avr. 2026', devis: 2, budget: '1 000 € - 5 000 €' },
    { id: 3, service: 'Aménagement', sousService: 'Dressing sur-mesure', statut: 'termine', date: '10 avr. 2026', devis: 1, budget: '1 000 € - 5 000 €' }
  ];

  const [artisans, setArtisans] = useState([
    { id: 1, nom: 'Marc Dupont', metier: 'Électricien IRVE', note: 4.9, avis: 34, ville: 'Clermont-Ferrand', avatar: 'MD', montant: '1 450 €', delai: '15 mai 2026', accepte: false },
    { id: 2, nom: 'Sophie Bernard', metier: 'Plombière', note: 4.7, avis: 21, ville: 'Aubière', avatar: 'SB', montant: '1 600 €', delai: '18 mai 2026', accepte: false }
  ]);

  const chantiers_detail = [
    {
      id: 1, ref: '#P1', service: 'IRVE', titre: 'Installation borne Wallbox 7.4 kW',
      client: 'Jean Dupont', ville: 'Clermont-Ferrand',
      artisan: 'Marc Leroy', statut: 'en_cours',
      currentStep: 2,
      steps: ['Visite', 'Pose', 'Raccord.', 'Livraison']
    },
    {
      id: 2, ref: '#P2', service: 'Rénovation', titre: 'Rénovation salle de bain',
      client: 'Marie Laurent', ville: 'Clermont-Ferrand',
      artisan: 'Sophie Vidal', statut: 'en_cours',
      currentStep: 1,
      steps: ['Dépose', 'Gros œuvre', 'Finitions', 'Livraison']
    }
  ];

  const documents = [
    { id: 1, nom: 'Contrat installation IRVE', type: 'Contrat', taille: '2.1 Mo', date: '18 avr. 2026', signe: true, chantier: 'IRVE' },
    { id: 2, nom: 'Devis initial borne Wallbox', type: 'Devis', taille: '450 Ko', date: '14 avr. 2026', signe: false, chantier: 'IRVE' },
    { id: 3, nom: 'Devis travaux rénovation', type: 'Devis', taille: '1.8 Mo', date: '10 avr. 2026', signe: false, chantier: 'Rénovation' },
    { id: 4, nom: 'Facture acompte borne', type: 'Facture', taille: '380 Ko', date: '16 avr. 2026', signe: true, chantier: 'IRVE' }
  ];

  const [agenda, setAgenda] = useState([
    { id: 1, heure: '14:00', titre: 'Mise en service de la borne', artisan: 'Marc Leroy', duree: '2h', statut: 'confirme', date: 'Ven. 2 mai' },
    { id: 2, heure: '09:00', titre: 'Vérification tableau électrique', artisan: 'Marc Leroy', duree: '1h', statut: 'a_confirmer', date: 'Lun. 5 mai' }
  ]);

  const [conversations, setConversations] = useState([
    {
      id: 1, nom: 'Marc Dupont', avatar: 'MD', lu: false,
      metier: 'Électricien IRVE', note: 4.9, service: 'Borne IRVE',
      messages: [
        { id: 1, texte: "Bonjour, je suis disponible le 15 mai pour l'installation.", de: 'eux', heure: '10:28', date: "Aujourd'hui" },
        { id: 2, texte: "Pouvez-vous confirmer l'adresse exacte ?", de: 'eux', heure: '10:32', date: "Aujourd'hui" },
      ]
    },
    {
      id: 2, nom: 'Sophie Bernard', avatar: 'SB', lu: true,
      metier: 'Plombière', note: 4.7, service: 'Rénovation salle de bain',
      messages: [
        { id: 1, texte: 'Voici mon devis détaillé pour votre salle de bain.', de: 'eux', heure: '14:10', date: 'Hier' },
        { id: 2, texte: 'Merci Sophie, je regarde ça et reviens vers vous.', de: 'moi', heure: '14:45', date: 'Hier' },
        { id: 3, texte: "Bien sûr ! N'hésitez pas si vous avez des questions.", de: 'eux', heure: '15:02', date: 'Hier' },
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
    c.metier?.toLowerCase().includes(convSearch.toLowerCase())
  );

  /* ── Handlers devis ── */
  const handleAccepterDevis = (artisanId: number) => {
    const artisan = artisans.find(a => a.id === artisanId);
    setArtisans(prev => prev.map(a => ({ ...a, accepte: a.id === artisanId })));
    showNotif(`Devis de ${artisan?.nom} accepté ✓ — vous recevrez une confirmation`);
  };

  /* ── Handlers documents ── */
  const handleTelechargement = (nomDoc: string) => {
    showNotif(`Téléchargement de "${nomDoc}"...`);
  };

  /* ── Handlers agenda ── */
  const handleConfirmerRdv = (rdvId: number) => {
    setAgenda(prev => prev.map(ev => ev.id === rdvId ? { ...ev, statut: 'confirme' } : ev));
    showNotif('Rendez-vous confirmé ✓');
  };

  const handleAnnulerRdv = (rdvId: number) => {
    setAgenda(prev => prev.filter(ev => ev.id !== rdvId));
    showNotif('Rendez-vous annulé', 'error');
  };

  /* ── Handler profil ── */
  const handleSauvegarderProfil = () => {
    showNotif('Profil sauvegardé avec succès ✓');
  };

  const serviceIcon = (service: string) => {
    if (service === 'Borne IRVE') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    if (service === 'Rénovation') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  };

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF' },
    devis_recu: { label: 'Devis reçus', color: '#E87D50', bg: '#FFF5F2' },
    termine: { label: 'Terminé', color: '#10B981', bg: '#ECFDF5' }
  };

  const navItems = [
    { id: 'accueil', label: 'Mon espace' },
    { id: 'demandes', label: 'Demandes', badge: demandes.filter(d => d.statut !== 'termine').length },
    { id: 'devis', label: 'Devis', badge: artisans.filter(a => !a.accepte).length },
    { id: 'chantiers', label: 'Chantiers' },
    { id: 'documents', label: 'Documents' },
    { id: 'messages', label: 'Messages', badge: conversations.filter(c => !c.lu).length },
    { id: 'agenda', label: 'Agenda', badge: agenda.filter(e => e.statut === 'a_confirmer').length },
  ];

  return (
    <div className="dashboard-client-layout">

      {/* NAVBAR */}
      <header className="client-navbar">
        <div className="client-navbar-inner">
          <Link to="/" className="client-logo">
            <span className="client-logo-name">BATINNOV</span>
            <span className="client-logo-tag">CLIENT</span>
          </Link>

          <nav className={`client-nav ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`client-nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => { setActivePage(item.id); setMenuOpen(false); }}
              >
                <span>{item.label}</span>
                {item.badge > 0 && <span className="client-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="client-navbar-right">
            <Link to="/devis" className="btn-nouvelle-demande">+ Nouvelle demande</Link>
            <button className="client-avatar-btn" onClick={() => setActivePage('profil')}>
              <div className="client-avatar">{client.avatar}</div>
              <span>{client.prenom}</span>
            </button>
            <button className="mobile-burger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {notif && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: notif.type === 'error' ? '#DC2626' : '#111827',
          color: '#fff', padding: '12px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 500, display: 'flex', gap: 12,
          alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 1000, maxWidth: 360
        }}>
          <span>{notif.msg}</span>
          <button onClick={() => setNotif(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <main className="client-main">
        <div className="container">

          {/* ===== ACCUEIL ===== */}
          {activePage === 'accueil' && (
            <div className="client-page">
              <div className="welcome-banner">
                <div className="welcome-text">
                  <h1>Bonjour {client.prenom}</h1>
                  <p>Retrouvez ici toutes vos demandes, devis et messages.</p>
                </div>
                <Link to="/devis" className="btn-primary-green">+ Nouvelle demande</Link>
              </div>

              <div className="client-stats">
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('demandes')}>
                  <span className="client-stat-num">{demandes.length}</span>
                  <span className="client-stat-label">Demandes</span>
                </div>
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('devis')}>
                  <span className="client-stat-num">{artisans.length}</span>
                  <span className="client-stat-label">Devis reçus</span>
                </div>
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('messages')}>
                  <span className="client-stat-num">{conversations.filter(c => !c.lu).length}</span>
                  <span className="client-stat-label">Messages non lus</span>
                </div>
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('chantiers')}>
                  <span className="client-stat-num">{demandes.filter(d => d.statut === 'termine').length}</span>
                  <span className="client-stat-label">Travaux terminés</span>
                </div>
              </div>

              <div className="client-section">
                <div className="section-head">
                  <h2>Mes dernières demandes</h2>
                  <button className="btn-voir-tout" onClick={() => setActivePage('demandes')}>Voir tout →</button>
                </div>
                <div className="demandes-list">
                  {demandes.slice(0, 2).map(d => (
                    <div key={d.id} className="demande-card">
                      <div className="demande-icon">
                        {serviceIcon(d.service)}
                      </div>
                      <div className="demande-info">
                        <strong>{d.sousService}</strong>
                        <span>{d.service} · {d.date}</span>
                        <span>Budget : {d.budget}</span>
                      </div>
                      <div className="demande-right">
                        <span className="statut-pill" style={{ color: statutConfig[d.statut].color, background: statutConfig[d.statut].bg }}>
                          {statutConfig[d.statut].label}
                        </span>
                        {d.devis > 0 && <span className="devis-count">{d.devis} devis reçu{d.devis > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="client-section">
                <h2>Besoin d'un autre service ?</h2>
                <div className="services-quick-grid">
                  {([
                    { id: 'renovation', label: 'Rénovation', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                    { id: 'courtage', label: 'Courtage', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
                    { id: 'services-maison', label: 'Services à domicile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
                    { id: 'irve', label: 'Borne IRVE', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
                  ] as { id: string; label: string; icon: React.ReactNode }[]).map(s => (
                    <Link key={s.id} to={`/services/${s.id}`} className="quick-service-btn">
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== DEMANDES ===== */}
          {activePage === 'demandes' && (
            <div className="client-page">
              <div className="section-head">
                <h1>Mes demandes</h1>
                <Link to="/devis" className="btn-primary-green">+ Nouvelle demande</Link>
              </div>
              <div className="demandes-list full">
                {demandes.map(d => (
                  <div key={d.id} className="demande-card">
                    <div className="demande-icon">
                      {d.service === 'Rénovation' ? '🏠' : d.service === 'Borne IRVE' ? '⚡' : '📐'}
                    </div>
                    <div className="demande-info">
                      <strong>{d.sousService}</strong>
                      <span>{d.service} · Demandé le {d.date}</span>
                      <span>Budget estimé : {d.budget}</span>
                    </div>
                    <div className="demande-right">
                      <span className="statut-pill" style={{ color: statutConfig[d.statut].color, background: statutConfig[d.statut].bg }}>
                        {statutConfig[d.statut].label}
                      </span>
                      {d.devis > 0 && <span className="devis-count">{d.devis} devis reçu{d.devis > 1 ? 's' : ''}</span>}
                      {d.statut !== 'termine' && (
                        <button className="btn-voir-devis" onClick={() => setActivePage('devis')}>
                          Voir les devis →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== DEVIS ===== */}
          {activePage === 'devis' && (
            <div className="client-page">
              <h1>Mes devis reçus</h1>
              <p className="page-subtitle">Comparez les propositions de nos artisans</p>
              <div className="devis-list">
                {artisans.map(a => (
                  <div key={a.id} className={`devis-card ${a.accepte ? 'accepte' : ''}`}>
                    <div className="devis-artisan">
                      <div className="artisan-avatar">{a.avatar}</div>
                      <div className="artisan-info">
                        <strong>{a.nom}</strong>
                        <span>{a.metier} · {a.ville}</span>
                        <div className="artisan-note">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {a.note} ({a.avis} avis)
                        </div>
                      </div>
                      {a.accepte && (
                        <span style={{ marginLeft: 'auto', background: '#ECFDF5', color: '#10B981', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                          ✓ Accepté
                        </span>
                      )}
                    </div>
                    <div className="devis-details">
                      <div className="devis-montant">
                        <span>Montant proposé</span>
                        <strong>{a.montant}</strong>
                      </div>
                      <div className="devis-delai">
                        <span>Disponible le</span>
                        <strong>{a.delai}</strong>
                      </div>
                    </div>
                    <div className="devis-actions">
                      <button
                        className="btn-accepter"
                        onClick={() => handleAccepterDevis(a.id)}
                        disabled={a.accepte || artisans.some(x => x.accepte)}
                        style={{ opacity: (a.accepte || artisans.some(x => x.accepte && x.id !== a.id)) ? 0.4 : 1, cursor: (a.accepte || artisans.some(x => x.accepte && x.id !== a.id)) ? 'not-allowed' : 'pointer' }}
                      >
                        {a.accepte ? 'Devis accepté ✓' : 'Accepter ce devis'}
                      </button>
                      <button className="btn-contacter" onClick={() => { setActivePage('messages'); }}>
                        Contacter →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== CHANTIERS ===== */}
          {activePage === 'chantiers' && (
            <div className="client-page">
              <h1>Mes chantiers</h1>
              <div className="chantiers-list">
                {chantiers_detail.map(ch => {
                  const pct = ch.steps.length <= 1 ? 100 : Math.round((ch.currentStep / (ch.steps.length - 1)) * 100);
                  return (
                    <div key={ch.id} className="chantier-card">
                      <div className="chantier-top-row">
                        <span className="chantier-ref-label">{ch.service} · {ch.ref}</span>
                        <span className="chantier-statut-badge">En cours</span>
                      </div>
                      <h3 className="chantier-card-title">{ch.titre}</h3>
                      <p className="chantier-card-meta">{ch.client} · {ch.ville}</p>
                      <div className="chantier-bar-track">
                        <div className="chantier-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="chantier-steps-row">
                        {ch.steps.map((step, i) => (
                          <div key={i} className={`chantier-step ${i <= ch.currentStep ? 'done' : ''}`}>
                            {step}
                          </div>
                        ))}
                      </div>
                      <div className="chantier-card-footer">
                        <span>Prestataire : <strong>{ch.artisan}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== DOCUMENTS ===== */}
          {activePage === 'documents' && (
            <div className="client-page">
              <h1>Documents</h1>
              <div className="documents-list">
                {documents.map(doc => (
                  <div key={doc.id} className="document-row">
                    <div className="doc-icon">
                      {doc.type === 'Contrat'
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        : doc.type === 'Devis'
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      }
                    </div>
                    <div className="doc-info">
                      <strong>{doc.nom}</strong>
                      <span>{doc.type} · {doc.chantier} · {doc.date}</span>
                    </div>
                    <div className="doc-meta">
                      <span className="doc-taille">{doc.taille}</span>
                      {doc.signe && <span className="doc-signe-badge">Signé</span>}
                    </div>
                    <button className="btn-dl-doc" onClick={() => handleTelechargement(doc.nom)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== AGENDA ===== */}
          {activePage === 'agenda' && (
            <div className="client-page">
              <h1>Agenda</h1>
              <div className="agenda-list">
                {agenda.map(ev => (
                  <div key={ev.id} className="agenda-card">
                    <div className="agenda-date-block">
                      <span className="agenda-date">{ev.date}</span>
                      <strong className="agenda-heure">{ev.heure}</strong>
                    </div>
                    <div className="agenda-info">
                      <strong>{ev.titre}</strong>
                      <span>Avec {ev.artisan} · Durée : {ev.duree}</span>
                    </div>
                    <span
                      className="agenda-statut"
                      style={{
                        background: ev.statut === 'confirme' ? '#ECFDF5' : '#FFF5F2',
                        color: ev.statut === 'confirme' ? '#10B981' : '#E87D50'
                      }}
                    >
                      {ev.statut === 'confirme' ? 'Confirmé' : 'À confirmer'}
                    </span>
                    {ev.statut === 'a_confirmer' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleConfirmerRdv(ev.id)}
                          style={{ padding: '6px 14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => handleAnnulerRdv(ev.id)}
                          style={{ padding: '6px 14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {agenda.length === 0 && (
                  <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun rendez-vous à venir</p>
                )}
              </div>
            </div>
          )}

          {/* ===== MESSAGES ===== */}
          {activePage === 'messages' && (
            <div className="client-page">
              <div className="chat-layout">

                {/* ── SIDEBAR ── */}
                <div className="chat-sidebar">
                  <div className="chat-sidebar-head">
                    <span>Messages <strong>{conversations.filter(c => !c.lu).length > 0 ? `(${conversations.filter(c => !c.lu).length} non lu)` : ''}</strong></span>
                  </div>
                  <div className="chat-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      className="chat-search"
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
                      <div className="chat-conv-avatar" style={{ position: 'relative' }}>
                        {conv.avatar}
                        {!conv.lu && <span className="chat-avatar-dot" />}
                      </div>
                      <div className="chat-conv-info">
                        <div className="chat-conv-name">
                          <strong>{conv.nom}</strong>
                          <span className="chat-conv-time">{conv.messages.at(-1)?.heure}</span>
                        </div>
                        <span className="chat-conv-meta">{conv.metier}</span>
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

                {/* ── FENETRE ── */}
                <div className="chat-window">
                  {!convActive ? (
                    <div className="chat-empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <p>Sélectionnez une conversation</p>
                      <span style={{ fontSize: 12, color: '#D1D5DB' }}>Vos échanges avec les artisans apparaissent ici</span>
                    </div>
                  ) : (
                    <>
                      {/* HEADER enrichi */}
                      <div className="chat-header">
                        <div className="chat-conv-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>{convActive.avatar}</div>
                        <div className="chat-header-info">
                          <strong>{convActive.nom}</strong>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {convActive.metier} ·
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {convActive.note} · {convActive.service}
                          </span>
                        </div>
                        <button
                          className="chat-header-action"
                          onClick={() => setActivePage('devis')}
                        >
                          Voir son devis →
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
                                  <div className="chat-date-sep">
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
                          className="chat-attach-btn"
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

          {/* ===== PROFIL ===== */}
          {activePage === 'profil' && (
            <div className="client-page">
              <h1>Mon profil</h1>
              <div className="profil-client-card">
                <div className="profil-client-header">
                  <div className="profil-avatar-xl">{client.avatar}</div>
                  <div>
                    <h2>{clientForm.prenom} {clientForm.nom}</h2>
                    <p>{clientForm.email}</p>
                    <p>{clientForm.telephone}</p>
                  </div>
                </div>
                <div className="profil-client-form">
                  <h3>Informations personnelles</h3>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Prénom</label>
                      <input value={clientForm.prenom} onChange={e => setClientForm(f => ({ ...f, prenom: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input value={clientForm.nom} onChange={e => setClientForm(f => ({ ...f, nom: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input value={clientForm.telephone} onChange={e => setClientForm(f => ({ ...f, telephone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Adresse</label>
                    <input value={clientForm.adresse} onChange={e => setClientForm(f => ({ ...f, adresse: e.target.value }))} />
                  </div>
                  <div className="profil-save-row">
                    <button className="btn-save-client" onClick={handleSauvegarderProfil}>Sauvegarder</button>
                    <button onClick={handleLogout} className="btn-deconnexion">Se déconnecter</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default DashboardClient;
