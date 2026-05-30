import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.LOCAL_AI_PORT ?? 8787);
const HOST = process.env.LOCAL_AI_HOST ?? '127.0.0.1';
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'mistral:latest';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text:latest';
const RAG_INDEX_FILE = path.join(__dirname, 'index', 'rag-index.json');
const CORE_GUIDANCE_FILES = new Set(['ton-assistant.md', 'exemples-dialogues.md', 'routes-actions.md', 'format-reponse-json.md']);
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://batinnov-gehu.vercel.app',
  'https://batinnov.fr',
]);

const VALID_PAGES = new Set([
  'contactSupport',
  'helpCenter',
  'messages',
  'devis',
  'factures',
  'demandes',
  'chantiers',
  'agenda',
  'proAgenda',
  'proLeads',
  'proChantiers',
  'adminDashboard',
  'adminSuivi',
]);

const VALID_INTENTS = new Set([
  'contact_direct',
  'quote_status',
  'payment_blocked',
  'appointment_help',
  'document_required',
  'request_tracking',
  'provider_validation',
  'admin_priority',
  'admin_support',
  'service_info',
  'unknown',
]);

const FALLBACK_RESPONSE = {
  answer: "Je n'ai pas assez d'informations fiables pour répondre. Le support peut prendre le relais.",
  intent: 'unknown',
  confidence: 0.25,
  actions: [{ label: 'Nous contacter', page: 'contactSupport' }],
  sources: ['fallback'],
};

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  try {
    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { ok: true, model: OLLAMA_MODEL });
      return;
    }
    if (req.method === 'POST' && req.url === '/chatbot/query') {
      const body = await readJson(req);
      console.log('[chatbot/query]', new Date().toISOString(), `role=${body?.role ?? 'n/a'}`, `msg=${String(body?.message ?? '').slice(0, 100)}`);
      const response = await answerChatbot(body);
      sendJson(res, 200, { data: response });
      return;
    }
    sendJson(res, 404, { error: { message: 'Route introuvable' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur locale';
    sendJson(res, 500, { error: { message } });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Batinnov AI server  →  http://${HOST}:${PORT}`);
  console.log(`  Ollama              →  ${OLLAMA_URL}  (${OLLAMA_MODEL})\n`);
});

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

async function answerChatbot(body) {
  const role = normalizeRole(body?.role);
  const message = String(body?.message ?? '').trim();
  const context = body?.context && typeof body.context === 'object' ? body.context : {};
  const history = normalizeHistory(body?.history);

  if (!message) return { ...FALLBACK_RESPONSE, answer: 'Posez-moi une question sur votre demande, vos devis ou vos rendez-vous Batinnov.', sources: ['empty-message'] };
  if (isBlockedExpression(message)) return { answer: "Je ne suis pas en mesure de répondre à ça.", intent: 'unknown', confidence: 1, actions: [{ label: 'Support', page: 'contactSupport' }], sources: ['fallback'] };
  if (isUnclearShortMessage(message)) return { answer: "Je n'ai pas bien compris. Parlez-moi d'une demande, d'un devis, d'un paiement ou d'un rendez-vous.", intent: 'unknown', confidence: 0.9, actions: [{ label: "Centre d'aide", page: 'helpCenter' }], sources: ['fallback'] };
  if (isGreetingOrFriendlySmallTalk(message)) return { answer: friendlySmallTalkAnswer(message), intent: 'unknown', confidence: 0.95, actions: [{ label: 'Demander un devis', page: 'devis' }, { label: "Centre d'aide", page: 'helpCenter' }], sources: ['fallback'] };
  if (isOffTopicKnowledgeQuestion(message)) return { answer: "Je ne peux pas répondre de façon fiable à cette question. Je peux vous aider sur les demandes, devis, paiements, rendez-vous ou documents.", intent: 'unknown', confidence: 0.95, actions: [{ label: "Centre d'aide", page: 'helpCenter' }], sources: ['fallback'] };

  const contextualShortcut = answerContextualFollowUp(message, history, role);
  if (contextualShortcut) return contextualShortcut;

  const snippets = await retrieveKnowledge([history.map(i => i.content).join('\n'), message].join('\n'), role);
  const prompt = buildPrompt({ role, message, context, history, snippets });
  const raw = await callOllama(prompt);
  return sanitizeResponse(parseModelResponse(raw), snippets, { message, role });
}

async function retrieveKnowledge(message, role) {
  const docs = await loadKnowledgeDocs();
  const coreDocs = docs.filter(doc => CORE_GUIDANCE_FILES.has(doc.file)).map(doc => ({ ...doc, score: 1 }));
  const vectorResults = await retrieveKnowledgeWithEmbeddings(message, role);
  const queryTerms = terms(`${message} ${role}`);
  const lexicalResults = docs.map(doc => ({ ...doc, score: scoreText(doc.content, queryTerms) })).sort((a, b) => b.score - a.score).filter(doc => doc.score > 0).slice(0, 4);
  return uniqueSnippets([...coreDocs, ...vectorResults, ...lexicalResults]).slice(0, 8);
}

async function retrieveKnowledgeWithEmbeddings(message, role) {
  const index = await loadRagIndex();
  if (!index?.chunks?.length) return [];
  try {
    const queryEmbedding = await embedQuery(`${role}\n${message}`);
    return index.chunks.map(chunk => ({ file: chunk.file, content: chunk.text, score: cosineSimilarity(queryEmbedding, chunk.embedding) })).sort((a, b) => b.score - a.score).filter(chunk => chunk.score > 0.18).slice(0, 5);
  } catch (error) {
    console.warn(`RAG embeddings indisponible: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}

let ragIndexCache = undefined;
async function loadRagIndex() {
  if (ragIndexCache !== undefined) return ragIndexCache;
  try {
    const raw = await readFile(RAG_INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    ragIndexCache = parsed?.chunks ? parsed : null;
  } catch { ragIndexCache = null; }
  return ragIndexCache;
}

async function embedQuery(text) {
  const response = await fetch(`${OLLAMA_URL}/api/embed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }) });
  if (!response.ok) { const d = await safeReadError(response); throw new Error(`Embedding impossible (${response.status})${d ? `: ${d}` : ''}`); }
  const payload = await response.json();
  const embedding = Array.isArray(payload?.embeddings) ? payload.embeddings[0] : payload?.embedding;
  if (!Array.isArray(embedding)) throw new Error('Réponse embedding invalide.');
  return embedding;
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

let knowledgeCache = null;
async function loadKnowledgeDocs() {
  if (knowledgeCache) return knowledgeCache;
  const dir = path.join(__dirname, 'knowledge');
  const files = (await readdir(dir)).filter(f => f.endsWith('.md'));
  knowledgeCache = await Promise.all(files.map(async file => ({ file, content: await readFile(path.join(dir, file), 'utf8') })));
  return knowledgeCache;
}

function buildPrompt({ role, message, context, history, snippets }) {
  const sources = snippets.map(s => `--- ${s.file}\n${s.content}`).join('\n\n');
  const conversation = history.map(i => `${i.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${i.content}`).join('\n');
  return [
    {
      role: 'system',
      content: [
        'Tu es l assistant Batinnov, un conseiller conversationnel integre au site web batinnov.fr.',
        'Tu peux discuter naturellement pour les salutations et phrases simples.',
        'Pour les sujets Batinnov, tu utilises les SOURCES comme reference fiable.',
        'Si une question manque de contexte, pose une courte question de clarification.',
        'Tu ne dois jamais inventer un statut, un devis, une facture, un rendez-vous ou un montant.',
        'L Admin est l intermediaire obligatoire pour les flux critiques.',
        'Tu tiens compte de l historique pour comprendre les references pronominales.',
        'Tu reponds en francais clair, naturel et professionnel. Maximum 4 phrases.',
        'Tu retournes uniquement un JSON valide avec les cles answer, intent, confidence, actions, sources.',
        'Les actions contiennent label et page. Les valeurs de page sont dans les sources routes-actions.md.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Role utilisateur: ${role}`,
        `Contexte: ${JSON.stringify(context)}`,
        '',
        'HISTORIQUE:',
        conversation || 'Aucun.',
        '',
        'SOURCES:',
        sources || 'Aucune source pertinente.',
        '',
        `Question: ${message}`,
      ].join('\n'),
    },
  ];
}

async function callOllama(messages) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: OLLAMA_MODEL, stream: false, format: 'json', messages, options: { temperature: 0.28, top_p: 0.9 } }) });
  if (!response.ok) {
    const d = await safeReadError(response);
    throw new Error(`Ollama indisponible (${response.status}). Modèle: ${OLLAMA_MODEL}. Vérifiez avec "ollama list".${d ? ` Détail: ${d}` : ''}`);
  }
  const payload = await response.json();
  return payload?.message?.content ?? '';
}

function parseModelResponse(raw) {
  try { const p = JSON.parse(raw); return p && typeof p === 'object' ? p : FALLBACK_RESPONSE; }
  catch { return { ...FALLBACK_RESPONSE, answer: String(raw || FALLBACK_RESPONSE.answer) }; }
}

function sanitizeResponse(response, snippets, request = {}) {
  let answer = String(response?.answer ?? FALLBACK_RESPONSE.answer);
  const sourceFiles = new Set(snippets.map(s => s.file));
  if (containsForbiddenContact(answer)) return { answer: "Le contact direct client-prestataire n'est pas autorisé sur Batinnov. L'Admin coordonne les échanges.", intent: 'contact_direct', confidence: 0.92, actions: [{ label: 'Support Admin', page: 'contactSupport' }], sources: ['regles-admin-centric.md'] };

  const actions = Array.isArray(response?.actions)
    ? response.actions.filter(a => a && VALID_PAGES.has(a.page)).map(a => ({ label: String(a.label ?? 'Ouvrir'), page: a.page })).slice(0, 3)
    : [];

  const intent = normalizeIntent(response?.intent, answer, request.message);
  if (intent === 'unknown' && isBusinessLikeQuestion(request.message) && !/support/i.test(answer)) {
    answer = `${answer} Je peux transmettre votre question au support si vous voulez une vérification humaine.`;
  }

  return { answer, intent, confidence: clamp(Number(response?.confidence ?? 0.5), 0, 1), actions: preferredActions(intent, request.role, actions), sources: normalizeSources(response?.sources, sourceFiles, snippets) };
}

function normalizeIntent(intent, answer, question = '') {
  const q = terms(question).join(' ');
  if (/rendez|rdv|creneau|disponibilite/.test(q)) return 'appointment_help';
  if (/devis|refus|accepte|motif/.test(q)) return 'quote_status';
  if (/paiement|facture|payer|regler/.test(q)) return 'payment_blocked';
  if (/contact|telephone|numero|appeler|message/.test(q)) return 'contact_direct';
  if (/document|kbis|assurance|justificatif/.test(q)) return 'document_required';
  if (/demande|suivi|etape|avancement/.test(q)) return 'request_tracking';
  if (typeof intent === 'string' && VALID_INTENTS.has(intent)) return intent;
  const a = terms(answer).join(' ');
  if (/rendez|rdv|creneau/.test(a)) return 'appointment_help';
  if (/devis|refus|accepte/.test(a)) return 'quote_status';
  if (/paiement|facture|payer/.test(a)) return 'payment_blocked';
  return 'unknown';
}

function preferredActions(intent, role, modelActions) {
  const byIntent = {
    payment_blocked:  [{ label: 'Mes factures', page: 'factures' }, { label: 'Support Admin', page: 'contactSupport' }],
    contact_direct:   [{ label: 'Support Admin', page: 'contactSupport' }],
    appointment_help: role === 'pro' ? [{ label: 'Mon agenda', page: 'proAgenda' }] : [{ label: 'Mon agenda', page: 'agenda' }, { label: 'Support Admin', page: 'contactSupport' }],
    quote_status:     role === 'pro' ? [{ label: 'Mes leads', page: 'proLeads' }] : [{ label: 'Mes devis', page: 'devis' }, { label: 'Support Admin', page: 'contactSupport' }],
    document_required:[{ label: "Centre d'aide", page: 'helpCenter' }],
    request_tracking: [{ label: 'Mes demandes', page: 'demandes' }, { label: 'Support Admin', page: 'contactSupport' }],
    unknown: FALLBACK_RESPONSE.actions,
  };
  return byIntent[intent] ?? (modelActions.length > 0 ? modelActions : FALLBACK_RESPONSE.actions);
}

function normalizeSources(sources, sourceFiles, snippets) {
  const model = Array.isArray(sources) ? sources.map(String).filter(s => sourceFiles.has(s)) : [];
  return Array.from(new Set([...model, ...snippets.map(s => s.file)])).slice(0, 4);
}

function uniqueSnippets(snippets) {
  const seen = new Set(); const unique = [];
  for (const s of snippets) { if (!s?.file || seen.has(s.file)) continue; seen.add(s.file); unique.push(s); }
  return unique;
}

function containsForbiddenContact(text) {
  const n = text.toLowerCase();
  return /appelez directement|contactez directement|envoyez un message directement/.test(n) || /numero du prestataire|numero de l artisan|telephone du prestataire/.test(n);
}

function answerContextualFollowUp(message, history, role) {
  const n = normalizeText(message);
  const prev = history.map(i => normalizeText(i.content)).join(' ');
  const aboutRequest = /\bdemande\b/.test(n) || /\bdemande\b/.test(prev);
  const wrongRequest = /\b(pas|plus)\s+(la\s+)?(bonne|bon)\b/.test(n) || /\bmauvaise\s+demande\b/.test(n);
  if (aboutRequest && wrongRequest) return { answer: "Si ce n'est pas la bonne demande, vérifiez le service et les documents dans votre suivi. Si l'erreur vient du dossier affiché, contactez le support Admin.", intent: 'request_tracking', confidence: 0.94, actions: [{ label: 'Mes demandes', page: 'demandes' }, { label: 'Support Admin', page: 'contactSupport' }], sources: ['statuts-etapes.md'] };
  return null;
}

function isBlockedExpression(m) { return /\bnk[mn]k?\b/i.test(String(m)); }
function isUnclearShortMessage(m) {
  const n = normalizeText(m);
  if (!n || hasBusinessTerm(n) || isGreetingOrFriendlySmallTalk(n)) return false;
  const w = terms(n);
  return w.length === 0 || (w.length <= 2 && w.every(t => !/(bonjour|bonsoir|salut|hello|coucou|merci|oui|non|ok|rdv|irve)/.test(t)));
}
function isGreetingOrFriendlySmallTalk(m) {
  const n = normalizeText(m);
  if (hasBusinessTerm(n)) return false;
  return /^(bonjour|bonsoir|salut|hello|coucou|hey|yo)(\s|$)/.test(n) || /^(ca va|cv|comment ca va|tu vas bien|merci|ok merci|parfait merci)/.test(n);
}
function friendlySmallTalkAnswer(m) {
  const n = normalizeText(m);
  if (/^(merci|ok merci|parfait merci)$/.test(n)) return "Avec plaisir ! Je peux aussi vous aider à vérifier une demande, un devis, un paiement ou un rendez-vous.";
  if (/ca va|tu vas bien/.test(n)) return "Ça va, merci ! Je suis là pour votre parcours Batinnov : demande, devis, paiement ou rendez-vous.";
  return "Bonjour ! Vous souhaitez vérifier une demande, un devis, un paiement ou un rendez-vous ?";
}
function isOffTopicKnowledgeQuestion(m) {
  const n = normalizeText(m);
  if (hasBusinessTerm(n)) return false;
  return /^(qui|quoi|quelle|quel|ou|combien|pourquoi|comment)\b/.test(n) && /\b(meteo|foot|president|capitale|recette|film|musique|bitcoin)\b/.test(n);
}
function isBusinessLikeQuestion(m) { return hasBusinessTerm(normalizeText(m)); }
function hasBusinessTerm(n) { return /\b(admin|aide|artisan|assurance|bloque|chantier|client|compte|creneau|demande|devis|document|dossier|erreur|facture|irve|kbis|message|paiement|payer|prestataire|pro|rdv|rendez|service|suivi|travaux|validation)\b/.test(n); }
function normalizeRole(r) { return r === 'admin' || r === 'pro' ? r : 'client'; }
function normalizeHistory(h) {
  if (!Array.isArray(h)) return [];
  return h.filter(i => i && (i.role === 'user' || i.role === 'assistant') && typeof i.content === 'string').map(i => ({ role: i.role, content: i.content.trim().slice(0, 700) })).filter(i => i.content.length > 0).slice(-8);
}
function normalizeText(v) { return String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['']/g, ' ').trim(); }
function terms(v) { return String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(t => t.length >= 3); }
function scoreText(text, queryTerms) { const n = terms(text).join(' '); return queryTerms.reduce((s, t) => s + (n.includes(t) ? 1 : 0), 0); }
function clamp(v, min, max) { if (Number.isNaN(v)) return min; return Math.max(min, Math.min(max, v)); }
async function readJson(req) { const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks).toString('utf8'); return raw ? JSON.parse(raw) : {}; }
function sendJson(res, status, payload) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(payload)); }
async function safeReadError(response) { try { const p = await response.json(); return p?.error ? String(p.error) : JSON.stringify(p); } catch { return ''; } }
