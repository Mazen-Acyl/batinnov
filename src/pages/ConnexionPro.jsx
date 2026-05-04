        import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Connexion.css';

function ConnexionPro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    console.log('Connexion pro :', { email, password });
  };

  return (
    <div className="connexion-page" style={{ background: '#FFF5F2' }}>
      <div className="connexion-wrapper">

        {/* LOGO PRO */}
        <Link to="/" className="connexion-logo pro">
          BATINNOV
          <sup style={{
            fontSize: '14px',
            fontWeight: 700,
            background: '#E87D50',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '6px',
            verticalAlign: 'super',
            fontStyle: 'normal',
            letterSpacing: 0
          }}>PRO</sup>
        </Link>

        <h1>Espace pro</h1>
        <p className="connexion-subtitle">
          Connectez-vous pour accéder à votre tableau de bord
        </p>

        <form className="connexion-form" onSubmit={handleSubmit}>

          {error && (
            <div className="form-error-banner">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="email-pro">Adresse email professionnelle</label>
            <input
              id="email-pro"
              type="email"
              placeholder="contact@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-pro">
              Mot de passe
              <Link to="/mot-de-passe-oublie-pro" className="forgot-link" style={{ color: '#E87D50' }}>
                Mot de passe oublié ?
              </Link>
            </label>
            <div className="password-input-wrapper">
              <input
                id="password-pro"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ '--focus-color': '#E87D50' }}
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

          <button type="submit" className="btn-connexion pro">
            Se connecter
          </button>
        </form>

        <p className="connexion-footer">
          Pas encore inscrit ?{' '}
          <Link to="/pro" style={{ color: '#E87D50' }}>Rejoindre le réseau →</Link>
        </p>

        <div className="connexion-pro-link">
          <Link to="/connexion" style={{ color: '#4A7A5C' }}>
            ← Vous êtes un client ?
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ConnexionPro;
