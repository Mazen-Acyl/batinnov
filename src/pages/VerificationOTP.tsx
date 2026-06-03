import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

function VerificationOTP() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email: string = location.state?.email || '';

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) { setError('Entrez le code à 6 chiffres.'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyEmail(fullCode, email);
      navigate('/dashboard-client');
    } catch (err: any) {
      setError(err.message || 'Code invalide. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await authAPI.resendVerification(email);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 5000);
    } catch {
      setError('Impossible de renvoyer le code.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <Link to="/" className="auth-logo">BATINNOV</Link>

        <div className="auth-icon-box" style={{ background: '#F0F5F2' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A7A5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        <h1>Vérifier votre email</h1>
        <p className="auth-subtitle">
          Code à 6 chiffres envoyé à<br />
          <strong>{email || 'votre email'}</strong>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="otp-input"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <p className="auth-error">{error}</p>}
          {resendSent && <p style={{ color: '#4A7A5C', fontSize: '0.85rem', textAlign: 'center' }}>Code renvoyé !</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Vérification…' : 'Confirmer'}
          </button>
        </form>

        <button className="auth-resend" onClick={handleResend} disabled={!email}>
          Renvoyer le code
        </button>
      </div>
    </div>
  );
}

export default VerificationOTP;
