import { Link } from 'react-router-dom';
import './NavbarPro.css';

function NavbarPro() {
  return (
    <nav className="navbar navbar-pro">
      <div className="container">
        <div className="navbar-content">
          {/* LOGO PRO avec switch vers client */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">BATINNOV</span>
            <span className="logo-pro-badge">PRO</span>
          </Link>

          {/* MENU PRO */}
          <div className="navbar-pro-links">
            <a href="#avantages" className="navbar-link">Avantages</a>
            <a href="#comment-ca-marche" className="navbar-link">Comment ça marche</a>
            <a href="#temoignages" className="navbar-link">Témoignages</a>
          </div>

          {/* ACTIONS */}
          <div className="navbar-actions">
            <Link to="/connexion-pro" className="navbar-link">
              Connexion pro
            </Link>
            <a href="#inscription" className="btn btn-pro">
              S'inscrire gratuitement
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavbarPro;