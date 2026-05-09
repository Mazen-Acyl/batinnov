import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const services = [
    {
      id: 'renovation',
      title: 'Rénovation',
      image: '/images/renovation.jpg',
      desc: 'Cuisine, salle de bain, extension, ravalement...',
      link: '/services/renovation'
    },
    {
      id: 'courtage',
      title: 'Courtage',
      image: '/images/amenagement.jpg',
      desc: 'Financement, prêt travaux, rachat de crédit...',
      link: '/services/courtage'
    },
    {
      id: 'services-maison',
      title: 'Aide à la personne',
      image: '/images/pmr.jpg',
      desc: 'Petite peinture, jardinage, entretien...',
      link: '/services/services-maison'
    },
    {
      id: 'irve',
      title: 'Borne IRVE',
      image: '/images/irve.jpg',
      desc: 'Installation bornes recharge électrique...',
      link: '/services/irve'
    }
  ];

  const avis = [
    {
      texte: "Travail impeccable pour la rénovation de notre cuisine. L'artisan a été ponctuel, professionnel et très soigneux. Je recommande vivement !",
      auteur: "Marie L.",
      service: "Rénovation cuisine",
      note: 5
    },
    {
      texte: "Installation de notre borne de recharge en moins de 2h. Tarif respecté, équipe sympa. Parfait pour notre nouvelle voiture électrique.",
      auteur: "Thomas D.",
      service: "Borne IRVE",
      note: 5
    },
    {
      texte: "Nous avons fait adapter la salle de bain de ma mère. Les artisans ont été très à l'écoute et le résultat est parfait pour son confort.",
      auteur: "Sophie M.",
      service: "Aide à la personne",
      note: 4
    },
    {
      texte: "Création d'un dressing sur-mesure. Le rendu est magnifique et conforme à nos attentes. Bravo à toute l'équipe BATINNOV !",
      auteur: "Pierre R.",
      service: "Aménagement",
      note: 5
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
              <a
                href="#services-section"
                className="btn-hero"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Demander un devis gratuit
              </a>
            </div>
            <div className="hero-image">
              <img src="/images/hero.jpg" alt="Artisan BATINNOV" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES POPULAIRES STYLE WECASA */}
      <section id="services-section" className="services-section">
        <div className="container">
          <h2>Nos services à domicile</h2>
          <div className="services-grid">
            {services.map((service) => (
              <Link to={service.link} key={service.id} className="service-card">
                <div className="service-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-card-body">
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                  <span className="service-card-link">Demander un devis →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <section className="avis-section">
        <div className="container">
          <div className="avis-header">
            <h2>Déjà 2 000 moments de bonheur</h2>
            <p>Nos clients nous notent <strong>4,8/5</strong></p>
          </div>
          <div className="avis-grid">
            {avis.map((item, index) => (
              <div key={index} className="avis-card">
                <div className="avis-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < item.note ? '#FFB800' : '#DDDDDD', fontSize: '20px' }}>★</span>
                  ))}
                </div>
                <p className="avis-texte">{item.texte}</p>
                <div className="avis-auteur">
                  <strong>{item.auteur}</strong>
                  <span>{item.service}</span>
                </div>
              </div>
            ))}
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