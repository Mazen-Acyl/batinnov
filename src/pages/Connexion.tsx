import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import './Connexion.css';

function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const getRedirectPath = (role: string) => {
    if (redirectPath === 'demande') return '/dashboard-client';
    if (role === 'prestataire') return '/dashboard-pro';
    if (role === 'admin') return '/dashboard-admin';
    return '/dashboard-client';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, motDePasse);
      navigate(getRedirectPath(user.role));
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        navigate('/verification', { state: { email: err.email || email } });
        return;
      }
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connexion-page">
      <div className="connexion-wrapper">
        <Link to="/" className="connexion-logo">BATINNOV</Link>

        <h1>Connexion</h1>
        <p className="connexion-subtitle">Accédez à votre espace personnel</p>

        <form className="connexion-form" onSubmit={handleSubmit}>
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Mot de passe</label>
              <Link to="/mot-de-passe-oublie" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
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

          <button type="submit" className="btn-connexion" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="connexion-divider"><span>ou</span></div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setError('');
              try {
                const user = await loginWithGoogle(credentialResponse.credential!);
                navigate(getRedirectPath(user?.role ?? 'client'));
              } catch (err: any) {
                setError(err.message || 'Connexion Google échouée. Réessayez.');
              }
            }}
            onError={() => setError('Connexion Google annulée.')}
            text="continue_with"
            locale="fr"
          />
        </div>

        <p className="connexion-footer">
          Pas encore de compte ?{' '}
          <Link to="/inscription-client">Créer un compte</Link>
        </p>

        <p className="connexion-footer" style={{ marginTop: 8 }}>
          Vous êtes artisan ?{' '}
          <Link to="/pro">Rejoindre le réseau →</Link>
        </p>
      </div>
    </div>
  );
}

export default Connexion;
