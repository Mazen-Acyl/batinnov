import { useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPro.css';

function DashboardPro() {
  const [activePage, setActivePage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const pro = {
    nom: 'Marc Dupont',
    entreprise: 'SARL Dupont BTP',
    metier: 'Électricien IRVE',
    ville: 'Clermont-Ferrand',
    note: 4.8,
    avis: 24,
    avatar: 'MD'
  };

  const stats = [
    { label: 'Chantiers en cours', value: '3', icon: '🔨', trend: '+1 cette semaine' },
    { label: 'Devis en attente', value: '5', icon: '📋', trend: '2 à répondre' },
    { label: 'Revenus ce mois', value: '4 200 €', icon: '💰', trend: '+12% vs mois dernier' },
    { label: 'Nouveaux leads', value: '8', icon: '🎯', trend: '3 non lus' }
  ];

  const chantiers = [
    { id: 1, client: 'Marie L.', service: 'Borne IRVE', adresse: 'Aubière (63)', date: '12 mai 2026', statut: 'en_cours', montant: '1 400 €' },
    { id: 2, client: 'Thomas D.', service: 'Borne IRVE', adresse: 'Riom (63)', date: '15 mai 2026', statut: 'planifie', montant: '1 600 €' },
    { id: 3, client: 'Sophie M.', service: 'Rénovation', adresse: 'Clermont-Ferrand', date: '20 mai 2026', statut: 'planifie', montant: '2 200 €' },
    { id: 4, client: 'Pierre R.', service: 'Borne IRVE', adresse: 'Issoire (63)', date: '2 mai 2026', statut: 'termine', montant: '1 200 €' },
    { id: 5, client: 'Julie K.', service: 'Borne IRVE', adresse: 'Cournon (63)', date: '28 avr. 2026', statut: 'termine', montant: '1 800 €' }
  ];

  const leads = [
    { id: 1, client: 'Antoine B.', service: 'Borne IRVE Wallbox 11kW', adresse: 'Chamalières (63)', budget: '1 600 €', date: 'Il y a 2h', urgent: true },
    { id: 2, client: 'Nadia F.', service: 'Borne IRVE Wallbox 7kW', adresse: 'Aubière (63)', budget: '1 200 €', date: 'Il y a 5h', urgent: false },
    { id: 3, client: 'Robert V.', service: 'Rénovation électrique', adresse: 'Riom (63)', budget: '800 €', date: 'Hier', urgent: false }
  ];

  const messages = [
    { id: 1, client: 'Marie L.', texte: "Bonjour, est-ce que vous pouvez venir mercredi matin ?", heure: '10:32', lu: false },
    { id: 2, client: 'Thomas D.', texte: "Merci pour le devis, je l'accepte !", heure: '09:15', lu: false },
    { id: 3, client: 'Pierre R.', texte: "Parfait, à bientôt !", heure: 'Hier', lu: true }
  ];

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#E87D50', bg: '#FFF5F0' },
    planifie: { label: 'Planifié', color: '#6366F1', bg: '#F0F0FF' },
    termine: { label: 'Terminé', color: '#22C55E', bg: '#F0FDF4' }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'leads', label: 'Leads', badge: leads.length },
    { id: 'chantiers', label: 'Chantiers' },
    { id: 'messages', label: 'Messages', badge: messages.filter(m => !m.lu).length },
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

      {/* ── NAVBAR HAUT ── */}
      <header className="dp-navbar">
        <div className="dp-navbar-inner">

          {/* LOGO */}
          <Link to="/" className="dp-logo-link">
            <span className="dp-logo-name">BATINNOV</span>
            <span className="dp-pro-tag">PRO</span>
          </Link>

          {/* NAV CENTRE */}
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

          {/* DROITE */}
          <div className="dp-navbar-right">
            {/* LIEN VERS SITE CLIENT */}
            <Link to="/" className="dp-client-link">
              Voir site client
            </Link>

            {/* NOTIFICATIONS */}
            <div className="dp-notif">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="dp-notif-dot" />
            </div>

            {/* AVATAR + PROFIL */}
            <button
              className="dp-avatar-btn"
              onClick={() => setActivePage('profil')}
            >
              <div className="dp-avatar">{pro.avatar}</div>
              <div className="dp-avatar-info">
                <strong>{pro.nom}</strong>
                <span>{pro.metier}</span>
              </div>
            </button>

            {/* BURGER MOBILE */}
            <button className="dp-burger" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="dp-main">
        <div className="dp-content-wrap">

          {/* PAGE TITLE */}
          <div className="dp-page-title">
            <h1>{pageTitle}</h1>
            {activePage === 'dashboard' && (
              <p>Bonjour {pro.nom.split(' ')[0]} 👋 · ⭐ {pro.note}/5 · {pro.avis} avis · {pro.ville}</p>
            )}
          </div>

          {/* ── DASHBOARD ── */}
          {activePage === 'dashboard' && (
            <div className="dp-page">
              <div className="dp-stats">
                {stats.map((s, i) => (
                  <div key={i} className="dp-stat-card">
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
                  {leads.map(l => (
                    <div key={l.id} className="dp-lead-row">
                      {l.urgent && <span className="dp-urgent">🔥 Urgent</span>}
                      <strong>{l.service}</strong>
                      <span>{l.adresse} · {l.budget}</span>
                      <span className="dp-time">{l.date}</span>
                      <button className="dp-btn-sm">Répondre →</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dp-card">
                <div className="dp-card-head">
                  <h3>Messages récents</h3>
                  <button className="dp-link" onClick={() => setActivePage('messages')}>Voir tout →</button>
                </div>
                {messages.map(m => (
                  <div key={m.id} className={`dp-msg-row ${!m.lu ? 'unread' : ''}`}>
                    <div className="dp-msg-avatar">{m.client[0]}</div>
                    <div className="dp-msg-body">
                      <strong>{m.client}</strong>
                      <span>{m.texte}</span>
                    </div>
                    <span className="dp-time">{m.heure}</span>
                    {!m.lu && <span className="dp-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LEADS ── */}
          {activePage === 'leads' && (
            <div className="dp-page">
              <div className="dp-card">
                <div className="dp-card-head"><h3>Leads disponibles ({leads.length})</h3></div>
                {leads.map(l => (
                  <div key={l.id} className="dp-lead-card">
                    {l.urgent && <span className="dp-urgent">🔥 Urgent</span>}
                    <div className="dp-lead-info">
                      <h4>{l.service}</h4>
                      <p>📍 {l.adresse}</p>
                      <p>💰 Budget : {l.budget}</p>
                      <p>👤 {l.client} · {l.date}</p>
                    </div>
                    <div className="dp-lead-actions">
                      <button className="dp-btn-primary">Envoyer un devis</button>
                      <button className="dp-btn-ghost">Refuser</button>
                    </div>
                  </div>
                ))}
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
              <div className="dp-card">
                <div className="dp-card-head"><h3>Mes messages</h3></div>
                {messages.map(m => (
                  <div key={m.id} className={`dp-msg-full ${!m.lu ? 'unread' : ''}`}>
                    <div className="dp-msg-avatar">{m.client[0]}</div>
                    <div className="dp-msg-full-body">
                      <div className="dp-msg-full-head">
                        <strong>{m.client}</strong>
                        <span>{m.heure}</span>
                      </div>
                      <p>{m.texte}</p>
                      <button className="dp-btn-sm">Répondre →</button>
                    </div>
                    {!m.lu && <span className="dp-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activePage === 'documents' && (
            <div className="dp-page">
              <div className="dp-card">
                <div className="dp-card-head"><h3>Mes documents</h3></div>
                {[
                  { name: 'K-bis', statut: 'Validé', date: '01/01/2026', ok: true },
                  { name: 'Assurance décennale', statut: 'Validé', date: '01/01/2026', ok: true },
                  { name: 'Carte BTP', statut: 'En attente', date: '—', ok: false }
                ].map((doc, i) => (
                  <div key={i} className="dp-doc-row">
                    <span className="dp-doc-icon">📄</span>
                    <div className="dp-doc-info">
                      <strong>{doc.name}</strong>
                      <span className={doc.ok ? 'dp-ok' : 'dp-pending'}>{doc.ok ? '✓' : '⏳'} {doc.statut}</span>
                    </div>
                    <span className="dp-time">Expire : {doc.date}</span>
                    <button className="dp-btn-ghost">Mettre à jour</button>
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
                  <button className="dp-btn-primary">+ Nouvelle facture</button>
                </div>
                <table className="dp-table">
                  <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
                  <tbody>
                    {[
                      { num: 'F-2026-005', client: 'Pierre R.', date: '2 mai 2026', montant: '1 200 €', ok: true },
                      { num: 'F-2026-004', client: 'Julie K.', date: '28 avr.', montant: '1 800 €', ok: true },
                      { num: 'F-2026-003', client: 'Marie L.', date: '12 mai 2026', montant: '1 400 €', ok: false }
                    ].map((f, i) => (
                      <tr key={i}>
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
                    <p style={{ color: '#FFB800', fontWeight: 700 }}>⭐ {pro.note}/5 · {pro.avis} avis</p>
                  </div>
                </div>
                <div className="dp-form-grid">
                  <div className="dp-form-group"><label>Prénom</label><input defaultValue="Marc" /></div>
                  <div className="dp-form-group"><label>Nom</label><input defaultValue="Dupont" /></div>
                  <div className="dp-form-group"><label>Email</label><input defaultValue="marc@dupont-btp.fr" /></div>
                  <div className="dp-form-group"><label>Téléphone</label><input defaultValue="04 73 12 34 56" /></div>
                  <div className="dp-form-group" style={{ gridColumn: '1/-1' }}><label>Raison sociale</label><input defaultValue="SARL Dupont BTP" /></div>
                  <div className="dp-form-group"><label>SIRET</label><input defaultValue="123 456 789 00012" /></div>
                  <div className="dp-form-group"><label>Ville</label><input defaultValue="Clermont-Ferrand" /></div>
                </div>
                <button className="dp-btn-primary" style={{ marginTop: 8 }}>Sauvegarder</button>
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #EBEBEB' }}>
                  <Link to="/" className="dp-logout-btn">↩ Déconnexion</Link>
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