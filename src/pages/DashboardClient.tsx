import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardClient.css';

function DashboardClient() {
  const [activePage, setActivePage] = useState('accueil');
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

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

  const [conversations, setConversations] = useState([
    {
      id: 1,
      nom: 'Marc Dupont',
      avatar: 'MD',
      lu: false,
      messages: [
        { id: 1, texte: 'Bonjour, je suis disponible le 15 mai pour l\'installation.', de: 'eux', heure: '10:30' },
        { id: 2, texte: 'Pouvez-vous confirmer l\'adresse exacte ?', de: 'eux', heure: '10:32' },
      ]
    },
    {
      id: 2,
      nom: 'Sophie Bernard',
      avatar: 'SB',
      lu: true,
      messages: [
        { id: 1, texte: 'Voici mon devis détaillé pour votre salle de bain.', de: 'eux', heure: 'Hier' },
        { id: 2, texte: 'Merci Sophie, je regarde ça et reviens vers vous.', de: 'moi', heure: 'Hier' },
      ]
    }
  ]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    if (!draft.trim() || selectedConv === null) return;
    setConversations(prev => prev.map(c =>
      c.id === selectedConv
        ? { ...c, lu: true, messages: [...c.messages, { id: Date.now(), texte: draft, de: 'moi', heure: "À l'instant" }] }
        : c
    ));
    setDraft('');
  };

  const convActive = conversations.find(c => c.id === selectedConv);

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF' },
    devis_recu: { label: 'Devis reçus', color: '#E87D50', bg: '#FFF5F2' },
    termine: { label: 'Terminé', color: '#10B981', bg: '#ECFDF5' }
  };

  const navItems = [
    { id: 'accueil', label: 'Mon espace' },
    { id: 'demandes', label: 'Demandes', badge: demandes.filter(d => d.statut !== 'termine').length },
    { id: 'devis', label: 'Devis', badge: artisans.length },
    { id: 'chantiers', label: 'Chantiers' },
    { id: 'documents', label: 'Documents' },
    { id: 'messages', label: 'Messages', badge: conversations.filter(c => !c.lu).length },
    { id: 'agenda', label: 'Agenda' },
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
            <Link to="/devis" className="btn-nouvelle-demande">
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
                <Link to="/devis" className="btn-primary-green">
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
                  <span className="client-stat-num">{conversations.filter(c => !c.lu).length}</span>
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
                <Link to="/devis" className="btn-primary-green">
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

          {/* ===== CHANTIERS ===== */}
          {activePage === 'chantiers' && (
            <div className="client-page">
              <h1>Mes chantiers</h1>
              <div className="chantiers-list">
                {chantiers_detail.map(ch => (
                  <div key={ch.id} className="chantier-card">
                    <div className="chantier-card-header">
                      <div>
                        <h3>{ch.titre}</h3>
                        <span className="chantier-artisan">Artisan : {ch.artisan}</span>
                      </div>
                      <div className="chantier-rdv">
                        <span className="rdv-label">Prochain RDV</span>
                        <strong>{ch.date_rdv}</strong>
                      </div>
                    </div>
                    <div className="chantier-progress-bar-wrap">
                      <div className="chantier-progress-bar">
                        <div className="chantier-progress-fill" style={{ width: `${ch.avancement}%` }} />
                      </div>
                      <span className="chantier-progress-pct">{ch.avancement}%</span>
                    </div>
                    <div className="chantier-etapes">
                      {ch.etapes.map((e, i) => (
                        <div key={i} className={`chantier-etape ${e.fait ? 'fait' : ''} ${e.encours ? 'encours' : ''}`}>
                          <span className="etape-dot">{e.fait ? '✓' : e.encours ? '◉' : '○'}</span>
                          <span>{e.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                      {doc.type === 'Contrat' ? '📋' : doc.type === 'Devis' ? '💼' : '🧾'}
                    </div>
                    <div className="doc-info">
                      <strong>{doc.nom}</strong>
                      <span>{doc.type} · {doc.chantier} · {doc.date}</span>
                    </div>
                    <div className="doc-meta">
                      <span className="doc-taille">{doc.taille}</span>
                      {doc.signe && <span className="doc-signe-badge">Signé</span>}
                    </div>
                    <button className="btn-dl-doc">⬇ Télécharger</button>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== MESSAGES ===== */}
          {activePage === 'messages' && (
            <div className="client-page">
              <h1>Messages</h1>
              <div className="chat-layout">

                {/* LISTE DES CONVERSATIONS */}
                <div className="chat-sidebar">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      className={`chat-conv-item ${selectedConv === conv.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedConv(conv.id);
                        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, lu: true } : c));
                      }}
                    >
                      <div className="chat-conv-avatar">{conv.avatar}</div>
                      <div className="chat-conv-info">
                        <div className="chat-conv-name">
                          <strong>{conv.nom}</strong>
                          {!conv.lu && <span className="chat-unread-dot" />}
                        </div>
                        <span className="chat-conv-preview">
                          {conv.messages.at(-1)?.texte}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* FENETRE DE CHAT */}
                <div className="chat-window">
                  {!convActive ? (
                    <div className="chat-empty">
                      <p>Sélectionnez une conversation</p>
                    </div>
                  ) : (
                    <>
                      <div className="chat-header">
                        <div className="chat-conv-avatar">{convActive.avatar}</div>
                        <strong>{convActive.nom}</strong>
                      </div>

                      <div className="chat-messages">
                        {convActive.messages.map(msg => (
                          <div key={msg.id} className={`chat-bubble-wrap ${msg.de === 'moi' ? 'moi' : 'eux'}`}>
                            <div className="chat-bubble">
                              <p>{msg.texte}</p>
                              <span className="chat-time">{msg.heure}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="chat-input-bar">
                        <input
                          type="text"
                          placeholder="Écrire un message..."
                          value={draft}
                          onChange={e => setDraft(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="chat-send-btn" onClick={sendMessage}>
                          Envoyer
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
                  <div className="profil-save-row">
                    <button className="btn-save-client">Sauvegarder</button>
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
