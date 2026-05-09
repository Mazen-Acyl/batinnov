import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './InscriptionClient.css';

function InscriptionClient() {
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    motDePasse: '', confirmMotDePasse: '',
    adresse: '', codePostal: '', ville: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(tokenResponse.access_token);
      navigate('/dashboard-client');
    } catch {
      setError('Inscription Google échouée. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({ onSuccess: handleGoogleSuccess, onError: () => setError('Connexion Google annulée.') });

  const isValid = form.prenom && form.nom && form.email &&
    form.adresse && form.codePostal && form.ville &&
    form.motDePasse.length >= 8 &&
    form.motDePasse === form.confirmMotDePasse;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      await authAPI.registerClient({
        prenom: form.prenom, nom: form.nom,
        email: form.email, telephone: form.telephone,
        motDePasse: form.motDePasse,
        adresse: form.adresse, codePostal: form.codePostal, ville: form.ville
      });
      navigate('/dashboard-client');
    } catch (err) {
      setError(err.message || 'Erreur. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-page">
      <div className="inscription-wrapper">
        <Link to="/" className="inscription-logo">BATINNOV</Link>
        <h1>Créer un compte</h1>
        <p className="inscription-subtitle">Rejoignez BATINNOV et accédez à nos artisans qualifiés</p>

        <button className="btn-google-inscription" onClick={() => googleLogin()} type="button" disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="inscription-divider"><span>ou remplissez le formulaire</span></div>

        <form onSubmit={handleSubmit} className="inscription-form">
          <div className="form-section">
            <h3>Vos informations</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label>Prénom *</label>
                <input type="text" placeholder="Jean" value={form.prenom} onChange={e => update('prenom', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" placeholder="Dupont" value={form.nom} onChange={e => update('nom', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" placeholder="jean.dupont@email.fr" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input type="tel" placeholder="06 12 34 56 78" value={form.telephone} onChange={e => update('telephone', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <h3>Votre adresse</h3>
            <div className="form-group">
              <label>Adresse *</label>
              <input type="text" placeholder="12 rue des Lilas" value={form.adresse} onChange={e => update('adresse', e.target.value)} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Code postal *</label>
                <input type="text" placeholder="63000" value={form.codePostal} onChange={e => update('codePostal', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Ville *</label>
                <input type="text" placeholder="Clermont-Ferrand" value={form.ville} onChange={e => update('ville', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Sécurité</h3>
            <div className="form-group">
              <label>Mot de passe * <span className="label-hint">min. 8 caractères</span></label>
              <div className="password-field">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.motDePasse} onChange={e => update('motDePasse', e.target.value)} required />
                <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Cacher' : 'Voir'}
                </button>
              </div>
              {form.motDePasse.length > 0 && form.motDePasse.length < 8 && <span className="field-error">Minimum 8 caractères</span>}
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe *</label>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.confirmMotDePasse} onChange={e => update('confirmMotDePasse', e.target.value)} required />
              {form.confirmMotDePasse && form.motDePasse !== form.confirmMotDePasse && <span className="field-error">Les mots de passe ne correspondent pas</span>}
              {form.confirmMotDePasse && form.motDePasse === form.confirmMotDePasse && form.motDePasse.length >= 8 && <span className="field-success">✓ Parfait !</span>}
            </div>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          <button type="submit" className="btn-inscription" disabled={!isValid || loading}>
            {loading ? 'Création...' : 'Créer mon compte →'}
          </button>

          <p className="rgpd-text">En créant un compte, vous acceptez nos <Link to="/cgv">CGV</Link>.</p>
        </form>

        <p className="inscription-footer">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}

export default InscriptionClient;