import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pro.css';

function Pro() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);

  const services = [
    { id: 'renovation', name: 'Rénovation' },
    { id: 'amenagement', name: 'Aménagement' },
    { id: 'pmr', name: 'Aide à la personne' },
    { id: 'irve', name: 'Borne IRVE' }
  ];

  const avantages = [
    {
      title: 'Zéro commission',
      description: 'Gardez 100% de vos revenus. Aucune commission sur vos prestations.'
    },
    {
      title: 'Chantiers locaux',
      description: 'Recevez des demandes de clients près de chez vous.'
    },
    {
      title: 'Paiement sécurisé',
      description: 'Vos paiements sont garantis et versés rapidement.'
    },
    {
      title: 'Visibilité accrue',
      description: 'Augmentez votre notoriété grâce aux avis clients.'
    },
    {
      title: 'Gestion simplifiée',
      description: 'Gérez vos chantiers, devis et factures en ligne.'
    },
    {
      title: 'Leads qualifiés',
      description: 'Recevez des demandes correspondant à vos compétences.'
    }
  ];

  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  return (
    <div className="pro-page">
      {/* HERO PRO */}
      <section className="hero-pro">
        <div className="container">
          <div className="hero-pro-content">
            <div className="hero-pro-text">
              <div className="hero-badge">Inscription 100% gratuite</div>
              <h1>Développez votre activité<br />sans commission</h1>
              <p>
                Rejoignez le réseau d'artisans BATINNOV et recevez des chantiers
                près de chez vous. Zéro commission, paiements garantis.
              </p>
              <a href="#inscription" className="btn-pro-hero">
                Rejoindre le réseau →
              </a>
              <div className="hero-stats">
                <div className="stat">
                  <strong>150+</strong>
                  <span>Artisans actifs</span>
                </div>
                <div className="stat">
                  <strong>2000+</strong>
                  <span>Chantiers réalisés</span>
                </div>
                <div className="stat">
                  <strong>4.8/5</strong>
                  <span>Satisfaction</span>
                </div>
              </div>
            </div>
            <div className="hero-pro-image">
              <img src="/images/renovation.jpg" alt="Artisan au travail" />
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="avantages-section">
        <div className="container">
          <h2>Pourquoi rejoindre BATINNOV ?</h2>
          <div className="avantages-grid">
            {avantages.map((avantage, index) => (
              <div key={index} className="avantage-card">
                <h3>{avantage.title}</h3>
                <p>{avantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSCRIPTION */}
      <section id="inscription" className="inscription-section">
        <div className="container">
          <div className="inscription-wrapper">
            <h2>Rejoignez-nous gratuitement</h2>
            <p className="inscription-subtitle">Inscription en 2 étapes simples</p>

            {step === 1 && (
              <div className="inscription-step">
                <h3>Étape 1/2 : Vos services</h3>
                <p>Sélectionnez vos domaines d'expertise</p>
                <div className="services-grid-pro">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      className={`service-btn-pro ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                      onClick={() => toggleService(service.id)}
                    >
                      {service.name}
                      {selectedServices.includes(service.id) && <span className="check">✓</span>}
                    </button>
                  ))}
                </div>
                <button
                  className="btn-pro-next"
                  onClick={() => setStep(2)}
                  disabled={selectedServices.length === 0}
                >
                  Continuer →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="inscription-step">
                <button className="btn-back" onClick={() => setStep(1)}>← Retour</button>
                <h3>Étape 2/2 : Vos informations</h3>
                <form className="form-pro">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Raison sociale *</label>
                      <input type="text" placeholder="SARL DUPONT" required />
                    </div>
                    <div className="form-group">
                      <label>SIRET *</label>
                      <input type="text" placeholder="14 chiffres" required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" placeholder="contact@entreprise.fr" required />
                    </div>
                    <div className="form-group">
                      <label>Téléphone *</label>
                      <input type="tel" placeholder="04 73 12 34 56" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ville d'intervention *</label>
                    <input type="text" placeholder="Clermont-Ferrand" required />
                  </div>

                  <div className="upload-section">
                    <h4>Documents obligatoires</h4>
                    <div className="upload-grid">
                      <div className="upload-box">
                        <p>📄 K-bis (moins de 3 mois)</p>
                        <input type="file" accept=".pdf,.jpg,.png" />
                      </div>
                      <div className="upload-box">
                        <p>📄 Assurance décennale</p>
                        <input type="file" accept=".pdf,.jpg,.png" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-pro-submit">
                    Finaliser mon inscription
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pro;