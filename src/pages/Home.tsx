import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const services = [
    {
      id: 'renovation',
      title: 'Travaux',
      color: '#E87D50',
      image: '/images/renovation.jpg',
      desc: 'Rénovation, extension, isolation, ravalement...',
      link: '/services/renovation'
    },
    {
      id: 'courtage',
      title: 'Assistance à maîtrise d\'ouvrage',
      color: '#7C3AED',
      image: '/images/amenagement.jpg',
      desc: 'Pilotage, coordination et suivi de projet...',
      link: '/services/courtage'
    },
    {
      id: 'services-maison',
      title: 'Aide à la personne',
      color: '#4A7A5C',
      image: '/images/pmr.jpg',
      desc: 'Petite peinture, jardinage, entretien...',
      link: '/services/services-maison'
    },
    {
      id: 'irve',
      title: 'Borne IRVE',
      color: '#2563EB',
      image: '/images/irve.jpg',
      desc: 'Installation bornes recharge électrique...',
      link: '/services/irve'
    }
  ];


  return (
    <div className="home-page">
      {/* HERO STYLE WECASA */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Sponsor officiel<br />de votre habitat</h1>
              <p>
                Trouvez le bon artisan pour tous vos travaux du bâtiment.
                Rénovation, aménagement, adaptation PMR ou borne électrique.
              </p>
              <button
                className="btn-hero"
                onClick={() => navigate('/devis')}
              >
                Demander un devis gratuit
              </button>
            </div>
            <div className="hero-image">
              <img src="/images/hero.jpg" alt="Artisan BATINNOV" />
            </div>
          </div>
        </div>
      </section>

      {/* BANDE CHIFFRES CLÉS */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-strip-grid">
            <div className="stats-strip-item">
              <strong>200+</strong>
              <span>Artisans certifiés</span>
            </div>
            <div className="stats-strip-divider" />
            <div className="stats-strip-item">
              <strong>4,8/5</strong>
              <span>Note moyenne</span>
            </div>
            <div className="stats-strip-divider" />
            <div className="stats-strip-item">
              <strong>2 000+</strong>
              <span>Chantiers réalisés</span>
            </div>
            <div className="stats-strip-divider" />
            <div className="stats-strip-item">
              <strong>48h</strong>
              <span>Délai de réponse</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services-section" className="services-section">
        <div className="container">
          <div className="services-header">
            <span className="services-tag">Nos prestations</span>
            <h2>Des experts pour chaque projet</h2>
            <p className="services-sub">Artisans certifiés, devis gratuit sous 48h</p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <Link to={service.link} className="service-card-img-wrap">
                  <img src={service.image} alt={service.title} />
                  <div className="service-card-overlay" />
                  <div className="service-card-img-content">
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                  </div>
                </Link>
                <button
                  className="service-card-cta"
                  onClick={() => navigate(`/devis?service=${service.id}`)}
                >
                  Demander un devis
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="how-section">
        <div className="container">
          <div className="how-header">
            <span className="how-tag">Simple & rapide</span>
            <h2>Comment ça marche ?</h2>
            <p>4 étapes pour concrétiser votre projet</p>
          </div>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-num">1</div>
              <div className="how-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <h3>Décrivez votre projet</h3>
              <p>Remplissez notre formulaire en 2 minutes. Type de travaux, budget, localisation.</p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">2</div>
              <div className="how-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3>Recevez des devis</h3>
              <p>Des artisans qualifiés de votre région vous répondent sous 48h.</p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">3</div>
              <div className="how-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="23 11 17 11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>
              </div>
              <h3>Choisissez votre artisan</h3>
              <p>Comparez les profils, avis et tarifs. Vous décidez en toute liberté.</p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">4</div>
              <div className="how-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3>Profitez du résultat</h3>
              <p>Suivez l'avancement en temps réel et validez à la livraison.</p>
            </div>
          </div>
        </div>
      </section>


      {/* WE ARE BATINNOV - Style Wecasa */}
      <section className="we-are-section">
        <div className="container">
          <div className="we-are-content">
            {/* GAUCHE : Vidéo placeholder style Wecasa */}
            <div className="we-are-video">
              <div className="video-wrapper">
                <div className="video-label">
                  <span>BATINNOV</span>
                </div>
                <div className="video-question">
                  C'EST<br />QUOI ?
                </div>
                <button className="video-play-btn">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* DROITE : Texte style Wecasa */}
            <div className="we-are-text">
              <h2>We are BATINNOV</h2>
              <p>
                <strong>Permettre</strong> à chacun de réaliser ses projets de travaux.
              </p>
              <p>
                <strong>Révéler</strong> le talent des artisans du bâtiment.
              </p>
              <p>
                <strong>Construire</strong> un modèle de plateforme responsable.
              </p>
              <p className="we-are-tagline">Voilà ce qui nous anime au quotidien !</p>
              <Link to="/about" className="btn-en-savoir-plus">En savoir plus</Link>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION APPLICATION */}
      <section className="app-section">
        <div className="container">
          <div className="app-inner">

            <div className="app-text">
              <h2>Téléchargez notre application</h2>
              <p>
                Gérez vos projets encore plus facilement depuis votre téléphone.
                Suivez l'avancement de vos chantiers, échangez avec vos artisans
                et recevez vos devis en temps réel, où que vous soyez.
              </p>
              <div className="app-badges">
                <a href="#" className="app-badge">
                  <img src="/images/payment/googleplay.png" alt="Disponible sur Google Play" />
                </a>
                <a href="#" className="app-badge">
                  <img src="/images/payment/appstore.png" alt="Disponible sur l'App Store" />
                </a>
              </div>
              <p className="app-pro-link">
                Vous êtes un professionnel ?{' '}
                <Link to="/pro" className="app-link">Rejoignez le réseau →</Link>
              </p>
            </div>

            <div className="app-phones">
              <img src="/images/appli.png" alt="App BATINNOV" className="app-phone-1" />
              <img src="/images/appli2.png" alt="App BATINNOV" className="app-phone-2" />
            </div>

          </div>
        </div>
      </section>

      {/* BANDE DÉFILANTE - entre We are BATINNOV et le footer */}
      <div className="ticker-wrapper">
        <div className="ticker-track">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ticker-content">
              <span> On recrute des artisans en ce moment</span>
              <span className="ticker-dot">·</span>
              <span> Refaites votre maison à petit prix</span>
              <span className="ticker-dot">·</span>
              <span> Installation borne IRVE dès 1 200 €</span>
              <span className="ticker-dot">·</span>
              <span>Devis gratuit sous 48h</span>
              <span className="ticker-dot">·</span>
              <span> Jardinage et petits travaux disponibles</span>
              <span className="ticker-dot">·</span>
              <span> Financement travaux avec nos courtiers</span>
              <span className="ticker-dot">·</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;