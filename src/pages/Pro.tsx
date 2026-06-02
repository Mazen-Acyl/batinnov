import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Pro.css';

function Pro() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    raisonSociale: '', siret: '', email: '', telephone: '',
    adresse: '', codePostal: '', ville: '',
    motDePasse: '', confirmMotDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerPro } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const friendlyError = (msg = '') => {
    const m = msg.toLowerCase();
    if (m.includes('siret') || (m.includes('failed query') && m.includes('siret')))
      return 'Ce numéro SIRET est déjà utilisé. Connectez-vous ou utilisez un autre SIRET.';
    if (m.includes('email') || m.includes('mail'))
      return 'Cette adresse email est déjà associée à un compte.';
    if (m.includes('failed query') || m.includes('unique') || m.includes('duplicate'))
      return 'Un compte existe déjà avec ces informations. Essayez de vous connecter.';
    return msg || 'Une erreur est survenue. Réessayez.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{14}$/.test(formData.siret)) {
      setError('Le SIRET doit contenir exactement 14 chiffres.');
      return;
    }
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await registerPro({
        raisonSociale: formData.raisonSociale,
        siret: formData.siret,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        codePostal: formData.codePostal,
        ville: formData.ville,
        motDePasse: formData.motDePasse,
        services: selectedServices,
      });
      navigate('/dashboard-pro');
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
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
                <form className="form-pro" onSubmit={handleSubmit}>
                  {error && <div className="form-error-banner">{error}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Raison sociale *</label>
                      <input
                        type="text" name="raisonSociale" placeholder="SARL DUPONT"
                        value={formData.raisonSociale} onChange={handleChange} required
                      />
                    </div>
                    <div className="form-group">
                      <label>SIRET *</label>
                      <input
                        type="text" name="siret" placeholder="14 chiffres"
                        value={formData.siret} onChange={handleChange}
                        maxLength={14} required
                      />
                      {formData.siret.length > 0 && (
                        <span className={`siret-hint ${/^\d{14}$/.test(formData.siret) ? 'valid' : 'invalid'}`}>
                          {/^\d{14}$/.test(formData.siret) ? '✓ SIRET valide' : `${formData.siret.length}/14 chiffres`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email" name="email" placeholder="contact@entreprise.fr"
                        value={formData.email} onChange={handleChange} required
                      />
                    </div>
                    <div className="form-group">
                      <label>Téléphone *</label>
                      <input
                        type="tel" name="telephone" placeholder="04 73 12 34 56"
                        value={formData.telephone} onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Adresse *</label>
                    <input
                      type="text" name="adresse" placeholder="12 rue des Artisans"
                      value={formData.adresse} onChange={handleChange} required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Code postal *</label>
                      <input
                        type="text" name="codePostal" placeholder="63000"
                        value={formData.codePostal} onChange={handleChange} required
                      />
                    </div>
                    <div className="form-group">
                      <label>Ville *</label>
                      <input
                        type="text" name="ville" placeholder="Clermont-Ferrand"
                        value={formData.ville} onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mot de passe *</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="motDePasse" placeholder="8 caractères minimum"
                          value={formData.motDePasse} onChange={handleChange} required
                        />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Confirmer le mot de passe *</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          name="confirmMotDePasse" placeholder="Répétez le mot de passe"
                          value={formData.confirmMotDePasse} onChange={handleChange} required
                        />
                        <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
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

                  <button type="submit" className="btn-pro-submit" disabled={loading}>
                    {loading ? 'Inscription en cours...' : 'Finaliser mon inscription'}
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