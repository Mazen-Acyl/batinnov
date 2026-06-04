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

/* Cookie HTTP-only — le token est géré par le navigateur, jamais en localStorage */
const h = () => ({ 'Content-Type': 'application/json' });

/* Wrapper fetch avec credentials: 'include' pour envoyer le cookie automatiquement */
const f = (url: string, init: RequestInit = {}) =>
  fetch(url, { ...init, credentials: 'include' });

const r = async (res: Response, isLogin = false) => {
  let data: any = null;
  try { data = await res.json(); } catch { /* réponse vide */ }
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || data?.error;
    if (res.status === 401 && isLogin) throw new Error('Email ou mot de passe incorrect.');
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    if (res.status === 409) throw new Error('Un compte existe déjà avec ces informations.');
    if (res.status === 0 || !res.status) throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
    throw new Error(typeof msg === 'string' ? msg : 'Une erreur est survenue. Réessayez.');
  }
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  registerClient: async (body) => {
    const data = await r(await f(`${API_URL}/api/auth/register/client`, { method: 'POST', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  registerPrestataire: async (body) => {
    const data = await r(await f(`${API_URL}/api/auth/register/prestataire`, { method: 'POST', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  login: async ({ email, motDePasse }) => {
    const data = await r(await f(`${API_URL}/api/auth/login`, { method: 'POST', headers: h(), body: JSON.stringify({ email, motDePasse }) }), true);
    const result = data.data;
    if (result?.user?.email_verifie === false) {
      const err: any = new Error('EMAIL_NOT_VERIFIED');
      err.email = result.user.email;
      throw err;
    }
    return result;
  },
  resendVerification: async (email: string) => {
    return r(await f(`${API_URL}/api/auth/resend-verification`, { method: 'POST', headers: h(), body: JSON.stringify({ email }) }));
  },
  verifyEmail: async (code: string, email: string) => {
    const data = await r(await f(`${API_URL}/api/auth/verify-email`, { method: 'POST', headers: h(), body: JSON.stringify({ code, email }) }));
    return data.data;
  },
  me: async () => {
    const data = await r(await f(`${API_URL}/api/auth/me`, { headers: h() }));
    return data.data;
  },
  changePassword: async (body) => {
    return r(await f(`${API_URL}/api/auth/password`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) }));
  },
  loginGoogle: async (googleToken) => {
    const data = await r(await f(`${API_URL}/api/auth/google/token`, { method: 'POST', headers: h(), body: JSON.stringify({ googleToken }) }));
    return data.data;
  },
  logout: async () => {
    try { await f(`${API_URL}/api/auth/logout`, { method: 'POST', headers: h() }); } catch { /* ignore */ }
  },
  isAuthenticated: () => true, // le cookie HTTP-only est vérifié par le serveur via /auth/me
};

// ── PROSPECTS ─────────────────────────────────────────────────
export const prospectsAPI = {
  getAll: async (filters = {}) => {
    const data = await r(await f(`${API_URL}/api/prospects?${new URLSearchParams(filters)}`, { headers: h() }));
    return data;
  },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/prospects/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/prospects`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/prospects/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/prospects/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  relancer: async (id) => { const data = await r(await f(`${API_URL}/api/prospects/${id}/relancer`, { method: 'POST', headers: h() })); return data.data; },
  convertir: async (id, body) => { const data = await r(await f(`${API_URL}/api/prospects/${id}/convertir`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; }
};

// ── CLIENTS ───────────────────────────────────────────────────
export const clientsAPI = {
  getAll: async () => { const data = await r(await f(`${API_URL}/api/clients`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/clients/${id}`, { headers: h() })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/clients/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/clients/${id}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── DEVIS ─────────────────────────────────────────────────────
export const devisAPI = {
  getAll: async (filters = {}) => { const data = await r(await f(`${API_URL}/api/devis?${new URLSearchParams(filters)}`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/devis/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/devis`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/devis/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/devis/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  changerStatut: async (id, statut) => { const data = await r(await f(`${API_URL}/api/devis/${id}/changer-statut`, { method: 'POST', headers: h(), body: JSON.stringify({ statut }) })); return data.data; },
  addLigne: async (id, body) => { const data = await r(await f(`${API_URL}/api/devis/${id}/lignes`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  updateLigne: async (id, ligneId, body) => { const data = await r(await f(`${API_URL}/api/devis/${id}/lignes/${ligneId}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  deleteLigne: async (id, ligneId) => { const res = await f(`${API_URL}/api/devis/${id}/lignes/${ligneId}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── PAIEMENTS ─────────────────────────────────────────────────
export const paiementsAPI = {
  getAll: async () => { const data = await r(await f(`${API_URL}/api/paiements`, { headers: h() })); return data.data; },
  getByDevis: async (devisId) => { const data = await r(await f(`${API_URL}/api/paiements/devis/${devisId}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/paiements`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/paiements/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/paiements/${id}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── ADMINS ────────────────────────────────────────────────────
export const adminsAPI = {
  update: async (id: string, body: Record<string, unknown>) => {
    const data = await r(await f(`${API_URL}/api/admins/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
};

// ── PRESTATAIRES ──────────────────────────────────────────────
export const prestatairesAPI = {
  getAll: async () => { const data = await r(await f(`${API_URL}/api/prestataires`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/prestataires/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/prestataires`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/prestataires/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/prestataires/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  getNotations: async (id) => { const data = await r(await f(`${API_URL}/api/prestataires/${id}/notations`, { headers: h() })); return data.data; },
  addSpecialite: async (id, typePrestationId) => { const data = await r(await f(`${API_URL}/api/prestataires/${id}/specialites`, { method: 'POST', headers: h(), body: JSON.stringify({ typePrestationId }) })); return data.data; },
  removeSpecialite: async (id, tpId) => { const res = await f(`${API_URL}/api/prestataires/${id}/specialites/${tpId}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── PRESTATIONS ───────────────────────────────────────────────
export const prestationsAPI = {
  getAll: async () => { const data = await r(await f(`${API_URL}/api/prestations`, { headers: h() })); return data.data; },
  getAAssigner: async () => { const data = await r(await f(`${API_URL}/api/prestations/a-assigner`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/prestations/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/prestations`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/prestations/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/prestations/${id}`, { method: 'DELETE', headers: h() }); return res.ok; },
  assigner: async (id, prestataireId) => { const data = await r(await f(`${API_URL}/api/prestations/${id}/assigner`, { method: 'POST', headers: h(), body: JSON.stringify({ prestataireId }) })); return data.data; },
  changerStatut: async (id, statut) => { const data = await r(await f(`${API_URL}/api/prestations/${id}/changer-statut`, { method: 'POST', headers: h(), body: JSON.stringify({ statut }) })); return data.data; }
};

// ── NOTATIONS ─────────────────────────────────────────────────
export const notationsAPI = {
  getAll: async () => { const data = await r(await f(`${API_URL}/api/notations`, { headers: h() })); return data.data; },
  getByPrestation: async (prestId) => { const data = await r(await f(`${API_URL}/api/notations/prestation/${prestId}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/notations`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/notations/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  delete: async (id) => { const res = await f(`${API_URL}/api/notations/${id}`, { method: 'DELETE', headers: h() }); return res.ok; }
};

// ── CAMPAGNES ─────────────────────────────────────────────────
export const campagnesAPI = {
  getAll: async (filters = {}) => { const data = await r(await f(`${API_URL}/api/campagnes?${new URLSearchParams(filters)}`, { headers: h() })); return data.data; },
  getActives: async () => { const data = await r(await f(`${API_URL}/api/campagnes/actives`, { headers: h() })); return data.data; },
  getPerformance: async () => { const data = await r(await f(`${API_URL}/api/campagnes/performance`, { headers: h() })); return data.data; },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/campagnes/${id}`, { headers: h() })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/campagnes`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; },
  update: async (id, body) => { const data = await r(await f(`${API_URL}/api/campagnes/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) })); return data.data; },
  cloturer: async (id) => { const data = await r(await f(`${API_URL}/api/campagnes/${id}/cloturer`, { method: 'POST', headers: h() })); return data.data; }
};

// ── TYPES PRESTATION ──────────────────────────────────────────
export const typesPrestationAPI = {
  getAll: async (filters = {}) => { const data = await r(await f(`${API_URL}/api/types-prestation?${new URLSearchParams(filters)}`, { headers: h(false) })); return data.data; },
  getById: async (id) => { const data = await r(await f(`${API_URL}/api/types-prestation/${id}`, { headers: h(false) })); return data.data; },
  create: async (body) => { const data = await r(await f(`${API_URL}/api/types-prestation`, { method: 'POST', headers: h(), body: JSON.stringify(body) })); return data.data; }
};

// ── DASHBOARD (ADMIN) ─────────────────────────────────────────
export const dashboardAPI = {
  getResume: async () => { const data = await r(await f(`${API_URL}/api/dashboard/resume`, { headers: h() })); return data.data; },
  getPrestationsAAssigner: async () => { const data = await r(await f(`${API_URL}/api/dashboard/prestations-a-assigner`, { headers: h() })); return data.data; },
  getCaParDomaine: async () => { const data = await r(await f(`${API_URL}/api/dashboard/ca-par-domaine`, { headers: h() })); return data.data; },
  getNotesPrestataires: async () => { const data = await r(await f(`${API_URL}/api/dashboard/notes-prestataires`, { headers: h() })); return data.data; },
  getPerformanceCampagnes: async () => { const data = await r(await f(`${API_URL}/api/dashboard/performance-campagnes`, { headers: h() })); return data.data; },
  getConversionParSource: async () => { const data = await r(await f(`${API_URL}/api/dashboard/conversion-par-source`, { headers: h() })); return data.data; }
};

// ── DEMANDES ──────────────────────────────────────────────────
export const demandesAPI = {
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await f(`${API_URL}/api/demandes${qs ? '?' + qs : ''}`, { headers: h() }));
    // L'API retourne { data: [], total, page, limit } ou { data: [] }
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  listMine: async (clientId: string) => {
    // Pas de /mes-demandes — filtrer par clientId
    const data = await r(await f(`${API_URL}/api/demandes?clientId=${clientId}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  getById: async (id: string) => { const data = await r(await f(`${API_URL}/api/demandes/${id}`, { headers: h() })); return data.data; },
  create: async (body: Record<string, unknown>) => {
    const data = await r(await f(`${API_URL}/api/demandes`, { method: 'POST', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  patch: async (id: string, body: Record<string, unknown>) => {
    const data = await r(await f(`${API_URL}/api/demandes/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  qualifier: async (id: string, adminId: string) => {
    const data = await r(await f(`${API_URL}/api/demandes/${id}/qualifier`, { method: 'POST', headers: h(), body: JSON.stringify({ adminId }) }));
    return data.data;
  },
  valider: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/demandes/${id}/valider`, { method: 'POST', headers: h() }));
    return data.data;
  },
  annuler: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/demandes/${id}/annuler`, { method: 'POST', headers: h() }));
    return data.data;
  },
};

// ── CONVERSATIONS ─────────────────────────────────────────────
export const conversationsAPI = {
  // Le backend filtre automatiquement selon le JWT (clientId ou prestataireId)
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await f(`${API_URL}/api/conversations${qs ? '?' + qs : ''}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  getById: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/conversations/${id}`, { headers: h() }));
    return data.data;
  },
  listMessages: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/conversations/${id}/messages`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  sendMessage: async (id: string, contenu: string) => {
    const data = await r(await f(`${API_URL}/api/conversations/${id}/messages`, { method: 'POST', headers: h(), body: JSON.stringify({ contenu }) }));
    return data.data;
  },
  marquerTousLus: async (id: string) => {
    return r(await f(`${API_URL}/api/conversations/${id}/marquer-tous-lus`, { method: 'POST', headers: h() }));
  },
};

// ── RENDEZ-VOUS ───────────────────────────────────────────────
export const rendezVousAPI = {
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await f(`${API_URL}/api/rendez-vous${qs ? '?' + qs : ''}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  aVenir: async () => {
    const data = await r(await f(`${API_URL}/api/rendez-vous/a-venir`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  create: async (body: Record<string, unknown>) => {
    const data = await r(await f(`${API_URL}/api/rendez-vous`, { method: 'POST', headers: h(), body: JSON.stringify(body) }));
    return data.data;
  },
  confirmer: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/rendez-vous/${id}/confirmer`, { method: 'POST', headers: h() }));
    return data.data;
  },
  annuler: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/rendez-vous/${id}/annuler`, { method: 'POST', headers: h() }));
    return data.data;
  },
  marquerRealise: async (id: string) => {
    const data = await r(await f(`${API_URL}/api/rendez-vous/${id}/marquer-realise`, { method: 'POST', headers: h() }));
    return data.data;
  },
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationsAPI = {
  list: async (filters: Record<string, string> = {}) => {
    const qs = new URLSearchParams(filters).toString();
    const data = await r(await f(`${API_URL}/api/notifications${qs ? '?' + qs : ''}`, { headers: h() }));
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
  },
  markRead: async (id: string) => {
    return r(await f(`${API_URL}/api/notifications/${id}/marquer-lue`, { method: 'POST', headers: h() }));
  },
  markAllRead: async () => {
    return r(await f(`${API_URL}/api/notifications/marquer-toutes-lues`, { method: 'POST', headers: h() }));
  },
};