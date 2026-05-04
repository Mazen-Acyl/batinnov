import { useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardClient.css';

function DashboardClient() {
  const [activePage, setActivePage] = useState('accueil');
  const [menuOpen, setMenuOpen] = useState(false);

  const client = {
    prenom: 'Marie',
    nom: 'Laurent',
    email: 'marie.laurent@email.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue des Lilas, 63000 Clermont-Ferrand',
    avatar: 'ML'
  };

  const demandes = [
    {
      id: 1,
      service: 'Rénovation',
      sousService: 'Rénovation salle de bain',
      statut: 'en_cours',
      date: '2 mai 2026',
      devis: 3,
      budget: '5 000 € - 15 000 €'
    },
    {
      id: 2,
      service: 'Borne IRVE',
      sousService: 'Wallbox 11kW',
      statut: 'devis_recu',
      date: '28 avr. 2026',
      devis: 2,
      budget: '1 000 € - 5 000 €'
    },
    {
      id: 3,
      service: 'Aménagement',
      sousService: 'Dressing sur-mesure',
      statut: 'termine',
      date: '10 avr. 2026',
      devis: 1,
      budget: '1 000 € - 5 000 €'
    }
  ];

  const artisans = [
    {
      id: 1,
      nom: 'Marc Dupont',
      metier: 'Électricien IRVE',
      note: 4.9,
      avis: 34,
      ville: 'Clermont-Ferrand',
      avatar: 'MD',
      montant: '1 450 €',
      delai: '15 mai 2026'
    },
    {
      id: 2,
      nom: 'Sophie Bernard',
      metier: 'Plombière',
      note: 4.7,
      avis: 21,
      ville: 'Aubière',
      avatar: 'SB',
      montant: '1 600 €',
      delai: '18 mai 2026'
    }
  ];

  const chantiers_detail = [
    {
      id: 1,
      titre: 'Installation Borne IRVE',
      artisan: 'Marc Leroy',
      service: 'IRVE',
      adresse: '12 rue des Fleurs, 63000 Clermont-Fd',
      avancement: 65,
      statut: 'en_cours',
      prochaine_etape: 'Mise en service',
      date_rdv: 'Ven. 2 mai · 14h00',
      etapes: [
        { label: 'Visite technique', fait: true },
        { label: 'Préparation chantier', fait: true },
        { label: 'Installation borne', fait: false, encours: true },
        { label: 'Mise en service', fait: false },
        { label: 'Livraison', fait: false }
      ]
    },
    {
      id: 2,
      titre: 'Rénovation salle de bain',
      artisan: 'Sophie Vidal',
      service: 'Rénovation',
      adresse: '12 rue des Fleurs, 63000 Clermont-Fd',
      avancement: 40,
      statut: 'en_cours',
      prochaine_etape: 'Pose carrelage',
      date_rdv: "Aujourd'hui · 09h00",
      etapes: [
        { label: 'Dépose ancienne installation', fait: true },
        { label: 'Plomberie', fait: true },
        { label: 'Carrelage', fait: false, encours: true },
        { label: 'Finitions', fait: false },
        { label: 'Livraison', fait: false }
      ]
    }
  ];

  const documents = [
    { id: 1, nom: 'Contrat installation IRVE', type: 'Contrat', taille: '2.1 Mo', date: '18 avr. 2026', signe: true, chantier: 'IRVE' },
    { id: 2, nom: 'Devis initial borne Wallbox', type: 'Devis', taille: '450 Ko', date: '14 avr. 2026', signe: false, chantier: 'IRVE' },
    { id: 3, nom: 'Devis travaux rénovation', type: 'Devis', taille: '1.8 Mo', date: '10 avr. 2026', signe: false, chantier: 'Rénovation' },
    { id: 4, nom: 'Facture acompte borne', type: 'Facture', taille: '380 Ko', date: '16 avr. 2026', signe: true, chantier: 'IRVE' }
  ];

  const agenda = [
    { id: 1, heure: '14:00', titre: 'Mise en service de la borne', artisan: 'Marc Leroy', duree: '2h', statut: 'confirme', date: 'Ven. 2 mai' },
    { id: 2, heure: '09:00', titre: 'Vérification tableau électrique', artisan: 'Marc Leroy', duree: '1h', statut: 'a_confirmer', date: 'Lun. 5 mai' }
  ];

  const messages = [
    {
      id: 1,
      artisan: 'Marc Dupont',
      texte: 'Bonjour, je suis disponible le 15 mai pour l\'installation.',
      heure: '10:32',
      lu: false
    },
    {
      id: 2,
      artisan: 'Sophie Bernard',
      texte: 'Voici mon devis détaillé pour votre salle de bain.',
      heure: 'Hier',
      lu: true
    }
  ];

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF' },
    devis_recu: { label: 'Devis reçus', color: '#E87D50', bg: '#FFF5F2' },
    termine: { label: 'Terminé', color: '#10B981', bg: '#ECFDF5' }
  };

  const navItems = [
    { id: 'accueil', icon: '🏠', label: 'Mon espace' },
    { id: 'demandes', icon: '📋', label: 'Mes demandes', badge: demandes.filter(d => d.statut !== 'termine').length },
    { id: 'devis', icon: '💼', label: 'Mes devis', badge: artisans.length },
    { id: 'chantiers', icon: '🔨', label: 'Mes chantiers' },
    { id: 'documents', icon: '📄', label: 'Documents' },
    { id: 'messages', icon: '💬', label: 'Messages', badge: messages.filter(m => !m.lu).length },
    { id: 'agenda', icon: '📅', label: 'Agenda' },
    { id: 'profil', icon: '👤', label: 'Mon profil' }
  ];

  return (
    <div className="dashboard-client-layout">

      {/* NAVBAR CLIENT */}
      <header className="client-navbar">
        <div className="client-navbar-inner">
          <Link to="/" className="client-logo">BATINNOV</Link>

          {/* NAVIGATION CENTRE */}
          <nav className={`client-nav ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`client-nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => { setActivePage(item.id); setMenuOpen(false); }}
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="client-nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* DROITE */}
          <div className="client-navbar-right">
            <Link to="/services/renovation" className="btn-nouvelle-demande">
              + Nouvelle demande
            </Link>
            <button
              className="client-avatar-btn"
              onClick={() => setActivePage('profil')}
            >
              <div className="client-avatar">{client.avatar}</div>
              <span>{client.prenom}</span>
            </button>
            <button
              className="mobile-burger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main className="client-main">
        <div className="container">

          {/* ===== ACCUEIL ===== */}
          {activePage === 'accueil' && (
            <div className="client-page">
              {/* BIENVENUE */}
              <div className="welcome-banner">
                <div className="welcome-text">
                  <h1>Bonjour {client.prenom} 👋</h1>
                  <p>Retrouvez ici toutes vos demandes, devis et messages.</p>
                </div>
                <Link to="/services/renovation" className="btn-primary-green">
                  + Nouvelle demande
                </Link>
              </div>

              {/* STATS RAPIDES */}
              <div className="client-stats">
                <div className="client-stat">
                  <span className="client-stat-num">{demandes.length}</span>
                  <span className="client-stat-label">Demandes</span>
                </div>
                <div className="client-stat">
                  <span className="client-stat-num">{artisans.length}</span>
                  <span className="client-stat-label">Devis reçus</span>
                </div>
                <div className="client-stat">
                  <span className="client-stat-num">{messages.filter(m => !m.lu).length}</span>
                  <span className="client-stat-label">Messages non lus</span>
                </div>
                <div className="client-stat">
                  <span className="client-stat-num">{demandes.filter(d => d.statut === 'termine').length}</span>
                  <span className="client-stat-label">Travaux terminés</span>
                </div>
              </div>

              {/* DERNIÈRES DEMANDES */}
              <div className="client-section">
                <div className="section-head">
                  <h2>Mes dernières demandes</h2>
                  <button className="btn-voir-tout" onClick={() => setActivePage('demandes')}>
                    Voir tout →
                  </button>
                </div>
                <div className="demandes-list">
                  {demandes.slice(0, 2).map(d => (
                    <div key={d.id} className="demande-card">
                      <div className="demande-icon">
                        {d.service === 'Rénovation' ? '🏠' : d.service === 'Borne IRVE' ? '⚡' : '📐'}
                      </div>
                      <div className="demande-info">
                        <strong>{d.sousService}</strong>
                        <span>{d.service} · {d.date}</span>
                        <span>Budget : {d.budget}</span>
                      </div>
                      <div className="demande-right">
                        <span
                          className="statut-pill"
                          style={{ color: statutConfig[d.statut].color, background: statutConfig[d.statut].bg }}
                        >
                          {statutConfig[d.statut].label}
                        </span>
                        {d.devis > 0 && (
                          <span className="devis-count">{d.devis} devis reçu{d.devis > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOUVEAUX SERVICES */}
              <div className="client-section">
                <h2>Besoin d'un autre service ?</h2>
                <div className="services-quick-grid">
                  {[
                    { id: 'renovation', label: 'Rénovation', icon: '🏠' },
                    { id: 'courtage', label: 'Courtage', icon: '💼' },
                    { id: 'services-maison', label: 'Services à domicile', icon: '🌿' },
                    { id: 'irve', label: 'Borne IRVE', icon: '⚡' }
                  ].map(s => (
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
                <Link to="/services/renovation" className="btn-primary-green">
                  + Nouvelle demande
                </Link>
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
                      <span
                        className="statut-pill"
                        style={{ color: statutConfig[d.statut].color, background: statutConfig[d.statut].bg }}
                      >
                        {statutConfig[d.statut].label}
                      </span>
                      {d.devis > 0 && (
                        <span className="devis-count">{d.devis} devis reçu{d.devis > 1 ? 's' : ''}</span>
                      )}
                      <button
                        className="btn-voir-devis"
                        onClick={() => setActivePage('devis')}
                      >
                        Voir les devis →
                      </button>
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
                  <div key={a.id} className="devis-card">
                    <div className="devis-artisan">
                      <div className="artisan-avatar">{a.avatar}</div>
                      <div className="artisan-info">
                        <strong>{a.nom}</strong>
                        <span>{a.metier} · {a.ville}</span>
                        <div className="artisan-note">
                          ⭐ {a.note} ({a.avis} avis)
                        </div>
                      </div>
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
                      <button className="btn-accepter">Accepter ce devis</button>
                      <button className="btn-contacter" onClick={() => setActivePage('messages')}>
                        Contacter →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== MESSAGES ===== */}
          {activePage === 'messages' && (
            <div className="client-page">
              <h1>Mes messages</h1>
              <div className="messages-list-client">
                {messages.map(msg => (
                  <div key={msg.id} className={`message-client-card ${!msg.lu ? 'unread' : ''}`}>
                    <div className="msg-avatar-client">{msg.artisan[0]}</div>
                    <div className="msg-body">
                      <div className="msg-header-client">
                        <strong>{msg.artisan}</strong>
                        <span>{msg.heure}</span>
                      </div>
                      <p>{msg.texte}</p>
                      <div className="msg-reply-box">
                        <input type="text" placeholder="Écrire un message..." />
                        <button className="btn-send">Envoyer</button>
                      </div>
                    </div>
                    {!msg.lu && <span className="unread-dot" />}
                  </div>
                ))}
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
                    <h2>{client.prenom} {client.nom}</h2>
                    <p>{client.email}</p>
                    <p>{client.telephone}</p>
                  </div>
                </div>
                <div className="profil-client-form">
                  <h3>Informations personnelles</h3>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Prénom</label>
                      <input defaultValue={client.prenom} />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input defaultValue={client.nom} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input defaultValue={client.email} />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input defaultValue={client.telephone} />
                  </div>
                  <div className="form-group">
                    <label>Adresse</label>
                    <input defaultValue={client.adresse} />
                  </div>
                  <button className="btn-save-client">Sauvegarder</button>

                  <div className="profil-danger-zone">
                    <h3>Zone de danger</h3>
                    <Link to="/" className="btn-deconnexion">Se déconnecter</Link>
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