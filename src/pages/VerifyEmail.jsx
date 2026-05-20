import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './VerifyEmail.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide ou manquant.');
      return;
    }

    authAPI.verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Une erreur est survenue lors de la vérification.');
      });
  }, [searchParams]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        {status === 'loading' && (
          <>
            <div className="verify-email-spinner" />
            <p>Vérification en cours…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-email-icon verify-email-icon--success">✓</div>
            <h1>Adresse e-mail vérifiée !</h1>
            <p>Votre compte a bien été confirmé. Vous pouvez maintenant vous connecter.</p>
            <Link to="/connexion" className="verify-email-btn">Se connecter</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-email-icon verify-email-icon--error">✕</div>
            <h1>Vérification échouée</h1>
            <p>{message}</p>
            <Link to="/" className="verify-email-btn verify-email-btn--secondary">Retour à l&apos;accueil</Link>
          </>
        )}
      </div>
    </div>
  );
}
