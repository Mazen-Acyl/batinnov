import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardAdmin.css';

const utilisateurs = [
  { id: 1, nom: 'Jean Dupont', email: 'jean.dupont@email.com', role: 'client', ville: 'Clermont-Ferrand', statut: 'actif', cree: '12 avr.', depense: '4 280 €' },
  { id: 2, nom: 'Marc Leroy', email: 'contact@leroy-elec.fr', role: 'pro', ville: 'Clermont-Ferrand', statut: 'actif', cree: '8 avr.', depense: '—' },
  { id: 3, nom: 'Nadia Benali', email: 'nadia.benali@email.com', role: 'client', ville: 'Riom', statut: 'actif', cree: '15 avr.', depense: '96 €' },
  { id: 4, nom: 'Sophie Vidal', email: 'contact@vidal-renov.fr', role: 'pro', ville: 'Issoire', statut: 'en_attente', cree: '3 mai', depense: '—' },
  { id: 5, nom: 'Paul Martin', email: 'paul.martin@email.com', role: 'client', ville: 'Chamalières', statut: 'actif', cree: '20 avr.', depense: '3 800 €' },
];

const dossiersPro = [
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

const rdvs = [
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
  const [selectedDossier, setSelectedDossier] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { id: 'accueil', icon: '◎', label: 'Accueil' },
    { id: 'utilisateurs', icon: '👤', label: 'Utilisateurs' },
    { id: 'validation', icon: '✦', label: 'Validation pros', badge: dossiersPro.filter(d => d.statut === 'a_verifier').length },
    { id: 'services', icon: '⚙', label: 'Services', badge: services.filter(s => s.statut === 'bloque').length },
    { id: 'finance', icon: '€', label: 'Finance' },
    { id: 'rdv', icon: '📅', label: 'RDV', badge: rdvs.filter(r => r.statut === 'a_coordonner').length },
  ];

  const filteredUsers = utilisateurs.filter(u => {
    const matchFilter = userFilter === 'tous' || (userFilter === 'clients' && u.role === 'client') || (userFilter === 'pros' && u.role === 'pro');
    const matchSearch = u.nom.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredServices = serviceFilter === 'tous' ? services : services.filter(s => s.statut === serviceFilter);
  const filteredFactures = factureFilter === 'tous' ? factures : factures.filter(f => f.statut === factureFilter);

  const statutServiceConfig = {
    en_cours: { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF' },
    bloque: { label: 'Bloqué', color: '#DC2626', bg: '#FEF2F2' },
    a_demarrer: { label: 'À démarrer', color: '#E87D50', bg: '#FFF5F2' },
  };

  const statutFactureConfig = {
    paye: { label: 'Payé', color: '#10B981', bg: '#ECFDF5' },
    attente: { label: 'En attente', color: '#E87D50', bg: '#FFF5F2' },
    retard: { label: 'Retard', color: '#DC2626', bg: '#FEF2F2' },
  };

  return (
    <div className="admin-layout">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">BATINNOV</div>
        <div className="admin-sidebar-tag">Pôle Admin</div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSelectedDossier(null); }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>↩ Déconnexion</button>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">

        {/* ══ ACCUEIL ══ */}
        {page === 'accueil' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Pôle Admin</p>
                <h1>Admin Dashboard</h1>
              </div>
              <span className="admin-alert-badge">3 validations</span>
            </div>

            {/* HERO */}
            <div className="admin-hero-card">
              <p className="admin-hero-label">Pilotage global</p>
              <h2>Contrôlez l'activité<br />Batinnov en temps réel.</h2>
              <div className="admin-hero-stats">
                <div><strong>186 420 €</strong><span>CA TOTAL</span></div>
                <div><strong>+12%</strong><span>CE MOIS</span></div>
              </div>
            </div>

            {/* KPI */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi"><span className="admin-kpi-num">37</span><span>services en cours</span></div>
              <div className="admin-kpi"><span className="admin-kpi-num">14</span><span>demandes en attente</span></div>
              <div className="admin-kpi"><span className="admin-kpi-num">2</span><span>devis sans réponse</span></div>
              <div className="admin-kpi"><span className="admin-kpi-num">3</span><span>RDV à coordonner</span></div>
            </div>

            {/* PRIORITÉ */}
            <div className="admin-section">
              <div className="admin-section-head">
                <h3>Priorité admin</h3>
                <button className="admin-link" onClick={() => setPage('validation')}>Tout voir →</button>
              </div>
              {dossiersPro.slice(0, 2).map(d => (
                <div key={d.id} className="admin-priority-row" onClick={() => { setPage('validation'); setSelectedDossier(d); }}>
                  <div className="admin-priority-tag">Validation prestataire</div>
                  <div className="admin-priority-info">
                    <strong>{d.nom}</strong>
                    <span>{d.contact} · {d.ville}</span>
                  </div>
                  <span className="admin-priority-arrow">→</span>
                </div>
              ))}
            </div>

            {/* MODULES */}
            <div className="admin-section">
              <h3>Modules actifs</h3>
              <div className="admin-modules-grid">
                {navItems.filter(n => n.id !== 'accueil').map(item => (
                  <button key={item.id} className="admin-module-btn" onClick={() => setPage(item.id)}>
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
                <p className="admin-page-tag">Admin</p>
                <h1>Utilisateurs</h1>
              </div>
              <span className="admin-alert-badge">{utilisateurs.length} comptes</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Gestion des accès</p>
              <h2>Clients et prestataires<br />au même endroit.</h2>
            </div>

            <div className="admin-filter-row">
              {['tous', 'clients', 'pros'].map(f => (
                <button key={f} className={`admin-filter-btn ${userFilter === f ? 'active' : ''}`} onClick={() => setUserFilter(f)}>
                  {f === 'tous' ? 'Tous' : f === 'clients' ? 'Clients' : 'Pros'}
                </button>
              ))}
              <button className="admin-filter-btn-right" onClick={() => setPage('validation')}>Validations →</button>
            </div>

            <div className="admin-search-bar">
              <span>🔍</span>
              <input placeholder="Rechercher un nom, email, ville..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>

            <div className="admin-list-label">
              <span>Liste filtrable</span>
              <button className="admin-link" onClick={() => setPage('validation')}>Validations →</button>
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
                  <span className={`admin-role-badge ${u.role}`}>{u.role === 'client' ? '• Client' : '• Pro'}</span>
                  <span className={`admin-statut-dot ${u.statut}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ VALIDATION PROS ══ */}
        {page === 'validation' && !selectedDossier && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Admin</p>
                <h1>Validation pros</h1>
              </div>
              <span className="admin-alert-badge orange">{dossiersPro.filter(d => d.statut === 'a_verifier').length} en attente</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Conformité prestataire</p>
              <h2>Validez les dossiers<br />avant activation.</h2>
              <div className="admin-hero-stats">
                <div><strong>{dossiersPro.length}</strong><span>À TRAITER</span></div>
                <div><strong>0</strong><span>VALIDÉS</span></div>
                <div><strong>0</strong><span>REFUSÉS</span></div>
              </div>
            </div>

            <div className="admin-section-head" style={{ marginBottom: 12 }}>
              <h3>Dossiers reçus</h3>
              <button className="admin-link">Services →</button>
            </div>

            <div className="admin-dossier-list">
              {dossiersPro.map(d => (
                <div key={d.id} className="admin-dossier-row" onClick={() => setSelectedDossier(d)}>
                  <div className="admin-dossier-avatar">{d.nom[0]}</div>
                  <div className="admin-dossier-info">
                    <strong>{d.nom}</strong>
                    <span>{d.ville} · {d.date}</span>
                  </div>
                  <span className="admin-dossier-tag">→ À vérifier</span>
                </div>
              ))}
            </div>

            <div className="admin-section" style={{ marginTop: 24 }}>
              <div className="admin-section-head">
                <h3>Flux de validation</h3>
                <button className="admin-link">Finance →</button>
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
            <button className="admin-back" onClick={() => setSelectedDossier(null)}>← Retour</button>
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
                <div><strong>{selectedDossier.docs.filter(d => d.statut === 'valide').length}</strong><span>pièces validées</span></div>
                <div><strong>{selectedDossier.docs.filter(d => d.statut === 'en_attente').length}</strong><span>restantes</span></div>
              </div>
            </div>

            <h3 style={{ marginBottom: 12 }}>Justificatifs obligatoires</h3>
            <div className="admin-docs-list">
              {selectedDossier.docs.map((doc, i) => (
                <div key={i} className="admin-doc-card">
                  <div className="admin-doc-head">
                    <strong>{doc.nom}</strong>
                    <span className={`admin-doc-statut ${doc.statut}`}>
                      {doc.statut === 'valide' ? '✓ Validé' : '⏳ En attente'}
                    </span>
                  </div>
                  <span className="admin-doc-meta">{doc.taille}</span>
                  <div className="admin-doc-actions">
                    <button className="admin-doc-btn open">Ouvrir</button>
                    <button className="admin-doc-btn reject">Rejeter</button>
                    <button className="admin-doc-btn validate">Valider</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-final-actions">
              <button className="admin-btn-reject-all">Refuser le dossier</button>
              <button className="admin-btn-validate-all">Activer le prestataire ✓</button>
            </div>
          </div>
        )}

        {/* ══ SERVICES ══ */}
        {page === 'services' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Admin</p>
                <h1>Services en cours</h1>
              </div>
              {services.filter(s => s.statut === 'bloque').length > 0 && (
                <span className="admin-alert-badge red">{services.filter(s => s.statut === 'bloque').length} bloqué</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Contrôle opérationnel</p>
              <h2>Suivez tous les<br />services actifs.</h2>
            </div>

            <div className="admin-filter-row">
              {[['tous', 'Tous'], ['en_cours', 'En cours'], ['a_demarrer', 'À démarrer'], ['bloque', 'Bloqués']].map(([val, label]) => (
                <button key={val} className={`admin-filter-btn ${serviceFilter === val ? 'active' : ''}`} onClick={() => setServiceFilter(val)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="admin-search-bar">
              <span>🔍</span>
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
                      <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg }}>• {cfg.label}</span>
                    </div>
                    <div className="admin-service-progress-bar">
                      <div className="admin-service-progress-fill" style={{ width: `${s.avancement}%`, background: s.statut === 'bloque' ? '#DC2626' : '#2D5A3D' }} />
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
            </div>
          </div>
        )}

        {/* ══ FINANCE ══ */}
        {page === 'finance' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Admin</p>
                <h1>Finance</h1>
              </div>
              <span className="admin-alert-badge orange">2 à relancer</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pilotage financier</p>
              <h2>Factures, paiements<br />et relances.</h2>
              <div className="admin-hero-stats">
                <div><strong>7 504 €</strong><span>TOTAL ÉMIS</span></div>
                <div><strong>1 428 €</strong><span>ENCAISSÉ</span></div>
              </div>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi"><span className="admin-kpi-num">4</span><span>factures</span></div>
              <div className="admin-kpi"><span className="admin-kpi-num orange">1</span><span>devis à acter</span></div>
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
                      <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg }}>• {cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ RDV ══ */}
        {page === 'rdv' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Admin</p>
                <h1>Coordination RDV</h1>
              </div>
              <span className="admin-alert-badge orange">{rdvs.filter(r => r.statut === 'a_coordonner').length} à coordonner</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Intermédiation totale</p>
              <h2>Validez les créneaux<br />avant diffusion aux deux parties.</h2>
              <div className="admin-hero-stats">
                <div><strong>{rdvs.filter(r => r.statut === 'a_coordonner').length}</strong><span>À TRAITER</span></div>
                <div><strong>{rdvs.filter(r => r.statut === 'valide').length}</strong><span>VALIDÉS</span></div>
              </div>
            </div>

            <div className="admin-section-head" style={{ marginBottom: 12 }}>
              <h3>Demandes RDV</h3>
              <button className="admin-link">Services →</button>
            </div>

            <div className="admin-rdv-list">
              {rdvs.map(r => (
                <div key={r.id} className={`admin-rdv-card ${r.statut}`}>
                  <div className="admin-rdv-info">
                    <strong>{r.titre}</strong>
                    <span>{r.client} · {r.pro}</span>
                  </div>
                  <span className={`admin-rdv-tag ${r.statut}`}>{r.tag}</span>
                  {r.statut === 'a_coordonner' && (
                    <div className="admin-rdv-actions">
                      <button className="admin-doc-btn validate">Valider</button>
                      <button className="admin-doc-btn reject">Refuser</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
