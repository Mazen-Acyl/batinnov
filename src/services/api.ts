// Chemins relatifs partout : Vite proxy en dev, Vercel rewrites en prod
const API_URL = '';

/* ── Batch fetch : récupère plusieurs entités par ID en parallèle ── */
export async function batchFetchById<T>(
  fetchFn: (id: string) => Promise<T>,
  ids: string[],
  concurrency = 5
): Promise<Map<string, T>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, T>();
  for (let i = 0; i < unique.length; i += concurrency) {
    const chunk = unique.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async id => {
        try { map.set(id, await fetchFn(id)); } catch { /* ignore */ }
      })
    );
  }
  return map;
}

/* ── Helpers de normalisation (backend → frontend) ── */
export function normalizeDate(v: unknown): string {
  if (!v) return '—';
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function normalizeMontant(v: unknown): string {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return '—';
  return `${n.toLocaleString('fr-FR')} €`;
}

export type UserRole = 'client' | 'prestataire' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  prenom?: string;
  nom?: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export const getToken = (): string | null => localStorage.getItem('batinnov_token');
export const setToken = (t: string): void => localStorage.setItem('batinnov_token', t);
export const removeToken = (): void => localStorage.removeItem('batinnov_token');

const h = (auth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
  return headers;
};

const r = async (res) => {
  let data: any = null;
  try { data = await res.json(); } catch { /* réponse vide */ }
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || data?.error;
    if (res.status === 401) throw new Error('Email ou mot de passe incorrect.');
    if (res.status === 409) throw new Error('Un compte existe déjà avec ces informations.');
    if (res.status === 0 || !res.status) throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
    throw new Error(typeof msg === 'string' ? msg : 'Une erreur est survenue. Réessayez.');
  }
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  registerClient: async (body) => {
    const data = await r(await fetch(`${API_URL}/api/auth/register/client`, { method: 'POST', headers: h(false), body: JSON.stringify(body) }));
    if (data?.data?.token) setToken(data.data.token);
    return data.data;
  },
  registerPrestataire: async (body) => {
    const data = await r(await fetch(`${API_URL}/api/auth/register/prestataire`, { method: 'POST', headers: h(false), body: JSON.stringify(body) }));
    if (data?.data?.token) setToken(data.data.token);
    return data.data;
  },
  login: async ({ email, motDePasse }) => {
    const data = await r(await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: h(false), body: JSON.stringify({ email, motDePasse }) }));
    if (data?.data?.token) setToken(data.data.token);
    return data.data; // { token, user: { id, email, role, profil } }
  },
  me: async () => {
    const data = await r(await fetch(`${API_URL}/api/auth/me`, { headers: h() }));
    return data.data;
  },
  changePassword: async (body) => {
    return r(await fetch(`${API_URL}/api/auth/password`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) }));
  },
  loginGoogle: async (googleToken) => {
    const data = await r(await fetch(`${API_URL}/api/auth/google/token`, { method: 'POST', headers: h(false), body: JSON.stringify({ googleToken }) }));
    if (data?.data?.token) setToken(data.data.token);
    return data.data;
  },
  logout: () => removeToken(),
  isAuthenticated: () => !!getToken()
};

// ── PROSPECTS ─────────────────────────────────────────────────
export const prospectsAPI = {
  getAll: async (filters = {}) => {
    const data = await r(await fetch(`${API_URL}/api/prospects?${new URLSearchParams(filters)}`, { headers: h() }));
    return data;
  },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/prospects/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/prospects`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/prospects/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/prospects/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  relancer: async (id) => { const data = await r(await fetch(`${API_URL}/api/prospects/${id}/relancer`, { method: 'POST', headers: h() })); return data.data; },
  convertir: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/prospects/${id}/convertir`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; }
};

// ── CLIENTS ───────────────────────────────────────────────────
export const clientsAPI = {
  getAll: async () => { const data = await r(await fetch(`${API_URL}/api/clients`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/clients/${id}`, { headers: h() })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/clients/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/clients/${id}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── DEVIS ─────────────────────────────────────────────────────
export const devisAPI = {
  getAll: async (filters = {}) => { const data = await r(await fetch(`${API_URL}/api/devis?${new URLSearchParams(filters)}`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/devis/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/devis`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/devis/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/devis/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  changerStatut: async (id, statut) => { const data = await r(await fetch(`${API_URL}/api/devis/${id}/changer-statut`, { method: 'POST', headers: h(), body: JSON.stringify({ statut }) })); return data.data; },
  addLigne: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/devis/${id}/lignes`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  updateLigne: async (id, ligneId, body) => { const data = await r(await fetch(`${API_URL}/api/devis/${id}/lignes/${ligneId}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  deleteLigne: async (id, ligneId) => { const res = await fetch(`${API_URL}/api/devis/${id}/lignes/${ligneId}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── PAIEMENTS ─────────────────────────────────────────────────
export const paiementsAPI = {
  getAll: async () => { const data = await r(await fetch(`${API_URL}/api/paiements`, { headers: h() })); return data.data; },
  getByDevis: async (devisId) => { const data = await r(await fetch(`${API_URL}/api/paiements/devis/${devisId}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/paiements`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/paiements/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/paiements/${id}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── PRESTATAIRES ──────────────────────────────────────────────
export const prestatairesAPI = {
  getAll: async () => { const data = await r(await fetch(`${API_URL}/api/prestataires`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/prestataires/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/prestataires`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/prestataires/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/prestataires/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  getNotations: async (id) => { const data = await r(await fetch(`${API_URL}/api/prestataires/${id}/notations`, { headers: h() })); return data.data; },
  addSpecialite: async (id, typePrestationId) => { const data = await r(await fetch(`${API_URL}/api/prestataires/${id}/specialites`, { method: 'POST', headers: h(), body: JSON.stringify({ typePrestationId }) })); return data.data; },
  removeSpecialite: async (id, tpId) => { const res = await fetch(`${API_URL}/api/prestataires/${id}/specialites/${tpId}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── PRESTATIONS ───────────────────────────────────────────────
export const prestationsAPI = {
  getAll: async () => { const data = await r(await fetch(`${API_URL}/api/prestations`, { headers: h() })); return data.data; },
  getAAssigner: async () => { const data = await r(await fetch(`${API_URL}/api/prestations/a-assigner`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/prestations/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/prestations`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/prestations/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/prestations/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  assigner: async (id, prestataireId) => { const data = await r(await fetch(`${API_URL}/api/prestations/${id}/assigner`, { method: 'POST', headers: h(), body: JSON.stringify({ prestataireId }) })); return data.data; },
  changerStatut: async (id, statut) => { const data = await r(await fetch(`${API_URL}/api/prestations/${id}/changer-statut`, { method: 'POST', headers: h(), body: JSON.stringify({ statut }) })); return data.data; }
};

// ── NOTATIONS ─────────────────────────────────────────────────
export const notationsAPI = {
  getAll: async () => { const data = await r(await fetch(`${API_URL}/api/notations`, { headers: h() })); return data.data; },
  getByPrestation: async (prestId) => { const data = await r(await fetch(`${API_URL}/api/notations/prestation/${prestId}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/notations`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/notations/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await fetch(`${API_URL}/api/notations/${id}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── CAMPAGNES ─────────────────────────────────────────────────
export const campagnesAPI = {
  getAll: async (filters = {}) => { const data = await r(await fetch(`${API_URL}/api/campagnes?${new URLSearchParams(filters)}`, { headers: h() })); return data.data; },
  getActives: async () => { const data = await r(await fetch(`${API_URL}/api/campagnes/actives`, { headers: h() })); return data.data; },
  getPerformance: async () => { const data = await r(await fetch(`${API_URL}/api/campagnes/performance`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/campagnes/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/campagnes`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await fetch(`${API_URL}/api/campagnes/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  cloturer: async (id) => { const data = await r(await fetch(`${API_URL}/api/campagnes/${id}/cloturer`, { method: 'POST', headers: h() })); return data.data; }
};

// ── TYPES PRESTATION ──────────────────────────────────────────
export const typesPrestationAPI = {
  getAll: async (filters = {}) => { const data = await r(await fetch(`${API_URL}/api/types-prestation?${new URLSearchParams(filters)}`, { headers: h(false) })); return data.data; },
  getById: async (id) => { const data = await r(await fetch(`${API_URL}/api/types-prestation/${id}`, { headers: h(false) })); return data.data; },
  create: async (body) => { const data = await r(await fetch(`${API_URL}/api/types-prestation`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; }
};

// ── DASHBOARD (ADMIN) ─────────────────────────────────────────
export const dashboardAPI = {
  getResume: async () => { const data = await r(await fetch(`${API_URL}/api/dashboard/resume`, { headers: h() })); return data.data; },
  getPrestationsAAssigner: async () => { const data = await r(await fetch(`${API_URL}/api/dashboard/prestations-a-assigner`, { headers: h() })); return data.data; },
  getCaParDomaine: async () => { const data = await r(await fetch(`${API_URL}/api/dashboard/ca-par-domaine`, { headers: h() })); return data.data; },
  getNotesPrestataires: async () => { const data = await r(await fetch(`${API_URL}/api/dashboard/notes-prestataires`, { headers: h() })); return data.data; },
  getPerformanceCampagnes: async () => { const data = await r(await fetch(`${API_URL}/api/dashboard/performance-campagnes`, { headers: h() })); return data.data; },
  getConversionParSource: async () => { const data = await r(await fetch(`${API_URL}/api/dashboard/conversion-par-source`, { headers: h() })); return data.data; }
};

// ── DEMANDES ──────────────────────────────────────────────────
export const demandesAPI = {
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await fetch(`${API_URL}/api/demandes${qs ? '?' + qs : ''}`, { headers: h() }));
    // L'API retourne { data: [], total, page, limit } ou { data: [] }
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  listMine: async (clientId: string) => {
    // Pas de /mes-demandes — filtrer par clientId
    const data = await r(await fetch(`${API_URL}/api/demandes?clientId=${clientId}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  getById: async (id: string) => { const data = await r(await fetch(`${API_URL}/api/demandes/${id}`, { headers: h() })); return data.data; },
  create: async (body: Record<string, unknown>) => {
    const data = await r(await fetch(`${API_URL}/api/demandes`, { method: 'POST', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  patch: async (id: string, body: Record<string, unknown>) => {
    const data = await r(await fetch(`${API_URL}/api/demandes/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  qualifier: async (id: string, adminId: string) => {
    const data = await r(await fetch(`${API_URL}/api/demandes/${id}/qualifier`, { method: 'POST', headers: h(), body: JSON.stringify({ adminId }) }));
    return data.data;
  },
  valider: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/demandes/${id}/valider`, { method: 'POST', headers: h() }));
    return data.data;
  },
  annuler: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/demandes/${id}/annuler`, { method: 'POST', headers: h() }));
    return data.data;
  },
};

// ── CONVERSATIONS ─────────────────────────────────────────────
export const conversationsAPI = {
  // Le backend filtre automatiquement selon le JWT (clientId ou prestataireId)
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await fetch(`${API_URL}/api/conversations${qs ? '?' + qs : ''}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  getById: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/conversations/${id}`, { headers: h() }));
    return data.data;
  },
  listMessages: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/conversations/${id}/messages`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  sendMessage: async (id: string, contenu: string) => {
    const data = await r(await fetch(`${API_URL}/api/conversations/${id}/messages`, { method: 'POST', headers: h(), body: JSON.stringify({ contenu }) }));
    return data.data;
  },
  marquerTousLus: async (id: string) => {
    return r(await fetch(`${API_URL}/api/conversations/${id}/marquer-tous-lus`, { method: 'POST', headers: h() }));
  },
};

// ── RENDEZ-VOUS ───────────────────────────────────────────────
export const rendezVousAPI = {
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await fetch(`${API_URL}/api/rendez-vous${qs ? '?' + qs : ''}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  aVenir: async () => {
    const data = await r(await fetch(`${API_URL}/api/rendez-vous/a-venir`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  create: async (body: Record<string, unknown>) => {
    const data = await r(await fetch(`${API_URL}/api/rendez-vous`, { method: 'POST', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  confirmer: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/rendez-vous/${id}/confirmer`, { method: 'POST', headers: h() }));
    return data.data;
  },
  annuler: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/rendez-vous/${id}/annuler`, { method: 'POST', headers: h() }));
    return data.data;
  },
  marquerRealise: async (id: string) => {
    const data = await r(await fetch(`${API_URL}/api/rendez-vous/${id}/marquer-realise`, { method: 'POST', headers: h() }));
    return data.data;
  },
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationsAPI = {
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await fetch(`${API_URL}/api/notifications${qs ? '?' + qs : ''}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  markRead: async (id: string) => {
    return r(await fetch(`${API_URL}/api/notifications/${id}/marquer-lue`, { method: 'POST', headers: h() }));
  },
  markAllRead: async () => {
    return r(await fetch(`${API_URL}/api/notifications/marquer-toutes-lues`, { method: 'POST', headers: h() }));
  },
};