import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { demandesAPI, authAPI } from '../services/api';
import './DemandeDevis.css';

const SERVICES = [
  { id: 'renovation',    label: 'Travaux',                          desc: 'Rénovation, extension, isolation, ravalement...' },
  { id: 'irve',          label: 'Borne IRVE',                       desc: 'Installation borne de recharge électrique...' },
  { id: 'aide-personne', label: 'Aide à la personne',               desc: 'Adaptation PMR, douches plain-pied, petits travaux...' },
  { id: 'courtage',      label: 'Assistance à maîtrise d\'ouvrage', desc: 'Pilotage, coordination et suivi de vos chantiers...' },
];

function DemandeDevis() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';

  const [step, setStep] = useState(preselectedService ? 2 : 1);
  const topRef = useRef<HTMLDivElement>(null);
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
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  const { isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const DOMAINE_MAP: Record<string, string> = {
    'renovation':    'renovation',
    'irve':          'irve',
    'aide-personne': 'service_personne',
    'courtage':      'courtage',
  };

  const submitDemande = async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const me = await authAPI.me();
      const clientId = me?.profil?.id;
      if (!clientId) throw new Error('Profil client introuvable. Reconnectez-vous.');

      let description = devis.description;
      if (devis.surface) description += `\nSurface : ${devis.surface}`;
      if (devis.budget)  description += `\nBudget estimé : ${devis.budget}`;

      await demandesAPI.create({
        clientId,
        description,
        adresseIntervention:    devis.ville,
        codePostalIntervention: devis.codePostal,
        villeIntervention:      devis.ville,
        domaine:                DOMAINE_MAP[devis.service] ?? devis.service,
      });
      setSuccess(true);
    } catch (err: any) {
      submitted.current = false;
      setAuthError(err.message || 'Erreur lors de l\'envoi de votre demande. Réessayez.');
    } finally {
      setSubmitting(false);
      setAuthLoading(false);
    }
  };


  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [step]);

  useEffect(() => {
    if (step === 3 && isAuthenticated) submitDemande();
  }, [step, isAuthenticated]);

  const update = (field, value) => setDevis(d => ({ ...d, [field]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(authEmail, authPassword);
      await submitDemande();
    } catch (err) {
      setAuthError(err.message || 'Email ou mot de passe incorrect.');
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
      <div ref={topRef} />
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

        {/* ── ÉTAPE 3 : ENVOI EN COURS (déjà connecté) ── */}
        {step === 3 && isAuthenticated && !success && (
          <div className="devis-step" style={{ textAlign: 'center', padding: '48px 24px' }}>
            {submitting ? (
              <>
                <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#4A7A5C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#6B7280', fontSize: 15 }}>Envoi de votre demande…</p>
              </>
            ) : authError ? (
              <>
                <p style={{ color: '#DC2626', marginBottom: 16 }}>{authError}</p>
                <button className="btn-devis-primary" onClick={() => { submitted.current = false; setAuthError(''); submitDemande(); }}>
                  Réessayer
                </button>
              </>
            ) : null}
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

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setAuthError('');
                  setAuthLoading(true);
                  try {
                    await loginWithGoogle(credentialResponse.credential!);
                    await submitDemande();
                  } catch (err: any) {
                    setAuthError(err.message || 'Connexion Google échouée. Réessayez.');
                    setAuthLoading(false);
                  }
                }}
                onError={() => setAuthError('Connexion Google annulée.')}
                text="continue_with"
                locale="fr"
              />
            </div>

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
