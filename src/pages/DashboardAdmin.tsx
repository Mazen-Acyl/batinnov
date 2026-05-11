import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardAdmin.css';

/* ── Icônes SVG ── */
const Icon = {
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  Euro: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
};

/* ── Données statiques ── */
const utilisateurs = [
  { id: 1, nom: 'Jean Dupont', email: 'jean.dupont@email.com', role: 'client', ville: 'Clermont-Ferrand', statut: 'actif', cree: '12 avr.', depense: '4 280 €' },
  { id: 2, nom: 'Marc Leroy', email: 'contact@leroy-elec.fr', role: 'pro', ville: 'Clermont-Ferrand', statut: 'actif', cree: '8 avr.', depense: '—' },
  { id: 3, nom: 'Nadia Benali', email: 'nadia.benali@email.com', role: 'client', ville: 'Riom', statut: 'actif', cree: '15 avr.', depense: '96 €' },
  { id: 4, nom: 'Sophie Vidal', email: 'contact@vidal-renov.fr', role: 'pro', ville: 'Issoire', statut: 'en_attente', cree: '3 mai', depense: '—' },
  { id: 5, nom: 'Paul Martin', email: 'paul.martin@email.com', role: 'client', ville: 'Chamalières', statut: 'actif', cree: '20 avr.', depense: '3 800 €' },
];

const initialDossiers = [
  { id: 1, nom: 'Vidal Rénov', contact: 'Sophie Vidal', ville: 'Issoire', date: '03 mai, 12:00', statut: 'a_verifier', docs: [
    { nom: 'Extrait Kbis', statut: 'valide', taille: 'PDF · 180 Ko' },
    { nom: 'Assurance décennale', statut: 'en_attente', taille: 'PDF · 620 Ko' },
    { nom: 'Certification Qualibat', statut: 'valide', taille: 'PDF · valide jusqu\'en 2027' },
  ]},
  { id: 2, nom: 'KB Assistance', contact: 'Karim Bensaid', ville: 'Clermont-Ferrand', date: '04 mai, 17:20', statut: 'a_verifier', docs: [
    { nom: 'Extrait Kbis', statut: 'valide', taille: 'PDF · 210 Ko' },
    { nom: 'Assurance décennale', statut: 'en_attente', taille: 'PDF · 540 Ko' },
  ]},
  { id: 3, nom: 'Aline Paysage', contact: 'Aline Morel', ville: 'Riom', date: '05 mai, 10:45', statut: 'a_verifier', docs: [
    { nom: 'Extrait Kbis', statut: 'en_attente', taille: 'PDF · 95 Ko' },
  ]},
];

const services = [
  { id: 1, ref: 'IRVE · #P1', titre: 'Installation borne Wallbox 7.4 kW', client: 'Jean Dupont', pro: 'Marc Leroy', ville: 'Clermont-Ferrand', statut: 'en_cours', avancement: 65, etapes: ['Visite', 'Pose', 'Raccord.', 'Livraison'], etapeFaite: 2 },
  { id: 2, ref: 'TRAVAUX · #P2', titre: 'Rénovation salle de bain', client: 'Paul Martin', pro: 'Sophie Vidal', ville: 'Chamalières', statut: 'bloque', avancement: 30, etapes: ['Devis', 'Dépôse', 'Avenant', 'Finitions'], etapeFaite: 1 },
  { id: 3, ref: 'AIDE · #P3', titre: 'Aide à domicile hebdomadaire', client: 'Nadia Benali', pro: 'KB Assistance', ville: 'Riom', statut: 'a_demarrer', avancement: 0, etapes: ['Signature', 'Démarrage', 'Suivi'], etapeFaite: 0 },
];

const factures = [
  { id: 1, ref: 'F2026-0341', montant: '1 428 €', client: 'Jean Dupont', pro: 'Leroy Électricité', statut: 'paye', date: '20 avr.' },
  { id: 2, ref: 'F2026-0348', montant: '3 800 €', client: 'Paul Martin', pro: 'Vidal Rénov', statut: 'attente', date: '25 avr.' },
  { id: 3, ref: 'F2026-0352', montant: '96 €', client: 'Nadia Benali', pro: 'KB Assistance', statut: 'retard', date: '28 avr.' },
];

const initialRdvs = [
  { id: 1, titre: 'Clarifier le périmètre avant devis définitif', client: 'Paul Martin', pro: 'Sophie Vidal', tag: 'Créneaux client', statut: 'a_coordonner' },
  { id: 2, titre: 'Mise en service de la borne', client: 'Jean Dupont', pro: 'Marc Leroy', tag: 'Retour pro', statut: 'a_coordonner' },
  { id: 3, titre: 'Premier rendez-vous SAP', client: 'Nadia Benali', pro: 'KB Assistance', tag: 'Validé', statut: 'valide' },
];

export default function DashboardAdmin() {
  const [page, setPage] = useState('accueil');
  const [userFilter, setUserFilter] = useState('tous');
  const [userSearch, setUserSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('tous');
  const [factureFilter, setFactureFilter] = useState('tous');
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);
  const [dossiers, setDossiers] = useState(initialDossiers.map(d => ({ ...d, docs: d.docs.map(doc => ({ ...doc })) })));
  const [rdvList, setRdvList] = useState(initialRdvs.map(r => ({ ...r })));
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  /* ── Dossier courant (live depuis state) ── */
  const selectedDossier = selectedDossierId ? dossiers.find(d => d.id === selectedDossierId) ?? null : null;

  /* ── Actions documents ── */
  const handleDocValider = (dossierId: number, docIndex: number) => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== dossierId) return d;
      const docs = d.docs.map((doc, i) => i === docIndex ? { ...doc, statut: 'valide' } : doc);
      return { ...d, docs };
    }));
    showNotif('Document validé');
  };

  const handleDocRejeter = (dossierId: number, docIndex: number) => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== dossierId) return d;
      const docs = d.docs.map((doc, i) => i === docIndex ? { ...doc, statut: 'rejete' } : doc);
      return { ...d, docs };
    }));
    showNotif('Document rejeté', 'error');
  };

  /* ── Actions dossier ── */
  const handleActiverPrestataire = () => {
    if (!selectedDossier) return;
    const nom = selectedDossier.nom;
    setDossiers(prev => prev.map(d => d.id === selectedDossier.id ? { ...d, statut: 'valide' } : d));
    setSelectedDossierId(null);
    showNotif(`${nom} activé avec succès ✓`);
  };

  const handleRefuserDossier = () => {
    if (!selectedDossier) return;
    const nom = selectedDossier.nom;
    setDossiers(prev => prev.map(d => d.id === selectedDossier.id ? { ...d, statut: 'refuse' } : d));
    setSelectedDossierId(null);
    showNotif(`Dossier ${nom} refusé`, 'error');
  };

  /* ── Actions RDV ── */
  const handleRdvValider = (rdvId: number) => {
    setRdvList(prev => prev.map(r => r.id === rdvId ? { ...r, statut: 'valide', tag: 'Validé' } : r));
    showNotif('RDV validé — les deux parties ont été notifiées');
  };

  const handleRdvRefuser = (rdvId: number) => {
    setRdvList(prev => prev.filter(r => r.id !== rdvId));
    showNotif('RDV refusé', 'error');
  };

  /* ── Données dérivées ── */
  const dossiersEnAttente = dossiers.filter(d => d.statut === 'a_verifier');
  const rdvsACoord = rdvList.filter(r => r.statut === 'a_coordonner');

  const navItems = [
    { id: 'accueil', icon: <Icon.Home />, label: 'Accueil' },
    { id: 'utilisateurs', icon: <Icon.Users />, label: 'Utilisateurs' },
    { id: 'validation', icon: <Icon.Shield />, label: 'Validation pros', badge: dossiersEnAttente.length },
    { id: 'services', icon: <Icon.Briefcase />, label: 'Services', badge: services.filter(s => s.statut === 'bloque').length },
    { id: 'finance', icon: <Icon.Euro />, label: 'Finance' },
    { id: 'rdv', icon: <Icon.Calendar />, label: 'RDV', badge: rdvsACoord.length },
  ];

  const filteredUsers = utilisateurs.filter(u => {
    const matchFilter = userFilter === 'tous' || (userFilter === 'clients' && u.role === 'client') || (userFilter === 'pros' && u.role === 'pro');
    const matchSearch = u.nom.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredServices = serviceFilter === 'tous' ? services : services.filter(s => s.statut === serviceFilter);
  const filteredFactures = factureFilter === 'tous' ? factures : factures.filter(f => f.statut === factureFilter);

  const statutServiceConfig = {
    en_cours: { label: 'En cours', color: '#1D4ED8', bg: '#EFF6FF' },
    bloque: { label: 'Bloqué', color: '#DC2626', bg: '#FEF2F2' },
    a_demarrer: { label: 'À démarrer', color: '#D97706', bg: '#FFFBEB' },
  };

  const statutFactureConfig = {
    paye: { label: 'Payé', color: '#059669', bg: '#ECFDF5' },
    attente: { label: 'En attente', color: '#D97706', bg: '#FFFBEB' },
    retard: { label: 'Retard', color: '#DC2626', bg: '#FEF2F2' },
  };

  const navigateTo = (p: string) => { setPage(p); setSelectedDossierId(null); };

  return (
    <div className="admin-layout">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="admin-logo-name">BATINNOV</span>
          <span className="admin-logo-tag">ADMIN</span>
        </div>
        <div className="admin-sidebar-tag">Pôle administration</div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <span className="admin-nav-icon"><Icon.LogOut /></span>
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">

        {/* Notification toast */}
        {notif && (
          <div className={`admin-notif ${notif.type}`}>
            <span>{notif.msg}</span>
            <button onClick={() => setNotif(null)}>×</button>
          </div>
        )}

        {/* ══ ACCUEIL ══ */}
        {page === 'accueil' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Vue d'ensemble</p>
                <h1>Tableau de bord</h1>
              </div>
              {dossiersEnAttente.length > 0 && (
                <span className="admin-alert-badge">{dossiersEnAttente.length} validation{dossiersEnAttente.length > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pilotage global</p>
              <h2>Contrôlez l'activité Batinnov en temps réel.</h2>
              <div className="admin-hero-stats">
                <div><strong>186 420 €</strong><span>CA total</span></div>
                <div><strong>+12 %</strong><span>Ce mois</span></div>
              </div>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('services')}>
                <span className="admin-kpi-num">37</span><span>Services en cours</span>
              </div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('validation')}>
                <span className="admin-kpi-num">{dossiersEnAttente.length}</span><span>Dossiers en attente</span>
              </div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('finance')}>
                <span className="admin-kpi-num">2</span><span>Devis sans réponse</span>
              </div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('rdv')}>
                <span className="admin-kpi-num">{rdvsACoord.length}</span><span>RDV à coordonner</span>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h3>Priorité admin</h3>
                <button className="admin-link" onClick={() => navigateTo('validation')}>Tout voir →</button>
              </div>
              {dossiersEnAttente.slice(0, 2).map(d => (
                <div key={d.id} className="admin-priority-row" onClick={() => { setPage('validation'); setSelectedDossierId(d.id); }}>
                  <div className="admin-priority-tag">Validation prestataire</div>
                  <div className="admin-priority-info">
                    <strong>{d.nom}</strong>
                    <span>{d.contact} · {d.ville}</span>
                  </div>
                  <span className="admin-priority-arrow">→</span>
                </div>
              ))}
              {dossiersEnAttente.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '12px 0' }}>Aucune validation en attente</p>
              )}
            </div>

            <div className="admin-section">
              <h3>Modules actifs</h3>
              <div className="admin-modules-grid">
                {navItems.filter(n => n.id !== 'accueil').map(item => (
                  <button key={item.id} className="admin-module-btn" onClick={() => navigateTo(item.id)}>
                    <span className="admin-module-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge > 0 && <span className="admin-module-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ UTILISATEURS ══ */}
        {page === 'utilisateurs' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Annuaire</p>
                <h1>Utilisateurs</h1>
              </div>
              <span className="admin-alert-badge">{utilisateurs.length} comptes</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Gestion des accès</p>
              <h2>Clients et prestataires au même endroit.</h2>
            </div>

            <div className="admin-filter-row">
              {['tous', 'clients', 'pros'].map(f => (
                <button key={f} className={`admin-filter-btn ${userFilter === f ? 'active' : ''}`} onClick={() => setUserFilter(f)}>
                  {f === 'tous' ? 'Tous' : f === 'clients' ? 'Clients' : 'Pros'}
                </button>
              ))}
              <button className="admin-filter-btn-right" onClick={() => navigateTo('validation')}>Validations →</button>
            </div>

            <div className="admin-search-bar">
              <span><Icon.Search /></span>
              <input placeholder="Rechercher un nom, email, ville..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>

            <div className="admin-list-label">
              <span>{filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''}</span>
              <button className="admin-link" onClick={() => navigateTo('validation')}>Validations →</button>
            </div>

            <div className="admin-user-list">
              {filteredUsers.map(u => (
                <div key={u.id} className="admin-user-row">
                  <div className="admin-user-avatar">{u.nom[0]}</div>
                  <div className="admin-user-info">
                    <strong>{u.nom}</strong>
                    <span>{u.email}</span>
                  </div>
                  <div className="admin-user-meta">
                    <span>{u.ville}</span>
                    <span className="admin-user-depense">{u.depense}</span>
                  </div>
                  <span className={`admin-role-badge ${u.role}`}>{u.role === 'client' ? 'Client' : 'Pro'}</span>
                  <span className={`admin-statut-dot ${u.statut}`} />
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun utilisateur trouvé</p>
              )}
            </div>
          </div>
        )}

        {/* ══ VALIDATION PROS — liste ══ */}
        {page === 'validation' && !selectedDossier && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Conformité</p>
                <h1>Validation pros</h1>
              </div>
              {dossiersEnAttente.length > 0 && (
                <span className="admin-alert-badge orange">{dossiersEnAttente.length} en attente</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Conformité prestataire</p>
              <h2>Validez les dossiers avant activation.</h2>
              <div className="admin-hero-stats">
                <div><strong>{dossiersEnAttente.length}</strong><span>À traiter</span></div>
                <div><strong>{dossiers.filter(d => d.statut === 'valide').length}</strong><span>Validés</span></div>
                <div><strong>{dossiers.filter(d => d.statut === 'refuse').length}</strong><span>Refusés</span></div>
              </div>
            </div>

            <div className="admin-section-head" style={{ marginBottom: 12 }}>
              <h3>Dossiers reçus</h3>
              <button className="admin-link" onClick={() => navigateTo('services')}>Services →</button>
            </div>

            <div className="admin-dossier-list">
              {dossiersEnAttente.map(d => (
                <div key={d.id} className="admin-dossier-row" onClick={() => setSelectedDossierId(d.id)}>
                  <div className="admin-dossier-avatar">{d.nom[0]}</div>
                  <div className="admin-dossier-info">
                    <strong>{d.nom}</strong>
                    <span>{d.ville} · {d.date}</span>
                  </div>
                  <span className="admin-dossier-tag">À vérifier →</span>
                </div>
              ))}
              {dossiersEnAttente.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Tous les dossiers ont été traités</p>
              )}
            </div>

            <div className="admin-section" style={{ marginTop: 24 }}>
              <div className="admin-section-head">
                <h3>Flux de validation</h3>
                <button className="admin-link" onClick={() => navigateTo('finance')}>Finance →</button>
              </div>
              <div className="admin-flux">
                <div className="admin-flux-step done"><span>Nouveau dossier</span><small>OK</small></div>
                <div className="admin-flux-line" />
                <div className="admin-flux-step active"><span>Vérification documents</span><small>En cours</small></div>
                <div className="admin-flux-line" />
                <div className="admin-flux-step"><span>Décision</span><small>À vérif.</small></div>
              </div>
            </div>
          </div>
        )}

        {/* ══ DÉTAIL DOSSIER PRO ══ */}
        {page === 'validation' && selectedDossier && (
          <div className="admin-page">
            <button className="admin-back" onClick={() => setSelectedDossierId(null)}>← Retour</button>
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Validation prestataire</p>
                <h1>{selectedDossier.nom}</h1>
              </div>
              <span className="admin-alert-badge orange">En attente</span>
            </div>

            <div className="admin-pro-detail-head">
              <div className="admin-pro-detail-avatar">{selectedDossier.contact[0]}</div>
              <div>
                <strong>{selectedDossier.contact}</strong>
                <span>{selectedDossier.ville} · Travaux</span>
              </div>
              <div className="admin-pro-detail-stats">
                <div><strong>{selectedDossier.docs.filter(d => d.statut === 'valide').length}</strong><span>Pièces validées</span></div>
                <div><strong>{selectedDossier.docs.filter(d => d.statut === 'en_attente').length}</strong><span>Restantes</span></div>
              </div>
            </div>

            <h3 style={{ marginBottom: 12 }}>Justificatifs obligatoires</h3>
            <div className="admin-docs-list">
              {selectedDossier.docs.map((doc, i) => (
                <div key={i} className="admin-doc-card">
                  <div className="admin-doc-head">
                    <strong>{doc.nom}</strong>
                    <span className={`admin-doc-statut ${doc.statut}`}>
                      {doc.statut === 'valide' ? '✓ Validé' : doc.statut === 'rejete' ? '✗ Rejeté' : '⏳ En attente'}
                    </span>
                  </div>
                  <span className="admin-doc-meta">{doc.taille}</span>
                  <div className="admin-doc-actions">
                    <button className="admin-doc-btn open" onClick={() => showNotif(`Ouverture de "${doc.nom}"...`)}>
                      Ouvrir
                    </button>
                    <button
                      className="admin-doc-btn reject"
                      onClick={() => handleDocRejeter(selectedDossier.id, i)}
                      disabled={doc.statut === 'rejete'}
                    >
                      Rejeter
                    </button>
                    <button
                      className="admin-doc-btn validate"
                      onClick={() => handleDocValider(selectedDossier.id, i)}
                      disabled={doc.statut === 'valide'}
                    >
                      Valider
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-final-actions">
              <button className="admin-btn-reject-all" onClick={handleRefuserDossier}>
                Refuser le dossier
              </button>
              <button className="admin-btn-validate-all" onClick={handleActiverPrestataire}>
                Activer le prestataire
              </button>
            </div>
          </div>
        )}

        {/* ══ SERVICES ══ */}
        {page === 'services' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Opérations</p>
                <h1>Services en cours</h1>
              </div>
              {services.filter(s => s.statut === 'bloque').length > 0 && (
                <span className="admin-alert-badge red">{services.filter(s => s.statut === 'bloque').length} bloqué</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Contrôle opérationnel</p>
              <h2>Suivez tous les services actifs.</h2>
            </div>

            <div className="admin-filter-row">
              {[['tous', 'Tous'], ['en_cours', 'En cours'], ['a_demarrer', 'À démarrer'], ['bloque', 'Bloqués']].map(([val, label]) => (
                <button key={val} className={`admin-filter-btn ${serviceFilter === val ? 'active' : ''}`} onClick={() => setServiceFilter(val)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="admin-search-bar">
              <span><Icon.Search /></span>
              <input placeholder="Rechercher service, client, prestataire..." />
            </div>

            <div className="admin-services-list">
              {filteredServices.map(s => {
                const cfg = statutServiceConfig[s.statut];
                return (
                  <div key={s.id} className="admin-service-card">
                    <div className="admin-service-head">
                      <div>
                        <span className="admin-service-ref">{s.ref}</span>
                        <h4>{s.titre}</h4>
                        <span className="admin-service-parties">{s.client} · {s.ville}</span>
                      </div>
                      <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </div>
                    <div className="admin-service-progress-bar">
                      <div className="admin-service-progress-fill" style={{ width: `${s.avancement}%`, background: s.statut === 'bloque' ? '#DC2626' : '#2563EB' }} />
                    </div>
                    <div className="admin-service-etapes">
                      {s.etapes.map((e, i) => (
                        <span key={i} className={`admin-etape ${i < s.etapeFaite ? 'fait' : i === s.etapeFaite ? 'encours' : ''}`}>{e}</span>
                      ))}
                    </div>
                    <div className="admin-service-footer">
                      <span>Prestataire : <strong>{s.pro}</strong></span>
                    </div>
                  </div>
                );
              })}
              {filteredServices.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun service dans cette catégorie</p>
              )}
            </div>
          </div>
        )}

        {/* ══ FINANCE ══ */}
        {page === 'finance' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Pilotage financier</p>
                <h1>Finance</h1>
              </div>
              <span className="admin-alert-badge orange">2 à relancer</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pilotage financier</p>
              <h2>Factures, paiements et relances.</h2>
              <div className="admin-hero-stats">
                <div><strong>7 504 €</strong><span>Total émis</span></div>
                <div><strong>1 428 €</strong><span>Encaissé</span></div>
              </div>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi"><span className="admin-kpi-num">4</span><span>Factures</span></div>
              <div className="admin-kpi"><span className="admin-kpi-num orange">1</span><span>Devis à acter</span></div>
            </div>

            <div className="admin-filter-row">
              {[['tous', 'Tous'], ['paye', 'Payés'], ['attente', 'Attente'], ['retard', 'Retard']].map(([val, label]) => (
                <button key={val} className={`admin-filter-btn ${factureFilter === val ? 'active' : ''}`} onClick={() => setFactureFilter(val)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="admin-factures-list">
              {filteredFactures.map(f => {
                const cfg = statutFactureConfig[f.statut];
                return (
                  <div key={f.id} className="admin-facture-row">
                    <div className="admin-facture-icon">€</div>
                    <div className="admin-facture-info">
                      <strong>{f.ref} · {f.montant}</strong>
                      <span>{f.client} · {f.pro}</span>
                    </div>
                    <div className="admin-facture-right">
                      <span>{f.date}</span>
                      <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </div>
                    {f.statut !== 'paye' && (
                      <button className="admin-doc-btn open" onClick={() => showNotif(`Relance envoyée à ${f.client}`)}>
                        Relancer
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredFactures.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucune facture dans cette catégorie</p>
              )}
            </div>
          </div>
        )}

        {/* ══ RDV ══ */}
        {page === 'rdv' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Coordination</p>
                <h1>Rendez-vous</h1>
              </div>
              {rdvsACoord.length > 0 && (
                <span className="admin-alert-badge orange">{rdvsACoord.length} à coordonner</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Intermédiation totale</p>
              <h2>Validez les créneaux avant diffusion aux deux parties.</h2>
              <div className="admin-hero-stats">
                <div><strong>{rdvsACoord.length}</strong><span>À traiter</span></div>
                <div><strong>{rdvList.filter(r => r.statut === 'valide').length}</strong><span>Validés</span></div>
              </div>
            </div>

            <div className="admin-section-head" style={{ marginBottom: 12 }}>
              <h3>Demandes RDV</h3>
              <button className="admin-link" onClick={() => navigateTo('services')}>Services →</button>
            </div>

            <div className="admin-rdv-list">
              {rdvList.map(r => (
                <div key={r.id} className={`admin-rdv-card ${r.statut}`}>
                  <div className="admin-rdv-info">
                    <strong>{r.titre}</strong>
                    <span>{r.client} · {r.pro}</span>
                  </div>
                  <span className={`admin-rdv-tag ${r.statut}`}>{r.tag}</span>
                  {r.statut === 'a_coordonner' && (
                    <div className="admin-rdv-actions">
                      <button className="admin-doc-btn validate" onClick={() => handleRdvValider(r.id)}>
                        Valider
                      </button>
                      <button className="admin-doc-btn reject" onClick={() => handleRdvRefuser(r.id)}>
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {rdvList.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun rendez-vous en attente</p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
