import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text:latest';

const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge');
const INDEX_DIR = path.join(__dirname, 'index');
const INDEX_FILE = path.join(INDEX_DIR, 'rag-index.json');

const files = (await readdir(KNOWLEDGE_DIR)).filter((file) => file.endsWith('.md')).sort();
const chunks = [];

for (const file of files) {
  const content = await readFile(path.join(KNOWLEDGE_DIR, file), 'utf8');
  for (const [index, text] of chunkMarkdown(content).entries()) {
    chunks.push({
      id: `${file}#${index + 1}`,
      file,
      text,
    });
  }
}

console.log(`Indexation de ${chunks.length} passages avec ${EMBEDDING_MODEL}...`);

const indexed = [];
for (const chunk of chunks) {
  const embedding = await embed(chunk.text);
  indexed.push({ ...chunk, embedding });
}

await mkdir(INDEX_DIR, { recursive: true });
await writeFile(
  INDEX_FILE,
  JSON.stringify({
    createdAt: new Date().toISOString(),
    embeddingModel: EMBEDDING_MODEL,
    chunks: indexed,
  }, null, 2),
);

console.log(`Index RAG ecrit dans ${INDEX_FILE}`);

function chunkMarkdown(content) {
  const clean = content
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

  const sections = clean
    .split(/\n(?=#{1,3}\s)/g)
    .map((section) => section.trim())
    .filter(Boolean);

  const chunks = [];
  for (const section of sections) {
    if (wordCount(section) <= 180) {
      chunks.push(section);
      continue;
    }

    const paragraphs = section.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    let current = '';
    for (const paragraph of paragraphs) {
      const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
      if (wordCount(candidate) > 180 && current) {
        chunks.push(current);
        current = paragraph;
      } else {
        current = candidate;
      }
    }
    if (current) chunks.push(current);
  }

  return chunks;
}

function wordCount(value) {
  return value.split(/\s+/).filter(Boolean).length;
}

async function embed(text) {
  const response = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const details = await safeReadError(response);
    throw new Error(
      `Embedding Ollama indisponible (${response.status}). Modele demande: ${EMBEDDING_MODEL}. `
      + `Installez-le avec "ollama pull nomic-embed-text".`
      + (details ? ` Detail: ${details}` : ''),
    );
  }

  const payload = await response.json();
  const embedding = Array.isArray(payload?.embeddings) ? payload.embeddings[0] : payload?.embedding;
  if (!Array.isArray(embedding)) {
    throw new Error('Reponse embedding Ollama invalide.');
  }
  return embedding;
}

async function safeReadError(response) {
  try {
    const payload = await response.json();
    return payload?.error ? String(payload.error) : JSON.stringify(payload);
  } catch {
    return '';
  }
}
