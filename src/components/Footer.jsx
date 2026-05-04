import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">

      {/* PARTIE 1 : LIENS - fond blanc comme Wecasa */}
      <div className="footer-links-section">
        <div className="container">

          {/* LOGO + description EN HAUT à gauche - seul sur sa ligne */}
          <div className="footer-brand-row">
            <div className="footer-brand-col">
              <Link to="/" className="footer-logo">BATINNOV</Link>
            </div>
          </div>

          {/* 4 COLONNES DE LIENS */}
          <div className="footer-links-grid">

            <div className="footer-nav-col">
              <h4>À propos</h4>
              <ul>
                <li><Link to="#">Plateforme responsable</Link></li>
                <li><Link to="#">Avis sur BATINNOV</Link></li>
                <li><Link to="#">Nos réalisations</Link></li>
                <li><Link to="#">Le Mag' BATINNOV</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>Pour les pros</h4>
              <ul>
                <li><Link to="/pro">Devenir pro BATINNOV</Link></li>
                <li><Link to="/pro">Devenir artisan rénovation</Link></li>
                <li><Link to="/pro">Devenir artisan aménagement</Link></li>
                <li><Link to="/pro">Devenir installateur IRVE</Link></li>
                <li><Link to="/pro">Devenir prestataire PMR</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>Contact</h4>
              <ul>
                <li><Link to="#">FAQ / Centre d'aide</Link></li>
                <li><Link to="#">Nous contacter</Link></li>
                <li>
                  <Link to="#" className="footer-recrute">
                    Nous rejoindre
                    <span className="badge-recrute">on recrute !</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>Besoin d'aide ?</h4>
              <ul>
                <li><Link to="#">FAQ / Centre d'aide</Link></li>
                <li><Link to="#">Démarrer un chat</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="footer-separator" />

      {/* PARTIE 2 : APPS + RÉSEAUX - STYLE WECASA */}
      <div className="footer-apps-section">
        <div className="container">
          <div className="footer-apps-row">
            <div className="footer-apps-left">
              <p>Échangez avec vos artisans et réservez facilement :</p>
              <div className="footer-app-btns">
                <a href="#" className="app-btn-img">
                  <img src="/images/payment/appstore.png" alt="Télécharger sur l'App Store" />
                </a>
                <a href="#" className="app-btn-img">
                  <img src="/images/payment/googleplay.png" alt="Disponible sur Google Play" />
                </a>
              </div>
            </div>
            <div className="footer-social">
              <p>Suivez-nous</p>
              <div className="social-links">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-separator" />

      {/* PARTIE 3 : PAIEMENTS AVEC VRAIES IMAGES */}
      <div className="footer-payment-section">
        <div className="container">
          <div className="footer-payment-row">
            <p><strong>Moyens de paiement acceptés</strong></p>
            <div className="payment-icons">
              <img src="/images/payment/visa.png" alt="Visa" className="pay-icon" />
              <img src="/images/payment/cb.png" alt="CB" className="pay-icon" />
              <img src="/images/payment/maestro.png" alt="Maestro" className="pay-icon" />
              <img src="/images/payment/mastercard.png" alt="Mastercard" className="pay-icon" />
              <img src="/images/payment/amex.png" alt="American Express" className="pay-icon" />
              <img src="/images/payment/applepay.png" alt="Apple Pay" className="pay-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-separator" />

      {/* PARTIE 4 : LÉGAL */}
      <div className="footer-legal-section">
        <div className="container">
          <div className="footer-legal-row">
            <div className="footer-legal-links">
              <Link to="#">Mentions légales</Link>
              <Link to="#">CGU BATINNOV</Link>
              <Link to="#">Politique de confidentialité</Link>
              <Link to="#">Info. des consommateurs</Link>
              <Link to="#">Cookies</Link>
            </div>
            <div className="footer-country">🇫🇷 France</div>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;