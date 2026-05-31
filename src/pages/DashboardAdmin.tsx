import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI, clientsAPI, prestatairesAPI, devisAPI, prestationsAPI, demandesAPI, paiementsAPI, rendezVousAPI, prospectsAPI, normalizeDate, normalizeMontant, batchFetchById } from '../services/api';
import './DashboardAdmin.css';

/* ── Icônes SVG ── */
const Icon = {
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  Euro: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Sparkle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  File: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
  ),
};

/* ── Devis admin ── */
type QuoteStatusAdmin = 'draft' | 'sent' | 'waiting_client_response' | 'accepted_by_client' | 'quote_rejected_by_client' | 'admin_approved' | 'expired';

interface QuoteLine { id: number; label: string; quantity: number; unitPrice: number; tvaRate: number; }

interface AdminQuote {
  id: number; ref: string; title: string; client: string; provider: string;
  serviceType: string; createdAt: string; validUntil: string;
  status: QuoteStatusAdmin; items: QuoteLine[];
  rejectionReason?: string; notes?: string;
}

const QUOTE_STATUS_ADMIN: Record<QuoteStatusAdmin, { label: string; color: string; bg: string }> = {
  draft:                    { label: 'Brouillon',       color: '#6B7280', bg: '#F3F4F6' },
  sent:                     { label: 'Envoyé',          color: '#1D4ED8', bg: '#EFF6FF' },
  waiting_client_response:  { label: 'Attente client',  color: '#D97706', bg: '#FFFBEB' },
  accepted_by_client:       { label: 'Accepté client',  color: '#059669', bg: '#ECFDF5' },
  quote_rejected_by_client: { label: 'Refusé client',   color: '#DC2626', bg: '#FEF2F2' },
  admin_approved:           { label: 'Acté Admin ✓',    color: '#10B981', bg: '#D1FAE5' },
  expired:                  { label: 'Expiré',          color: '#9CA3AF', bg: '#F3F4F6' },
};

const QUOTE_FILTERS_ADMIN = [
  { value: 'all',                     label: 'Tous' },
  { value: 'waiting_client_response', label: 'En attente' },
  { value: 'accepted_by_client',      label: 'Acceptés' },
  { value: 'quote_rejected_by_client',label: 'Refusés' },
  { value: 'sent',                    label: 'Envoyés' },
  { value: 'draft',                   label: 'Brouillons' },
];

const DEFAULT_QUOTE_LINES: QuoteLine[] = [
  { id: 1, label: 'Étude technique et préparation', quantity: 1, unitPrice: 450,  tvaRate: 20 },
  { id: 2, label: 'Intervention principale',         quantity: 1, unitPrice: 1850, tvaRate: 20 },
  { id: 3, label: 'Contrôle qualité et remise',      quantity: 1, unitPrice: 280,  tvaRate: 20 },
];

const initQuotes: AdminQuote[] = [];

/* ── Données statiques ── */
const initUtilisateurs: any[] = [];

const activiteRecente = [
  { id: 1, texte: 'Nouveau client inscrit : Paul Martin', temps: 'il y a 8 min', color: '#10B981' },
  { id: 2, texte: 'Dossier reçu : Vidal Rénov (Issoire)', temps: 'il y a 42 min', color: '#E87D50' },
  { id: 3, texte: 'Paiement reçu : F2026-0341 · 1 428 €', temps: 'il y a 2h', color: '#2563EB' },
  { id: 4, texte: 'RDV demandé : Marc Leroy / Jean Dupont', temps: 'il y a 3h', color: '#6366F1' },
  { id: 5, texte: 'Service démarré : Installation IRVE #P1', temps: 'il y a 5h', color: '#4A7A5C' },
];

const monthlyCA = [
  { mois: 'Jan', montant: 12400 },
  { mois: 'Fév', montant: 15200 },
  { mois: 'Mar', montant: 18600 },
  { mois: 'Avr', montant: 22100 },
  { mois: 'Mai', montant: 14300 },
];

const initialDossiers: any[] = [];

const services_UNUSED_STATIC = [
  {
    id: 1, ref: 'IRVE · #P1', titre: 'Installation borne Wallbox 7.4 kW',
    client: 'Jean Dupont', pro: 'Marc Leroy', ville: 'Clermont-Ferrand',
    address: '12 rue des Fleurs, 63000 Clermont-Fd', serviceType: 'irve',
    statut: 'en_cours', progress: 65, nextStep: 'Mise en service', nextDate: '7 mai · 14h',
    steps: [
      { label: 'Visite',    status: 'done',    date: '24 avr.' },
      { label: 'Pose',      status: 'done',    date: '30 avr.' },
      { label: 'Raccord.',  status: 'current', date: '7 mai'   },
      { label: 'Livraison', status: 'upcoming'                  },
    ],
    photos: [
      { label: 'Tableau électrique', phase: 'Avant',   date: '24 avr.', color: '#2F6F55' },
      { label: 'Passage câble',       phase: 'Pendant', date: '30 avr.', color: '#4A8266' },
      { label: 'Borne posée',         phase: 'Pendant', date: '7 mai',   color: '#4CAF7D' },
    ],
  },
  {
    id: 2, ref: 'TRAVAUX · #P2', titre: 'Rénovation salle de bain',
    client: 'Paul Martin', pro: 'Sophie Vidal', ville: 'Chamalières',
    address: '15 rue des Acacias, 63400 Chamalières', serviceType: 'travaux',
    statut: 'bloque', progress: 40, nextStep: 'Validation devis complémentaire', nextDate: '8 mai · 9h',
    steps: [
      { label: 'Devis',     status: 'done',    date: '12 avr.' },
      { label: 'Dépose',    status: 'done',    date: '20 avr.' },
      { label: 'Avenant',   status: 'current', date: '8 mai'   },
      { label: 'Finitions', status: 'upcoming'                  },
    ],
    photos: [
      { label: 'Avant SdB',       phase: 'Avant',   date: '10 avr.', color: '#B8744A' },
      { label: 'Dépose existant', phase: 'Pendant', date: '20 avr.', color: '#8D6045' },
    ],
  },
  {
    id: 3, ref: 'AIDE · #P3', titre: 'Aide à domicile hebdomadaire',
    client: 'Nadia Benali', pro: 'KB Assistance', ville: 'Riom',
    address: '4 rue Pascal, 63100 Aubière', serviceType: 'aide',
    statut: 'a_demarrer', progress: 0, nextStep: 'Premier rendez-vous', nextDate: '10 mai · 10h30',
    steps: [
      { label: 'Devis',   status: 'done',    date: '4 mai'  },
      { label: 'Créneau', status: 'current', date: '10 mai' },
      { label: 'Interv.', status: 'upcoming'                },
      { label: 'CR',      status: 'upcoming'                },
    ],
    photos: [
      { label: 'Zone intervention', phase: 'Avant', date: '4 mai', color: '#C29545' },
    ],
  },
  {
    id: 4, ref: 'TRAVAUX · #P4', titre: 'Isolation combles',
    client: 'Éric Boudon', pro: 'Morel Bâtiment', ville: 'Riom',
    address: '8 route de Mozac, 63200 Riom', serviceType: 'travaux',
    statut: 'livre', progress: 100, nextStep: '—', nextDate: '—',
    steps: [
      { label: 'Audit',     status: 'done', date: '22 avr.' },
      { label: 'Prépa.',    status: 'done', date: '2 mai'   },
      { label: 'Contrôle', status: 'done', date: '9 mai'   },
      { label: 'Livraison',status: 'done', date: '12 mai'  },
    ],
    photos: [
      { label: 'Combles avant',     phase: 'Avant',   date: '22 avr.', color: '#A6855E' },
      { label: 'Soufflage isolant', phase: 'Pendant', date: '2 mai',   color: '#7A6A55' },
      { label: 'Résultat final',    phase: 'Après',   date: '12 mai',  color: '#6B7E8B' },
    ],
  },
];

const factures: any[] = [];

const initialRdvs: any[] = [];

/* ── Leads ── */
type LeadStatus = 'new' | 'contacted' | 'to_follow_up' | 'qualified' | 'unqualified' | 'converted' | 'lost';
type LeadPriority = 'low' | 'normal' | 'high' | 'urgent';
type LeadSource = 'website' | 'referral' | 'social_media' | 'phone' | 'email' | 'partner' | 'event' | 'other';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  serviceType: string;
  city: string;
  createdAt: string;
  notes: string;
  estimatedValue?: number;
}

const LEAD_STATUS: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new:          { label: 'Nouveau',      color: '#1D4ED8', bg: '#EFF6FF' },
  contacted:    { label: 'Contacté',     color: '#7C3AED', bg: '#F5F3FF' },
  to_follow_up: { label: 'À relancer',   color: '#D97706', bg: '#FFFBEB' },
  qualified:    { label: 'Qualifié',     color: '#059669', bg: '#ECFDF5' },
  unqualified:  { label: 'Non qualifié', color: '#6B7280', bg: '#F3F4F6' },
  converted:    { label: 'Converti',     color: '#10B981', bg: '#D1FAE5' },
  lost:         { label: 'Perdu',        color: '#DC2626', bg: '#FEF2F2' },
};

const LEAD_PRIORITY: Record<LeadPriority, { label: string; color: string }> = {
  low:    { label: 'Basse',   color: '#9CA3AF' },
  normal: { label: 'Normale', color: '#6B7280' },
  high:   { label: 'Haute',   color: '#D97706' },
  urgent: { label: 'Urgent',  color: '#DC2626' },
};

const LEAD_SOURCE: Record<LeadSource, string> = {
  website:      'Site web',
  referral:     'Parrainage',
  social_media: 'Réseaux sociaux',
  phone:        'Appel entrant',
  email:        'Email',
  partner:      'Partenaire',
  event:        'Événement',
  other:        'Autre',
};

const STATUS_FILTERS_LEAD = [
  { value: 'all',         label: 'Tous' },
  { value: 'new',         label: 'Nouveaux' },
  { value: 'contacted',   label: 'Contactés' },
  { value: 'to_follow_up',label: 'À relancer' },
  { value: 'qualified',   label: 'Qualifiés' },
  { value: 'converted',   label: 'Convertis' },
  { value: 'lost',        label: 'Perdus' },
];

const PRIORITY_FILTERS_LEAD = [
  { value: 'all',    label: 'Toutes' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high',   label: 'Haute' },
  { value: 'normal', label: 'Normale' },
  { value: 'low',    label: 'Basse' },
];

const initLeads: Lead[] = [];

/* ── Demandes admin ── */
type DemandeStage = 'received' | 'admin_validation' | 'quotes_sent' | 'client_decision' | 'payment';
type ServiceTypeAdmin = 'all' | 'travaux' | 'irve' | 'aide' | 'courtage';

interface DemandeAdmin {
  id: number;
  ref: string;
  title: string;
  client: string;
  serviceType: 'travaux' | 'irve' | 'aide' | 'courtage';
  city: string;
  stage: DemandeStage;
  createdAt: string;
  amount?: number;
}

const DEMANDE_STAGES: { key: DemandeStage; label: string }[] = [
  { key: 'received',         label: 'Reçue' },
  { key: 'admin_validation', label: 'Validation admin' },
  { key: 'quotes_sent',      label: 'Devis envoyés' },
  { key: 'client_decision',  label: 'Décision client' },
  { key: 'payment',          label: 'Paiement' },
];

const DEMANDE_STAGE_COLOR: Record<DemandeStage, string> = {
  received:         '#6B7280',
  admin_validation: '#D97706',
  quotes_sent:      '#1D4ED8',
  client_decision:  '#7C3AED',
  payment:          '#059669',
};

const SERVICE_ADMIN_VISUAL: Record<string, { label: string; color: string; bg: string }> = {
  travaux:  { label: 'Travaux',  color: '#D97706', bg: '#FFFBEB' },
  irve:     { label: 'IRVE',     color: '#10B981', bg: '#ECFDF5' },
  aide:     { label: 'Aide',     color: '#6366F1', bg: '#EEF2FF' },
  courtage: { label: 'Courtage', color: '#F59E0B', bg: '#FEF3C7' },
};

const SERVICE_FILTERS_ADMIN: { value: ServiceTypeAdmin; label: string }[] = [
  { value: 'all',      label: 'Toutes' },
  { value: 'travaux',  label: 'Travaux' },
  { value: 'irve',     label: 'IRVE' },
  { value: 'aide',     label: 'Aide' },
  { value: 'courtage', label: 'Courtage' },
];

const initDemandes: DemandeAdmin[] = [];

/* ── Helpers de mapping backend → frontend ── */
function mapDomaine(d: string | undefined): 'travaux' | 'irve' | 'aide' | 'courtage' {
  if (d === 'irve') return 'irve';
  if (d === 'service_personne') return 'aide';
  if (d === 'courtage') return 'courtage';
  return 'travaux';
}
function mapDemandeStage(s: string): DemandeStage {
  const m: Record<string, DemandeStage> = {
    recue: 'received', en_qualification: 'admin_validation', validee: 'quotes_sent',
    devis_emis: 'quotes_sent', signee: 'client_decision', payee: 'payment', terminee: 'payment', annulee: 'received',
  };
  return m[s] ?? 'received';
}
function mapDevisStatus(s: string): QuoteStatusAdmin {
  if (s === 'brouillon') return 'draft';
  if (s === 'envoye') return 'sent';
  if (s === 'accepte') return 'accepted_by_client';
  if (s === 'refuse') return 'quote_rejected_by_client';
  if (s === 'expire') return 'expired';
  return 'sent';
}
function mapProspectStatus(s: string): string {
  if (s === 'nouveau') return 'new';
  if (s === 'contacte') return 'contacted';
  if (s === 'qualifie') return 'qualified';
  if (s === 'perdu') return 'lost';
  return 'new';
}

export default function DashboardAdmin() {
  const [page, setPage] = useState('accueil');
  const [userFilter, setUserFilter] = useState('tous');
  const [userSearch, setUserSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('tous');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [factureFilter, setFactureFilter] = useState('tous');
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);
  const [dossiers, setDossiers] = useState<any[]>(initialDossiers);
  const [rdvList, setRdvList] = useState<any[]>(initialRdvs);
  const [services, setServices] = useState<any[]>([]);
  const [adminFactures, setAdminFactures] = useState<any[]>(factures);
  const [utilisateurs, setUtilisateurs] = useState(initUtilisateurs);
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadPriorityFilter, setLeadPriorityFilter] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [leads, setLeads] = useState<Lead[]>(initLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [serviceFilterAdmin, setServiceFilterAdmin] = useState<ServiceTypeAdmin>('all');
  const [demandeSearch, setDemandeSearch] = useState('');
  const [demandes, setDemandes] = useState<DemandeAdmin[]>(initDemandes);
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(null);
  const [quoteFilter, setQuoteFilter] = useState('all');
  const [quotes, setQuotes] = useState<AdminQuote[]>(initQuotes);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qLines, setQLines] = useState<QuoteLine[]>(DEFAULT_QUOTE_LINES.map(l => ({ ...l })));
  const [qDelay, setQDelay] = useState('Intervention sous 3 à 4 semaines après validation.');
  const [qConditions, setQConditions] = useState('Acompte 30 % à la commande. Solde à réception.');
  const [qNotes, setQNotes] = useState("Proposition préparée par l'Admin.");
  const [qValidUntil, setQValidUntil] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [validationFilter, setValidationFilter] = useState('tous');
  const [showRdvCreate, setShowRdvCreate] = useState(false);
  const [rdvCreateTitle, setRdvCreateTitle] = useState('');
  const [rdvCreateClient, setRdvCreateClient] = useState('');
  const [rdvCreatePro, setRdvCreatePro] = useState('');
  const [rdvCreateDate, setRdvCreateDate] = useState('');
  const [rdvCreateTime, setRdvCreateTime] = useState('');
  const [rdvCreateAddr, setRdvCreateAddr] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  /* ── Dossier courant (live depuis state) ── */
  const selectedDossier = selectedDossierId ? dossiers.find(d => d.id === selectedDossierId) ?? null : null;

  /* ── Actions documents ── */
  const handleDocValider = (dossierId: number, docIndex: number) => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== dossierId) return d;
      const docs = d.docs.map((doc, i) => i === docIndex ? { ...doc, statut: 'valide' } : doc);
      return { ...d, docs };
    }));
    showNotif('Document validé');
  };

  const handleDocRejeter = (dossierId: number, docIndex: number) => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== dossierId) return d;
      const docs = d.docs.map((doc, i) => i === docIndex ? { ...doc, statut: 'rejete' } : doc);
      return { ...d, docs };
    }));
    showNotif('Document rejeté', 'error');
  };

  /* ── Actions dossier ── */
  const handleActiverPrestataire = () => {
    if (!selectedDossier) return;
    const nom = selectedDossier.nom;
    setDossiers(prev => prev.map(d => d.id === selectedDossier.id ? { ...d, statut: 'valide' } : d));
    setSelectedDossierId(null);
    showNotif(`${nom} activé avec succès ✓`);
  };

  const handleRefuserDossier = () => {
    if (!selectedDossier) return;
    const nom = selectedDossier.nom;
    setDossiers(prev => prev.map(d => d.id === selectedDossier.id ? { ...d, statut: 'refuse' } : d));
    setSelectedDossierId(null);
    showNotif(`Dossier ${nom} refusé`, 'error');
  };

  /* ── Actions utilisateurs ── */
  const handleToggleStatut = (userId: number) => {
    setUtilisateurs(prev => prev.map(u =>
      u.id === userId ? { ...u, statut: u.statut === 'actif' ? 'suspendu' : 'actif' } : u
    ));
    showNotif('Statut utilisateur mis à jour ✓');
  };

  /* ── Actions RDV ── */
  const handleRdvValider = (rdvId: number) => {
    setRdvList(prev => prev.map(r => r.id === rdvId ? { ...r, statut: 'valide', tag: 'Validé' } : r));
    showNotif('RDV validé — les deux parties ont été notifiées');
  };

  const handleRdvRefuser = (rdvId: number) => {
    setRdvList(prev => prev.filter(r => r.id !== rdvId));
    showNotif('RDV refusé', 'error');
  };

  /* ── Données dérivées ── */
  const dossiersEnAttente = dossiers.filter(d => d.statut === 'a_verifier');
  const rdvsACoord = rdvList.filter(r => r.statut === 'a_coordonner');

  const leadsNew = leads.filter(l => l.status === 'new').length;
  const leadsToFollowUp = leads.filter(l => l.status === 'to_follow_up').length;
  const leadsQualified = leads.filter(l => l.status === 'qualified').length;
  const leadsConverted = leads.filter(l => l.status === 'converted').length;

  const filteredLeads = leads.filter(l => {
    const matchStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    const matchPriority = leadPriorityFilter === 'all' || l.priority === leadPriorityFilter;
    const matchSearch = l.name.toLowerCase().includes(leadSearch.toLowerCase()) || l.email.toLowerCase().includes(leadSearch.toLowerCase()) || l.city.toLowerCase().includes(leadSearch.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const selectedLead = selectedLeadId ? leads.find(l => l.id === selectedLeadId) ?? null : null;

  const filteredDemandes = demandes.filter(d => {
    const matchService = serviceFilterAdmin === 'all' || d.serviceType === serviceFilterAdmin;
    const matchSearch = d.title.toLowerCase().includes(demandeSearch.toLowerCase()) || d.client.toLowerCase().includes(demandeSearch.toLowerCase()) || d.ref.toLowerCase().includes(demandeSearch.toLowerCase());
    return matchService && matchSearch;
  });

  const selectedDemande = selectedDemandeId ? demandes.find(d => d.id === selectedDemandeId) ?? null : null;

  const selectedQuote = selectedQuoteId ? quotes.find(q => q.id === selectedQuoteId) ?? null : null;
  const filteredQuotes = quoteFilter === 'all' ? quotes : quotes.filter(q => q.status === (quoteFilter as QuoteStatusAdmin));
  const qSubtotal = qLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const qTva = qLines.reduce((sum, l) => sum + Math.round(l.unitPrice * l.quantity * l.tvaRate / 100), 0);
  const qTotal = qSubtotal + qTva;
  const quotesNeedAction = quotes.filter(q => q.status === 'accepted_by_client').length;

  const navItems = [
    { id: 'accueil',      icon: <Icon.Home />,      label: 'Accueil' },
    { id: 'leads',        icon: <Icon.Sparkle />,   label: 'Leads', badge: leadsNew + leadsToFollowUp },
    { id: 'demandes',     icon: <Icon.File />,      label: 'Demandes', badge: demandes.filter(d => d.stage === 'admin_validation').length },
    { id: 'devis',        icon: <Icon.Sparkle />,   label: 'Devis', badge: quotesNeedAction },
    { id: 'utilisateurs', icon: <Icon.Users />,     label: 'Utilisateurs' },
    { id: 'validation',   icon: <Icon.Shield />,    label: 'Validation pros', badge: dossiersEnAttente.length },
    { id: 'services',     icon: <Icon.Briefcase />, label: 'Services', badge: services.filter(s => s.statut === 'bloque').length },
    { id: 'finance',      icon: <Icon.Euro />,      label: 'Finance' },
    { id: 'rdv',          icon: <Icon.Calendar />,  label: 'RDV', badge: rdvsACoord.length },
    { id: 'suivi',        icon: <Icon.Check />,     label: 'Suivi requêtes', badge: demandes.filter(d => d.stage === 'received').length },
  ];

  const filteredUsers = utilisateurs.filter(u => {
    const matchFilter = userFilter === 'tous' || (userFilter === 'clients' && u.role === 'client') || (userFilter === 'pros' && u.role === 'pro');
    const matchSearch = u.nom.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredServices = serviceFilter === 'tous' ? services : services.filter(s => s.statut === serviceFilter);
  const filteredFactures = factureFilter === 'tous' ? adminFactures : adminFactures.filter(f => f.statut === factureFilter);
  const filteredDossiers = validationFilter === 'tous' ? dossiers : validationFilter === 'a_verifier' ? dossiersEnAttente : dossiers.filter(d => d.statut === validationFilter);
  const selectedUser = selectedUserId ? utilisateurs.find(u => u.id === selectedUserId) ?? null : null;
  const quotesAccepteesNonActees = quotes.filter(q => q.status === 'accepted_by_client');

  const statutServiceConfig: Record<string, { label: string; color: string; bg: string }> = {
    en_cours:  { label: 'En cours',    color: '#1D4ED8', bg: '#EFF6FF' },
    bloque:    { label: 'Bloqué',      color: '#DC2626', bg: '#FEF2F2' },
    a_demarrer:{ label: 'À démarrer',  color: '#D97706', bg: '#FFFBEB' },
    livre:     { label: 'Livré',       color: '#059669', bg: '#ECFDF5' },
  };

  const selectedService = selectedServiceId ? services.find(s => s.id === selectedServiceId) ?? null : null;

  const SERVICE_TYPE_VISUAL: Record<string, { label: string; color: string; bg: string }> = {
    irve:     { label: 'IRVE',     color: '#10B981', bg: '#ECFDF5' },
    travaux:  { label: 'Travaux',  color: '#D97706', bg: '#FFFBEB' },
    aide:     { label: 'Aide',     color: '#6366F1', bg: '#EEF2FF' },
    courtage: { label: 'Courtage', color: '#F59E0B', bg: '#FEF3C7' },
  };

  const PHOTO_PHASE_COLOR: Record<string, string> = {
    Avant: '#6B7280', Pendant: '#1D4ED8', Après: '#059669',
  };

  const statutFactureConfig = {
    paye: { label: 'Payé', color: '#059669', bg: '#ECFDF5' },
    attente: { label: 'En attente', color: '#D97706', bg: '#FFFBEB' },
    retard: { label: 'Retard', color: '#DC2626', bg: '#FEF2F2' },
  };

  const navigateTo = (p: string) => {
    setPage(p);
    setSelectedDossierId(null);
    setSelectedLeadId(null);
    setSelectedDemandeId(null);
    setSelectedQuoteId(null);
    setShowCreateForm(false);
    setSelectedServiceId(null);
    setSelectedUserId(null);
    setShowRdvCreate(false);
  };

  /* ── Fetch données réelles ── */
  const fetchAdminData = useCallback(async () => {
    try {
      /* Utilisateurs : clients + prestataires — API retourne { data: [], total, ... } */
      const [clientsRaw, presRaw] = await Promise.allSettled([clientsAPI.getAll(), prestatairesAPI.getAll()]);
      // clientsAPI/prestatairesAPI.getAll() retourne data.data (tableau)
      // Clients : email est jointé directement (pas dans utilisateur imbriqué)
      // Prestataires : email est jointé directement
      const clientsList = clientsRaw.status === 'fulfilled'
        ? (Array.isArray(clientsRaw.value) ? clientsRaw.value : [])
        : [];
      const presList = presRaw.status === 'fulfilled'
        ? (Array.isArray(presRaw.value) ? presRaw.value : [])
        : [];

      // Lookup maps : id → nom (utilisés pour enrichir les autres listes)
      const clientMap = new Map<string, string>(
        clientsList.map((c: any) => [c.id, `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || c.email || '—'])
      );
      const presMap = new Map<string, string>(
        presList.map((p: any) => [p.id, p.raisonSociale ?? '—'])
      );

      const allUsers = [
        ...clientsList.map((c: any) => ({
          id:         c.id,
          nom:        `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || c.email || '—',
          email:      c.email ?? '—',
          phone:      c.telephone ?? '—',
          role:       'client',
          ville:      c.ville ?? '—',
          statut:     c.supprimeLe ? 'suspendu' : 'actif',
          cree:       normalizeDate(c.creeLe),
          depense:    '—', nbDemandes: 0,
        })),
        ...presList.map((p: any) => ({
          id:         p.id,
          nom:        p.raisonSociale ?? '—',
          email:      p.email ?? '—',
          phone:      p.telephone ?? '—',
          role:       'pro',
          ville:      p.ville ?? '—',
          statut:     p.statut === 'valide' ? 'actif' : p.statut === 'suspendu' ? 'suspendu' : 'en_attente',
          cree:       normalizeDate(p.creeLe),
          depense:    '—', nbDemandes: 0,
        })),
      ];
      setUtilisateurs(allUsers);

      /* Dossiers prestataires à valider */
      const presAValider = presList.filter((p: any) => p.statut === 'en_attente' || p.statut === 'en_verification');
      setDossiers(presAValider.map((p: any) => ({
        id:      p.id, nom: p.raisonSociale ?? '—',
        contact: `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() || '—',
        ville:   p.ville ?? '—',
        date:    normalizeDate(p.creeLe),
        statut:  p.statut === 'valide' ? 'valide' : p.statut === 'refuse' ? 'refuse' : 'a_verifier',
        docs:    [],
      })));

      /* Demandes */
      try {
        const raw = await demandesAPI.list();
        const list = Array.isArray(raw) ? raw : [];
        // Demandes liste : champs plats clientNom, clientPrenom, typePrestationLibelle
        setDemandes(list.map((d: any) => ({
          id:          d.id,
          ref:         d.id?.slice(0,8)?.toUpperCase() ?? 'DEM',
          title:       d.typePrestationLibelle ?? d.description?.slice(0,60) ?? 'Demande',
          client:      `${d.clientPrenom ?? ''} ${d.clientNom ?? ''}`.trim() || '—',
          serviceType: 'travaux' as const, // domaine non inclus dans la liste
          city:        d.villeIntervention ?? '—',
          stage:       mapDemandeStage(d.statut),
          createdAt:   normalizeDate(d.creeLe),
          amount:      undefined,
        })));
      } catch {}

      /* Devis */
      try {
        const raw = await devisAPI.getAll();
        const list = Array.isArray(raw) ? raw : [];
        // Devis liste : clientNom, clientPrenom (pas de prestataire, pas de lignes)
        // lignes uniquement sur GET /api/devis/:id (détail)
        setQuotes(list.map((q: any) => ({
          id:          q.id,
          ref:         q.numero ?? q.id?.slice(0,8)?.toUpperCase() ?? 'DEV',
          title:       q.objet ?? 'Devis',
          client:      `${q.clientPrenom ?? ''} ${q.clientNom ?? ''}`.trim() || '—',
          provider:    '—', // non inclus dans la liste
          serviceType: 'travaux' as const,
          createdAt:   normalizeDate(q.dateEmission),
          validUntil:  normalizeDate(q.dateEmission),
          status:      mapDevisStatus(q.statut),
          items:       [],
        })));
      } catch {}

      /* RDVs */
      try {
        const raw = await rendezVousAPI.list();
        const list = Array.isArray(raw) ? raw : [];
        // Rendez-vous : clientId et prestataireId résolus via lookup maps
        setRdvList(list.map((r: any) => {
          const d = r.dateDebut ? new Date(r.dateDebut) : null;
          return {
            id:      r.id,
            titre:   r.notes ?? r.type ?? 'Rendez-vous',
            client:  clientMap.get(r.clientId) ?? '—',
            pro:     presMap.get(r.prestataireId) ?? '—',
            date:    d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—',
            heure:   d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
            adresse: r.lieu ?? '—',
            tag:     r.statut === 'confirme' || r.statut === 'realise' ? 'Validé' : 'À coordonner',
            statut:  r.statut === 'confirme' || r.statut === 'realise' ? 'valide' : 'a_coordonner',
          };
        }));
      } catch {}

      /* Services / prestations */
      try {
        const raw = await prestationsAPI.getAll();
        const list = Array.isArray(raw) ? raw : [];
        // Prestations liste : prestataireId résolu via presMap (déjà chargée)
        setServices(list.map((p: any) => ({
          id:          p.id,
          ref:         `SRV · #${p.id?.slice(0,6) ?? ''}`,
          titre:       p.notesInternes ?? 'Prestation',
          client:      '—', // clientId non disponible directement
          pro:         presMap.get(p.prestataireId) ?? '—',
          ville:       p.villeIntervention ?? '—',
          address:     `${p.adresseIntervention ?? ''}, ${p.codePostalIntervention ?? ''} ${p.villeIntervention ?? ''}`.trim(),
          serviceType: 'travaux' as const,
          statut:      p.statut === 'terminee' ? 'livre' : p.statut === 'en_cours' ? 'en_cours' : p.statut === 'annulee' ? 'bloque' : 'a_demarrer',
          progress:    p.statut === 'terminee' ? 100 : p.statut === 'en_cours' ? 50 : 0,
          nextStep:    '—',
          nextDate:    normalizeDate(p.datePrevue),
          steps:       [], photos: [],
        })));
      } catch {}

      /* Factures / paiements admin */
      try {
        const raw = await paiementsAPI.getAll();
        const list = Array.isArray(raw) ? raw : [];
        // Paiements : montant est une string décimale, pas de client imbriqué
        setAdminFactures(list.map((p: any) => ({
          id:      p.id,
          ref:     p.reference ?? `F${p.id?.slice(0,8) ?? ''}`,
          montant: normalizeMontant(Number(p.montant ?? 0)),
          client:  '—',
          pro:     '—',
          statut:  p.statut === 'paye' ? 'paye' : p.statut === 'echoue' ? 'retard' : 'attente',
          date:    normalizeDate(p.datePaiement ?? p.creeLe),
        })));
      } catch {}

      /* Leads / prospects */
      try {
        const raw = await prospectsAPI.getAll();
        const list = Array.isArray(raw) ? raw : [];
        // Prospects : nom, prenom, email, telephone, statut, messageInitial, source
        setLeads(list.map((p: any) => ({
          id:             p.id,
          name:           `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() || '—',
          email:          p.email ?? '—',
          phone:          p.telephone ?? '—',
          source:         (p.source as LeadSource) ?? 'other',
          status:         mapProspectStatus(p.statut) as LeadStatus,
          priority:       'normal' as LeadPriority,
          serviceType:    '—',
          city:           '—',
          createdAt:      normalizeDate(p.creeLe),
          notes:          p.messageInitial ?? p.notes ?? '',
          estimatedValue: 0,
        })));
      } catch {}

    } catch (err: any) {
      console.error('[DashboardAdmin] fetchData:', err.message);
    }
  }, []);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  return (
    <div className="admin-layout">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="admin-logo-name">BATINNOV</span>
          <span className="admin-logo-tag">ADMIN</span>
        </div>
        <div className="admin-sidebar-tag">Pôle administration</div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <span className="admin-nav-icon"><Icon.LogOut /></span>
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">

        {/* Notification toast */}
        {notif && (
          <div className={`admin-notif ${notif.type}`}>
            <span>{notif.msg}</span>
            <button onClick={() => setNotif(null)}>×</button>
          </div>
        )}

        {/* ══ ACCUEIL ══ */}
        {page === 'accueil' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Vue d'ensemble</p>
                <h1>Tableau de bord</h1>
              </div>
              {dossiersEnAttente.length > 0 && (
                <span className="admin-alert-badge">{dossiersEnAttente.length} validation{dossiersEnAttente.length > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pilotage global</p>
              <h2>Contrôlez l'activité Batinnov en temps réel.</h2>
              <div className="admin-hero-stats">
                <div><strong>186 420 €</strong><span>CA total</span></div>
                <div><strong>+12 %</strong><span>Ce mois</span></div>
              </div>
            </div>

            {/* Leads widget */}
            <div className="admin-leads-widget" onClick={() => navigateTo('leads')}>
              <div className="admin-leads-widget-head">
                <span className="admin-leads-widget-title"><Icon.Sparkle /> Leads & Prospects</span>
                <span className="admin-leads-widget-link">Voir tout →</span>
              </div>
              <div className="admin-leads-kpi-row">
                <div className="admin-leads-kpi">
                  <span className="admin-leads-kpi-num" style={{ color: '#1D4ED8' }}>{leadsNew}</span>
                  <span>Nouveaux</span>
                </div>
                <div className="admin-leads-kpi">
                  <span className="admin-leads-kpi-num" style={{ color: '#D97706' }}>{leadsToFollowUp}</span>
                  <span>À relancer</span>
                </div>
                <div className="admin-leads-kpi">
                  <span className="admin-leads-kpi-num" style={{ color: '#059669' }}>{leadsQualified}</span>
                  <span>Qualifiés</span>
                </div>
                <div className="admin-leads-kpi">
                  <span className="admin-leads-kpi-num" style={{ color: '#10B981' }}>{leadsConverted}</span>
                  <span>Convertis</span>
                </div>
              </div>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('services')}>
                <span className="admin-kpi-num">37</span><span>Services en cours</span>
              </div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('validation')}>
                <span className="admin-kpi-num">{dossiersEnAttente.length}</span><span>Dossiers en attente</span>
              </div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('demandes')}>
                <span className="admin-kpi-num">{demandes.filter(d => d.stage === 'admin_validation').length}</span><span>Demandes à traiter</span>
              </div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('rdv')}>
                <span className="admin-kpi-num">{rdvsACoord.length}</span><span>RDV à coordonner</span>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h3>Priorité admin</h3>
                <button className="admin-link" onClick={() => navigateTo('validation')}>Tout voir →</button>
              </div>
              {dossiersEnAttente.slice(0, 2).map(d => (
                <div key={d.id} className="admin-priority-row" onClick={() => { setPage('validation'); setSelectedDossierId(d.id); }}>
                  <div className="admin-priority-tag">Validation prestataire</div>
                  <div className="admin-priority-info">
                    <strong>{d.nom}</strong>
                    <span>{d.contact} · {d.ville}</span>
                  </div>
                  <span className="admin-priority-arrow">→</span>
                </div>
              ))}
              {dossiersEnAttente.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '12px 0' }}>Aucune validation en attente</p>
              )}
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h3>Activité récente</h3>
              </div>
              <div className="admin-activity-feed">
                {activiteRecente.map(a => (
                  <div key={a.id} className="admin-activity-row">
                    <span className="admin-activity-dot" style={{ background: a.color }} />
                    <span className="admin-activity-text">{a.texte}</span>
                    <span className="admin-activity-time">{a.temps}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <h3>Modules actifs</h3>
              <div className="admin-modules-grid">
                {navItems.filter(n => n.id !== 'accueil').map(item => (
                  <button key={item.id} className="admin-module-btn" onClick={() => navigateTo(item.id)}>
                    <span className="admin-module-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge > 0 && <span className="admin-module-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ UTILISATEURS — liste ══ */}
        {page === 'utilisateurs' && !selectedUser && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Annuaire</p>
                <h1>Utilisateurs</h1>
              </div>
              <span className="admin-alert-badge">{utilisateurs.length} comptes</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Gestion des accès</p>
              <h2>Clients et prestataires au même endroit.</h2>
              <div className="admin-hero-stats">
                <div><strong>{utilisateurs.filter(u => u.role === 'client').length}</strong><span>Clients</span></div>
                <div><strong>{utilisateurs.filter(u => u.role === 'pro').length}</strong><span>Prestataires</span></div>
                <div><strong>{utilisateurs.filter(u => u.statut === 'actif').length}</strong><span>Actifs</span></div>
              </div>
            </div>

            <div className="admin-filter-row">
              {[['tous','Tous'],['clients','Clients'],['pros','Pros']].map(([val, lbl]) => (
                <button key={val} className={`admin-filter-btn ${userFilter === val ? 'active' : ''}`} onClick={() => setUserFilter(val)}>{lbl}</button>
              ))}
              <button className="admin-filter-btn-right" onClick={() => navigateTo('validation')}>Validations →</button>
            </div>

            <div className="admin-search-bar">
              <span><Icon.Search /></span>
              <input placeholder="Rechercher un nom, email, ville..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>

            <div className="admin-list-label">
              <span>{filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="admin-user-list">
              {filteredUsers.map(u => (
                <div key={u.id} className="admin-user-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedUserId(u.id)}>
                  <div className="admin-user-avatar">{u.nom[0]}</div>
                  <div className="admin-user-info">
                    <strong>{u.nom}</strong>
                    <span>{u.email}</span>
                  </div>
                  <div className="admin-user-meta">
                    <span>{u.ville}</span>
                    <span className="admin-user-depense">{u.depense}</span>
                  </div>
                  <span className={`admin-role-badge ${u.role}`}>{u.role === 'client' ? 'Client' : 'Pro'}</span>
                  <span className={`admin-statut-dot ${u.statut}`} />
                  <span className="admin-priority-arrow">→</span>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun utilisateur trouvé</p>
              )}
            </div>
          </div>
        )}

        {/* ══ UTILISATEURS — profil ══ */}
        {page === 'utilisateurs' && selectedUser && (
          <div className="admin-page">
            <button className="admin-back" onClick={() => setSelectedUserId(null)}>← Retour</button>
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">{selectedUser.role === 'client' ? 'Fiche client' : 'Fiche prestataire'}</p>
                <h1>{selectedUser.nom}</h1>
              </div>
              <span className={`admin-statut-pill`} style={{
                color: selectedUser.statut === 'actif' ? '#059669' : selectedUser.statut === 'suspendu' ? '#DC2626' : '#D97706',
                background: selectedUser.statut === 'actif' ? '#ECFDF5' : selectedUser.statut === 'suspendu' ? '#FEF2F2' : '#FFFBEB',
                fontSize: 13, padding: '4px 12px', borderRadius: 20,
              }}>
                {selectedUser.statut === 'actif' ? 'Actif' : selectedUser.statut === 'suspendu' ? 'Suspendu' : 'En attente'}
              </span>
            </div>

            <div className="admin-user-profile-head">
              <div className="admin-user-profile-avatar">{selectedUser.nom[0]}</div>
              <div className="admin-user-profile-meta">
                <strong>{selectedUser.nom}</strong>
                <span>{selectedUser.ville}</span>
                <span className={`admin-role-badge ${selectedUser.role}`}>{selectedUser.role === 'client' ? 'Client' : 'Pro'}</span>
              </div>
              <div className="admin-user-profile-stats">
                <div><strong>{selectedUser.depense}</strong><span>Dépenses</span></div>
                <div><strong>{selectedUser.nbDemandes}</strong><span>Demandes</span></div>
              </div>
            </div>

            <div className="admin-lead-detail-card" style={{ marginTop: 16 }}>
              <div className="admin-lead-detail-row"><span>Email</span><strong>{selectedUser.email}</strong></div>
              <div className="admin-lead-detail-row"><span>Téléphone</span><strong>{selectedUser.phone}</strong></div>
              <div className="admin-lead-detail-row"><span>Ville</span><strong>{selectedUser.ville}</strong></div>
              <div className="admin-lead-detail-row"><span>Rôle</span><strong>{selectedUser.role === 'client' ? 'Client' : 'Prestataire'}</strong></div>
              <div className="admin-lead-detail-row"><span>Inscrit le</span><strong>{selectedUser.cree}</strong></div>
              <div className="admin-lead-detail-row"><span>Dépenses totales</span><strong>{selectedUser.depense}</strong></div>
            </div>

            <div className="admin-section" style={{ marginTop: 16 }}>
              <h3>Actions rapides</h3>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <button className="admin-doc-btn open" onClick={() => showNotif(`Message envoyé à ${selectedUser.nom}`)}>
                  Envoyer un message
                </button>
                {selectedUser.role === 'client' && (
                  <button className="admin-doc-btn open" onClick={() => { navigateTo('demandes'); }}>
                    Voir ses demandes
                  </button>
                )}
                {selectedUser.role === 'pro' && (
                  <button className="admin-doc-btn open" onClick={() => navigateTo('validation')}>
                    Voir son dossier
                  </button>
                )}
              </div>
            </div>

            <div className="admin-final-actions" style={{ marginTop: 24 }}>
              <button
                className={selectedUser.statut === 'actif' ? 'admin-btn-reject-all' : 'admin-btn-validate-all'}
                onClick={() => { handleToggleStatut(selectedUser.id); setSelectedUserId(null); }}
              >
                {selectedUser.statut === 'actif' ? 'Suspendre le compte' : 'Réactiver le compte'}
              </button>
            </div>
          </div>
        )}

        {/* ══ VALIDATION PROS — liste ══ */}
        {page === 'validation' && !selectedDossier && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Conformité</p>
                <h1>Validation pros</h1>
              </div>
              {dossiersEnAttente.length > 0 && (
                <span className="admin-alert-badge orange">{dossiersEnAttente.length} en attente</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Conformité prestataire</p>
              <h2>Validez les dossiers avant activation.</h2>
              <div className="admin-hero-stats">
                <div><strong>{dossiersEnAttente.length}</strong><span>À traiter</span></div>
                <div><strong>{dossiers.filter(d => d.statut === 'valide').length}</strong><span>Validés</span></div>
                <div><strong>{dossiers.filter(d => d.statut === 'refuse').length}</strong><span>Refusés</span></div>
              </div>
            </div>

            <div className="admin-filter-row" style={{ marginBottom: 4 }}>
              {[
                { val: 'tous',      lbl: `Tous (${dossiers.length})` },
                { val: 'a_verifier',lbl: `En attente (${dossiersEnAttente.length})` },
                { val: 'valide',    lbl: `Validés (${dossiers.filter(d => d.statut === 'valide').length})` },
                { val: 'refuse',    lbl: `Refusés (${dossiers.filter(d => d.statut === 'refuse').length})` },
              ].map(f => (
                <button key={f.val} className={`admin-filter-btn ${validationFilter === f.val ? 'active' : ''}`} onClick={() => setValidationFilter(f.val)}>
                  {f.lbl}
                </button>
              ))}
            </div>

            <div className="admin-section-head" style={{ marginBottom: 12 }}>
              <h3>Dossiers ({filteredDossiers.length})</h3>
              <button className="admin-link" onClick={() => navigateTo('services')}>Services →</button>
            </div>

            <div className="admin-dossier-list">
              {filteredDossiers.map(d => {
                const docsValides = d.docs.filter(doc => doc.statut === 'valide').length;
                const docsTotal = d.docs.length;
                const statutCfg = d.statut === 'valide'
                  ? { label: 'Validé', color: '#059669', bg: '#ECFDF5' }
                  : d.statut === 'refuse'
                  ? { label: 'Refusé', color: '#DC2626', bg: '#FEF2F2' }
                  : { label: 'À vérifier', color: '#D97706', bg: '#FFFBEB' };
                return (
                  <div key={d.id} className="admin-dossier-row admin-dossier-row-rich" onClick={() => d.statut === 'a_verifier' ? setSelectedDossierId(d.id) : undefined} style={{ cursor: d.statut === 'a_verifier' ? 'pointer' : 'default' }}>
                    <div className="admin-dossier-avatar">{d.nom[0]}</div>
                    <div className="admin-dossier-info" style={{ flex: 1 }}>
                      <strong>{d.nom}</strong>
                      <span>{d.ville} · {d.date}</span>
                      <div className="admin-dossier-docs-bar">
                        <div className="admin-dossier-docs-fill" style={{ width: `${Math.round(docsValides / docsTotal * 100)}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{docsValides}/{docsTotal} pièces validées</span>
                    </div>
                    <span className="admin-statut-pill" style={{ color: statutCfg.color, background: statutCfg.bg, fontSize: 11 }}>
                      {statutCfg.label}
                    </span>
                    {d.statut === 'a_verifier' && <span className="admin-priority-arrow">→</span>}
                  </div>
                );
              })}
              {filteredDossiers.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun dossier dans cette catégorie</p>
              )}
            </div>

            <div className="admin-section" style={{ marginTop: 24 }}>
              <div className="admin-section-head">
                <h3>Flux de validation</h3>
                <button className="admin-link" onClick={() => navigateTo('finance')}>Finance →</button>
              </div>
              <div className="admin-flux">
                <div className="admin-flux-step done"><span>Nouveau dossier</span><small>OK</small></div>
                <div className="admin-flux-line" />
                <div className="admin-flux-step active"><span>Vérification documents</span><small>En cours</small></div>
                <div className="admin-flux-line" />
                <div className="admin-flux-step"><span>Décision</span><small>À vérif.</small></div>
              </div>
            </div>
          </div>
        )}

        {/* ══ DÉTAIL DOSSIER PRO ══ */}
        {page === 'validation' && selectedDossier && (
          <div className="admin-page">
            <button className="admin-back" onClick={() => setSelectedDossierId(null)}>← Retour</button>
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Validation prestataire</p>
                <h1>{selectedDossier.nom}</h1>
              </div>
              <span className="admin-alert-badge orange">En attente</span>
            </div>

            <div className="admin-pro-detail-head">
              <div className="admin-pro-detail-avatar">{selectedDossier.contact[0]}</div>
              <div>
                <strong>{selectedDossier.contact}</strong>
                <span>{selectedDossier.ville} · Travaux</span>
              </div>
              <div className="admin-pro-detail-stats">
                <div><strong>{selectedDossier.docs.filter(d => d.statut === 'valide').length}</strong><span>Pièces validées</span></div>
                <div><strong>{selectedDossier.docs.filter(d => d.statut === 'en_attente').length}</strong><span>Restantes</span></div>
              </div>
            </div>

            <h3 style={{ marginBottom: 12 }}>Justificatifs obligatoires</h3>
            <div className="admin-docs-list">
              {selectedDossier.docs.map((doc, i) => (
                <div key={i} className="admin-doc-card">
                  <div className="admin-doc-head">
                    <strong>{doc.nom}</strong>
                    <span className={`admin-doc-statut ${doc.statut}`}>
                      {doc.statut === 'valide' ? '✓ Validé' : doc.statut === 'rejete' ? '✗ Rejeté' : '⏳ En attente'}
                    </span>
                  </div>
                  <span className="admin-doc-meta">{doc.taille}</span>
                  <div className="admin-doc-actions">
                    <button className="admin-doc-btn open" onClick={() => showNotif(`Ouverture de "${doc.nom}"...`)}>
                      Ouvrir
                    </button>
                    <button
                      className="admin-doc-btn reject"
                      onClick={() => handleDocRejeter(selectedDossier.id, i)}
                      disabled={doc.statut === 'rejete'}
                    >
                      Rejeter
                    </button>
                    <button
                      className="admin-doc-btn validate"
                      onClick={() => handleDocValider(selectedDossier.id, i)}
                      disabled={doc.statut === 'valide'}
                    >
                      Valider
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-final-actions">
              <button className="admin-btn-reject-all" onClick={handleRefuserDossier}>
                Refuser le dossier
              </button>
              <button className="admin-btn-validate-all" onClick={handleActiverPrestataire}>
                Activer le prestataire
              </button>
            </div>
          </div>
        )}

        {/* ══ SERVICES — liste ══ */}
        {page === 'services' && !selectedService && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Opérations</p>
                <h1>Services en cours</h1>
              </div>
              {services.filter(s => s.statut === 'bloque').length > 0 && (
                <span className="admin-alert-badge red">{services.filter(s => s.statut === 'bloque').length} bloqué{services.filter(s => s.statut === 'bloque').length > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Contrôle opérationnel</p>
              <h2>Suivez tous les services actifs.</h2>
              <div className="admin-hero-stats">
                <div><strong>{services.filter(s => s.statut === 'en_cours').length}</strong><span>En cours</span></div>
                <div><strong>{services.filter(s => s.statut === 'bloque').length}</strong><span>Bloqués</span></div>
                <div><strong>{services.filter(s => s.statut === 'livre').length}</strong><span>Livrés</span></div>
              </div>
            </div>

            <div className="admin-filter-row">
              {[['tous', 'Tous'], ['en_cours', 'En cours'], ['a_demarrer', 'À démarrer'], ['bloque', 'Bloqués'], ['livre', 'Livrés']].map(([val, label]) => (
                <button key={val} className={`admin-filter-btn ${serviceFilter === val ? 'active' : ''}`} onClick={() => setServiceFilter(val)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="admin-search-bar">
              <span><Icon.Search /></span>
              <input placeholder="Rechercher service, client, prestataire..." />
            </div>

            <div className="admin-services-list">
              {filteredServices.map(s => {
                const cfg = statutServiceConfig[s.statut] ?? statutServiceConfig['en_cours'];
                const svc = SERVICE_TYPE_VISUAL[s.serviceType] ?? SERVICE_TYPE_VISUAL['travaux'];
                return (
                  <div key={s.id} className="admin-service-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedServiceId(s.id)}>
                    <div className="admin-service-head">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="admin-service-ref">{s.ref}</span>
                          <span className="admin-statut-pill" style={{ color: svc.color, background: svc.bg, fontSize: 11 }}>{svc.label}</span>
                        </div>
                        <h4>{s.titre}</h4>
                        <span className="admin-service-parties">{s.client} · {s.ville}</span>
                      </div>
                      <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </div>
                    <div className="admin-service-progress-wrap">
                      <div className="admin-service-progress-bar">
                        <div className="admin-service-progress-fill" style={{ width: `${s.progress}%`, background: cfg.color }} />
                      </div>
                      <span className="admin-service-pct" style={{ color: cfg.color }}>{s.progress}%</span>
                    </div>
                    <div className="admin-service-etapes">
                      {s.steps.map((step, i) => (
                        <span key={i} className={`admin-etape ${step.status === 'done' ? 'fait' : ''} ${step.status === 'current' ? 'encours' : ''}`}>{step.label}</span>
                      ))}
                    </div>
                    <div className="admin-service-footer">
                      <span>Pro : <strong>{s.pro}</strong></span>
                      {s.nextStep !== '—' && <span className="admin-service-next">→ {s.nextStep}</span>}
                    </div>
                  </div>
                );
              })}
              {filteredServices.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun service dans cette catégorie</p>
              )}
            </div>
          </div>
        )}

        {/* ══ SERVICES — détail chantier ══ */}
        {page === 'services' && selectedService && (() => {
          const cfg = statutServiceConfig[selectedService.statut] ?? statutServiceConfig['en_cours'];
          const svc = SERVICE_TYPE_VISUAL[selectedService.serviceType] ?? SERVICE_TYPE_VISUAL['travaux'];
          return (
            <div className="admin-page">
              <button className="admin-back" onClick={() => setSelectedServiceId(null)}>← Retour</button>
              <div className="admin-page-header">
                <div>
                  <p className="admin-page-tag">{selectedService.ref}</p>
                  <h1>{selectedService.titre}</h1>
                </div>
                <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg, fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                  {cfg.label}
                </span>
              </div>

              {selectedService.statut === 'bloque' && (
                <div className="admin-quote-refusal-banner">
                  <strong>Chantier bloqué —</strong> action requise : {selectedService.nextStep}
                </div>
              )}

              <div className="admin-service-detail-progress">
                <div className="admin-service-detail-progress-bar">
                  <div style={{ width: `${selectedService.progress}%`, height: '100%', background: cfg.color, borderRadius: 99, transition: 'width .4s' }} />
                </div>
                <span style={{ color: cfg.color, fontWeight: 700, fontSize: 14 }}>{selectedService.progress}%</span>
              </div>

              <div className="admin-lead-detail-card" style={{ marginBottom: 16 }}>
                <div className="admin-lead-detail-row"><span>Client</span><strong>{selectedService.client}</strong></div>
                <div className="admin-lead-detail-row"><span>Prestataire</span><strong>{selectedService.pro}</strong></div>
                <div className="admin-lead-detail-row"><span>Ville</span><strong>{selectedService.ville}</strong></div>
                <div className="admin-lead-detail-row"><span>Adresse</span><strong>{selectedService.address}</strong></div>
                <div className="admin-lead-detail-row"><span>Prochaine étape</span><strong style={{ color: cfg.color }}>{selectedService.nextStep}</strong></div>
                <div className="admin-lead-detail-row"><span>Date prévue</span><strong>{selectedService.nextDate}</strong></div>
              </div>

              <div className="admin-section">
                <h3>Avancement du chantier</h3>
                <div className="admin-demande-stepper" style={{ marginTop: 14 }}>
                  {selectedService.steps.map((step, i) => (
                    <div key={i} className="admin-stepper-step">
                      <div className="admin-stepper-dot-wrap">
                        <div className="admin-stepper-dot" style={{
                          background: step.status === 'done' ? cfg.color : step.status === 'current' ? cfg.color : '#E5E7EB',
                          border: step.status === 'current' ? `3px solid ${cfg.color}` : 'none',
                          color: '#fff',
                        }}>
                          {step.status === 'done' && <Icon.Check />}
                        </div>
                        {i < selectedService.steps.length - 1 && (
                          <div className="admin-stepper-line" style={{ background: step.status === 'done' ? cfg.color : '#E5E7EB' }} />
                        )}
                      </div>
                      <span className="admin-stepper-label" style={{
                        color: step.status === 'current' ? cfg.color : step.status === 'done' ? '#374151' : '#9CA3AF',
                        fontWeight: step.status === 'current' ? 700 : 400,
                      }}>
                        {step.label}
                        {step.date && <><br /><span style={{ fontSize: 10, color: '#9CA3AF' }}>{step.date}</span></>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedService.photos.length > 0 && (
                <div className="admin-section" style={{ marginTop: 16 }}>
                  <h3>Photos du chantier</h3>
                  <div className="admin-photos-grid">
                    {selectedService.photos.map((photo, i) => (
                      <div key={i} className="admin-photo-chip">
                        <div className="admin-photo-thumb" style={{ background: photo.color }} />
                        <div className="admin-photo-meta">
                          <span className="admin-photo-phase" style={{ color: PHOTO_PHASE_COLOR[photo.phase] }}>
                            {photo.phase}
                          </span>
                          <strong>{photo.label}</strong>
                          <span>{photo.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-final-actions" style={{ marginTop: 24 }}>
                {selectedService.statut === 'bloque' && (
                  <button className="admin-doc-btn open" onClick={() => showNotif('Signalement transmis au prestataire')}>
                    Relancer le pro
                  </button>
                )}
                <button className="admin-doc-btn open" onClick={() => navigateTo('rdv')}>
                  Coordonner RDV
                </button>
                {selectedService.statut !== 'livre' && (
                  <button className="admin-btn-validate-all" onClick={() => showNotif('Chantier marqué comme livré ✓')}>
                    Marquer livré
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* ══ FINANCE ══ */}
        {page === 'finance' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Pilotage financier</p>
                <h1>Finance</h1>
              </div>
              <span className="admin-alert-badge orange">2 à relancer</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pilotage financier</p>
              <h2>Factures, paiements et relances.</h2>
              <div className="admin-hero-stats">
                <div><strong>{factures.reduce((s, f) => s + parseFloat(f.montant.replace(/\s/g,'').replace('€','')||'0'), 0).toLocaleString('fr-FR')} €</strong><span>Total émis</span></div>
                <div><strong>{factures.filter(f => f.statut === 'paye').reduce((s, f) => s + parseFloat(f.montant.replace(/\s/g,'').replace('€','')||'0'), 0).toLocaleString('fr-FR')} €</strong><span>Encaissé</span></div>
                <div><strong style={{ color: '#DC2626' }}>{factures.filter(f => f.statut === 'retard').length}</strong><span>En retard</span></div>
              </div>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi"><span className="admin-kpi-num">{factures.length}</span><span>Factures</span></div>
              <div className="admin-kpi" style={{ cursor: 'pointer' }} onClick={() => navigateTo('devis')}>
                <span className="admin-kpi-num orange">{quotesAccepteesNonActees.length}</span><span>Devis à acter</span>
              </div>
              <div className="admin-kpi"><span className="admin-kpi-num" style={{ color: '#D97706' }}>{factures.filter(f => f.statut === 'attente').length}</span><span>En attente</span></div>
              <div className="admin-kpi"><span className="admin-kpi-num" style={{ color: '#DC2626' }}>{factures.filter(f => f.statut === 'retard').length}</span><span>En retard</span></div>
            </div>

            {quotesAccepteesNonActees.length > 0 && (
              <div className="admin-section" style={{ border: '1px solid #FDE68A', background: '#FFFBEB' }}>
                <div className="admin-section-head">
                  <h3 style={{ color: '#D97706' }}>Devis acceptés — action requise</h3>
                  <button className="admin-link" onClick={() => navigateTo('devis')}>Voir tous les devis →</button>
                </div>
                {quotesAccepteesNonActees.map(q => {
                  const totalTTC = q.items.reduce((s, l) => s + Math.round(l.unitPrice * l.quantity * (1 + l.tvaRate / 100)), 0);
                  return (
                    <div key={q.id} className="admin-finance-devis-row" onClick={() => { setPage('devis'); setSelectedQuoteId(q.id); }}>
                      <div className="admin-finance-devis-info">
                        <strong>{q.title}</strong>
                        <span>{q.client} · {q.ref}</span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{totalTTC.toLocaleString('fr-FR')} €</div>
                        <span className="admin-statut-pill" style={{ color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 11 }}>Accepté client</span>
                      </div>
                      <button className="admin-btn-validate-all" style={{ fontSize: 12, padding: '6px 14px' }} onClick={e => {
                        e.stopPropagation();
                        setQuotes(prev => prev.map(qu => qu.id === q.id ? { ...qu, status: 'admin_approved' } : qu));
                        showNotif('Devis acté — paiement débloqué ✓');
                      }}>
                        Acter
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="admin-section" style={{ marginBottom: 0 }}>
              <h3 style={{ marginBottom: 16 }}>Chiffre d'affaires mensuel</h3>
              <div className="admin-chart">
                {(() => { const max = Math.max(...monthlyCA.map(m => m.montant)); return monthlyCA.map(m => (
                  <div key={m.mois} className="admin-chart-col">
                    <span className="admin-chart-val">{(m.montant / 1000).toFixed(0)}k€</span>
                    <div className="admin-chart-bar-wrap">
                      <div className="admin-chart-bar" style={{ height: `${Math.round((m.montant / max) * 100)}%` }} />
                    </div>
                    <span className="admin-chart-label">{m.mois}</span>
                  </div>
                )); })()}
              </div>
            </div>

            <div className="admin-filter-row">
              {[['tous', 'Tous'], ['paye', 'Payés'], ['attente', 'Attente'], ['retard', 'Retard']].map(([val, label]) => (
                <button key={val} className={`admin-filter-btn ${factureFilter === val ? 'active' : ''}`} onClick={() => setFactureFilter(val)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="admin-factures-list">
              {filteredFactures.map(f => {
                const cfg = statutFactureConfig[f.statut];
                return (
                  <div key={f.id} className="admin-facture-row">
                    <div className="admin-facture-icon">€</div>
                    <div className="admin-facture-info">
                      <strong>{f.ref} · {f.montant}</strong>
                      <span>{f.client} · {f.pro}</span>
                    </div>
                    <div className="admin-facture-right">
                      <span>{f.date}</span>
                      <span className="admin-statut-pill" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </div>
                    {f.statut !== 'paye' && (
                      <button className="admin-doc-btn open" onClick={() => showNotif(`Relance envoyée à ${f.client}`)}>
                        Relancer
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredFactures.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucune facture dans cette catégorie</p>
              )}
            </div>
          </div>
        )}

        {/* ══ RDV ══ */}
        {page === 'rdv' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Coordination</p>
                <h1>Rendez-vous</h1>
              </div>
              {rdvsACoord.length > 0 && (
                <span className="admin-alert-badge orange">{rdvsACoord.length} à coordonner</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Intermédiation totale</p>
              <h2>Validez les créneaux avant diffusion aux deux parties.</h2>
              <div className="admin-hero-stats">
                <div><strong>{rdvsACoord.length}</strong><span>À traiter</span></div>
                <div><strong>{rdvList.filter(r => r.statut === 'valide').length}</strong><span>Validés</span></div>
              </div>
            </div>

            <div className="admin-section-head" style={{ marginBottom: 12 }}>
              <h3>Rendez-vous</h3>
              <button className="admin-link" onClick={() => setShowRdvCreate(v => !v)}>
                {showRdvCreate ? 'Fermer ↑' : '+ Nouveau RDV'}
              </button>
            </div>

            {showRdvCreate && (
              <div className="admin-rdv-create-form">
                <h4>Créer un rendez-vous</h4>
                <div className="admin-rdv-create-grid">
                  <div className="admin-cq-field">
                    <label>Objet</label>
                    <input value={rdvCreateTitle} onChange={e => setRdvCreateTitle(e.target.value)} placeholder="Ex : Visite technique avant devis" />
                  </div>
                  <div className="admin-cq-field">
                    <label>Client</label>
                    <input value={rdvCreateClient} onChange={e => setRdvCreateClient(e.target.value)} placeholder="Nom du client" />
                  </div>
                  <div className="admin-cq-field">
                    <label>Prestataire</label>
                    <input value={rdvCreatePro} onChange={e => setRdvCreatePro(e.target.value)} placeholder="Nom du prestataire" />
                  </div>
                  <div className="admin-cq-field">
                    <label>Adresse</label>
                    <input value={rdvCreateAddr} onChange={e => setRdvCreateAddr(e.target.value)} placeholder="Adresse du RDV" />
                  </div>
                  <div className="admin-cq-field">
                    <label>Date</label>
                    <input type="date" value={rdvCreateDate} onChange={e => setRdvCreateDate(e.target.value)} />
                  </div>
                  <div className="admin-cq-field">
                    <label>Heure</label>
                    <input type="time" value={rdvCreateTime} onChange={e => setRdvCreateTime(e.target.value)} />
                  </div>
                </div>
                <div className="admin-cq-actions">
                  <button className="admin-doc-btn open" onClick={() => setShowRdvCreate(false)}>Annuler</button>
                  <button className="admin-btn-validate-all" style={{ flex: 1 }} onClick={() => {
                    if (!rdvCreateTitle.trim() || !rdvCreateClient.trim() || !rdvCreatePro.trim()) {
                      showNotif('Remplissez au moins l\'objet, le client et le prestataire', 'error'); return;
                    }
                    const newId = Math.max(...rdvList.map(r => r.id)) + 1;
                    const dateLabel = rdvCreateDate ? new Date(rdvCreateDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
                    const heureLabel = rdvCreateTime || '—';
                    setRdvList(prev => [...prev, { id: newId, titre: rdvCreateTitle, client: rdvCreateClient, pro: rdvCreatePro, date: dateLabel, heure: heureLabel, adresse: rdvCreateAddr || '—', tag: 'Validé', statut: 'valide' }]);
                    setRdvCreateTitle(''); setRdvCreateClient(''); setRdvCreatePro(''); setRdvCreateDate(''); setRdvCreateTime(''); setRdvCreateAddr('');
                    setShowRdvCreate(false);
                    showNotif('RDV créé et notifié aux deux parties ✓');
                  }}>
                    Confirmer le RDV
                  </button>
                </div>
              </div>
            )}

            {rdvsACoord.length > 0 && (
              <div className="admin-section-head" style={{ marginBottom: 8, marginTop: 4 }}>
                <h3 style={{ color: '#D97706' }}>À coordonner ({rdvsACoord.length})</h3>
              </div>
            )}
            <div className="admin-rdv-list">
              {rdvList.map(r => (
                <div key={r.id} className={`admin-rdv-card ${r.statut}`}>
                  <div className="admin-rdv-info">
                    <strong>{r.titre}</strong>
                    <span>{r.client} · {r.pro}</span>
                    <span className="admin-rdv-datetime">
                      {r.date !== '—' ? `${r.date} à ${r.heure}` : '—'} · {r.adresse !== '—' ? r.adresse : 'Adresse non définie'}
                    </span>
                  </div>
                  <span className={`admin-rdv-tag ${r.statut}`}>{r.tag}</span>
                  {r.statut === 'a_coordonner' && (
                    <div className="admin-rdv-actions">
                      <button className="admin-doc-btn validate" onClick={() => handleRdvValider(r.id)}>
                        Valider
                      </button>
                      <button className="admin-doc-btn reject" onClick={() => handleRdvRefuser(r.id)}>
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {rdvList.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun rendez-vous enregistré</p>
              )}
            </div>
          </div>
        )}

        {/* ══ LEADS — liste ══ */}
        {page === 'leads' && !selectedLead && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">CRM</p>
                <h1>Leads & Prospects</h1>
              </div>
              <span className="admin-alert-badge">{leads.length} contacts</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pipeline commercial</p>
              <h2>Suivez chaque prospect jusqu'à la conversion.</h2>
              <div className="admin-hero-stats">
                <div><strong>{leadsNew}</strong><span>Nouveaux</span></div>
                <div><strong>{leadsQualified}</strong><span>Qualifiés</span></div>
                <div><strong>{leadsConverted}</strong><span>Convertis</span></div>
              </div>
            </div>

            <div className="admin-filter-row admin-filter-scroll">
              {STATUS_FILTERS_LEAD.map(f => (
                <button key={f.value} className={`admin-filter-btn ${leadStatusFilter === f.value ? 'active' : ''}`} onClick={() => setLeadStatusFilter(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="admin-filter-row admin-filter-scroll" style={{ marginTop: 6 }}>
              {PRIORITY_FILTERS_LEAD.map(f => (
                <button key={f.value} className={`admin-filter-btn small ${leadPriorityFilter === f.value ? 'active' : ''}`} onClick={() => setLeadPriorityFilter(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="admin-search-bar">
              <span><Icon.Search /></span>
              <input placeholder="Rechercher un nom, email, ville..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} />
            </div>

            <div className="admin-list-label">
              <span>{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="admin-leads-list">
              {filteredLeads.map(lead => {
                const sc = LEAD_STATUS[lead.status];
                const pc = LEAD_PRIORITY[lead.priority];
                return (
                  <div key={lead.id} className="admin-lead-row" onClick={() => setSelectedLeadId(lead.id)}>
                    <div className="admin-lead-avatar">{lead.name[0]}</div>
                    <div className="admin-lead-info">
                      <div className="admin-lead-name-row">
                        <strong>{lead.name}</strong>
                        <span className="admin-lead-source">{LEAD_SOURCE[lead.source]}</span>
                      </div>
                      <span className="admin-lead-sub">{lead.serviceType} · {lead.city} · {lead.createdAt}</span>
                    </div>
                    <div className="admin-lead-right">
                      <span className="admin-statut-pill" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                      <span className="admin-lead-priority" style={{ color: pc.color }}>● {pc.label}</span>
                    </div>
                    <span className="admin-priority-arrow">→</span>
                  </div>
                );
              })}
              {filteredLeads.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun lead dans cette catégorie</p>
              )}
            </div>
          </div>
        )}

        {/* ══ LEADS — détail ══ */}
        {page === 'leads' && selectedLead && (
          <div className="admin-page">
            <button className="admin-back" onClick={() => setSelectedLeadId(null)}>← Retour</button>
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Fiche lead</p>
                <h1>{selectedLead.name}</h1>
              </div>
              <span className="admin-statut-pill" style={{ color: LEAD_STATUS[selectedLead.status].color, background: LEAD_STATUS[selectedLead.status].bg, fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                {LEAD_STATUS[selectedLead.status].label}
              </span>
            </div>

            <div className="admin-lead-detail-card">
              <div className="admin-lead-detail-row"><span>Email</span><strong>{selectedLead.email}</strong></div>
              <div className="admin-lead-detail-row"><span>Téléphone</span><strong>{selectedLead.phone}</strong></div>
              <div className="admin-lead-detail-row"><span>Ville</span><strong>{selectedLead.city}</strong></div>
              <div className="admin-lead-detail-row"><span>Service</span><strong>{selectedLead.serviceType}</strong></div>
              <div className="admin-lead-detail-row"><span>Source</span><strong>{LEAD_SOURCE[selectedLead.source]}</strong></div>
              <div className="admin-lead-detail-row"><span>Priorité</span><strong style={{ color: LEAD_PRIORITY[selectedLead.priority].color }}>{LEAD_PRIORITY[selectedLead.priority].label}</strong></div>
              {selectedLead.estimatedValue !== undefined && selectedLead.estimatedValue > 0 && (
                <div className="admin-lead-detail-row"><span>Valeur estimée</span><strong>{selectedLead.estimatedValue.toLocaleString('fr-FR')} €</strong></div>
              )}
              <div className="admin-lead-detail-row"><span>Créé le</span><strong>{selectedLead.createdAt}</strong></div>
            </div>

            {selectedLead.notes && (
              <div className="admin-section" style={{ marginTop: 16 }}>
                <h3>Notes</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginTop: 8 }}>{selectedLead.notes}</p>
              </div>
            )}

            <div className="admin-section" style={{ marginTop: 16 }}>
              <h3>Changer le statut</h3>
              <div className="admin-filter-row admin-filter-scroll" style={{ marginTop: 10 }}>
                {(Object.keys(LEAD_STATUS) as LeadStatus[]).map(s => (
                  <button
                    key={s}
                    className={`admin-filter-btn ${selectedLead.status === s ? 'active' : ''}`}
                    style={selectedLead.status === s ? { background: LEAD_STATUS[s].bg, color: LEAD_STATUS[s].color, borderColor: LEAD_STATUS[s].color } : {}}
                    onClick={() => {
                      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: s } : l));
                      showNotif(`Statut mis à jour : ${LEAD_STATUS[s].label}`);
                    }}
                  >
                    {LEAD_STATUS[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-final-actions" style={{ marginTop: 24 }}>
              <button className="admin-btn-reject-all" onClick={() => {
                setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: 'lost' } : l));
                setSelectedLeadId(null);
                showNotif('Lead marqué comme perdu', 'error');
              }}>
                Marquer perdu
              </button>
              <button className="admin-btn-validate-all" onClick={() => {
                setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: 'converted' } : l));
                setSelectedLeadId(null);
                showNotif('Lead converti en client ✓');
              }}>
                Convertir en client
              </button>
            </div>
          </div>
        )}

        {/* ══ DEVIS — liste ══ */}
        {page === 'devis' && !selectedQuote && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Négociation</p>
                <h1>Gestion des devis</h1>
              </div>
              {quotesNeedAction > 0 && (
                <span className="admin-alert-badge">{quotesNeedAction} à acter</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pipeline devis</p>
              <h2>Créez, transmettez et actez les devis.</h2>
              <div className="admin-hero-stats">
                <div><strong>{quotes.length}</strong><span>Total</span></div>
                <div><strong>{quotes.filter(q => q.status === 'accepted_by_client').length}</strong><span>Acceptés</span></div>
                <div><strong>{quotes.filter(q => q.status === 'quote_rejected_by_client').length}</strong><span>Refusés</span></div>
              </div>
            </div>

            <div className="admin-filter-row admin-filter-scroll">
              {QUOTE_FILTERS_ADMIN.map(f => (
                <button key={f.value} className={`admin-filter-btn ${quoteFilter === f.value ? 'active' : ''}`} onClick={() => setQuoteFilter(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="admin-quotes-list">
              {filteredQuotes.map(q => {
                const sc = QUOTE_STATUS_ADMIN[q.status];
                const svc = SERVICE_ADMIN_VISUAL[q.serviceType] ?? { label: q.serviceType, color: '#6B7280', bg: '#F3F4F6' };
                const totalTTC = q.items.reduce((s, l) => s + Math.round(l.unitPrice * l.quantity * (1 + l.tvaRate / 100)), 0);
                return (
                  <div key={q.id} className="admin-quote-row" onClick={() => setSelectedQuoteId(q.id)}>
                    <div className="admin-quote-icon"><Icon.File /></div>
                    <div className="admin-quote-info">
                      <div className="admin-quote-title-row">
                        <strong>{q.title}</strong>
                        <span className="admin-lead-source">{svc.label}</span>
                      </div>
                      <span className="admin-lead-sub">{q.client} · {q.ref} · {q.createdAt}</span>
                    </div>
                    <div className="admin-quote-right">
                      <span className="admin-quote-total">{totalTTC.toLocaleString('fr-FR')} €</span>
                      <span className="admin-statut-pill" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                    </div>
                    <span className="admin-priority-arrow">→</span>
                  </div>
                );
              })}
              {filteredQuotes.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun devis dans cette catégorie</p>
              )}
            </div>

            {/* ── Formulaire création ── */}
            <div className="admin-section-head" style={{ marginTop: 28 }}>
              <h3>Proposer un devis</h3>
              <button className="admin-link" onClick={() => setShowCreateForm(v => !v)}>
                {showCreateForm ? 'Réduire ↑' : 'Ouvrir ↓'}
              </button>
            </div>

            {showCreateForm && (
              <div className="admin-create-quote-form">
                <div className="admin-cq-field">
                  <label>Titre du devis</label>
                  <input value={qTitle} onChange={e => setQTitle(e.target.value)} placeholder="Ex : Devis installation borne IRVE 7,4 kW" />
                </div>

                <div className="admin-cq-lines">
                  {qLines.map((line, i) => (
                    <div key={line.id} className="admin-cq-line">
                      <div className="admin-cq-line-top">
                        <span className="admin-cq-line-num">Ligne {i + 1}</span>
                        <button className="admin-cq-remove" onClick={() => setQLines(prev => prev.filter((_, idx) => idx !== i))}>
                          <Icon.Trash /> Supprimer
                        </button>
                      </div>
                      <input className="admin-cq-line-label" value={line.label} onChange={e => setQLines(prev => prev.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))} placeholder="Libellé prestation" />
                      <div className="admin-cq-line-nums">
                        <div>
                          <label>Qté</label>
                          <input type="number" min="0" value={line.quantity} onChange={e => setQLines(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: Number(e.target.value) } : l))} />
                        </div>
                        <div>
                          <label>P.U. (€ HT)</label>
                          <input type="number" min="0" value={line.unitPrice} onChange={e => setQLines(prev => prev.map((l, idx) => idx === i ? { ...l, unitPrice: Number(e.target.value) } : l))} />
                        </div>
                        <div>
                          <label>TVA (%)</label>
                          <input type="number" min="0" value={line.tvaRate} onChange={e => setQLines(prev => prev.map((l, idx) => idx === i ? { ...l, tvaRate: Number(e.target.value) } : l))} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="admin-cq-add-line" onClick={() => setQLines(prev => [...prev, { id: Date.now(), label: 'Nouvelle prestation', quantity: 1, unitPrice: 0, tvaRate: 20 }])}>
                    <Icon.Plus /> Ajouter une ligne
                  </button>
                </div>

                <div className="admin-cq-totals">
                  <div><span>Sous-total HT</span><strong>{qSubtotal.toLocaleString('fr-FR')} €</strong></div>
                  <div><span>TVA</span><strong>{qTva.toLocaleString('fr-FR')} €</strong></div>
                  <div className="admin-cq-total-ttc"><span>Total TTC</span><strong>{qTotal.toLocaleString('fr-FR')} €</strong></div>
                </div>

                <div className="admin-cq-field">
                  <label>Délai estimé</label>
                  <input value={qDelay} onChange={e => setQDelay(e.target.value)} />
                </div>
                <div className="admin-cq-field">
                  <label>Conditions de paiement</label>
                  <input value={qConditions} onChange={e => setQConditions(e.target.value)} />
                </div>
                <div className="admin-cq-field">
                  <label>Commentaire Admin</label>
                  <input value={qNotes} onChange={e => setQNotes(e.target.value)} />
                </div>
                <div className="admin-cq-field">
                  <label>Valide jusqu'au</label>
                  <input type="date" value={qValidUntil} onChange={e => setQValidUntil(e.target.value)} />
                </div>

                <div className="admin-cq-actions">
                  <button className="admin-doc-btn open" onClick={() => showNotif('Brouillon enregistré')}>Enregistrer brouillon</button>
                  <button className="admin-btn-validate-all" style={{ flex: 1 }} onClick={() => {
                    if (!qTitle.trim()) { showNotif('Saisissez un titre', 'error'); return; }
                    const newId = Math.max(...quotes.map(q => q.id)) + 1;
                    const newQuote: AdminQuote = {
                      id: newId, ref: `DEV-00${newId}`, title: qTitle,
                      client: '—', provider: 'Admin', serviceType: 'travaux',
                      createdAt: 'Aujourd\'hui', validUntil: qValidUntil || '—',
                      status: 'sent', items: qLines.map(l => ({ ...l })),
                      notes: qNotes,
                    };
                    setQuotes(prev => [newQuote, ...prev]);
                    setQTitle(''); setQLines(DEFAULT_QUOTE_LINES.map(l => ({ ...l }))); setShowCreateForm(false);
                    showNotif('Devis créé et transmis au client ✓');
                  }}>
                    Soumettre le devis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ DEVIS — détail ══ */}
        {page === 'devis' && selectedQuote && (
          <div className="admin-page">
            <button className="admin-back" onClick={() => setSelectedQuoteId(null)}>← Retour</button>
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">{selectedQuote.ref}</p>
                <h1>{selectedQuote.title}</h1>
              </div>
              <span className="admin-statut-pill" style={{ color: QUOTE_STATUS_ADMIN[selectedQuote.status].color, background: QUOTE_STATUS_ADMIN[selectedQuote.status].bg, fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                {QUOTE_STATUS_ADMIN[selectedQuote.status].label}
              </span>
            </div>

            {selectedQuote.status === 'quote_rejected_by_client' && selectedQuote.rejectionReason && (
              <div className="admin-quote-refusal-banner">
                <strong>Motif du refus client :</strong> {selectedQuote.rejectionReason}
              </div>
            )}

            {selectedQuote.status === 'accepted_by_client' && (
              <div className="admin-quote-accept-banner">
                Le client a accepté ce devis. Valider côté Admin officialise le choix et fait avancer la demande à l'étape <strong>Paiement</strong>.
              </div>
            )}

            <div className="admin-lead-detail-card">
              <div className="admin-lead-detail-row"><span>Client</span><strong>{selectedQuote.client}</strong></div>
              <div className="admin-lead-detail-row"><span>Prestataire</span><strong>{selectedQuote.provider}</strong></div>
              <div className="admin-lead-detail-row"><span>Créé le</span><strong>{selectedQuote.createdAt}</strong></div>
              <div className="admin-lead-detail-row"><span>Valide jusqu'au</span><strong>{selectedQuote.validUntil}</strong></div>
            </div>

            <div className="admin-section" style={{ marginTop: 16 }}>
              <h3>Lignes du devis</h3>
              <div className="admin-quote-lines-table">
                <div className="admin-quote-lines-head">
                  <span>Prestation</span><span>Qté</span><span>P.U. HT</span><span>Total TTC</span>
                </div>
                {selectedQuote.items.map(line => (
                  <div key={line.id} className="admin-quote-line-row">
                    <span>{line.label}</span>
                    <span>{line.quantity}</span>
                    <span>{line.unitPrice.toLocaleString('fr-FR')} €</span>
                    <span><strong>{Math.round(line.unitPrice * line.quantity * (1 + line.tvaRate / 100)).toLocaleString('fr-FR')} €</strong></span>
                  </div>
                ))}
                <div className="admin-quote-lines-total">
                  <span>Total TTC</span>
                  <strong>{selectedQuote.items.reduce((s, l) => s + Math.round(l.unitPrice * l.quantity * (1 + l.tvaRate / 100)), 0).toLocaleString('fr-FR')} €</strong>
                </div>
              </div>
            </div>

            <div className="admin-final-actions" style={{ marginTop: 24 }}>
              <button className="admin-doc-btn open" onClick={() => showNotif('Devis retransmis au client')}>Envoyer client</button>
              <button className="admin-doc-btn open" onClick={() => showNotif('Base du devis chargée dans le formulaire')}>Modifier</button>
              {selectedQuote.status === 'quote_rejected_by_client' ? (
                <button className="admin-doc-btn reject" onClick={() => { setQuotes(prev => prev.filter(q => q.id !== selectedQuote.id)); setSelectedQuoteId(null); showNotif('Refus archivé', 'error'); }}>
                  Archiver refus
                </button>
              ) : selectedQuote.status === 'admin_approved' ? (
                <button className="admin-doc-btn validate" disabled>Acté Admin ✓</button>
              ) : (
                <button className="admin-btn-validate-all" onClick={() => {
                  setQuotes(prev => prev.map(q => q.id === selectedQuote.id ? { ...q, status: 'admin_approved' } : q));
                  setSelectedQuoteId(null);
                  showNotif('Devis acté — paiement débloqué ✓');
                }}>
                  Valider Admin
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ SUIVI REQUÊTES ══ */}
        {page === 'suivi' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Traitement</p>
                <h1>Suivi des requêtes</h1>
              </div>
              {demandes.filter(d => d.stage === 'received').length > 0 && (
                <span className="admin-alert-badge orange">{demandes.filter(d => d.stage === 'received').length} nouvelle{demandes.filter(d => d.stage === 'received').length > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pipeline de traitement</p>
              <h2>De la réception à la clôture, étape par étape.</h2>
              <div className="admin-hero-stats">
                {DEMANDE_STAGES.map(s => (
                  <div key={s.key}>
                    <strong style={{ color: DEMANDE_STAGE_COLOR[s.key] }}>{demandes.filter(d => d.stage === s.key).length}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-suivi-pipeline">
              {DEMANDE_STAGES.map((stage, stageIndex) => {
                const stageDemandes = demandes.filter(d => d.stage === stage.key);
                if (stageDemandes.length === 0) return null;
                return (
                  <div key={stage.key} className="admin-suivi-column">
                    <div className="admin-suivi-col-head" style={{ borderColor: DEMANDE_STAGE_COLOR[stage.key] }}>
                      <span style={{ color: DEMANDE_STAGE_COLOR[stage.key] }}>{stage.label}</span>
                      <span className="admin-suivi-col-count">{stageDemandes.length}</span>
                    </div>
                    {stageDemandes.map(dem => {
                      const svc = SERVICE_ADMIN_VISUAL[dem.serviceType];
                      const isLast = stageIndex === DEMANDE_STAGES.length - 1;
                      const nextStage = !isLast ? DEMANDE_STAGES[stageIndex + 1] : null;
                      return (
                        <div key={dem.id} className="admin-suivi-card">
                          <div className="admin-suivi-card-top">
                            <span className="admin-service-ref">{dem.ref}</span>
                            <span className="admin-statut-pill" style={{ color: svc.color, background: svc.bg, fontSize: 10 }}>{svc.label}</span>
                          </div>
                          <strong className="admin-suivi-card-title">{dem.title}</strong>
                          <span className="admin-suivi-card-sub">{dem.client} · {dem.city}</span>
                          {dem.amount && dem.amount > 0 && (
                            <span className="admin-suivi-card-amount">{dem.amount.toLocaleString('fr-FR')} €</span>
                          )}
                          {nextStage && (
                            <button className="admin-suivi-advance-btn" onClick={() => {
                              setDemandes(prev => prev.map(d => d.id === dem.id ? { ...d, stage: nextStage.key } : d));
                              showNotif(`→ ${nextStage.label}`);
                            }}>
                              Avancer → {nextStage.label}
                            </button>
                          )}
                          {isLast && (
                            <span className="admin-suivi-done-tag">Terminé ✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ DEMANDES — liste ══ */}
        {page === 'demandes' && !selectedDemande && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">Suivi des demandes</p>
                <h1>Demandes clients</h1>
              </div>
              <span className="admin-alert-badge orange">{demandes.filter(d => d.stage === 'admin_validation').length} à traiter</span>
            </div>

            <div className="admin-hero-card">
              <p className="admin-hero-label">Pipeline demandes</p>
              <h2>De la réception au paiement, sans rien perdre.</h2>
              <div className="admin-hero-stats">
                <div><strong>{demandes.filter(d => d.stage === 'received').length}</strong><span>Reçues</span></div>
                <div><strong>{demandes.filter(d => d.stage === 'admin_validation').length}</strong><span>À valider</span></div>
                <div><strong>{demandes.filter(d => d.stage === 'payment').length}</strong><span>Paiement</span></div>
              </div>
            </div>

            <div className="admin-filter-row">
              {SERVICE_FILTERS_ADMIN.map(f => (
                <button key={f.value} className={`admin-filter-btn ${serviceFilterAdmin === f.value ? 'active' : ''}`} onClick={() => setServiceFilterAdmin(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="admin-search-bar">
              <span><Icon.Search /></span>
              <input placeholder="Référence, client, titre..." value={demandeSearch} onChange={e => setDemandeSearch(e.target.value)} />
            </div>

            <div className="admin-list-label">
              <span>{filteredDemandes.length} demande{filteredDemandes.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="admin-demandes-list">
              {filteredDemandes.map(dem => {
                const svc = SERVICE_ADMIN_VISUAL[dem.serviceType];
                const stageIdx = DEMANDE_STAGES.findIndex(s => s.key === dem.stage);
                return (
                  <div key={dem.id} className="admin-demande-card" onClick={() => setSelectedDemandeId(dem.id)}>
                    <div className="admin-demande-head">
                      <div>
                        <span className="admin-service-ref">{dem.ref}</span>
                        <h4>{dem.title}</h4>
                        <span className="admin-service-parties">{dem.client} · {dem.city} · {dem.createdAt}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className="admin-statut-pill" style={{ color: svc.color, background: svc.bg }}>{svc.label}</span>
                        {dem.amount && dem.amount > 0 && <span className="admin-demande-amount">{dem.amount.toLocaleString('fr-FR')} €</span>}
                      </div>
                    </div>
                    <div className="admin-demande-stages">
                      {DEMANDE_STAGES.map((s, i) => (
                        <div key={s.key} className="admin-demande-stage-item">
                          <div className="admin-demande-stage-dot" style={{
                            background: i <= stageIdx ? DEMANDE_STAGE_COLOR[dem.stage] : '#E5E7EB',
                            border: i === stageIdx ? `2px solid ${DEMANDE_STAGE_COLOR[dem.stage]}` : 'none',
                          }} />
                          <span className="admin-demande-stage-label" style={{ color: i === stageIdx ? DEMANDE_STAGE_COLOR[dem.stage] : '#9CA3AF', fontWeight: i === stageIdx ? 600 : 400 }}>
                            {s.label}
                          </span>
                          {i < DEMANDE_STAGES.length - 1 && <div className="admin-demande-stage-line" style={{ background: i < stageIdx ? DEMANDE_STAGE_COLOR[dem.stage] : '#E5E7EB' }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredDemandes.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucune demande dans cette catégorie</p>
              )}
            </div>
          </div>
        )}

        {/* ══ DEMANDES — détail ══ */}
        {page === 'demandes' && selectedDemande && (
          <div className="admin-page">
            <button className="admin-back" onClick={() => setSelectedDemandeId(null)}>← Retour</button>
            <div className="admin-page-header">
              <div>
                <p className="admin-page-tag">{selectedDemande.ref}</p>
                <h1>{selectedDemande.title}</h1>
              </div>
              <span className="admin-statut-pill" style={{ color: SERVICE_ADMIN_VISUAL[selectedDemande.serviceType].color, background: SERVICE_ADMIN_VISUAL[selectedDemande.serviceType].bg, fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                {SERVICE_ADMIN_VISUAL[selectedDemande.serviceType].label}
              </span>
            </div>

            <div className="admin-lead-detail-card">
              <div className="admin-lead-detail-row"><span>Client</span><strong>{selectedDemande.client}</strong></div>
              <div className="admin-lead-detail-row"><span>Ville</span><strong>{selectedDemande.city}</strong></div>
              <div className="admin-lead-detail-row"><span>Créée le</span><strong>{selectedDemande.createdAt}</strong></div>
              {selectedDemande.amount && <div className="admin-lead-detail-row"><span>Montant</span><strong>{selectedDemande.amount.toLocaleString('fr-FR')} €</strong></div>}
              <div className="admin-lead-detail-row"><span>Étape actuelle</span><strong style={{ color: DEMANDE_STAGE_COLOR[selectedDemande.stage] }}>{DEMANDE_STAGES.find(s => s.key === selectedDemande.stage)?.label}</strong></div>
            </div>

            <div className="admin-section" style={{ marginTop: 16 }}>
              <h3>Avancement</h3>
              <div className="admin-demande-stepper">
                {DEMANDE_STAGES.map((s, i) => {
                  const stageIdx = DEMANDE_STAGES.findIndex(st => st.key === selectedDemande.stage);
                  const done = i < stageIdx;
                  const active = i === stageIdx;
                  return (
                    <div key={s.key} className="admin-stepper-step">
                      <div className="admin-stepper-dot-wrap">
                        <div className="admin-stepper-dot" style={{ background: done || active ? DEMANDE_STAGE_COLOR[selectedDemande.stage] : '#E5E7EB', border: active ? `3px solid ${DEMANDE_STAGE_COLOR[selectedDemande.stage]}` : 'none' }}>
                          {done && <Icon.Check />}
                        </div>
                        {i < DEMANDE_STAGES.length - 1 && <div className="admin-stepper-line" style={{ background: done ? DEMANDE_STAGE_COLOR[selectedDemande.stage] : '#E5E7EB' }} />}
                      </div>
                      <span className="admin-stepper-label" style={{ color: active ? DEMANDE_STAGE_COLOR[selectedDemande.stage] : done ? '#374151' : '#9CA3AF', fontWeight: active ? 700 : 400 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-section" style={{ marginTop: 16 }}>
              <h3>Faire avancer</h3>
              <div className="admin-filter-row admin-filter-scroll" style={{ marginTop: 10 }}>
                {DEMANDE_STAGES.map(s => (
                  <button
                    key={s.key}
                    className={`admin-filter-btn ${selectedDemande.stage === s.key ? 'active' : ''}`}
                    style={selectedDemande.stage === s.key ? { background: `${DEMANDE_STAGE_COLOR[s.key]}18`, color: DEMANDE_STAGE_COLOR[s.key], borderColor: DEMANDE_STAGE_COLOR[s.key] } : {}}
                    onClick={() => {
                      setDemandes(prev => prev.map(d => d.id === selectedDemande.id ? { ...d, stage: s.key } : d));
                      showNotif(`Étape mise à jour : ${s.label}`);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
