import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function VerificationOTP() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode === '123456' || fullCode.length === 6) {
      navigate('/dashboard-client');
    } else {
      setError('Code invalide. Réessayez.');
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
          Code à 6 chiffres envoyé à<br /><strong>votre email</strong>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputs.current[index] = el}
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

          <button type="submit" className="auth-btn">Confirmer</button>
        </form>

        <button
          className="auth-resend"
          onClick={() => setCode(['', '', '', '', '', ''])}
        >
          Renvoyer le code
        </button>

        <p className="auth-demo-hint">
          Mode démo : entrez <strong>123456</strong> pour valider.
        </p>
      </div>
    </div>
  );
}

export default VerificationOTP;