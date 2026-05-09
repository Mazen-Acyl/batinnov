import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'prestataire' ? '/dashboard-pro' : '/dashboard-client';

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const services = [
    {
      id: 'renovation',
      name: 'Rénovation',
      description: 'Cuisine, salle de bain, extension, ravalement',
      details: ['Rénovation cuisine', 'Rénovation salle de bain', 'Extension maison', 'Ravalement façade']
    },
    {
      id: 'courtage',
      name: 'Courtage',
      description: 'Financement, prêt travaux, rachat de crédit',
      details: ['Prêt travaux', 'Rachat de crédit', 'Prêt à taux zéro (PTZ)', 'Simulation gratuite']
    },
    {
      id: 'services-maison',
      name: 'Aide à la personne',
      description: 'Petits travaux, jardinage, adaptation PMR',
      details: ['Petite peinture', 'Jardinage', 'Douche plain-pied PMR', 'Barres d\'appui']
    },
    {
      id: 'irve',
      name: 'Borne IRVE',
      description: 'Installation bornes de recharge électrique',
      details: ['Wallbox 7kW', 'Wallbox 11kW', 'Wallbox 22kW', 'Crédit d\'impôt 500€']
    }
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            BATINNOV
          </Link>

          <div className="navbar-services">
            {services.map((service) => (
              <div
                key={service.id}
                className="navbar-service-item"
                onMouseEnter={() => setActiveDropdown(service.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link to={`/services/${service.id}`} className="navbar-service-btn">
                  {service.name}
                </Link>

                {activeDropdown === service.id && (
                  <div className="service-dropdown">
                    <div className="dropdown-header">
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                    </div>
                    <ul className="dropdown-list">
                      {service.details.map((detail, index) => (
                        <li key={index}>
                          <Link to={`/services/${service.id}`} onClick={() => setActiveDropdown(null)}>
                            {detail}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/services/${service.id}`} className="dropdown-cta">
                      Demander un devis →
                    </Link>
                    <div className="dropdown-footer">
                      <span>Vous êtes artisan ?</span>
                      <Link to="/pro">Devenir prestataire →</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <div
                className="navbar-user-menu"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button className="navbar-user-btn">
                  <span className="navbar-user-avatar">
                    {user?.prenom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="navbar-user-name">
                    {user?.prenom || 'Mon compte'}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link to={dashboardPath} className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Mon tableau de bord
                    </Link>
                    <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/connexion" className="navbar-link">
                  Connexion
                </Link>
                <Link to="/pro" className="btn-devenir-pro">
                  Devenir pro
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;