import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { prospectsAPI } from '../services/api';
import './FormulaireIntelligent.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://batinnov-api.onrender.com';

// ============================================================
// SCHÉMAS DE VALIDATION ZOD
// ============================================================

const TYPE_CLIENT = ['particulier', 'professionnel', 'copropriete'];
const SERVICES = ['irve', 'renovation', 'automation', 'courtage', 'services_personne'];

const schemaEtape1 = z.object({
  service: z.enum(SERVICES, { errorMap: () => ({ message: 'Veuillez choisir un service' }) }),
});

const schemaEtape2 = z.object({
  typeClient: z.enum(TYPE_CLIENT, { errorMap: () => ({ message: 'Veuillez préciser votre profil' }) }),
});

const schemaIRVE = z.object({
  typeLogement: z.enum(['maison', 'appartement']).optional(),
  statutOccupation: z.enum(['proprietaire', 'locataire']).optional(),
  typeInstallation: z.enum(['monophase', 'triphase', 'inconnu']),
  distanceTableau: z.number().min(0).max(100),
  marqueVehicule: z.string().min(1, 'Marque requise'),
  puissanceCharge: z.enum(['3.7', '7.4', '11', '22']),
});

const schemaRenovation = z.object({
  typeRenovation: z.enum(['totale', 'partielle', 'energetique']),
  surfaceM2: z.number().min(1, 'Surface requise').max(10000),
  urgence: z.enum(['immediat', '1_3_mois', '3_6_mois', 'plus_6_mois']),
});

const schemaCoordonnees = z.object({
  nom: z.string().min(2, 'Nom requis').trim(),
  prenom: z.string().min(2, 'Prénom requis').trim(),
  email: z.string().email('Email invalide').toLowerCase().trim(),
  telephone: z
    .string()
    .regex(/^(?:\+33|0)[1-9]\d{8}$/, 'Numéro français invalide (ex: 0612345678)'),
  adresse: z.string().min(5, 'Adresse requise'),
  codePostal: z.string().regex(/^\d{5}$/, 'Code postal à 5 chiffres'),
  ville: z.string().min(2, 'Ville requise'),
  consentementRgpd: z.literal(true, { errorMap: () => ({ message: 'Consentement requis' }) }),
});

const schemaSiret = z.object({
  siret: z.string().regex(/^\d{14}$/, 'SIRET = 14 chiffres'),
});

// ============================================================
// CALCUL DU SCORE (logique métier)
// ============================================================

function calculerScore(formData) {
  let score = 0;

  const poidsService = {
    irve: 25,
    renovation: 30,
    automation: 20,
    courtage: 15,
    services_personne: 10,
  };
  score += poidsService[formData.service] || 0;

  if (formData.typeClient === 'copropriete') score += 25;
  else if (formData.typeClient === 'professionnel') score += 20;
  else score += 10;

  if (formData.urgence === 'immediat') score += 20;
  else if (formData.urgence === '1_3_mois') score += 15;
  else if (formData.urgence === '3_6_mois') score += 8;

  if (formData.surfaceM2 > 200) score += 15;
  else if (formData.surfaceM2 > 100) score += 10;
  else if (formData.surfaceM2 > 50) score += 5;

  if (formData.statutOccupation === 'proprietaire') score += 10;

  if (formData.email && !/(gmail|yahoo|hotmail|outlook|free|orange|wanadoo|laposte)\./.test(formData.email)) {
    score += 10;
  }

  return Math.min(score, 100);
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const STORAGE_KEY = 'batinnov_form_draft';

export default function FormulaireIntelligent() {
  const [etapeIndex, setEtapeIndex] = useState(0);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [erreurs, setErreurs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [enrichissementInsee, setEnrichissementInsee] = useState(null);
  const [doublonDetecte, setDoublonDetecte] = useState(false);

  // Sauvegarde auto en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData]);

  // Enrichissement SIRET via API ouverte
  useEffect(() => {
    if (!formData.siret || formData.siret.length !== 14) {
      setEnrichissementInsee(null);
      return;
    }
    fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${formData.siret}&limite=1`)
      .then((res) => res.json())
      .then((data) => {
        const e = data.results?.[0];
        if (e) {
          setEnrichissementInsee({
            raisonSociale: e.nom_complet || e.nom_raison_sociale || '',
            codeNaf: e.activite_principale || '',
            effectif: e.tranche_effectif_salarie || '',
            adresse: e.siege?.adresse || '',
          });
        } else {
          setEnrichissementInsee(null);
        }
      })
      .catch(() => setEnrichissementInsee(null));
  }, [formData.siret]);

  // Détection de doublons sur email
  useEffect(() => {
    if (!formData.email || !z.string().email().safeParse(formData.email).success) {
      setDoublonDetecte(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/auth/verifier-doublon?email=${encodeURIComponent(formData.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setDoublonDetecte(data.data.existe);
        }
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.email]);

  // ----------------------------------------------------------
  // CONSTRUCTION DYNAMIQUE DES ÉTAPES SELON LE SERVICE
  // ----------------------------------------------------------
  const etapes = useMemo(() => {
    const base = ['service', 'typeClient'];
    if (formData.service === 'irve') base.push('irveDetails');
    if (formData.service === 'renovation') base.push('renovationDetails');
    if (formData.service === 'automation') base.push('automationDetails');
    if (formData.service === 'courtage') base.push('courtageDetails');
    if (formData.service === 'services_personne') base.push('servicesPersonneDetails');
    if (formData.typeClient === 'professionnel' || formData.typeClient === 'copropriete') {
      base.push('siret');
    }
    base.push('coordonnees', 'recapitulatif');
    return base;
  }, [formData.service, formData.typeClient]);

  const etapeCourante = etapes[etapeIndex];
  const progression = ((etapeIndex + 1) / etapes.length) * 100;

  // ----------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErreurs((prev) => ({ ...prev, [field]: undefined }));
  };

  const validerEtape = () => {
    let schema;

    switch (etapeCourante) {
      case 'service':       schema = schemaEtape1;    break;
      case 'typeClient':    schema = schemaEtape2;    break;
      case 'irveDetails':   schema = schemaIRVE;      break;
      case 'renovationDetails': schema = schemaRenovation; break;
      case 'siret':         schema = schemaSiret;     break;
      case 'coordonnees':   schema = schemaCoordonnees; break;
      default: return true;
    }

    const result = schema.safeParse(formData);
    if (!result.success) {
      const errs = {};
      result.error.errors.forEach((e) => { errs[e.path[0]] = e.message; });
      setErreurs(errs);
      return false;
    }
    return true;
  };

  const handleSuivant = () => {
    if (!validerEtape()) return;
    setEtapeIndex((i) => Math.min(i + 1, etapes.length - 1));
  };

  const handlePrecedent = () => {
    setEtapeIndex((i) => Math.max(i - 1, 0));
    setErreurs({});
  };

  const handleSubmit = async () => {
    if (!validerEtape()) return;
    setIsSubmitting(true);
    setSubmitError('');
    const score = calculerScore(formData);
    const payload = { ...formData, score };

    try {
      await prospectsAPI.create(payload);
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Une erreur est survenue. Merci de réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // ÉCRAN DE SUCCÈS
  // ----------------------------------------------------------
  if (submitted) {
    return (
      <div className="formulaire-intelligent">
        <div className="container">
          <div className="formulaire-card formulaire-succes">
            <div className="succes-icon">✓</div>
            <h2>Demande envoyée !</h2>
            <p>
              Merci <strong>{formData.prenom}</strong>, votre demande a bien été reçue.
              Un conseiller BATINNOV vous contactera sous <strong>24h ouvrées</strong>.
            </p>
            <a href="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // RENDU DES ÉTAPES
  // ----------------------------------------------------------
  return (
    <div className="formulaire-intelligent">
      <div className="container">
        <div className="formulaire-header">
          <h1>Demandez votre estimation gratuite</h1>
          <p>Quelques questions pour vous proposer une solution adaptée</p>
        </div>

        {/* Barre de progression */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progression}%` }} />
          <span className="progress-text">
            Étape {etapeIndex + 1} sur {etapes.length}
          </span>
        </div>

        <div className="formulaire-card">
          {etapeCourante === 'service' && (
            <EtapeService
              value={formData.service}
              onChange={(v) => updateField('service', v)}
              erreur={erreurs.service}
            />
          )}

          {etapeCourante === 'typeClient' && (
            <EtapeTypeClient
              value={formData.typeClient}
              onChange={(v) => updateField('typeClient', v)}
              erreur={erreurs.typeClient}
            />
          )}

          {etapeCourante === 'irveDetails' && (
            <EtapeIRVE formData={formData} updateField={updateField} erreurs={erreurs} />
          )}

          {etapeCourante === 'renovationDetails' && (
            <EtapeRenovation formData={formData} updateField={updateField} erreurs={erreurs} />
          )}

          {etapeCourante === 'automationDetails' && (
            <EtapeAutomation formData={formData} updateField={updateField} erreurs={erreurs} />
          )}

          {etapeCourante === 'courtageDetails' && (
            <EtapeCourtage formData={formData} updateField={updateField} erreurs={erreurs} />
          )}

          {etapeCourante === 'servicesPersonneDetails' && (
            <EtapeServicesPersonne formData={formData} updateField={updateField} erreurs={erreurs} />
          )}

          {etapeCourante === 'siret' && (
            <EtapeSiret
              formData={formData}
              updateField={updateField}
              erreurs={erreurs}
              enrichissement={enrichissementInsee}
            />
          )}

          {etapeCourante === 'coordonnees' && (
            <EtapeCoordonnees
              formData={formData}
              updateField={updateField}
              erreurs={erreurs}
              doublon={doublonDetecte}
            />
          )}

          {etapeCourante === 'recapitulatif' && (
            <EtapeRecapitulatif formData={formData} />
          )}

          {submitError && <p className="erreur" style={{ marginTop: '1rem' }}>{submitError}</p>}

          {/* Navigation */}
          <div className="form-actions">
            {etapeIndex > 0 && (
              <button type="button" className="btn btn-outline" onClick={handlePrecedent}>
                ← Précédent
              </button>
            )}
            {etapeCourante !== 'recapitulatif' ? (
              <button type="button" className="btn btn-primary" onClick={handleSuivant}>
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SOUS-COMPOSANTS PAR ÉTAPE
// ============================================================

function EtapeService({ value, onChange, erreur }) {
  const services = [
    { id: 'irve',             titre: 'Borne IRVE',             desc: 'Installation borne de recharge voiture électrique', icon: '⚡' },
    { id: 'renovation',       titre: 'Rénovation',             desc: 'Travaux de rénovation intérieure/extérieure',        icon: '🏠' },
    { id: 'automation',       titre: 'Domotique',              desc: 'Automatisation et objets connectés',                 icon: '📡' },
    { id: 'courtage',         titre: 'Courtage travaux',       desc: 'Accompagnement et mise en relation',                 icon: '📋' },
    { id: 'services_personne', titre: 'Services à la personne', desc: 'Aide à domicile, ménage, jardinage',               icon: '🤝' },
  ];

  return (
    <>
      <h2 className="etape-titre">Quel service vous intéresse ?</h2>
      <div className="choix-grid">
        {services.map((s) => (
          <label
            key={s.id}
            className={`choix-card ${value === s.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="service"
              value={s.id}
              checked={value === s.id}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="choix-icon">{s.icon}</span>
            <span className="choix-titre">{s.titre}</span>
            <span className="choix-desc">{s.desc}</span>
          </label>
        ))}
      </div>
      {erreur && <p className="erreur">{erreur}</p>}
    </>
  );
}

function EtapeTypeClient({ value, onChange, erreur }) {
  const types = [
    { id: 'particulier',  titre: 'Particulier',  icon: '👤' },
    { id: 'professionnel', titre: 'Professionnel', icon: '🏢' },
    { id: 'copropriete',  titre: 'Copropriété',  icon: '🏘️' },
  ];
  return (
    <>
      <h2 className="etape-titre">Vous êtes ?</h2>
      <div className="choix-grid choix-grid-3">
        {types.map((t) => (
          <label
            key={t.id}
            className={`choix-card ${value === t.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="typeClient"
              value={t.id}
              checked={value === t.id}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="choix-icon">{t.icon}</span>
            <span className="choix-titre">{t.titre}</span>
          </label>
        ))}
      </div>
      {erreur && <p className="erreur">{erreur}</p>}
    </>
  );
}

function EtapeIRVE({ formData, updateField, erreurs }) {
  return (
    <>
      <h2 className="etape-titre">Votre installation IRVE</h2>

      {formData.typeClient === 'particulier' && (
        <>
          <div className="form-group">
            <label>Type de logement</label>
            <div className="radio-row">
              <label><input type="radio" name="typeLogement" value="maison" checked={formData.typeLogement === 'maison'} onChange={(e) => updateField('typeLogement', e.target.value)} /> Maison</label>
              <label><input type="radio" name="typeLogement" value="appartement" checked={formData.typeLogement === 'appartement'} onChange={(e) => updateField('typeLogement', e.target.value)} /> Appartement</label>
            </div>
          </div>

          <div className="form-group">
            <label>Vous êtes</label>
            <div className="radio-row">
              <label><input type="radio" name="statutOccupation" value="proprietaire" checked={formData.statutOccupation === 'proprietaire'} onChange={(e) => updateField('statutOccupation', e.target.value)} /> Propriétaire</label>
              <label><input type="radio" name="statutOccupation" value="locataire" checked={formData.statutOccupation === 'locataire'} onChange={(e) => updateField('statutOccupation', e.target.value)} /> Locataire</label>
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <label>Type d&apos;installation électrique</label>
        <select value={formData.typeInstallation || ''} onChange={(e) => updateField('typeInstallation', e.target.value)}>
          <option value="">Choisir...</option>
          <option value="monophase">Monophasé</option>
          <option value="triphase">Triphasé</option>
          <option value="inconnu">Je ne sais pas</option>
        </select>
        {erreurs.typeInstallation && <p className="erreur">{erreurs.typeInstallation}</p>}
      </div>

      <div className="form-group">
        <label>Distance entre le tableau électrique et le parking (mètres)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.distanceTableau ?? ''}
          onChange={(e) => updateField('distanceTableau', parseInt(e.target.value) || 0)}
        />
        {erreurs.distanceTableau && <p className="erreur">{erreurs.distanceTableau}</p>}
      </div>

      <div className="form-group">
        <label>Marque du véhicule</label>
        <input
          type="text"
          placeholder="ex: Tesla, Renault, Peugeot..."
          value={formData.marqueVehicule || ''}
          onChange={(e) => updateField('marqueVehicule', e.target.value)}
        />
        {erreurs.marqueVehicule && <p className="erreur">{erreurs.marqueVehicule}</p>}
      </div>

      <div className="form-group">
        <label>Puissance de charge souhaitée</label>
        <select value={formData.puissanceCharge || ''} onChange={(e) => updateField('puissanceCharge', e.target.value)}>
          <option value="">Choisir...</option>
          <option value="3.7">3,7 kW (charge lente)</option>
          <option value="7.4">7,4 kW (standard)</option>
          <option value="11">11 kW (rapide)</option>
          <option value="22">22 kW (très rapide)</option>
        </select>
        {erreurs.puissanceCharge && <p className="erreur">{erreurs.puissanceCharge}</p>}
      </div>
    </>
  );
}

function EtapeRenovation({ formData, updateField, erreurs }) {
  return (
    <>
      <h2 className="etape-titre">Votre projet de rénovation</h2>

      <div className="form-group">
        <label>Type de rénovation</label>
        <select value={formData.typeRenovation || ''} onChange={(e) => updateField('typeRenovation', e.target.value)}>
          <option value="">Choisir...</option>
          <option value="totale">Rénovation totale</option>
          <option value="partielle">Rénovation partielle (pièce ou élément)</option>
          <option value="energetique">Rénovation énergétique</option>
        </select>
        {erreurs.typeRenovation && <p className="erreur">{erreurs.typeRenovation}</p>}
      </div>

      <div className="form-group">
        <label>Surface (m²)</label>
        <input
          type="number"
          min="1"
          value={formData.surfaceM2 ?? ''}
          onChange={(e) => updateField('surfaceM2', parseInt(e.target.value) || 0)}
        />
        {erreurs.surfaceM2 && <p className="erreur">{erreurs.surfaceM2}</p>}
      </div>

      <div className="form-group">
        <label>Délai souhaité</label>
        <select value={formData.urgence || ''} onChange={(e) => updateField('urgence', e.target.value)}>
          <option value="">Choisir...</option>
          <option value="immediat">Immédiat (sous 1 mois)</option>
          <option value="1_3_mois">Dans 1 à 3 mois</option>
          <option value="3_6_mois">Dans 3 à 6 mois</option>
          <option value="plus_6_mois">Plus tard</option>
        </select>
        {erreurs.urgence && <p className="erreur">{erreurs.urgence}</p>}
      </div>
    </>
  );
}

function EtapeAutomation({ formData, updateField }) {
  return (
    <>
      <h2 className="etape-titre">Votre projet domotique</h2>
      <div className="form-group">
        <label>Que souhaitez-vous automatiser ?</label>
        <textarea
          rows={4}
          placeholder="Éclairage, volets, chauffage, sécurité..."
          value={formData.descriptionAutomation || ''}
          onChange={(e) => updateField('descriptionAutomation', e.target.value)}
        />
      </div>
    </>
  );
}

function EtapeCourtage({ formData, updateField }) {
  return (
    <>
      <h2 className="etape-titre">Votre projet de courtage</h2>
      <div className="form-group">
        <label>Décrivez votre besoin</label>
        <textarea
          rows={4}
          value={formData.descriptionCourtage || ''}
          onChange={(e) => updateField('descriptionCourtage', e.target.value)}
        />
      </div>
    </>
  );
}

function EtapeServicesPersonne({ formData, updateField }) {
  const types = ['Ménage', 'Jardinage', "Garde d'enfants", 'Aide aux personnes âgées', 'Autre'];
  return (
    <>
      <h2 className="etape-titre">Quel type de service ?</h2>
      <div className="form-group">
        <label>Service souhaité</label>
        <select value={formData.typeServicePersonne || ''} onChange={(e) => updateField('typeServicePersonne', e.target.value)}>
          <option value="">Choisir...</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </>
  );
}

function EtapeSiret({ formData, updateField, erreurs, enrichissement }) {
  return (
    <>
      <h2 className="etape-titre">Informations de votre structure</h2>
      <div className="form-group">
        <label>SIRET (14 chiffres)</label>
        <input
          type="text"
          maxLength="14"
          value={formData.siret || ''}
          onChange={(e) => updateField('siret', e.target.value.replace(/\D/g, ''))}
          placeholder="12345678901234"
        />
        {erreurs.siret && <p className="erreur">{erreurs.siret}</p>}
      </div>

      {enrichissement && (
        <div className="enrichissement-card">
          <p className="enrichissement-titre">✓ Entreprise trouvée</p>
          <p><strong>{enrichissement.raisonSociale}</strong></p>
          {enrichissement.codeNaf && <p>{enrichissement.codeNaf}{enrichissement.effectif ? ` — ${enrichissement.effectif}` : ''}</p>}
          {enrichissement.adresse && <p>{enrichissement.adresse}</p>}
        </div>
      )}
    </>
  );
}

function EtapeCoordonnees({ formData, updateField, erreurs, doublon }) {
  return (
    <>
      <h2 className="etape-titre">Vos coordonnées</h2>
      {doublon && (
        <div className="alerte-doublon">
          ⚠️ Un compte existe déjà avec cet email.{' '}
          <a href="/connexion">Se connecter</a> pour suivre votre demande.
        </div>
      )}
      <div className="grid-2">
        <div className="form-group">
          <label>Prénom *</label>
          <input type="text" value={formData.prenom || ''} onChange={(e) => updateField('prenom', e.target.value)} />
          {erreurs.prenom && <p className="erreur">{erreurs.prenom}</p>}
        </div>
        <div className="form-group">
          <label>Nom *</label>
          <input type="text" value={formData.nom || ''} onChange={(e) => updateField('nom', e.target.value)} />
          {erreurs.nom && <p className="erreur">{erreurs.nom}</p>}
        </div>
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input type="email" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} />
        {erreurs.email && <p className="erreur">{erreurs.email}</p>}
      </div>

      <div className="form-group">
        <label>Téléphone *</label>
        <input type="tel" placeholder="0612345678" value={formData.telephone || ''} onChange={(e) => updateField('telephone', e.target.value)} />
        {erreurs.telephone && <p className="erreur">{erreurs.telephone}</p>}
      </div>

      <div className="form-group">
        <label>Adresse d&apos;intervention *</label>
        <input type="text" value={formData.adresse || ''} onChange={(e) => updateField('adresse', e.target.value)} />
        {erreurs.adresse && <p className="erreur">{erreurs.adresse}</p>}
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Code postal *</label>
          <input type="text" maxLength="5" value={formData.codePostal || ''} onChange={(e) => updateField('codePostal', e.target.value)} />
          {erreurs.codePostal && <p className="erreur">{erreurs.codePostal}</p>}
        </div>
        <div className="form-group">
          <label>Ville *</label>
          <input type="text" value={formData.ville || ''} onChange={(e) => updateField('ville', e.target.value)} />
          {erreurs.ville && <p className="erreur">{erreurs.ville}</p>}
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.consentementRgpd || false}
            onChange={(e) => updateField('consentementRgpd', e.target.checked)}
          />
          <span>J&apos;accepte que BATINNOV traite mes données personnelles pour le traitement de ma demande, conformément à la politique de confidentialité.</span>
        </label>
        {erreurs.consentementRgpd && <p className="erreur">{erreurs.consentementRgpd}</p>}
      </div>
    </>
  );
}

function EtapeRecapitulatif({ formData }) {
  const serviceLabels = {
    irve: 'Borne IRVE',
    renovation: 'Rénovation',
    automation: 'Domotique',
    courtage: 'Courtage travaux',
    services_personne: 'Services à la personne',
  };
  return (
    <>
      <h2 className="etape-titre">Récapitulatif</h2>
      <div className="recap-card">
        <p><strong>Service :</strong> {serviceLabels[formData.service]}</p>
        <p><strong>Profil :</strong> {formData.typeClient}</p>
        <p><strong>Contact :</strong> {formData.prenom} {formData.nom}</p>
        <p><strong>Email :</strong> {formData.email}</p>
        <p><strong>Téléphone :</strong> {formData.telephone}</p>
        <p><strong>Adresse :</strong> {formData.adresse}, {formData.codePostal} {formData.ville}</p>
      </div>
      <p className="recap-info">
        En validant, vous serez recontacté(e) sous 24h ouvrées par un conseiller BATINNOV.
      </p>
    </>
  );
}
