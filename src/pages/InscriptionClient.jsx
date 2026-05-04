import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './InscriptionClient.css';

function InscriptionClient() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service: '',
    description: '',
    budget: '',
    delai: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    confirmMotDePasse: '',
    adresse: '',
    ville: '',
    codePostal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const TOTAL_STEPS = 4;

  const services = [
    { id: 'renovation', label: 'Rénovation', image: '/images/renovation.jpg' },
    { id: 'amenagement', label: 'Aménagement', image: '/images/amenagement.jpg' },
    { id: 'pmr', label: 'Aide à la personne', image: '/images/pmr.jpg' },
    { id: 'irve', label: 'Borne IRVE', image: '/images/irve.jpg' }
  ];

  const budgets = [
    'Moins de 1 000 €',
    'Entre 1 000 € et 5 000 €',
    'Entre 5 000 € et 15 000 €',
    'Entre 15 000 € et 30 000 €',
    'Plus de 30 000 €',
    'Je ne sais pas encore'
  ];

  const delais = [
    'Le plus tôt possible',
    'Dans le mois',
    'Dans les 3 mois',
    'Dans les 6 mois',
    'Pas de délai précis'
  ];

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const canNext = () => {
    if (step === 1) return form.service !== '';
    if (step === 2) return form.description.length >= 20 && form.budget && form.delai;
    if (step === 3) return form.prenom && form.nom && form.email && form.telephone && form.motDePasse.length >= 8 && form.motDePasse === form.confirmMotDePasse;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.registerClient({
        email: form.email,
        motDePasse: form.motDePasse,
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        adresse: form.adresse,
        codePostal: form.codePostal,
        ville: form.ville
      });
      setStep(5); // Confirmation
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-client-page">
      <div className="inscription-client-wrapper">

        {/* LOGO */}
        <Link to="/" className="inscription-logo">BATINNOV</Link>

        {/* STEPPER */}
        {step <= TOTAL_STEPS && (
          <div className="stepper">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`step-dot ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}>
                {i + 1 < step ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
            ))}
            <div className="stepper-line">
              <div className="stepper-progress" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
            </div>
          </div>
        )}

        {/* =================== ÉTAPE 1 : SERVICE =================== */}
        {step === 1 && (
          <div className="step-content">
            <h1>Quel service vous intéresse ?</h1>
            <p>Sélectionnez votre type de travaux</p>
            <div className="service-select-grid">
              {services.map(s => (
                <button
                  key={s.id}
                  className={`service-select-card ${form.service === s.id ? 'selected' : ''}`}
                  onClick={() => update('service', s.id)}
                >
                  <div className="service-select-img">
                    <img src={s.image} alt={s.label} />
                  </div>
                  <span>{s.label}</span>
                  {form.service === s.id && (
                    <div className="check-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#4A7A5C"/>
                        <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================== ÉTAPE 2 : PROJET =================== */}
        {step === 2 && (
          <div className="step-content">
            <h1>Décrivez votre projet</h1>
            <p>Plus vous êtes précis, meilleurs seront les devis</p>

            <div className="form-group">
              <label>Description du projet *</label>
              <textarea
                rows={5}
                placeholder="Ex : Je souhaite rénover ma salle de bain (12m²). Je voudrais remplacer la baignoire par une douche italienne, changer le carrelage et refaire la plomberie..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
              <span className="char-count">{form.description.length}/20 min.</span>
            </div>

            <div className="form-group">
              <label>Budget estimé *</label>
              <div className="options-grid">
                {budgets.map(b => (
                  <button
                    key={b}
                    type="button"
                    className={`option-btn ${form.budget === b ? 'selected' : ''}`}
                    onClick={() => update('budget', b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Délai souhaité *</label>
              <div className="options-grid">
                {delais.map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`option-btn ${form.delai === d ? 'selected' : ''}`}
                    onClick={() => update('delai', d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================== ÉTAPE 3 : COORDONNÉES =================== */}
        {step === 3 && (
          <div className="step-content">
            <h1>Vos coordonnées</h1>
            <p>Pour recevoir les devis de nos artisans</p>

            <div className="form-row-2">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  placeholder="Jean"
                  value={form.prenom}
                  onChange={e => update('prenom', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  placeholder="Dupont"
                  value={form.nom}
                  onChange={e => update('nom', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="jean.dupont@email.fr"
                value={form.email}
                onChange={e => update('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Téléphone *</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={form.telephone}
                onChange={e => update('telephone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe * <span style={{ color: '#999', fontWeight: 400, fontSize: 13 }}>(8 caractères min.)</span></label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.motDePasse}
                  onChange={e => update('motDePasse', e.target.value)}
                />
                <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {form.motDePasse.length > 0 && form.motDePasse.length < 8 && (
                <span style={{ fontSize: 13, color: '#DC2626', marginTop: 4, display: 'block' }}>
                  Minimum 8 caractères
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirmMotDePasse}
                onChange={e => update('confirmMotDePasse', e.target.value)}
                style={{ borderColor: form.confirmMotDePasse && form.motDePasse !== form.confirmMotDePasse ? '#DC2626' : '' }}
              />
              {form.confirmMotDePasse && form.motDePasse !== form.confirmMotDePasse && (
                <span style={{ fontSize: 13, color: '#DC2626', marginTop: 4, display: 'block' }}>
                  Les mots de passe ne correspondent pas
                </span>
              )}
              {form.confirmMotDePasse && form.motDePasse === form.confirmMotDePasse && form.motDePasse.length >= 8 && (
                <span style={{ fontSize: 13, color: '#4A7A5C', marginTop: 4, display: 'block', fontWeight: 700 }}>
                  ✓ Parfait !
                </span>
              )}
            </div>

          </div>
        )}

        {/* =================== ÉTAPE 4 : ADRESSE =================== */}
        {step === 4 && (
          <div className="step-content">
            <h1>Adresse du chantier</h1>
            <p>Pour que nos artisans puissent intervenir chez vous</p>

            <div className="form-group">
              <label>Adresse *</label>
              <input
                type="text"
                placeholder="12 rue des Lilas"
                value={form.adresse}
                onChange={e => update('adresse', e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Code postal *</label>
                <input
                  type="text"
                  placeholder="63000"
                  value={form.codePostal}
                  onChange={e => update('codePostal', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Ville *</label>
                <input
                  type="text"
                  placeholder="Clermont-Ferrand"
                  value={form.ville}
                  onChange={e => update('ville', e.target.value)}
                />
              </div>
            </div>

            {/* RECAP */}
            <div className="recap-box">
              <h4>Récapitulatif de votre demande</h4>
              <ul>
                <li><strong>Service :</strong> {services.find(s => s.id === form.service)?.label}</li>
                <li><strong>Budget :</strong> {form.budget}</li>
                <li><strong>Délai :</strong> {form.delai}</li>
                <li><strong>Contact :</strong> {form.prenom} {form.nom}</li>
              </ul>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px 16px', borderRadius: 8, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                {error}
              </div>
            )}

            <p className="rgpd-text">
              En soumettant ce formulaire, vous acceptez nos{' '}
              <Link to="/cgv">CGV</Link> et notre{' '}
              <Link to="/confidentialite">politique de confidentialité</Link>.
            </p>
          </div>
        )}

        {/* =================== CONFIRMATION =================== */}
        {step === 5 && (
          <div className="step-content confirmation">
            <div className="confirmation-icon">✓</div>
            <h1>Demande envoyée !</h1>
            <p>
              Merci <strong>{form.prenom}</strong> ! Votre demande a bien été transmise.
              Nos artisans qualifiés vous contacteront sous <strong>48h</strong>.
            </p>
            <Link to="/" className="btn-retour-accueil">
              Retour à l'accueil
            </Link>
          </div>
        )}

        {/* NAVIGATION ÉTAPES */}
        {step <= TOTAL_STEPS && (
          <div className="step-nav">
            {step > 1 && (
              <button className="btn-prev" onClick={() => setStep(s => s - 1)}>
                ← Retour
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                className="btn-next"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Continuer →
              </button>
            ) : (
              <button
                className="btn-next"
                onClick={handleSubmit}
                disabled={loading || !form.adresse || !form.ville || !form.codePostal}
              >
                {loading ? 'Création du compte...' : 'Créer mon compte →'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default InscriptionClient;
