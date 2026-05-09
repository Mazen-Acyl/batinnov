import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import './DemandeDevis.css';

const SERVICES = [
  { id: 'renovation',    label: 'Rénovation',        desc: 'Cuisine, salle de bain, extension, ravalement...' },
  { id: 'amenagement',   label: 'Aménagement',        desc: 'Placards, dressings, bibliothèques, mezzanines...' },
  { id: 'aide-personne', label: 'Aide à la personne', desc: 'Adaptation PMR, douches plain-pied, barres d\'appui...' },
  { id: 'irve',          label: 'Borne IRVE',         desc: 'Installation borne de recharge électrique...' },
];

function DemandeDevis() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';

  const [step, setStep] = useState(preselectedService ? 2 : 1);
  const [devis, setDevis] = useState({
    service: preselectedService,
    description: '',
    surface: '',
    budget: '',
    codePostal: '',
    ville: '',
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPwd, setShowAuthPwd] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [success, setSuccess] = useState(false);

  const { isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAuthError('');
      setAuthLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        setSuccess(true);
      } catch {
        setAuthError('Connexion Google échouée. Réessayez.');
      } finally {
        setAuthLoading(false);
      }
    },
    onError: () => setAuthError('Connexion Google annulée.')
  });

  useEffect(() => {
    if (step === 3 && isAuthenticated) setSuccess(true);
  }, [step, isAuthenticated]);

  const update = (field, value) => setDevis(d => ({ ...d, [field]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(authEmail, authPassword);
      setSuccess(true);
    } catch (err) {
      setAuthError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (success) {
    return (
      <div className="devis-page">
        <div className="devis-wrapper devis-success-wrapper">
          <Link to="/" className="devis-logo">BATINNOV</Link>
          <div className="devis-success-icon">✓</div>
          <h2>Demande envoyée !</h2>
          <p>Vous serez contacté sous 48h par un artisan qualifié.</p>
          <Link to="/dashboard-client" className="btn-devis-primary">
            Voir mon tableau de bord →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="devis-page">
      <div className="devis-wrapper">
        <Link to="/" className="devis-logo">BATINNOV</Link>

        <div className="devis-progress">
          {[1, 2, 3].map((n, i) => (
            <>
              <div key={n} className={`devis-dot ${step > n ? 'done' : step === n ? 'active' : ''}`}>
                {step > n ? '✓' : n}
              </div>
              {i < 2 && (
                <div key={`line-${n}`} className={`devis-progress-line ${step > n ? 'done' : ''}`} />
              )}
            </>
          ))}
        </div>

        {/* ── ÉTAPE 1 : SERVICE ── */}
        {step === 1 && (
          <div className="devis-step">
            <h2>Quel service vous intéresse ?</h2>
            <p className="devis-subtitle">Choisissez votre type de travaux</p>
            <div className="devis-services-grid">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  className={`devis-service-card ${devis.service === s.id ? 'selected' : ''}`}
                  onClick={() => { update('service', s.id); setStep(2); }}
                >
                  <strong>{s.label}</strong>
                  <span>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : PROJET ── */}
        {step === 2 && (
          <div className="devis-step">
            {!preselectedService && (
              <button className="devis-back" onClick={() => setStep(1)}>← Retour</button>
            )}
            <h2>Décrivez votre projet</h2>
            <p className="devis-subtitle">Plus vous êtes précis, mieux l'artisan peut vous répondre</p>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="Ex: Je souhaite rénover ma salle de bain (12m²), remplacement de la baignoire par une douche italienne..."
                value={devis.description}
                onChange={e => update('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="devis-row">
              <div className="form-group">
                <label>Surface approximative</label>
                <select value={devis.surface} onChange={e => update('surface', e.target.value)}>
                  <option value="">Non précisé</option>
                  <option value="<20">Moins de 20 m²</option>
                  <option value="20-50">20 à 50 m²</option>
                  <option value="50-100">50 à 100 m²</option>
                  <option value=">100">Plus de 100 m²</option>
                </select>
              </div>
              <div className="form-group">
                <label>Budget estimé</label>
                <select value={devis.budget} onChange={e => update('budget', e.target.value)}>
                  <option value="">Non précisé</option>
                  <option value="<5000">Moins de 5 000 €</option>
                  <option value="5000-15000">5 000 à 15 000 €</option>
                  <option value="15000-30000">15 000 à 30 000 €</option>
                  <option value=">30000">Plus de 30 000 €</option>
                </select>
              </div>
            </div>

            <div className="devis-row">
              <div className="form-group">
                <label>Code postal *</label>
                <input
                  type="text" placeholder="63000"
                  value={devis.codePostal}
                  onChange={e => update('codePostal', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Ville *</label>
                <input
                  type="text" placeholder="Clermont-Ferrand"
                  value={devis.ville}
                  onChange={e => update('ville', e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn-devis-primary"
              onClick={() => setStep(3)}
              disabled={!devis.description.trim() || !devis.codePostal || !devis.ville}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 3 : AUTH WALL ── */}
        {step === 3 && !isAuthenticated && (
          <div className="devis-step">
            <button className="devis-back" onClick={() => setStep(2)}>← Retour</button>
            <h2>Plus qu'une étape !</h2>
            <p className="devis-subtitle">Connectez-vous pour envoyer votre demande de devis</p>

            <form className="devis-auth-form" onSubmit={handleLogin}>
              {authError && <div className="form-error-banner">{authError}</div>}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email" placeholder="jean.dupont@email.fr"
                  value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  autoComplete="email" required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <div className="devis-pwd-wrap">
                  <input
                    type={showAuthPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    autoComplete="current-password" required
                  />
                  <button type="button" className="devis-toggle-pwd" onClick={() => setShowAuthPwd(v => !v)}>
                    {showAuthPwd ? 'Cacher' : 'Voir'}
                  </button>
                </div>
              </div>
              <Link to="/mot-de-passe-oublie" className="devis-forgot">Mot de passe oublié ?</Link>
              <button type="submit" className="btn-devis-primary" disabled={authLoading}>
                {authLoading ? 'Connexion...' : 'Se connecter et envoyer →'}
              </button>
            </form>

            <div className="devis-divider"><span>ou</span></div>

            <button
              type="button"
              className="btn-google-devis"
              onClick={() => googleLogin()}
              disabled={authLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="devis-divider"><span>pas encore de compte ?</span></div>

            <Link to="/inscription-client" className="btn-devis-secondary">
              Créer un compte gratuitement →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemandeDevis;
