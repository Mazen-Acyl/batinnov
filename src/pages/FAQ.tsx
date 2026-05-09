import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const CATEGORIES = [
  { id: 'tout', label: 'Tout' },
  { id: 'irve', label: 'IRVE' },
  { id: 'travaux', label: 'Travaux' },
  { id: 'courtage', label: 'Courtage' },
  { id: 'aide', label: 'Aide' }
];

const FAQS = [
  {
    id: 1,
    categorie: 'irve',
    question: 'Comment fonctionne la signature électronique ?',
    reponse: 'Nos signatures sont conformes au règlement eIDAS. Un certificat horodaté est généré pour chaque document, et un accusé est envoyé par email. La valeur juridique est équivalente à une signature manuscrite.'
  },
  {
    id: 2,
    categorie: 'travaux',
    question: 'Quels sont les délais de remboursement ?',
    reponse: 'Les remboursements sont effectués sous 5 à 10 jours ouvrés après validation du chantier. Le virement est effectué directement sur votre compte bancaire enregistré.'
  },
  {
    id: 3,
    categorie: 'aide',
    question: 'Comment annuler un rendez-vous ?',
    reponse: 'Vous pouvez annuler un rendez-vous jusqu\'à 24h avant depuis votre espace client, onglet "Agenda". Au-delà, des frais d\'annulation peuvent s\'appliquer selon les conditions de l\'artisan.'
  },
  {
    id: 4,
    categorie: 'tout',
    question: 'Mes données sont-elles sécurisées ?',
    reponse: 'Oui, toutes vos données sont chiffrées et stockées en France conformément au RGPD. Nous ne partageons jamais vos informations personnelles avec des tiers sans votre consentement.'
  },
  {
    id: 5,
    categorie: 'travaux',
    question: 'Puis-je changer de prestataire en cours de chantier ?',
    reponse: 'Oui, dans certaines conditions. Contactez notre support via le chat pour analyser votre situation. Un changement de prestataire peut entraîner des délais supplémentaires.'
  },
  {
    id: 6,
    categorie: 'aide',
    question: 'Comment fonctionne le système d\'avis ?',
    reponse: 'Après chaque prestation terminée, vous recevez une invitation à laisser un avis. Les avis sont vérifiés et ne peuvent être laissés que par des clients ayant effectivement utilisé le service.'
  },
  {
    id: 7,
    categorie: 'irve',
    question: 'Quelles aides financières pour une borne IRVE ?',
    reponse: 'Vous pouvez bénéficier du crédit d\'impôt CITE (500€), de MaPrimeRénov\', et de l\'aide ADVENIR selon votre situation. Nos conseillers calculent automatiquement vos droits lors du devis.'
  },
  {
    id: 8,
    categorie: 'courtage',
    question: 'Combien coûte le service de courtage ?',
    reponse: 'Le service de courtage est entièrement gratuit pour les particuliers. Nous sommes rémunérés par les organismes financiers partenaires, sans frais supplémentaires pour vous.'
  }
];

function FAQ() {
  const [activeCategory, setActiveCategory] = useState('tout');
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter(faq => {
    const matchCategory = activeCategory === 'tout' || faq.categorie === activeCategory;
    const matchSearch = faq.question.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="faq-page">
      <div className="container">

        {/* HEADER */}
        <div className="faq-header">
          <h1>Centre d'aide</h1>
          <p>Trouvez rapidement une réponse à vos questions</p>

          {/* RECHERCHE */}
          <div className="faq-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher une réponse..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="faq-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`faq-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* GRILLE SERVICE + FAQ */}
        <div className="faq-layout">

          {/* FAQ ACCORDÉON */}
          <div className="faq-list">
            <h2>{filtered.length} réponse{filtered.length > 1 ? 's' : ''}</h2>
            {filtered.map(faq => (
              <div
                key={faq.id}
                className={`faq-item ${openFaq === faq.id ? 'open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <svg
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: openFaq === faq.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.reponse}</p>
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="faq-empty">
                <p>Aucun résultat pour "{search}"</p>
                <button className="faq-contact-btn" onClick={() => {}}>
                  Contacter le support →
                </button>
              </div>
            )}
          </div>

          {/* CONTACT SUPPORT */}
          <div className="faq-contact-panel">
            <h3>Pas trouvé votre réponse ?</h3>
            <p>Notre équipe est disponible pour vous aider</p>

            <div className="contact-options">
              <div className="contact-option active">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div>
                  <strong>Chat</strong>
                  <span>Réponse en 5 min</span>
                </div>
              </div>
              <div className="contact-option">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <div>
                  <strong>Email</strong>
                  <span>Sous 2h</span>
                </div>
              </div>
              <div className="contact-option">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.27 6.27l1.18-1.18a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div>
                  <strong>Téléphone</strong>
                  <span>9h - 18h</span>
                </div>
              </div>
            </div>

            <Link to="/contact" className="btn-contact-support">
              Contacter le support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FAQ;