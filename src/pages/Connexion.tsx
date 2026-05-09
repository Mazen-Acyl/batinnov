import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import './Connexion.css';

function Connexion() {
  const [type, setType] = useState('particulier');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(tokenResponse.access_token);
      navigate(user.role === 'prestataire' ? '/dashboard-pro' : '/dashboard-client');
    } catch {
      setError('Connexion Google échouée. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({ onSuccess: handleGoogleSuccess, onError: () => setError('Connexion Google annulée.') });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, motDePasse);
      // Redirection selon le rôle
      if (user.role === 'prestataire') {
        navigate('/dashboard-pro');
      } else {
        navigate('/dashboard-client');
      }
    } catch (err) {
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

        {/* CHOIX TYPE */}
        <div className="type-selector">
          <button
            className={`type-btn ${type === 'particulier' ? 'active' : ''}`}
            onClick={() => setType('particulier')}
            type="button"
          >
            <span className="type-icon">🏠</span>
            <span className="type-label">Particulier</span>
            <span className="type-desc">Je cherche un artisan</span>
          </button>
          <button
            className={`type-btn ${type === 'prestataire' ? 'active pro' : ''}`}
            onClick={() => setType('prestataire')}
            type="button"
          >
            <span className="type-icon">🔨</span>
            <span className="type-label">Prestataire</span>
            <span className="type-desc">Je suis un artisan</span>
          </button>
        </div>

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

          <button
            type="submit"
            className={`btn-connexion ${type === 'prestataire' ? 'pro' : ''}`}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="connexion-divider"><span>ou</span></div>

        <button className="btn-google" onClick={() => googleLogin()} type="button" disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <p className="connexion-footer">
          Pas encore de compte ?{' '}
          {type === 'prestataire'
            ? <Link to="/pro">Rejoindre le réseau →</Link>
            : <Link to="/inscription-client">Créer un compte</Link>
          }
        </p>
      </div>
    </div>
  );
}

export default Connexion;