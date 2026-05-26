import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardClient.css';

// ─── Notifications ────────────────────────────────────────────────────────────
type NotifType = 'message' | 'quote' | 'rdv' | 'document' | 'job_update' | 'payment';

const NOTIF_CLIENT_CONFIG: Record<NotifType, { label: string; color: string; soft: string; icon: React.ReactNode }> = {
  message:    { label: 'Message',  color: '#4A7A5C', soft: '#EDF4F0', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  quote:      { label: 'Devis',    color: '#E87D50', soft: '#FFF5F0', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  rdv:        { label: 'RDV',      color: '#3B82F6', soft: '#EFF6FF', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  document:   { label: 'Document', color: '#F59E0B', soft: '#FFFBEB', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  job_update: { label: 'Chantier', color: '#8B5CF6', soft: '#F5F3FF', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  payment:    { label: 'Paiement', color: '#10B981', soft: '#ECFDF5', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
};

const NOTIF_FILTERS_CLIENT = [
  { id: 'toutes',    label: 'Toutes' },
  { id: 'unread',    label: 'Non lues' },
  { id: 'message',   label: 'Messages' },
  { id: 'rdv',       label: 'RDV' },
  { id: 'quote',     label: 'Devis' },
  { id: 'document',  label: 'Documents' },
  { id: 'job_update',label: 'Chantiers' },
];

const initClientNotifs: { id: string; type: NotifType; title: string; body: string; createdAt: string; read: boolean }[] = [
  { id: 'n1', type: 'message',    title: 'Nouveau message de Marc Dupont',  body: "Bonjour, je suis disponible le 15 mai pour l'installation de votre borne.",            createdAt: new Date(Date.now() - 5*60000).toISOString(),      read: false },
  { id: 'n2', type: 'quote',      title: 'Devis reçu — Wallbox 7.4 kW',     body: "Sophie Bernard vous a envoyé un nouveau devis de 1 600 €. Consultez-le pour l'accepter.", createdAt: new Date(Date.now() - 2*3600000).toISOString(),    read: false },
  { id: 'n3', type: 'rdv',        title: 'RDV confirmé — 2 mai à 14h',      body: 'Votre rendez-vous de mise en service avec Marc Leroy est confirmé.',                   createdAt: new Date(Date.now() - 24*3600000).toISOString(),   read: true  },
  { id: 'n4', type: 'document',   title: 'Contrat disponible à signer',      body: "Votre contrat d'installation IRVE est prêt. Signez-le pour démarrer les travaux.",     createdAt: new Date(Date.now() - 2*24*3600000).toISOString(), read: true  },
  { id: 'n5', type: 'job_update', title: 'Avancement chantier mis à jour',   body: "L'étape \"Raccordement\" vient d'être validée sur votre installation IRVE Wallbox.",   createdAt: new Date(Date.now() - 3*24*3600000).toISOString(), read: true  },
];

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ─── Lifecycle demandes ───────────────────────────────────────────────────────
type DemandeStage = 'en_attente' | 'validation' | 'propositions' | 'a_signer' | 'a_payer' | 'en_chantier' | 'termine';
const STAGE_STEPS: DemandeStage[] = ['en_attente','validation','propositions','a_signer','a_payer','en_chantier','termine'];
const STAGE_CFG: Record<DemandeStage, { label: string; color: string; bg: string }> = {
  en_attente:   { label: 'En attente',   color: '#9CA3AF', bg: '#F9FAFB' },
  validation:   { label: 'Validation',   color: '#D97706', bg: '#FFFBEB' },
  propositions: { label: 'Devis reçus',  color: '#3B82F6', bg: '#EFF6FF' },
  a_signer:     { label: 'À signer',     color: '#8B5CF6', bg: '#F5F3FF' },
  a_payer:      { label: 'À payer',      color: '#E87D50', bg: '#FFF5F0' },
  en_chantier:  { label: 'En chantier',  color: '#4A7A5C', bg: '#EDF4F0' },
  termine:      { label: 'Terminé',      color: '#10B981', bg: '#ECFDF5' },
};
interface DemandeRiche {
  id: number; service: string; sousService: string;
  stage: DemandeStage; date: string; budget: string;
  devis: number; artisanAccepte?: string; montantAccepte?: string;
  chantierRef?: number; factureId?: string;
}

// ─── Chantiers ────────────────────────────────────────────────────────────────
type ChantierStatut = 'a_demarrer' | 'en_cours' | 'livre';

interface ChantierEnrichi {
  id: number; ref: string; service: string;
  titre: string; adresse: string;
  artisan: string; artisanRole: string;
  statut: ChantierStatut; progress: number;
  color: string; soft: string;
  nextStep: string; nextDate: string;
  startedAt?: string; deliveredAt?: string;
  checklist: { label: string; done: boolean; meta: string }[];
  photos: { label: string; tone: string; meta: string }[];
  docs: { id: string; title: string; meta: string; status: string }[];
}

const CHANTIER_STATUS_CONFIG: Record<ChantierStatut, { label: string; color: string; bg: string; text: string }> = {
  a_demarrer: { label: 'À démarrer', color: '#D97706', bg: '#FFFBEB', text: 'Le chantier est prêt. Le prestataire intervient au prochain créneau prévu.' },
  en_cours:   { label: 'En cours',   color: '#4A7A5C', bg: '#EDF4F0', text: 'Le chantier avance. Les prochaines étapes sont suivies avec le prestataire.' },
  livre:      { label: 'Livré',      color: '#6B7280', bg: '#F3F4F6', text: 'Le chantier est terminé. Les documents et garanties restent disponibles.' },
};

// ─── Factures ─────────────────────────────────────────────────────────────────
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

interface Invoice {
  id: string; number: string; status: InvoiceStatus;
  label: string; issuedAt: string;
  amountHT: number; tva: number; amountTTC: number;
  items: { label: string; qty: number; unitHT: number; tva: number }[];
  chantier: string;
}

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft:     { label: 'Brouillon', color: '#6B7280', bg: '#F9FAFB', dot: '#9CA3AF' },
  sent:      { label: 'À payer',   color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  overdue:   { label: 'En retard', color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444' },
  paid:      { label: 'Payée',     color: '#059669', bg: '#ECFDF5', dot: '#10B981' },
  cancelled: { label: 'Annulée',   color: '#9CA3AF', bg: '#F9FAFB', dot: '#D1D5DB' },
};

const INVOICE_FILTERS = [
  { id: 'toutes',    label: 'Toutes' },
  { id: 'sent',      label: 'À payer' },
  { id: 'overdue',   label: 'En retard' },
  { id: 'paid',      label: 'Payées' },
  { id: 'draft',     label: 'Brouillons' },
  { id: 'cancelled', label: 'Annulées' },
];

const initInvoices: Invoice[] = [
  {
    id: 'f1', number: 'FAC-2026-0042', status: 'sent',
    label: 'Installation borne Wallbox 7.4 kW', issuedAt: '18 avr. 2026',
    amountHT: 1333.33, tva: 20, amountTTC: 1600,
    items: [
      { label: 'Fourniture et pose borne Wallbox 7.4 kW', qty: 1, unitHT: 950, tva: 20 },
      { label: 'Câblage et tableau électrique', qty: 1, unitHT: 320, tva: 20 },
      { label: 'Mise en service et tests', qty: 1, unitHT: 63.33, tva: 20 },
    ],
    chantier: 'IRVE',
  },
  {
    id: 'f2', number: 'FAC-2026-0031', status: 'paid',
    label: 'Diagnostic électrique initial', issuedAt: '10 avr. 2026',
    amountHT: 125, tva: 20, amountTTC: 150,
    items: [
      { label: 'Diagnostic installation électrique', qty: 1, unitHT: 100, tva: 20 },
      { label: 'Rapport écrit', qty: 1, unitHT: 25, tva: 20 },
    ],
    chantier: 'IRVE',
  },
  {
    id: 'f3', number: 'FAC-2026-0018', status: 'overdue',
    label: 'Acompte rénovation salle de bain', issuedAt: '1 avr. 2026',
    amountHT: 2500, tva: 10, amountTTC: 2750,
    items: [
      { label: 'Acompte 30% — Rénovation salle de bain', qty: 1, unitHT: 2500, tva: 10 },
    ],
    chantier: 'Rénovation',
  },
  {
    id: 'f4', number: 'FAC-2026-0009', status: 'draft',
    label: 'Dressing sur-mesure', issuedAt: '28 mars 2026',
    amountHT: 3200, tva: 20, amountTTC: 3840,
    items: [
      { label: 'Conception et fabrication dressing sur-mesure', qty: 1, unitHT: 2800, tva: 20 },
      { label: 'Pose et installation', qty: 1, unitHT: 400, tva: 20 },
    ],
    chantier: 'Aménagement',
  },
];

function DashboardClient() {
  const [activePage, setActivePage] = useState('accueil');
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const [notif, setNotif] = useState<{ msg: string; type?: 'error' } | null>(null);
  const showNotif = (msg: string, type?: 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  };

  const client = {
    prenom: 'Marie',
    nom: 'Laurent',
    email: 'marie.laurent@email.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue des Lilas, 63000 Clermont-Ferrand',
    avatar: 'ML'
  };

  const [clientForm, setClientForm] = useState({
    prenom: 'Marie', nom: 'Laurent',
    email: 'marie.laurent@email.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue des Lilas, 63000 Clermont-Ferrand'
  });

  const [autoSign, setAutoSign] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [sigStyle, setSigStyle] = useState(0);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const [notifications, setNotifications] = useState(initClientNotifs);
  const [notifFilter, setNotifFilter] = useState('toutes');
  const handleMarkNotifRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const [invoices] = useState<Invoice[]>(initInvoices);
  const [invoiceFilter, setInvoiceFilter] = useState('toutes');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const [selectedChantier, setSelectedChantier] = useState<number | null>(null);
  const [chantierDocsOpen, setChantierDocsOpen] = useState(false);

  const [demandes] = React.useState<DemandeRiche[]>([
    { id: 1, service: 'Rénovation',       sousService: 'Rénovation salle de bain',      stage: 'en_chantier',  date: '2 mai 2026',   devis: 3, budget: '5 000 € - 15 000 €', artisanAccepte: 'Sophie Vidal',  montantAccepte: '8 500 €', chantierRef: 2 },
    { id: 2, service: 'Borne IRVE',        sousService: 'Wallbox 11kW',                  stage: 'propositions', date: '28 avr. 2026', devis: 2, budget: '1 000 € - 5 000 €' },
    { id: 3, service: 'Aménagement',       sousService: 'Dressing sur-mesure',           stage: 'termine',      date: '10 avr. 2026', devis: 1, budget: '1 000 € - 5 000 €', artisanAccepte: 'Pierre Morel', montantAccepte: '3 840 €', chantierRef: 4 },
    { id: 4, service: 'Aide à la personne',sousService: 'Adaptation salle de bain PMR',  stage: 'a_signer',     date: '15 mai 2026',  devis: 2, budget: '2 000 € - 8 000 €' },
  ]);

  // ── Avis modal ──
  const [showAvisModal, setShowAvisModal]   = React.useState(false);
  const [avisChantierTitle, setAvisChantierTitle] = React.useState('');
  const [avisNote, setAvisNote]             = React.useState(0);
  const [avisHover, setAvisHover]           = React.useState(0);
  const [avisComment, setAvisComment]       = React.useState('');
  const [avisSubmitted, setAvisSubmitted]   = React.useState(false);

  // ── RDV Booking modal ──
  const [showRdvModal, setShowRdvModal]     = React.useState(false);
  const [rdvSelectedDay, setRdvSelectedDay] = React.useState<number | null>(null);
  const [rdvSelectedSlot, setRdvSelectedSlot] = React.useState<string | null>(null);
  const [rdvSubject, setRdvSubject]         = React.useState('');
  const [rdvSuccess, setRdvSuccess]         = React.useState(false);
  const rdvDays = React.useMemo(() => {
    const days: Date[] = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i);
      if (d.getDay() !== 0) days.push(d);
    }
    return days;
  }, []);
  const RDV_SLOTS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'];

  const [artisans, setArtisans] = useState([
    { id: 1, nom: 'Marc Dupont',    metier: 'Électricien IRVE', note: 4.9, avis: 34, ville: 'Clermont-Ferrand', avatar: 'MD', montant: '1 450 €', montantNum: 1450, delai: '15 mai 2026', accepte: false, experience: '8 ans', garantie: '10 ans' },
    { id: 2, nom: 'Sophie Bernard', metier: 'Plombière',         note: 4.7, avis: 21, ville: 'Aubière',          avatar: 'SB', montant: '1 600 €', montantNum: 1600, delai: '18 mai 2026', accepte: false, experience: '5 ans', garantie: '5 ans'  },
    { id: 3, nom: 'Thierry Morel',  metier: 'Électricien',      note: 4.5, avis: 12, ville: 'Riom',             avatar: 'TM', montant: '1 380 €', montantNum: 1380, delai: '22 mai 2026', accepte: false, experience: '12 ans', garantie: '10 ans' },
  ]);

  const chantiers_detail: ChantierEnrichi[] = [
    {
      id: 1, ref: '#CH-IR-2026-0042', service: 'IRVE',
      titre: 'Installation borne Wallbox 7.4 kW',
      adresse: '12 rue des Lilas, 63000 Clermont-Ferrand',
      artisan: 'Marc Leroy', artisanRole: 'Technicien IRVE · Leroy Électricité',
      statut: 'en_cours', progress: 65,
      color: '#4A7A5C', soft: '#EDF4F0',
      nextStep: 'Mise en service', nextDate: 'Ven. 2 mai · 14h00',
      startedAt: '24 avr. 2026',
      checklist: [
        { label: 'Visite technique', done: true,  meta: 'Tableau vérifié' },
        { label: 'Passage câble',    done: true,  meta: '12 m posés' },
        { label: 'Pose borne',       done: true,  meta: 'Wallbox fixée' },
        { label: 'Raccordement',     done: false, meta: 'En cours' },
        { label: 'Mise en service',  done: false, meta: 'À venir' },
      ],
      photos: [
        { label: 'Tableau',    tone: '#2F6F55', meta: 'Avant' },
        { label: 'Câblage',    tone: '#4A7A5C', meta: 'Pendant' },
        { label: 'Borne posée',tone: '#5B9A73', meta: "Aujourd'hui" },
        { label: '+5 photos',  tone: '#1F3D34', meta: 'Album' },
      ],
      docs: [
        { id: 'd1', title: 'Devis installation borne',   meta: 'PDF · 1.8 Mo · signé',                    status: 'Signé' },
        { id: 'd2', title: 'Attestation Consuel',         meta: 'PDF · après mise en service',             status: 'À venir' },
        { id: 'd3', title: 'Garantie matériel Wallbox',   meta: 'PDF · disponible à la livraison',         status: 'À venir' },
      ],
    },
    {
      id: 2, ref: '#CH-TR-2026-0118', service: 'Rénovation',
      titre: 'Rénovation salle de bain',
      adresse: '12 rue des Lilas, 63000 Clermont-Ferrand',
      artisan: 'Sophie Vidal', artisanRole: 'Vidal Rénov · Coordination travaux',
      statut: 'en_cours', progress: 40,
      color: '#C47A3A', soft: '#FBF3EE',
      nextStep: 'Pose carrelage', nextDate: "Aujourd'hui · 09h00",
      startedAt: '15 avr. 2026',
      checklist: [
        { label: 'Protection des zones', done: true,  meta: 'Terminé' },
        { label: 'Dépose existant',       done: true,  meta: 'Évacué' },
        { label: 'Plomberie',             done: false, meta: 'Contrôle en cours' },
        { label: 'Carrelage',             done: false, meta: 'Prochaine étape' },
        { label: 'Finitions',             done: false, meta: 'À planifier' },
      ],
      photos: [
        { label: 'Avant',     tone: '#B8744A', meta: 'J-1' },
        { label: 'Dépose',    tone: '#8D6045', meta: 'Jour 1' },
        { label: 'Plomberie', tone: '#C99672', meta: 'Jour 3' },
        { label: '+7 photos', tone: '#5A3A28', meta: 'Album' },
      ],
      docs: [
        { id: 'd4', title: 'Devis travaux validé',   meta: 'PDF · 2.4 Mo · signé',        status: 'Signé' },
        { id: 'd5', title: 'Plan et croquis chantier',meta: 'PDF · version client',         status: 'Ajouté' },
        { id: 'd6', title: 'PV de réception',         meta: 'À signer à la livraison',      status: 'À venir' },
      ],
    },
    {
      id: 3, ref: '#CH-SAP-2026-0203', service: 'Services à domicile',
      titre: 'Travaux de bricolage à domicile',
      adresse: '4 rue Pascal, 63100 Clermont-Ferrand',
      artisan: 'Atelier Service Dom.', artisanRole: 'Prestataire SAP',
      statut: 'a_demarrer', progress: 0,
      color: '#C9A238', soft: '#FBF6E9',
      nextStep: 'Première intervention', nextDate: 'Lun. 5 mai · 10h00',
      checklist: [
        { label: 'Devis validé',      done: true,  meta: 'SAP confirmé' },
        { label: 'Créneau réservé',   done: true,  meta: '5 mai' },
        { label: 'Intervention',      done: false, meta: 'À démarrer' },
        { label: 'Compte rendu',      done: false, meta: 'Après passage' },
        { label: 'Justificatif fiscal',done: false, meta: 'Crédit impôt SAP' },
      ],
      photos: [
        { label: 'Demande',  tone: '#C29545', meta: 'Client' },
        { label: 'Zone',     tone: '#9D7A39', meta: 'Avant' },
        { label: 'À venir',  tone: '#E8D7A8', meta: 'Intervention' },
        { label: '0 photo',  tone: '#6B552A', meta: 'Album vide' },
      ],
      docs: [
        { id: 'd7', title: 'Devis prestation SAP',                meta: 'PDF · signé',                    status: 'Signé' },
        { id: 'd8', title: 'Attestation service à la personne',   meta: 'PDF · justificatif fiscal',       status: 'Disponible' },
        { id: 'd9', title: "Compte-rendu d'intervention",         meta: 'À compléter après passage',       status: 'À venir' },
      ],
    },
    {
      id: 4, ref: '#CH-TR-2026-0089', service: 'Travaux',
      titre: 'Peinture chambre enfant',
      adresse: '12 rue des Lilas, 63000 Clermont-Ferrand',
      artisan: 'Pierre Morel', artisanRole: 'Morel Bâtiment',
      statut: 'livre', progress: 100,
      color: '#6B7280', soft: '#F3F4F6',
      nextStep: 'Garantie active', nextDate: "jusqu'au 15 mars 2027",
      startedAt: '5 mars 2026', deliveredAt: '15 mars 2026',
      checklist: [
        { label: 'Préparation', done: true, meta: 'Terminé' },
        { label: 'Sous-couche', done: true, meta: 'Terminé' },
        { label: 'Peinture',    done: true, meta: 'Terminé' },
        { label: 'Nettoyage',   done: true, meta: 'Terminé' },
        { label: 'Livraison',   done: true, meta: '15 mars' },
      ],
      photos: [
        { label: 'Avant',    tone: '#8B7355', meta: 'Avant' },
        { label: 'Pendant',  tone: '#6E5A42', meta: 'Pendant' },
        { label: 'Après',    tone: '#A68B6A', meta: 'Livré' },
        { label: '+4 photos',tone: '#4A3828', meta: 'Album' },
      ],
      docs: [
        { id: 'd10', title: 'Devis peinture validé', meta: 'PDF · signé',                  status: 'Signé' },
        { id: 'd11', title: 'PV de réception',        meta: 'PDF · signé le 15 mars',       status: 'Signé' },
        { id: 'd12', title: 'Facture finale',          meta: 'PDF · disponible',             status: 'Disponible' },
      ],
    },
  ];

  const documents = [
    { id: 1, nom: 'Contrat installation IRVE', type: 'Contrat', taille: '2.1 Mo', date: '18 avr. 2026', signe: true, chantier: 'IRVE' },
    { id: 2, nom: 'Devis initial borne Wallbox', type: 'Devis', taille: '450 Ko', date: '14 avr. 2026', signe: false, chantier: 'IRVE' },
    { id: 3, nom: 'Devis travaux rénovation', type: 'Devis', taille: '1.8 Mo', date: '10 avr. 2026', signe: false, chantier: 'Rénovation' },
    { id: 4, nom: 'Facture acompte borne', type: 'Facture', taille: '380 Ko', date: '16 avr. 2026', signe: true, chantier: 'IRVE' }
  ];

  const [agenda, setAgenda] = useState([
    { id: 1, heure: '14:00', titre: 'Mise en service de la borne', artisan: 'Marc Leroy', duree: '2h', statut: 'confirme', date: 'Ven. 2 mai' },
    { id: 2, heure: '09:00', titre: 'Vérification tableau électrique', artisan: 'Marc Leroy', duree: '1h', statut: 'a_confirmer', date: 'Lun. 5 mai' }
  ]);

  const [conversations, setConversations] = useState([
    {
      id: 1, nom: 'Marc Dupont', avatar: 'MD', lu: false,
      metier: 'Électricien IRVE', note: 4.9, service: 'Borne IRVE',
      messages: [
        { id: 1, texte: "Bonjour, je suis disponible le 15 mai pour l'installation.", de: 'eux', heure: '10:28', date: "Aujourd'hui" },
        { id: 2, texte: "Pouvez-vous confirmer l'adresse exacte ?", de: 'eux', heure: '10:32', date: "Aujourd'hui" },
      ]
    },
    {
      id: 2, nom: 'Sophie Bernard', avatar: 'SB', lu: true,
      metier: 'Plombière', note: 4.7, service: 'Rénovation salle de bain',
      messages: [
        { id: 1, texte: 'Voici mon devis détaillé pour votre salle de bain.', de: 'eux', heure: '14:10', date: 'Hier' },
        { id: 2, texte: 'Merci Sophie, je regarde ça et reviens vers vous.', de: 'moi', heure: '14:45', date: 'Hier' },
        { id: 3, texte: "Bien sûr ! N'hésitez pas si vous avez des questions.", de: 'eux', heure: '15:02', date: 'Hier' },
      ]
    }
  ]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [draft, setDraft] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [quoteCompareMode, setQuoteCompareMode] = useState(false);
  const [helpOpenIdx, setHelpOpenIdx] = useState<number | null>(null);
  const [notifSettings, setNotifSettings] = useState({
    nouveau_devis:       { email: true,  push: true  },
    message_recu:        { email: true,  push: true  },
    rappel_rdv:          { email: true,  push: true  },
    chantier_avancement: { email: false, push: true  },
    facture:             { email: true,  push: true  },
    validation:          { email: true,  push: false },
  });

  const handleDraftChange = (val: string) => {
    setDraft(val);
    if (!isTyping) setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const sendMessage = () => {
    if (!draft.trim() || selectedConv === null) return;
    const now = new Date();
    const heure = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setConversations(prev => prev.map(c =>
      c.id === selectedConv
        ? { ...c, lu: true, messages: [...c.messages, { id: Date.now(), texte: draft, de: 'moi', heure, date: "Aujourd'hui" }] }
        : c
    ));
    setDraft('');
    setIsTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedConv]);

  const convActive = conversations.find(c => c.id === selectedConv);
  const filteredConvs = conversations.filter(c =>
    c.nom.toLowerCase().includes(convSearch.toLowerCase()) ||
    c.metier?.toLowerCase().includes(convSearch.toLowerCase())
  );

  /* ── Handlers devis ── */
  const handleAccepterDevis = (artisanId: number) => {
    const artisan = artisans.find(a => a.id === artisanId);
    setArtisans(prev => prev.map(a => ({ ...a, accepte: a.id === artisanId })));
    showNotif(`Devis de ${artisan?.nom} accepté ✓ — vous recevrez une confirmation`);
  };

  /* ── Handlers documents ── */
  const handleTelechargement = (nomDoc: string) => {
    showNotif(`Téléchargement de "${nomDoc}"...`);
  };

  /* ── Handlers agenda ── */
  const handleConfirmerRdv = (rdvId: number) => {
    setAgenda(prev => prev.map(ev => ev.id === rdvId ? { ...ev, statut: 'confirme' } : ev));
    showNotif('Rendez-vous confirmé ✓');
  };

  const handleAnnulerRdv = (rdvId: number) => {
    setAgenda(prev => prev.filter(ev => ev.id !== rdvId));
    showNotif('Rendez-vous annulé', 'error');
  };

  /* ── Handler profil ── */
  const handleSauvegarderProfil = () => {
    showNotif('Profil sauvegardé avec succès ✓');
  };

  const serviceIcon = (service: string) => {
    if (service === 'Borne IRVE') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    if (service === 'Rénovation') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  };

  const statutConfig = {
    en_cours: { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF' },
    devis_recu: { label: 'Devis reçus', color: '#E87D50', bg: '#FFF5F2' },
    termine: { label: 'Terminé', color: '#10B981', bg: '#ECFDF5' }
  };

  const filteredNotifs = notifFilter === 'toutes'
    ? notifications
    : notifFilter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === (notifFilter as NotifType));

  const filteredInvoices = invoiceFilter === 'toutes'
    ? invoices
    : invoices.filter(f => f.status === (invoiceFilter as InvoiceStatus));
  const totalDue = invoices
    .filter(f => f.status === 'sent' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.amountTTC, 0);
  const invoiceDetail = invoices.find(f => f.id === selectedInvoice) ?? null;

  const navItems = [
    { id: 'accueil',   label: 'Mon espace' },
    { id: 'demandes',  label: 'Demandes',  badge: demandes.filter(d => d.stage !== 'termine').length },
    { id: 'devis',     label: 'Devis',     badge: artisans.filter(a => !a.accepte).length },
    { id: 'factures',  label: 'Factures',  badge: invoices.filter(f => f.status === 'sent' || f.status === 'overdue').length },
    { id: 'chantiers', label: 'Chantiers' },
    { id: 'documents', label: 'Documents' },
    { id: 'messages',  label: 'Messages',  badge: conversations.filter(c => !c.lu).length },
    { id: 'agenda',    label: 'Agenda',    badge: agenda.filter(e => e.statut === 'a_confirmer').length },
  ];

  return (
    <div className="dashboard-client-layout">

      {/* NAVBAR */}
      <header className="client-navbar">
        <div className="client-navbar-inner">
          <Link to="/" className="client-logo">
            <span className="client-logo-name">BATINNOV</span>
            <span className="client-logo-tag">CLIENT</span>
          </Link>

          <nav className={`client-nav ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`client-nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => { setActivePage(item.id); setMenuOpen(false); }}
              >
                <span>{item.label}</span>
                {item.badge > 0 && <span className="client-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="client-navbar-right">
            <Link to="/devis" className="btn-nouvelle-demande">+ Nouvelle demande</Link>
            <button className="client-notif-bell" onClick={() => setActivePage('notifications')} title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="client-notif-badge">{notifications.filter(n => !n.read).length}</span>
              )}
            </button>
            <button className="client-avatar-btn" onClick={() => setActivePage('profil')}>
              <div className="client-avatar">{client.avatar}</div>
              <span>{client.prenom}</span>
            </button>
            <button className="mobile-burger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {notif && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: notif.type === 'error' ? '#DC2626' : '#111827',
          color: '#fff', padding: '12px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 500, display: 'flex', gap: 12,
          alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 1000, maxWidth: 360
        }}>
          <span>{notif.msg}</span>
          <button onClick={() => setNotif(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <main className="client-main">
        <div className="container">

          {/* ===== ACCUEIL ===== */}
          {activePage === 'accueil' && (
            <div className="client-page">
              <div className="welcome-banner">
                <div className="welcome-text">
                  <h1>Bonjour {client.prenom}</h1>
                  <p>Retrouvez ici toutes vos demandes, devis et messages.</p>
                </div>
                <Link to="/devis" className="btn-primary-green">+ Nouvelle demande</Link>
              </div>

              <div className="client-stats">
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('demandes')}>
                  <span className="client-stat-num">{demandes.length}</span>
                  <span className="client-stat-label">Demandes</span>
                </div>
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('devis')}>
                  <span className="client-stat-num">{artisans.length}</span>
                  <span className="client-stat-label">Devis reçus</span>
                </div>
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('messages')}>
                  <span className="client-stat-num">{conversations.filter(c => !c.lu).length}</span>
                  <span className="client-stat-label">Messages non lus</span>
                </div>
                <div className="client-stat" style={{ cursor: 'pointer' }} onClick={() => setActivePage('chantiers')}>
                  <span className="client-stat-num">{demandes.filter(d => d.stage === 'termine').length}</span>
                  <span className="client-stat-label">Travaux terminés</span>
                </div>
              </div>

              <div className="client-section">
                <div className="section-head">
                  <h2>Mes dernières demandes</h2>
                  <button className="btn-voir-tout" onClick={() => setActivePage('demandes')}>Voir tout →</button>
                </div>
                <div className="demandes-list">
                  {demandes.slice(0, 2).map(d => {
                    const sc = STAGE_CFG[d.stage];
                    return (
                      <div key={d.id} className="demande-card" style={{ cursor: 'pointer' }} onClick={() => setActivePage('demandes')}>
                        <div className="demande-icon">{serviceIcon(d.service)}</div>
                        <div className="demande-info">
                          <strong>{d.sousService}</strong>
                          <span>{d.service} · {d.date}</span>
                          <span>Budget : {d.budget}</span>
                        </div>
                        <div className="demande-right">
                          <span className="statut-pill" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                          {d.devis > 0 && <span className="devis-count">{d.devis} devis reçu{d.devis > 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="client-section">
                <h2>Besoin d'un autre service ?</h2>
                <div className="services-quick-grid">
                  {([
                    { id: 'renovation', label: 'Rénovation', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                    { id: 'courtage', label: 'Courtage', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
                    { id: 'services-maison', label: 'Services à domicile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
                    { id: 'irve', label: 'Borne IRVE', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
                  ] as { id: string; label: string; icon: React.ReactNode }[]).map(s => (
                    <Link key={s.id} to={`/services/${s.id}`} className="quick-service-btn">
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== DEMANDES ===== */}
          {activePage === 'demandes' && (
            <div className="client-page">
              <div className="section-head">
                <h1>Mes demandes</h1>
                <Link to="/devis" className="btn-primary-green">+ Nouvelle demande</Link>
              </div>

              {/* Résumé rapide */}
              <div className="demande-summary-strip">
                {(['propositions','a_signer','a_payer'] as DemandeStage[]).map(s => {
                  const count = demandes.filter(d => d.stage === s).length;
                  if (!count) return null;
                  const sc = STAGE_CFG[s];
                  return (
                    <div key={s} className="demande-summary-pill" style={{ background: sc.bg, color: sc.color }}>
                      <strong>{count}</strong> {sc.label}
                    </div>
                  );
                })}
              </div>

              <div className="demandes-full-list">
                {demandes.map(d => {
                  const sc = STAGE_CFG[d.stage];
                  const currentStep = STAGE_STEPS.indexOf(d.stage);
                  return (
                    <div key={d.id} className="demande-riche-card">
                      {/* En-tête */}
                      <div className="demande-riche-header">
                        <div className="demande-riche-icon">{serviceIcon(d.service)}</div>
                        <div className="demande-riche-info">
                          <strong>{d.sousService}</strong>
                          <span>{d.service} · Demandé le {d.date} · Budget {d.budget}</span>
                        </div>
                        <span className="statut-pill" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                      </div>

                      {/* Stepper lifecycle */}
                      <div className="demande-stepper">
                        {STAGE_STEPS.map((s, i) => {
                          const done    = i < currentStep;
                          const active  = i === currentStep;
                          const scStep  = STAGE_CFG[s];
                          return (
                            <React.Fragment key={s}>
                              <div className={`demande-step-item ${done ? 'done' : active ? 'active' : ''}`}>
                                <div className="demande-step-dot" style={{
                                  background: done ? '#4A7A5C' : active ? scStep.color : '#E5E7EB',
                                  borderColor: done ? '#4A7A5C' : active ? scStep.color : '#E5E7EB'
                                }}>
                                  {done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <span className="demande-step-label" style={{ color: done ? '#4A7A5C' : active ? scStep.color : '#9CA3AF', fontWeight: active ? 700 : 500 }}>
                                  {scStep.label}
                                </span>
                              </div>
                              {i < STAGE_STEPS.length - 1 && (
                                <div className="demande-step-line" style={{ background: i < currentStep ? '#4A7A5C' : '#E5E7EB' }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Artisan accepté (si applicable) */}
                      {d.artisanAccepte && (
                        <div className="demande-artisan-row">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4A7A5C" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span>Artisan : <strong>{d.artisanAccepte}</strong></span>
                          {d.montantAccepte && <span className="demande-artisan-montant">{d.montantAccepte}</span>}
                        </div>
                      )}

                      {/* CTA contextuel */}
                      <div className="demande-cta-row">
                        {d.stage === 'propositions' && (
                          <button className="demande-cta-btn" style={{ background: '#3B82F6' }} onClick={() => setActivePage('devis')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Comparer les {d.devis} devis
                          </button>
                        )}
                        {d.stage === 'a_signer' && (
                          <button className="demande-cta-btn" style={{ background: '#8B5CF6' }} onClick={() => showNotif('Redirection vers la signature électronique...')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Signer le contrat
                          </button>
                        )}
                        {d.stage === 'a_payer' && (
                          <button className="demande-cta-btn" style={{ background: '#E87D50' }} onClick={() => setActivePage('factures')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            Payer la facture
                          </button>
                        )}
                        {d.stage === 'en_chantier' && d.chantierRef && (
                          <button className="demande-cta-btn" style={{ background: '#4A7A5C' }} onClick={() => { setActivePage('chantiers'); setSelectedChantier(d.chantierRef!); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                            Suivre le chantier
                          </button>
                        )}
                        {d.stage === 'termine' && d.chantierRef && (
                          <button className="demande-cta-btn" style={{ background: '#10B981' }} onClick={() => { setActivePage('chantiers'); setSelectedChantier(d.chantierRef!); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            Laisser un avis
                          </button>
                        )}
                        <button className="demande-cta-ghost" onClick={() => setActivePage('messages')}>
                          Contacter l'artisan →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== DEVIS ===== */}
          {activePage === 'devis' && (
            <div className="client-page">
              <div className="devis-page-header">
                <div>
                  <h1>Mes devis reçus</h1>
                  <p className="page-subtitle">Comparez les propositions de nos artisans</p>
                </div>
                <button className={`devis-view-toggle ${quoteCompareMode ? 'active' : ''}`} onClick={() => setQuoteCompareMode(v => !v)}>
                  {quoteCompareMode ? '≡ Vue liste' : '⊞ Comparer'}
                </button>
              </div>

              {/* ── Vue liste (défaut) ── */}
              {!quoteCompareMode && (
                <div className="devis-list">
                  {artisans.map(a => (
                    <div key={a.id} className={`devis-card ${a.accepte ? 'accepte' : ''}`}>
                      <div className="devis-artisan">
                        <div className="artisan-avatar">{a.avatar}</div>
                        <div className="artisan-info">
                          <strong>{a.nom}</strong>
                          <span>{a.metier} · {a.ville}</span>
                          <div className="artisan-note">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {a.note} ({a.avis} avis)
                          </div>
                        </div>
                        {a.accepte && (
                          <span style={{ marginLeft: 'auto', background: '#ECFDF5', color: '#10B981', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                            ✓ Accepté
                          </span>
                        )}
                      </div>
                      <div className="devis-details">
                        <div className="devis-montant">
                          <span>Montant proposé</span>
                          <strong>{a.montant}</strong>
                        </div>
                        <div className="devis-delai">
                          <span>Disponible le</span>
                          <strong>{a.delai}</strong>
                        </div>
                      </div>
                      <div className="devis-actions">
                        <button
                          className="btn-accepter"
                          onClick={() => handleAccepterDevis(a.id)}
                          disabled={a.accepte || artisans.some(x => x.accepte)}
                          style={{ opacity: (a.accepte || artisans.some(x => x.accepte && x.id !== a.id)) ? 0.4 : 1, cursor: (a.accepte || artisans.some(x => x.accepte && x.id !== a.id)) ? 'not-allowed' : 'pointer' }}
                        >
                          {a.accepte ? 'Devis accepté ✓' : 'Accepter ce devis'}
                        </button>
                        <button className="btn-contacter" onClick={() => setActivePage('messages')}>Contacter →</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Vue comparaison ── */}
              {quoteCompareMode && (() => {
                const cheapest = Math.min(...artisans.map(a => a.montantNum));
                const bestNote = Math.max(...artisans.map(a => a.note));
                const earliestDelai = artisans.reduce((best, a) => a.delai < best.delai ? a : best, artisans[0]).delai;
                return (
                  <div className="quote-compare-wrap">
                    <div className="quote-compare-table" style={{ ['--qc-cols' as string]: `120px repeat(${artisans.length}, 1fr)` }}>
                      {/* HEADER */}
                      <div className="qc-row qc-head">
                        <div className="qc-label" />
                        {artisans.map(a => (
                          <div key={a.id} className={`qc-col-head ${a.accepte ? 'accepte' : ''}`}>
                            <div className="qc-avatar">{a.avatar}</div>
                            <strong>{a.nom}</strong>
                            <span>{a.metier}</span>
                            {a.accepte && <span className="qc-accepted-tag">✓ Accepté</span>}
                          </div>
                        ))}
                      </div>
                      {/* MONTANT */}
                      <div className="qc-row">
                        <div className="qc-label">Montant</div>
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell">
                            <strong className={a.montantNum === cheapest ? 'qc-best' : ''}>{a.montant}</strong>
                            {a.montantNum === cheapest && <span className="qc-badge green">Le moins cher</span>}
                          </div>
                        ))}
                      </div>
                      {/* DISPONIBILITÉ */}
                      <div className="qc-row">
                        <div className="qc-label">Disponible le</div>
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell">
                            <strong className={a.delai === earliestDelai ? 'qc-best' : ''}>{a.delai}</strong>
                            {a.delai === earliestDelai && <span className="qc-badge blue">Le plus rapide</span>}
                          </div>
                        ))}
                      </div>
                      {/* NOTE */}
                      <div className="qc-row">
                        <div className="qc-label">Note</div>
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell">
                            <strong className={a.note === bestNote ? 'qc-best' : ''}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1" style={{ verticalAlign: 'middle', marginRight: 3 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              {a.note} ({a.avis} avis)
                            </strong>
                            {a.note === bestNote && <span className="qc-badge yellow">Meilleure note</span>}
                          </div>
                        ))}
                      </div>
                      {/* EXPÉRIENCE */}
                      <div className="qc-row">
                        <div className="qc-label">Expérience</div>
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell"><strong>{a.experience}</strong></div>
                        ))}
                      </div>
                      {/* GARANTIE */}
                      <div className="qc-row">
                        <div className="qc-label">Garantie</div>
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell"><strong>{a.garantie}</strong></div>
                        ))}
                      </div>
                      {/* VILLE */}
                      <div className="qc-row">
                        <div className="qc-label">Ville</div>
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell"><span>{a.ville}</span></div>
                        ))}
                      </div>
                      {/* ACTIONS */}
                      <div className="qc-row qc-actions-row">
                        <div className="qc-label" />
                        {artisans.map(a => (
                          <div key={a.id} className="qc-cell qc-action-cell">
                            <button
                              className="btn-accepter"
                              onClick={() => handleAccepterDevis(a.id)}
                              disabled={a.accepte || artisans.some(x => x.accepte)}
                              style={{ fontSize: 12, padding: '8px 14px', opacity: (a.accepte || artisans.some(x => x.accepte && x.id !== a.id)) ? 0.4 : 1 }}
                            >
                              {a.accepte ? '✓ Accepté' : 'Choisir'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===== CHANTIERS ===== */}
          {activePage === 'chantiers' && (
            <div className="client-page">
              <div className="section-head">
                <h1>Mes chantiers</h1>
                {selectedChantier !== null && (
                  <button className="btn-voir-tout" onClick={() => { setSelectedChantier(null); setChantierDocsOpen(false); }}>
                    ← Retour à la liste
                  </button>
                )}
              </div>

              {selectedChantier === null ? (
                <div className="chantier-grid">
                  {chantiers_detail.map(ch => {
                    const sc = CHANTIER_STATUS_CONFIG[ch.statut];
                    const doneCount = ch.checklist.filter(s => s.done).length;
                    return (
                      <div key={ch.id} className="chantier-card-new" onClick={() => { setSelectedChantier(ch.id); setChantierDocsOpen(false); }}>
                        <div className="chantier-card-header">
                          <div className="chantier-service-icon" style={{ background: ch.color + '22', color: ch.color }}>
                            {ch.service === 'IRVE'
                              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                              : ch.service === 'Rénovation'
                                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                : ch.service === 'Travaux'
                                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            }
                          </div>
                          <div className="chantier-card-head-info">
                            <div className="chantier-card-ref">{ch.service} · {ch.ref}</div>
                            <div className="chantier-card-titre">{ch.titre}</div>
                            <div className="chantier-card-addr">{ch.adresse}</div>
                          </div>
                          <div className="chantier-status-pill" style={{ color: sc.color, background: sc.bg }}>{sc.label}</div>
                        </div>

                        <div className="chantier-progress-row">
                          <span className="chantier-pct" style={{ color: ch.color }}>{ch.progress}%</span>
                          <div className="chantier-bar-track-new">
                            <div className="chantier-bar-fill-new" style={{ width: `${ch.progress}%`, background: ch.color }} />
                          </div>
                          <span className="chantier-steps-count">{doneCount}/{ch.checklist.length} étapes</span>
                        </div>

                        <div className="chantier-card-footer-new">
                          <div className="chantier-footer-tile">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ch.color} strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <div>
                              <span>{ch.nextStep}</span>
                              <small>{ch.nextDate}</small>
                            </div>
                          </div>
                          <div className="chantier-footer-tile">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <div>
                              <span>{ch.artisan}</span>
                              <small>{ch.artisanRole.split(' · ')[1] ?? ch.artisanRole}</small>
                            </div>
                          </div>
                        </div>

                        <button className="chantier-voir-btn" style={{ color: ch.color, borderColor: ch.color + '40', background: ch.color + '08' }}>
                          Voir le suivi →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                (() => {
                  const ch = chantiers_detail.find(c => c.id === selectedChantier);
                  if (!ch) return null;
                  const sc = CHANTIER_STATUS_CONFIG[ch.statut];
                  return (
                    <div className="chantier-detail-layout">

                      {/* ── Dark hero ── */}
                      <div className="chantier-dark-hero">
                        <div className="chantier-hero-icon-box" style={{ background: ch.color }}>
                          {ch.service === 'IRVE'
                            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            : ch.service === 'Rénovation'
                              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                          }
                        </div>
                        <div className="chantier-hero-info">
                          <div className="chantier-hero-ref" style={{ color: ch.color }}>{ch.ref}</div>
                          <h2 className="chantier-hero-title">{ch.titre}</h2>
                          <p className="chantier-hero-addr">{ch.adresse}</p>
                        </div>
                        <div className="chantier-hero-pct-col">
                          <div className="chantier-hero-pct">{ch.progress}%</div>
                          <div className="chantier-hero-bar-track">
                            <div className="chantier-hero-bar-fill" style={{ width: `${ch.progress}%`, background: ch.color }} />
                          </div>
                          <div className="chantier-hero-pct-label">d'avancement</div>
                        </div>
                      </div>

                      {/* ── Info tiles ── */}
                      <div className="chantier-info-tiles">
                        <div className="chantier-info-tile">
                          <div className="chantier-tile-icon" style={{ background: ch.color + '18', color: ch.color }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </div>
                          <div className="chantier-tile-label">Prochaine étape</div>
                          <div className="chantier-tile-value">{ch.nextStep}</div>
                          <div className="chantier-tile-sub">{ch.nextDate}</div>
                        </div>
                        <div className="chantier-info-tile">
                          <div className="chantier-tile-icon" style={{ background: ch.color + '18', color: ch.color }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </div>
                          <div className="chantier-tile-label">Prestataire</div>
                          <div className="chantier-tile-value">{ch.artisan}</div>
                          <div className="chantier-tile-sub">{ch.artisanRole}</div>
                        </div>
                        {ch.startedAt && (
                          <div className="chantier-info-tile">
                            <div className="chantier-tile-icon" style={{ background: ch.color + '18', color: ch.color }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <div className="chantier-tile-label">Démarré le</div>
                            <div className="chantier-tile-value">{ch.startedAt}</div>
                            {ch.deliveredAt && <div className="chantier-tile-sub">Livré le {ch.deliveredAt}</div>}
                          </div>
                        )}
                      </div>

                      {/* ── Status block ── */}
                      <div className="chantier-status-block" style={{ background: ch.soft, borderColor: ch.color + '35' }}>
                        <div className="chantier-status-block-icon" style={{ background: ch.color }}>
                          {ch.statut === 'livre'
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          }
                        </div>
                        <div>
                          <div className="chantier-status-block-label" style={{ color: sc.color }}>{sc.label}</div>
                          <div className="chantier-status-block-text">{sc.text}</div>
                        </div>
                      </div>

                      {/* ── Checklist ── */}
                      <div className="chantier-section-label">Étapes terrain</div>
                      <div className="chantier-checklist-card">
                        {ch.checklist.map((step, i) => (
                          <div key={i} className={`chantier-step-row ${step.done ? 'done' : ''}`} style={{ borderBottom: i < ch.checklist.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                            <div className="chantier-step-icon" style={{ background: step.done ? ch.color : '#F3F4F6', color: step.done ? '#fff' : '#9CA3AF' }}>
                              {step.done
                                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              }
                            </div>
                            <div className="chantier-step-content">
                              <div className="chantier-step-label">{step.label}</div>
                              <div className="chantier-step-meta">{step.meta}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── Photos ── */}
                      <div className="chantier-section-row">
                        <div className="chantier-section-label" style={{ marginBottom: 0 }}>Photos chantier</div>
                        <button className="chantier-add-photo-btn" style={{ color: ch.color }} onClick={() => showNotif('Ajout de photos — bientôt disponible')}>
                          + Ajouter
                        </button>
                      </div>
                      <div className="chantier-photo-grid">
                        {ch.photos.map((photo, i) => (
                          <div key={i} className="chantier-photo-tile" style={{ background: `linear-gradient(140deg, ${photo.tone} 0%, #1A2B25 100%)` }}>
                            <div className="chantier-photo-overlay" />
                            <div className="chantier-photo-caption">
                              <div>{photo.label}</div>
                              <small>{photo.meta}</small>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── Documents ── */}
                      <div className="chantier-docs-section">
                        <button className="chantier-docs-toggle" onClick={() => setChantierDocsOpen(v => !v)}>
                          <div className="chantier-docs-toggle-chevron" style={{ background: ch.color + '16', color: ch.color, transform: chantierDocsOpen ? 'rotate(180deg)' : 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                          <div className="chantier-docs-toggle-info">
                            <div className="chantier-docs-toggle-title" style={{ color: ch.color }}>Documents du chantier</div>
                            <div className="chantier-docs-toggle-count">{ch.docs.length} fichiers liés à ce chantier</div>
                          </div>
                          <div className="chantier-docs-open-pill" style={{ color: ch.color, background: ch.color + '14' }}>
                            {chantierDocsOpen ? 'Ouvert' : 'Voir'}
                          </div>
                        </button>
                        {chantierDocsOpen && (
                          <div className="chantier-docs-list">
                            {ch.docs.map((doc, i) => (
                              <button key={doc.id} className="chantier-doc-row" style={{ borderBottom: i < ch.docs.length - 1 ? '1px solid #F3F4F6' : 'none' }} onClick={() => showNotif(`Téléchargement : ${doc.title}`)}>
                                <div className="chantier-doc-icon" style={{ background: ch.color + '12', color: ch.color }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div className="chantier-doc-info">
                                  <strong>{doc.title}</strong>
                                  <span>{doc.meta}</span>
                                </div>
                                <div className="chantier-doc-status-pill" style={{ color: ch.color, background: ch.color + '12' }}>
                                  {doc.status}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── CTA ── */}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {ch.statut === 'livre' ? (
                          <button className="chantier-cta-btn" style={{ background: ch.color }} onClick={() => {
                            setAvisChantierTitle(ch.titre);
                            setAvisNote(0); setAvisHover(0); setAvisComment(''); setAvisSubmitted(false);
                            setShowAvisModal(true);
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            Laisser un avis
                          </button>
                        ) : (
                          <button className="chantier-cta-btn" style={{ background: ch.color }} onClick={() => {
                            setRdvSelectedDay(null); setRdvSelectedSlot(null);
                            setRdvSubject(''); setRdvSuccess(false);
                            setShowRdvModal(true);
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Prendre un RDV
                          </button>
                        )}
                        <button className="chantier-cta-ghost" onClick={() => setActivePage('messages')}>
                          Contacter l'artisan →
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* ===== DOCUMENTS ===== */}
          {activePage === 'documents' && (
            <div className="client-page">
              <h1>Documents</h1>
              <div className="documents-list">
                {documents.map(doc => (
                  <div key={doc.id} className="document-row">
                    <div className="doc-icon">
                      {doc.type === 'Contrat'
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        : doc.type === 'Devis'
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      }
                    </div>
                    <div className="doc-info">
                      <strong>{doc.nom}</strong>
                      <span>{doc.type} · {doc.chantier} · {doc.date}</span>
                    </div>
                    <div className="doc-meta">
                      <span className="doc-taille">{doc.taille}</span>
                      {doc.signe && <span className="doc-signe-badge">Signé</span>}
                    </div>
                    <button className="btn-dl-doc" onClick={() => handleTelechargement(doc.nom)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== AGENDA ===== */}
          {activePage === 'agenda' && (
            <div className="client-page">
              <div className="section-head">
                <h1>Agenda</h1>
                <button className="btn-primary-green" onClick={() => {
                  setRdvSelectedDay(null); setRdvSelectedSlot(null);
                  setRdvSubject(''); setRdvSuccess(false);
                  setShowRdvModal(true);
                }}>
                  + Prendre un RDV
                </button>
              </div>
              <div className="agenda-list">
                {agenda.map(ev => (
                  <div key={ev.id} className="agenda-card">
                    <div className="agenda-date-block">
                      <span className="agenda-date">{ev.date}</span>
                      <strong className="agenda-heure">{ev.heure}</strong>
                    </div>
                    <div className="agenda-info">
                      <strong>{ev.titre}</strong>
                      <span>Avec {ev.artisan} · Durée : {ev.duree}</span>
                    </div>
                    <span
                      className="agenda-statut"
                      style={{
                        background: ev.statut === 'confirme' ? '#ECFDF5' : '#FFF5F2',
                        color: ev.statut === 'confirme' ? '#10B981' : '#E87D50'
                      }}
                    >
                      {ev.statut === 'confirme' ? 'Confirmé' : 'À confirmer'}
                    </span>
                    {ev.statut === 'a_confirmer' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleConfirmerRdv(ev.id)}
                          style={{ padding: '6px 14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => handleAnnulerRdv(ev.id)}
                          style={{ padding: '6px 14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {agenda.length === 0 && (
                  <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>Aucun rendez-vous à venir</p>
                )}
              </div>
            </div>
          )}

          {/* ===== MESSAGES ===== */}
          {activePage === 'messages' && (
            <div className="client-page">
              <div className="chat-layout">

                {/* ── SIDEBAR ── */}
                <div className="chat-sidebar">
                  <div className="chat-sidebar-head">
                    <span>Messages <strong>{conversations.filter(c => !c.lu).length > 0 ? `(${conversations.filter(c => !c.lu).length} non lu)` : ''}</strong></span>
                  </div>
                  <div className="chat-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      className="chat-search"
                      placeholder="Rechercher..."
                      value={convSearch}
                      onChange={e => setConvSearch(e.target.value)}
                    />
                  </div>
                  {filteredConvs.map(conv => (
                    <button
                      key={conv.id}
                      className={`chat-conv-item ${selectedConv === conv.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedConv(conv.id);
                        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, lu: true } : c));
                      }}
                    >
                      <div className="chat-conv-avatar" style={{ position: 'relative' }}>
                        {conv.avatar}
                        {!conv.lu && <span className="chat-avatar-dot" />}
                      </div>
                      <div className="chat-conv-info">
                        <div className="chat-conv-name">
                          <strong>{conv.nom}</strong>
                          <span className="chat-conv-time">{conv.messages.at(-1)?.heure}</span>
                        </div>
                        <span className="chat-conv-meta">{conv.metier}</span>
                        <span className={`chat-conv-preview ${!conv.lu ? 'unread' : ''}`}>
                          {conv.messages.at(-1)?.de === 'moi' ? 'Vous : ' : ''}{conv.messages.at(-1)?.texte}
                        </span>
                      </div>
                    </button>
                  ))}
                  {filteredConvs.length === 0 && (
                    <p style={{ fontSize: 13, color: '#9CA3AF', padding: '20px 18px' }}>Aucune conversation trouvée</p>
                  )}
                </div>

                {/* ── FENETRE ── */}
                <div className="chat-window">
                  {!convActive ? (
                    <div className="chat-empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <p>Sélectionnez une conversation</p>
                      <span style={{ fontSize: 12, color: '#D1D5DB' }}>Vos échanges avec les artisans apparaissent ici</span>
                    </div>
                  ) : (
                    <>
                      {/* HEADER enrichi */}
                      <div className="chat-header">
                        <div className="chat-conv-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>{convActive.avatar}</div>
                        <div className="chat-header-info">
                          <strong>{convActive.nom}</strong>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {convActive.metier} ·
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {convActive.note} · {convActive.service}
                          </span>
                        </div>
                        <button
                          className="chat-header-action"
                          onClick={() => setActivePage('devis')}
                        >
                          Voir son devis →
                        </button>
                      </div>

                      {/* MESSAGES avec séparateurs de date */}
                      <div className="chat-messages">
                        {(() => {
                          let lastDate = '';
                          const msgs = convActive.messages;
                          return msgs.map((msg, idx) => {
                            const showDate = msg.date !== lastDate;
                            lastDate = msg.date;
                            const isLastSent = msg.de === 'moi' && idx === msgs.length - 1;
                            return (
                              <div key={msg.id}>
                                {showDate && (
                                  <div className="chat-date-sep">
                                    <span>{msg.date}</span>
                                  </div>
                                )}
                                <div className={`chat-bubble-wrap ${msg.de === 'moi' ? 'moi' : 'eux'}`}>
                                  <div className="chat-bubble">
                                    <p>{msg.texte}</p>
                                    <span className="chat-time">
                                      {msg.heure}
                                      {msg.de === 'moi' && (
                                        <svg style={{ marginLeft: 4, display: 'inline', verticalAlign: 'middle' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                      )}
                                    </span>
                                  </div>
                                  {isLastSent && <span className="chat-read-receipt">Lu ✓</span>}
                                </div>
                              </div>
                            );
                          });
                        })()}
                        {isTyping && (
                          <div className="chat-bubble-wrap eux">
                            <div className="chat-bubble chat-typing-bubble">
                              <span className="chat-typing-dot" /><span className="chat-typing-dot" /><span className="chat-typing-dot" />
                            </div>
                            <span className="chat-typing-label">{convActive.nom} est en train d'écrire…</span>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* INPUT BAR */}
                      <div className="chat-input-bar">
                        <button
                          className="chat-attach-btn"
                          title="Joindre un fichier"
                          onClick={() => showNotif('Sélectionnez un fichier à joindre (PDF, image...)')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <input
                          type="text"
                          placeholder={`Message à ${convActive.nom}...`}
                          value={draft}
                          onChange={e => handleDraftChange(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="chat-send-btn" onClick={sendMessage} disabled={!draft.trim()}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activePage === 'notifications' && (
            <div className="client-page">
              <div className="notif-header-row">
                <h1>
                  Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="notif-header-badge">{notifications.filter(n => !n.read).length} non lues</span>
                  )}
                </h1>
                {notifications.filter(n => !n.read).length > 0 && (
                  <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="notif-filters">
                {NOTIF_FILTERS_CLIENT.map(f => {
                  const count = f.id === 'toutes' ? notifications.length
                    : f.id === 'unread' ? notifications.filter(n => !n.read).length
                    : notifications.filter(n => n.type === f.id).length;
                  return (
                    <button key={f.id} className={`notif-pill ${notifFilter === f.id ? 'active' : ''}`} onClick={() => setNotifFilter(f.id)}>
                      {f.label}
                      <span className="notif-pill-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="notif-list">
                {filteredNotifs.length === 0 ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <strong>Aucune notification</strong>
                    <span>Vous êtes à jour. On vous tiendra au courant ici.</span>
                  </div>
                ) : (
                  filteredNotifs.map(n => {
                    const cfg = NOTIF_CLIENT_CONFIG[n.type];
                    return (
                      <div key={n.id} className={`notif-card ${!n.read ? 'unread' : ''}`} onClick={() => handleMarkNotifRead(n.id)}>
                        <div className="notif-icon-box" style={{ background: cfg.soft, color: cfg.color }}>{cfg.icon}</div>
                        <div className="notif-content">
                          <div className="notif-top-row">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="notif-type-label" style={{ color: cfg.color }}>{cfg.label}</span>
                              <strong className="notif-title">{n.title}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <span className="notif-time">{formatRelative(n.createdAt)}</span>
                              {!n.read && <div className="notif-unread-dot" />}
                            </div>
                          </div>
                          <p className="notif-body">{n.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ===== FACTURES ===== */}
          {activePage === 'factures' && (
            <div className="client-page">
              <div className="section-head">
                <h1>Mes factures</h1>
              </div>

              {totalDue > 0 && (
                <div className="invoice-due-banner">
                  <div className="invoice-due-left">
                    <div className="invoice-due-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    </div>
                    <div>
                      <strong>Total à régler</strong>
                      <span>{invoices.filter(f => f.status === 'sent' || f.status === 'overdue').length} facture{invoices.filter(f => f.status === 'sent' || f.status === 'overdue').length > 1 ? 's' : ''} en attente</span>
                    </div>
                  </div>
                  <strong className="invoice-due-amount">{totalDue.toLocaleString('fr-FR')} €</strong>
                </div>
              )}

              <div className="notif-filters">
                {INVOICE_FILTERS.map(f => {
                  const count = f.id === 'toutes' ? invoices.length
                    : invoices.filter(inv => inv.status === f.id).length;
                  return (
                    <button key={f.id} className={`notif-pill ${invoiceFilter === f.id ? 'active' : ''}`} onClick={() => setInvoiceFilter(f.id)}>
                      {f.label}
                      <span className="notif-pill-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="invoice-list">
                {filteredInvoices.length === 0 ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    </div>
                    <strong>Aucune facture</strong>
                    <span>Aucune facture dans cette catégorie</span>
                  </div>
                ) : (
                  filteredInvoices.map(inv => {
                    const sc = INVOICE_STATUS_CONFIG[inv.status];
                    return (
                      <div key={inv.id} className="invoice-card" onClick={() => setSelectedInvoice(inv.id)}>
                        <div className="invoice-card-left">
                          <div className="invoice-icon-box" style={{ background: sc.bg, color: sc.color }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          </div>
                          <div className="invoice-card-info">
                            <div className="invoice-card-number">{inv.number}</div>
                            <div className="invoice-card-label">{inv.label}</div>
                            <div className="invoice-card-meta">{inv.chantier} · {inv.issuedAt}</div>
                          </div>
                        </div>
                        <div className="invoice-card-right">
                          <div className="invoice-status-badge" style={{ color: sc.color, background: sc.bg }}>
                            <span className="invoice-dot" style={{ background: sc.dot }} />
                            {sc.label}
                          </div>
                          <strong className="invoice-amount">{inv.amountTTC.toLocaleString('fr-FR')} €</strong>
                          {(inv.status === 'sent' || inv.status === 'overdue') && (
                            <button className="invoice-pay-btn" onClick={e => { e.stopPropagation(); showNotif('Redirection vers le paiement sécurisé...'); }}>
                              Payer
                            </button>
                          )}
                          {(inv.status !== 'sent' && inv.status !== 'overdue') && (
                            <button className="invoice-view-btn" onClick={e => { e.stopPropagation(); setSelectedInvoice(inv.id); }}>
                              Voir
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {invoiceDetail && (
                <div className="profil-modal-overlay" onClick={() => setSelectedInvoice(null)}>
                  <div className="invoice-modal" onClick={e => e.stopPropagation()}>
                    <div className="invoice-modal-hero" style={{ background: INVOICE_STATUS_CONFIG[invoiceDetail.status].bg, borderBottom: `1px solid ${INVOICE_STATUS_CONFIG[invoiceDetail.status].dot}30` }}>
                      <button className="profil-modal-close" style={{ position: 'absolute', top: 14, right: 14 }} onClick={() => setSelectedInvoice(null)}>×</button>
                      <div className="invoice-modal-status-label" style={{ color: INVOICE_STATUS_CONFIG[invoiceDetail.status].color }}>
                        <span className="invoice-dot" style={{ background: INVOICE_STATUS_CONFIG[invoiceDetail.status].dot }} />
                        {INVOICE_STATUS_CONFIG[invoiceDetail.status].label}
                      </div>
                      <div className="invoice-modal-number">{invoiceDetail.number}</div>
                      <div className="invoice-modal-amount">{invoiceDetail.amountTTC.toLocaleString('fr-FR')} €</div>
                      <div className="invoice-modal-date">Émise le {invoiceDetail.issuedAt} · {invoiceDetail.chantier}</div>
                    </div>

                    <div className="invoice-modal-body">
                      <div className="invoice-table-wrap">
                        <table className="invoice-table">
                          <thead>
                            <tr>
                              <th>Désignation</th>
                              <th>Qté</th>
                              <th>P.U. HT</th>
                              <th>TVA</th>
                              <th>Total HT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceDetail.items.map((item, i) => (
                              <tr key={i}>
                                <td>{item.label}</td>
                                <td>{item.qty}</td>
                                <td>{item.unitHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td>{item.tva}%</td>
                                <td>{(item.qty * item.unitHT).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="invoice-totals">
                        <div className="invoice-total-row">
                          <span>Sous-total HT</span>
                          <span>{invoiceDetail.amountHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                        </div>
                        <div className="invoice-total-row">
                          <span>TVA ({invoiceDetail.tva}%)</span>
                          <span>{(invoiceDetail.amountTTC - invoiceDetail.amountHT).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                        </div>
                        <div className="invoice-total-row total">
                          <strong>Total TTC</strong>
                          <strong>{invoiceDetail.amountTTC.toLocaleString('fr-FR')} €</strong>
                        </div>
                      </div>

                      <div className="invoice-modal-actions">
                        <button className="btn-dl-doc" style={{ flex: 1 }} onClick={() => showNotif(`Téléchargement de la facture ${invoiceDetail.number}...`)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Télécharger PDF
                        </button>
                        {(invoiceDetail.status === 'sent' || invoiceDetail.status === 'overdue') && (
                          <button className="invoice-pay-btn-lg" onClick={() => { setSelectedInvoice(null); showNotif('Redirection vers le paiement sécurisé...'); }}>
                            Payer {invoiceDetail.amountTTC.toLocaleString('fr-FR')} €
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== PROFIL ===== */}
          {activePage === 'profil' && (
            <div className="client-page">
              <h1>Mon profil</h1>
              <div className="profil-layout">

                {/* ── Carte identité (gauche) ── */}
                <div className="profil-identity-card">
                  <div className="profil-avatar-wrap">
                    <div className="profil-avatar-xl">{client.avatar}</div>
                    <div className="profil-verified">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                  <h2 className="profil-id-name">{clientForm.prenom} {clientForm.nom}</h2>
                  <span className="profil-role-tag">Client Batinnov</span>
                  <div className="profil-id-stats">
                    <div className="profil-id-stat">
                      <strong>{chantiers_detail.length}</strong>
                      <span>Chantiers</span>
                    </div>
                    <div className="profil-id-sep" />
                    <div className="profil-id-stat">
                      <strong>{documents.length}</strong>
                      <span>Documents</span>
                    </div>
                    <div className="profil-id-sep" />
                    <div className="profil-id-stat">
                      <strong>{agenda.length}</strong>
                      <span>RDV</span>
                    </div>
                  </div>
                  <button className="profil-photo-btn" onClick={() => showNotif('Modification de photo — bientôt disponible')}>
                    Modifier la photo
                  </button>
                </div>

                {/* ── Colonne droite ── */}
                <div className="profil-right-col">

                  {/* INFO PERSO */}
                  <div className="profil-section-card">
                    <h3 className="profil-card-title">Informations personnelles</h3>
                    <div className="profil-fields">
                      {[
                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, cls: 'green', label: 'Prénom', key: 'prenom' as const },
                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, cls: 'green', label: 'Nom', key: 'nom' as const },
                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, cls: 'blue', label: 'Email', key: 'email' as const },
                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.35 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 17z"/></svg>, cls: 'orange', label: 'Téléphone', key: 'telephone' as const },
                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, cls: 'purple', label: 'Adresse', key: 'adresse' as const },
                      ].map(f => (
                        <div key={f.key} className="profil-field-row">
                          <div className={`profil-field-icon ${f.cls}`}>{f.icon}</div>
                          <div className="profil-field-content">
                            <label>{f.label}</label>
                            <input value={clientForm[f.key]} onChange={e => setClientForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn-save-client" onClick={handleSauvegarderProfil}>Enregistrer les modifications</button>
                  </div>

                  {/* SIGNATURE ÉLECTRONIQUE */}
                  <div className="profil-section-card">
                    <div className="profil-sig-top">
                      <div>
                        <h3 className="profil-card-title" style={{ marginBottom: 6 }}>Signature électronique</h3>
                        <span className="profil-eidas-badge">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                          eIDAS certifiée
                        </span>
                      </div>
                      <button className="profil-sig-renew" onClick={() => setShowSigModal(true)}>Modifier</button>
                    </div>
                    <div className="profil-sig-preview">
                      {sigStyle === 0 && (
                        <svg width="200" height="56" viewBox="0 0 200 56">
                          <path d="M14 38 C22 18, 36 14, 44 26 C52 38, 55 16, 68 20 C78 23, 86 18, 96 28 C103 35, 107 28, 115 30" stroke="#1B4332" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M115 30 L124 26" stroke="#1B4332" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                          <path d="M36 44 Q44 50, 52 44" stroke="#1B4332" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                        </svg>
                      )}
                      {sigStyle === 1 && (
                        <svg width="200" height="56" viewBox="0 0 200 56">
                          <path d="M12 36 C18 8, 36 6, 44 20 C52 34, 56 10, 72 14 C82 17, 90 12, 102 22 C110 28, 114 22, 124 24" stroke="#1B4332" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M124 24 L134 20" stroke="#1B4332" strokeWidth="3" fill="none" strokeLinecap="round"/>
                        </svg>
                      )}
                      {sigStyle === 2 && (
                        <svg width="200" height="56" viewBox="0 0 200 56">
                          <path d="M10 42 C24 10, 30 42, 44 20 C54 4, 60 38, 76 24 C86 14, 94 30, 108 26 C118 23, 125 30, 138 24" stroke="#1B4332" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <line x1="44" y1="47" x2="72" y2="47" stroke="#1B4332" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="profil-toggle-row">
                      <div className="profil-toggle-label">
                        <strong>Signature automatique</strong>
                        <span>Appliquer ma signature automatiquement</span>
                      </div>
                      <button
                        className={`profil-toggle-btn ${autoSign ? 'on' : ''}`}
                        onClick={() => { setAutoSign(v => !v); showNotif(autoSign ? 'Signature automatique désactivée' : 'Signature automatique activée ✓'); }}
                        aria-label="Toggle signature automatique"
                      />
                    </div>
                  </div>

                  {/* PRÉFÉRENCES */}
                  <div className="profil-section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 className="profil-card-title" style={{ margin: 0 }}>Préférences</h3>
                      <button style={{ background: 'none', border: 'none', color: '#4A7A5C', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActivePage('notif-settings')}>
                        Tout configurer →
                      </button>
                    </div>
                    {([
                      { label: 'Notifications email', sub: 'Devis, chantiers, messages', val: notifEmail, set: setNotifEmail },
                      { label: 'SMS de rappel', sub: 'Rendez-vous et alertes urgentes', val: notifSMS, set: setNotifSMS },
                      { label: 'Newsletter Batinnov', sub: 'Conseils travaux et actualités', val: newsletter, set: setNewsletter },
                    ] as { label: string; sub: string; val: boolean; set: React.Dispatch<React.SetStateAction<boolean>> }[]).map((pref, i) => (
                      <div key={i} className="profil-toggle-row">
                        <div className="profil-toggle-label">
                          <strong>{pref.label}</strong>
                          <span>{pref.sub}</span>
                        </div>
                        <button
                          className={`profil-toggle-btn ${pref.val ? 'on' : ''}`}
                          onClick={() => pref.set(!pref.val)}
                          aria-label={`Toggle ${pref.label}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* ASSISTANCE */}
                  <div className="profil-section-card">
                    <h3 className="profil-card-title">Assistance</h3>
                    {([
                      { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: "Centre d'aide", sub: 'FAQ et guides pratiques', color: '#3B82F6', page: 'aide' },
                      { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: 'Signaler un problème', sub: 'Support technique 24h/24', color: '#E87D50' },
                      { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Nous contacter', sub: 'contact@batinnov.fr', color: '#4A7A5C' },
                    ] as { icon: React.ReactNode; label: string; sub: string; color: string; page?: string }[]).map((item, i) => (
                      <button key={i} className="profil-menu-row" onClick={() => item.page ? setActivePage(item.page) : showNotif(`${item.label} — bientôt disponible`)}>
                        <div className="profil-menu-icon" style={{ background: item.color + '1A', color: item.color }}>{item.icon}</div>
                        <div className="profil-menu-text">
                          <strong>{item.label}</strong>
                          <span>{item.sub}</span>
                        </div>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    ))}
                  </div>

                  {/* LÉGAL */}
                  <div className="profil-section-card">
                    <h3 className="profil-card-title">Légal</h3>
                    {["Conditions d'utilisation", 'Politique de confidentialité', 'Mentions légales'].map((item, i) => (
                      <button key={i} className="profil-menu-row" onClick={() => showNotif(`${item} — bientôt disponible`)}>
                        <span className="profil-menu-text-solo">{item}</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    ))}
                  </div>

                  {/* DÉCONNEXION */}
                  <button onClick={handleLogout} className="btn-deconnexion" style={{ alignSelf: 'flex-start' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Se déconnecter
                  </button>
                </div>
              </div>

              {/* ── MODAL SIGNATURE ── */}
              {showSigModal && (
                <div className="profil-modal-overlay" onClick={() => setShowSigModal(false)}>
                  <div className="profil-modal" onClick={e => e.stopPropagation()}>
                    <div className="profil-modal-head">
                      <h3>Style de signature</h3>
                      <button className="profil-modal-close" onClick={() => setShowSigModal(false)}>×</button>
                    </div>
                    <p className="profil-modal-sub">Choisissez le style qui vous correspond</p>
                    <div className="profil-sig-styles">
                      {[
                        { label: 'Élégante', svg: <svg width="130" height="44" viewBox="0 0 130 44"><path d="M10 32 C16 14, 28 10, 35 20 C42 30, 44 12, 54 15 C62 17, 68 13, 76 21 C82 27, 84 21, 90 23" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M90 23 L97 20" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/><path d="M28 36 Q34 40, 40 36" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/></svg> },
                        { label: 'Classique', svg: <svg width="130" height="44" viewBox="0 0 130 44"><path d="M8 30 C14 6, 30 4, 36 16 C42 28, 46 8, 58 11 C66 14, 72 9, 82 18 C88 23, 91 18, 100 20" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                        { label: 'Moderne', svg: <svg width="130" height="44" viewBox="0 0 130 44"><path d="M8 36 C18 8, 24 36, 36 16 C44 2, 50 30, 62 18 C70 9, 76 22, 88 18 C96 15, 100 22, 110 18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/><line x1="36" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> },
                      ].map((style, i) => (
                        <button key={i} className={`profil-sig-style-btn ${sigStyle === i ? 'selected' : ''}`} onClick={() => setSigStyle(i)}>
                          <div className="profil-sig-style-preview">{style.svg}</div>
                          <span>{style.label}</span>
                        </button>
                      ))}
                    </div>
                    <button className="btn-save-client" style={{ width: '100%', marginTop: 4 }} onClick={() => { showNotif('Signature mise à jour ✓'); setShowSigModal(false); }}>
                      Valider cette signature
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== CENTRE D'AIDE ===== */}
          {activePage === 'aide' && (() => {
            const FAQ = [
              { q: 'Comment recevoir un devis ?', r: 'Déposez une demande depuis le bouton "+ Nouvelle demande". Nos artisans partenaires vous envoient leurs propositions sous 48h.' },
              { q: 'Comment choisir entre plusieurs devis ?', r: 'Utilisez le bouton "⊞ Comparer" dans la section Devis pour voir tous les artisans côte-à-côte : prix, disponibilité, note et expérience.' },
              { q: 'Comment suivre l\'avancement de mon chantier ?', r: 'Rendez-vous dans l\'onglet "Chantiers". Chaque chantier affiche une barre de progression, les étapes validées, et les prochaines échéances.' },
              { q: 'Comment signer un devis électroniquement ?', r: 'Ouvrez le devis à signer, cliquez sur "Signer". Votre signature eIDAS certifiée est appliquée automatiquement si vous l\'avez activée dans votre profil.' },
              { q: 'Comment prendre un rendez-vous ?', r: 'Depuis l\'onglet "Agenda", cliquez sur "+ Prendre un RDV". Choisissez un créneau disponible, un objet, et validez.' },
              { q: 'Je ne reçois pas les notifications, que faire ?', r: 'Vérifiez vos préférences dans Profil → Préférences. Assurez-vous que les notifications email et push sont activées pour les événements souhaités.' },
              { q: 'Comment contacter un artisan ?', r: 'Allez dans l\'onglet "Messages" et sélectionnez la conversation avec l\'artisan. Vous pouvez envoyer un message texte ou joindre un fichier.' },
              { q: 'Mes données sont-elles sécurisées ?', r: 'Oui. Toutes les données sont chiffrées en transit (TLS 1.3) et au repos. Batinnov est conforme au RGPD. Voir la Politique de confidentialité dans votre profil.' },
            ];
            const GUIDES = [
              { title: 'Préparer sa rénovation', sub: '5 étapes clés avant de lancer des travaux', color: '#4A7A5C', icon: '🏠' },
              { title: 'Comprendre un devis', sub: 'Décrypter les lignes et vérifier les prix', color: '#E87D50', icon: '📄' },
              { title: 'Aide à domicile', sub: 'Droits, aides financières et démarches', color: '#6366F1', icon: '🤝' },
              { title: 'Borne IRVE', sub: 'Installation, normes et aides de l\'État', color: '#10B981', icon: '⚡' },
            ];
            return (
              <div className="client-page">
                <div className="section-head">
                  <h1>Centre d'aide</h1>
                  <button className="btn-voir-tout" onClick={() => setActivePage('profil')}>← Profil</button>
                </div>

                <div className="aide-search-bar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input placeholder="Rechercher dans l'aide..." />
                </div>

                <div className="aide-guides-strip">
                  {GUIDES.map((g, i) => (
                    <button key={i} className="aide-guide-card" onClick={() => showNotif(`Guide "${g.title}" — bientôt disponible`)}>
                      <span className="aide-guide-icon">{g.icon}</span>
                      <strong>{g.title}</strong>
                      <span>{g.sub}</span>
                    </button>
                  ))}
                </div>

                <h2 className="aide-section-title">Questions fréquentes</h2>
                <div className="aide-faq-list">
                  {FAQ.map((item, i) => (
                    <div key={i} className={`aide-faq-item ${helpOpenIdx === i ? 'open' : ''}`}>
                      <button className="aide-faq-q" onClick={() => setHelpOpenIdx(helpOpenIdx === i ? null : i)}>
                        <span>{item.q}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: helpOpenIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      {helpOpenIdx === i && (
                        <div className="aide-faq-a">{item.r}</div>
                      )}
                    </div>
                  ))}
                </div>

                <h2 className="aide-section-title" style={{ marginTop: 28 }}>Nous contacter</h2>
                <div className="aide-contact-grid">
                  {[
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: 'Chat en direct', sub: 'Réponse en moins de 5 min', color: '#3B82F6' },
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.35 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 17z"/></svg>, label: 'Appeler', sub: '+33 4 73 XX XX XX', color: '#4A7A5C' },
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', sub: 'contact@batinnov.fr', color: '#E87D50' },
                  ].map((c, i) => (
                    <button key={i} className="aide-contact-card" onClick={() => showNotif(`${c.label} — bientôt disponible`)}>
                      <div className="aide-contact-icon" style={{ color: c.color, background: c.color + '18' }}>{c.icon}</div>
                      <strong>{c.label}</strong>
                      <span>{c.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ===== NOTIFICATION SETTINGS ===== */}
          {activePage === 'notif-settings' && (() => {
            const EVENTS: { key: keyof typeof notifSettings; label: string; sub: string }[] = [
              { key: 'nouveau_devis',       label: 'Nouveau devis reçu',     sub: 'Quand un artisan vous envoie un devis' },
              { key: 'message_recu',        label: 'Message reçu',           sub: 'Nouveaux messages dans vos conversations' },
              { key: 'rappel_rdv',          label: 'Rappel de rendez-vous',   sub: '24h avant chaque RDV planifié' },
              { key: 'chantier_avancement', label: 'Avancement chantier',     sub: "Quand l'artisan met à jour l'étape" },
              { key: 'facture',             label: 'Facture disponible',      sub: "Nouvelles factures à régler ou télécharger" },
              { key: 'validation',          label: 'Validation demande',      sub: "Quand votre demande passe à l'étape suivante" },
            ];
            return (
              <div className="client-page">
                <div className="section-head">
                  <h1>Préférences de notifications</h1>
                  <button className="btn-voir-tout" onClick={() => setActivePage('profil')}>← Profil</button>
                </div>

                <div className="notif-settings-legend">
                  <span />
                  <span className="notif-settings-legend-email">Email</span>
                  <span className="notif-settings-legend-push">Push</span>
                </div>

                <div className="notif-settings-list">
                  {EVENTS.map(ev => {
                    const s = notifSettings[ev.key];
                    const toggle = (channel: 'email' | 'push') =>
                      setNotifSettings(prev => ({ ...prev, [ev.key]: { ...prev[ev.key], [channel]: !prev[ev.key][channel] } }));
                    return (
                      <div key={ev.key} className="notif-settings-row">
                        <div className="notif-settings-info">
                          <strong>{ev.label}</strong>
                          <span>{ev.sub}</span>
                        </div>
                        <button className={`notif-settings-toggle ${s.email ? 'on' : ''}`} onClick={() => toggle('email')} aria-label={`Email ${ev.label}`} />
                        <button className={`notif-settings-toggle push ${s.push ? 'on' : ''}`} onClick={() => toggle('push')} aria-label={`Push ${ev.label}`} />
                      </div>
                    );
                  })}
                </div>
                <p className="notif-settings-footer">Les modifications sont appliquées immédiatement.</p>
              </div>
            );
          })()}

        </div>
      </main>

      {/* ===== MODAL LAISSER UN AVIS ===== */}
      {showAvisModal && (
        <div className="profil-modal-overlay" onClick={() => setShowAvisModal(false)}>
          <div className="avis-modal" onClick={e => e.stopPropagation()}>
            {avisSubmitted ? (
              <div className="avis-success">
                <div className="avis-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>Merci pour votre avis !</h3>
                <p>Votre retour aide d'autres clients à choisir le bon artisan.</p>
                <button className="btn-primary-green" style={{ marginTop: 16 }} onClick={() => setShowAvisModal(false)}>Fermer</button>
              </div>
            ) : (
              <>
                <div className="avis-modal-head">
                  <div>
                    <h3>Laisser un avis</h3>
                    <p className="avis-modal-sub">{avisChantierTitle}</p>
                  </div>
                  <button className="profil-modal-close" onClick={() => setShowAvisModal(false)}>×</button>
                </div>

                <div className="avis-stars-row">
                  {[1,2,3,4,5].map(star => {
                    const filled = star <= (avisHover || avisNote);
                    return (
                      <button key={star} className="avis-star-btn"
                        onMouseEnter={() => setAvisHover(star)}
                        onMouseLeave={() => setAvisHover(0)}
                        onClick={() => setAvisNote(star)}
                      >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill={filled ? '#FFB800' : 'none'} stroke={filled ? '#FFB800' : '#D1D5DB'} strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    );
                  })}
                </div>
                {avisNote > 0 && (
                  <p className="avis-note-label">{['','Insuffisant 😕','Passable 😐','Bien 🙂','Très bien 😊','Excellent ! 🌟'][avisNote]}</p>
                )}

                <div className="avis-textarea-wrap">
                  <textarea
                    className="avis-textarea"
                    placeholder="Partagez votre expérience avec cet artisan (min. 10 caractères)..."
                    value={avisComment}
                    onChange={e => setAvisComment(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <span className="avis-counter">{avisComment.length}/500</span>
                </div>

                <button
                  className="btn-primary-green"
                  style={{ width: '100%', opacity: (avisNote === 0 || avisComment.length < 10) ? 0.4 : 1, cursor: (avisNote === 0 || avisComment.length < 10) ? 'not-allowed' : 'pointer' }}
                  disabled={avisNote === 0 || avisComment.length < 10}
                  onClick={() => { setAvisSubmitted(true); showNotif('Avis publié avec succès ✓'); }}
                >
                  Publier mon avis
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL PRENDRE UN RDV ===== */}
      {showRdvModal && (
        <div className="profil-modal-overlay" onClick={() => setShowRdvModal(false)}>
          <div className="rdv-modal" onClick={e => e.stopPropagation()}>
            {rdvSuccess ? (
              <div className="avis-success">
                <div className="avis-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A7A5C" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3>Demande envoyée !</h3>
                <p>Votre demande de RDV a été transmise à l'artisan. Vous recevrez une confirmation sous 24h.</p>
                {rdvSelectedDay !== null && <p className="rdv-success-slot"><strong>{rdvDays[rdvSelectedDay].toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</strong> à <strong>{rdvSelectedSlot}</strong></p>}
                <button className="btn-primary-green" style={{ marginTop: 16 }} onClick={() => setShowRdvModal(false)}>Fermer</button>
              </div>
            ) : (
              <>
                <div className="avis-modal-head">
                  <div>
                    <h3>Prendre un rendez-vous</h3>
                    <p className="avis-modal-sub">Choisissez une date et un créneau</p>
                  </div>
                  <button className="profil-modal-close" onClick={() => setShowRdvModal(false)}>×</button>
                </div>

                <div className="rdv-days-scroll">
                  {rdvDays.map((day, i) => {
                    const isSelected = rdvSelectedDay === i;
                    return (
                      <button key={i} className={`rdv-day-btn ${isSelected ? 'selected' : ''}`} onClick={() => { setRdvSelectedDay(i); setRdvSelectedSlot(null); }}>
                        <span className="rdv-day-name">{day.toLocaleDateString('fr-FR',{weekday:'short'})}</span>
                        <span className="rdv-day-num">{day.getDate()}</span>
                        <span className="rdv-day-month">{day.toLocaleDateString('fr-FR',{month:'short'})}</span>
                      </button>
                    );
                  })}
                </div>

                {rdvSelectedDay !== null && (
                  <div className="rdv-slots-grid">
                    {RDV_SLOTS.map(slot => (
                      <button key={slot} className={`rdv-slot-btn ${rdvSelectedSlot === slot ? 'selected' : ''}`} onClick={() => setRdvSelectedSlot(slot)}>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                <div className="avis-textarea-wrap" style={{ marginTop: 14 }}>
                  <textarea
                    className="avis-textarea"
                    placeholder="Objet du rendez-vous (ex: mise en service, visite technique...)"
                    value={rdvSubject}
                    onChange={e => setRdvSubject(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <span className="avis-counter">{rdvSubject.length}/200</span>
                </div>

                <button
                  className="btn-primary-green"
                  style={{ width: '100%', opacity: (rdvSelectedDay === null || rdvSelectedSlot === null) ? 0.4 : 1, cursor: (rdvSelectedDay === null || rdvSelectedSlot === null) ? 'not-allowed' : 'pointer' }}
                  disabled={rdvSelectedDay === null || rdvSelectedSlot === null}
                  onClick={() => {
                    setRdvSuccess(true);
                    const dayStr = rdvDays[rdvSelectedDay!].toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
                    setAgenda(prev => [...prev, { id: Date.now(), heure: rdvSelectedSlot!, titre: rdvSubject || 'Rendez-vous', artisan: 'En attente de confirmation', duree: '1h', statut: 'a_confirmer', date: dayStr }]);
                  }}
                >
                  Envoyer la demande
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardClient;
