// En dev : proxy Vite évite le CORS (vite.config.js)
// En prod : utilise l'URL complète via VITE_API_URL
const API_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://batinnov-api.onrender.com')
  : '';  // vide = proxy local Vite

export const getToken = () => localStorage.getItem('batinnov_token');
export const setToken = (t) => localStorage.setItem('batinnov_token', t);
export const removeToken = () => localStorage.removeItem('batinnov_token');

const h = (auth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
  return headers;
};

const r = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Erreur API');
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