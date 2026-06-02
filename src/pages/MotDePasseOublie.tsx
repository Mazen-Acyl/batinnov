import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <Link to="/" className="auth-logo">BATINNOV</Link>

        {!sent ? (
          <>
            <div className="auth-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A7A5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1>Mot de passe oublié ?</h1>
            <p className="auth-subtitle">Entrez votre email — nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>EMAIL</label>
                <div className="auth-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="auth-btn">
                Envoyer le lien
              </button>
            </form>

            <Link to="/connexion" className="auth-back">← Retour à la connexion</Link>
          </>
        ) : (
          <div className="auth-success">
            <div className="success-icon">✓</div>
            <h2>Email envoyé !</h2>
            <p>Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail.</p>
            <Link to="/connexion" className="auth-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24 }}>
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MotDePasseOublie;