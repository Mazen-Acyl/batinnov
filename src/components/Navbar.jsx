import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const services = [
    {
      id: 'renovation',
      name: 'Rénovation',
      description: 'Cuisine, salle de bain, extension, ravalement',
      details: ['Rénovation cuisine', 'Rénovation salle de bain', 'Extension maison', 'Ravalement façade']
    },
    {
      id: 'amenagement',
      name: 'Aménagement',
      description: 'Placards, dressings, mezzanines sur-mesure',
      details: ['Placards sur-mesure', 'Dressing', 'Bibliothèque', 'Mezzanine']
    },
    {
      id: 'pmr',
      name: 'Aide à la personne',
      description: 'Adaptation PMR, douches plain-pied',
      details: ['Douche plain-pied PMR', 'Barres d\'appui', 'Rampe d\'accès', 'Élargissement portes']
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
                <button className="navbar-service-btn">
                  {service.name}
                </button>

                {activeDropdown === service.id && (
                  <div className="service-dropdown">
                    <div className="dropdown-header">
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                    </div>
                    <ul className="dropdown-list">
                      {service.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                    <Link to="/inscription-client" className="dropdown-cta">
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
            <Link to="/connexion" className="navbar-link">
              Connexion
            </Link>
            <Link to="/pro" className="btn-devenir-pro">
              Devenir pro
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;