import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ServiceDetail.css';

const SERVICES = {
  renovation: {
    titre: 'Rénovation',
    image: '/images/renovation.jpg',
    description: 'Confiez vos travaux de rénovation à nos artisans qualifiés et certifiés.',
    sousServices: [
      'Rénovation complète',
      'Rénovation cuisine',
      'Rénovation salle de bain',
      'Ravalement façade',
      'Extension maison',
      'Isolation thermique',
      'Peinture intérieure',
      'Autre'
    ],
    questions: [
      { id: 'surface', label: 'Surface concernée (m²)', type: 'number', placeholder: 'Ex : 25' },
      { id: 'type_logement', label: 'Type de logement', type: 'select', options: ['Appartement', 'Maison', 'Local commercial'] },
      { id: 'etat_actuel', label: 'État actuel', type: 'select', options: ['Bon état général', 'Quelques dégradations', 'Mauvais état', 'Très dégradé'] },
    ]
  },
  courtage: {
    titre: 'Courtage',
    image: '/images/amenagement.jpg',
    description: 'Trouvez le meilleur financement pour vos travaux grâce à nos experts en courtage.',
    sousServices: [
      'Prêt travaux',
      'Rachat de crédit',
      'Financement immobilier',
      'Prêt à taux zéro (PTZ)',
      'Simulation de prêt gratuite',
      'Regroupement de crédits',
      'Autre'
    ],
    questions: [
      { id: 'montant', label: 'Montant souhaité (€)', type: 'number', placeholder: 'Ex : 15000' },
      { id: 'situation', label: 'Situation professionnelle', type: 'select', options: ['Salarié CDI', 'Salarié CDD', 'Indépendant / Auto-entrepreneur', 'Retraité', 'Autre'] },
      { id: 'propriete', label: 'Vous êtes', type: 'select', options: ['Propriétaire', 'Locataire', 'En cours d\'achat'] },
    ]
  },
  'services-maison': {
    titre: 'Aide à la personne',
    image: '/images/pmr.jpg',
    description: 'Des professionnels qualifiés pour l\'entretien et les petits travaux de votre maison.',
    sousServices: [
      'Petite peinture intérieure',
      'Jardinage & tonte de pelouse',
      'Nettoyage de façade / terrasse',
      'Petits travaux de plomberie',
      'Entretien chaudière',
      'Nettoyage de gouttières',
      'Montage de meubles',
      'Autre'
    ],
    questions: [
      { id: 'frequence', label: 'Fréquence souhaitée', type: 'select', options: ['Une seule fois', 'Régulièrement (par semaine)', 'Régulièrement (par mois)', 'Selon besoin'] },
      { id: 'type_logement', label: 'Type de logement', type: 'select', options: ['Appartement', 'Maison avec jardin', 'Maison sans jardin', 'Local commercial'] },
      { id: 'surface', label: 'Surface approximative (m²)', type: 'number', placeholder: 'Ex : 80' },
    ]
  },
  irve: {
    titre: 'Borne IRVE',
    image: '/images/irve.jpg',
    description: 'Installation de bornes de recharge pour véhicule électrique par des experts certifiés IRVE.',
    sousServices: [
      'Wallbox 7kW (maison individuelle)',
      'Wallbox 11kW',
      'Wallbox 22kW',
      'Borne collective (copropriété)',
      'Audit préalable',
      'Autre'
    ],
    questions: [
      { id: 'vehicule', label: 'Votre véhicule électrique', type: 'text', placeholder: 'Ex : Renault Zoé, Tesla Model 3...' },
      { id: 'type_logement', label: 'Type de logement', type: 'select', options: ['Maison individuelle', 'Appartement avec garage', 'Copropriété', 'Local professionnel'] },
      { id: 'tableau', label: 'Tableau électrique', type: 'select', options: ['Récent (moins de 10 ans)', 'Ancien (plus de 10 ans)', 'Je ne sais pas'] },
    ]
  }
};

const BUDGETS = [
  'Moins de 1 000 €',
  'Entre 1 000 € et 5 000 €',
  'Entre 5 000 € et 15 000 €',
  'Entre 15 000 € et 30 000 €',
  'Plus de 30 000 €',
  'Je ne sais pas encore'
];

const DELAIS = [
  'Le plus tôt possible',
  'Dans le mois',
  'Dans les 3 mois',
  'Dans les 6 mois',
  'Pas de délai précis'
];

function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = SERVICES[serviceId];

  const [step, setStep] = useState(1);
  const TOTAL = 3;

  const [form, setForm] = useState({
    sousService: '',
    description: '',
    budget: '',
    delai: '',
    answers: {}
  });

  if (!service) {
    return (
      <div className="service-not-found">
        <h2>Service introuvable</h2>
        <Link to="/">← Retour à l'accueil</Link>
      </div>
    );
  }

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updateAnswer = (id, value) => setForm(f => ({ ...f, answers: { ...f.answers, [id]: value } }));

  const canNext = () => {
    if (step === 1) return form.sousService !== '';
    if (step === 2) return form.description.length >= 20 && form.budget && form.delai;
    return true;
  };

  const handleFinaliser = () => {
    // Sauvegarde des données du formulaire dans sessionStorage
    sessionStorage.setItem('demandeService', JSON.stringify({
      service: service.titre,
      ...form
    }));
    // Redirection vers connexion avec message
    navigate('/connexion?redirect=demande');
  };

  return (
    <div className="service-detail-page">

      {/* HEADER AVEC IMAGE */}
      <div className="service-detail-hero">
        <img src={service.image} alt={service.titre} />
        <div className="service-detail-overlay">
          <div className="container">
            <Link to="/" className="btn-retour-hero">← Retour</Link>
            <h1>{service.titre}</h1>
            <p>{service.description}</p>
          </div>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="service-detail-body">
        <div className="container">
          <div className="service-form-wrapper">

            {/* STEPPER */}
            <div className="stepper">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} className={`stepper-item ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}>
                  <div className="step-dot">
                    {i + 1 < step
                      ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      : <span>{i + 1}</span>
                    }
                  </div>
                  <span className="step-name">
                    {i === 0 && 'Votre projet'}
                    {i === 1 && 'Détails'}
                    {i === 2 && 'Finaliser'}
                  </span>
                </div>
              ))}
              <div className="stepper-line">
                <div className="stepper-progress" style={{ width: `${((step - 1) / (TOTAL - 1)) * 100}%` }} />
              </div>
            </div>

            {/* ===== ÉTAPE 1 : CHOIX SOUS-SERVICE ===== */}
            {step === 1 && (
              <div className="form-step">
                <h2>Quel type de travaux ?</h2>
                <p className="step-desc">Sélectionnez votre besoin principal</p>

                <div className="sous-service-grid">
                  {service.sousServices.map(s => (
                    <button
                      key={s}
                      className={`sous-service-btn ${form.sousService === s ? 'selected' : ''}`}
                      onClick={() => update('sousService', s)}
                    >
                      {form.sousService === s && (
                        <svg className="check-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="9" r="9" fill="var(--primary, #4A7A5C)"/>
                          <path d="M5 9L7.5 11.5L13 6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                      {s}
                    </button>
                  ))}
                </div>

                {/* QUESTIONS SPÉCIFIQUES AU SERVICE */}
                {form.sousService && (
                  <div className="questions-bloc">
                    <h3>Quelques précisions</h3>
                    {service.questions.map(q => (
                      <div className="form-group" key={q.id}>
                        <label>{q.label}</label>
                        {q.type === 'select' ? (
                          <select
                            value={form.answers[q.id] || ''}
                            onChange={e => updateAnswer(q.id, e.target.value)}
                          >
                            <option value="">Choisir...</option>
                            {q.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={q.type}
                            placeholder={q.placeholder}
                            value={form.answers[q.id] || ''}
                            onChange={e => updateAnswer(q.id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== ÉTAPE 2 : DESCRIPTION + BUDGET + DÉLAI ===== */}
            {step === 2 && (
              <div className="form-step">
                <h2>Décrivez votre projet</h2>
                <p className="step-desc">Plus vous êtes précis, meilleurs seront les devis reçus</p>

                <div className="form-group">
                  <label>Description détaillée *</label>
                  <textarea
                    rows={6}
                    placeholder={`Décrivez votre projet de ${service.titre.toLowerCase()} en détail : état actuel, attentes, contraintes particulières...`}
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                  />
                  <div className="char-hint">
                    <span className={form.description.length >= 20 ? 'ok' : ''}>
                      {form.description.length >= 20 ? '✓ Description suffisante' : `Minimum 20 caractères (${form.description.length}/20)`}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Budget estimé *</label>
                  <div className="options-grid">
                    {BUDGETS.map(b => (
                      <button
                        key={b}
                        type="button"
                        className={`option-btn ${form.budget === b ? 'selected' : ''}`}
                        onClick={() => update('budget', b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Délai souhaité *</label>
                  <div className="options-grid options-grid-5">
                    {DELAIS.map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`option-btn ${form.delai === d ? 'selected' : ''}`}
                        onClick={() => update('delai', d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== ÉTAPE 3 : RÉCAP + CONNEXION ===== */}
            {step === 3 && (
              <div className="form-step">
                <h2>Récapitulatif de votre demande</h2>
                <p className="step-desc">Vérifiez vos informations avant de vous connecter pour envoyer votre demande</p>

                <div className="recap-card">
                  <div className="recap-row">
                    <span>Service</span>
                    <strong>{service.titre}</strong>
                  </div>
                  <div className="recap-row">
                    <span>Type de travaux</span>
                    <strong>{form.sousService}</strong>
                  </div>
                  {Object.entries(form.answers).map(([k, v]) => v && (
                    <div className="recap-row" key={k}>
                      <span>{service.questions.find(q => q.id === k)?.label}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                  <div className="recap-row">
                    <span>Budget</span>
                    <strong>{form.budget}</strong>
                  </div>
                  <div className="recap-row">
                    <span>Délai</span>
                    <strong>{form.delai}</strong>
                  </div>
                  <div className="recap-desc">
                    <span>Description</span>
                    <p>{form.description}</p>
                  </div>
                </div>

                {/* CTA CONNEXION */}
                <div className="connexion-cta-box">
                  <div className="connexion-cta-icon">🔐</div>
                  <h3>Connectez-vous pour envoyer votre demande</h3>
                  <p>
                    Créez un compte gratuit ou connectez-vous pour recevoir
                    les devis de nos artisans qualifiés sous 48h.
                  </p>
                  <div className="connexion-cta-btns">
                    <button onClick={handleFinaliser} className="btn-finaliser">
                      Se connecter et envoyer →
                    </button>
                    <Link to="/inscription-client" className="btn-creer-compte">
                      Créer un compte gratuit
                    </Link>
                  </div>
                  <p className="cta-reassurance">
                    Gratuit · Sans engagement · Réponse sous 48h
                  </p>
                </div>
              </div>
            )}

            {/* NAVIGATION */}
            <div className="step-nav">
              {step > 1 && (
                <button className="btn-prev" onClick={() => setStep(s => s - 1)}>
                  ← Retour
                </button>
              )}
              {step < TOTAL && (
                <button
                  className="btn-next"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                >
                  Continuer →
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;