// Storage durável de blobs de áudio no navegador.
//
// Por quê: `blob:` URLs do MediaRecorder são válidas só enquanto a aba está
// aberta — morrem no reload/navegação/fechar. Para que o borrador de áudio no
// chat sobreviva a um F5, os bytes precisam viver em algo persistente.
// IndexedDB é o único storage do browser que aceita Blobs grandes (localStorage
// tem limite de ~5MB e só aceita string).
//
// A chave retornada por `saveAudioBlob` é um URI sintético `idb-audio://{id}`
// que serve de identificador estável. Quando o código precisa do blob de
// verdade (upload, playback), chama `resolveAudioBlobUrl(uri)` que recupera
// os bytes e gera uma blob URL nova e viva.

const DB_NAME = "alterceo-audio-drafts";
const DB_VERSION = 1;
const STORE_NAME = "blobs";
const URI_PREFIX = "idb-audio://";

type AudioBlobRecord = {
  readonly id: string;
  readonly blob: Blob;
  readonly contentType: string;
  readonly createdAt: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    request.onblocked = () => reject(new Error("IndexedDB open blocked"));
  }).catch((err) => {
    // Reset: next call retries (ex: user allowed storage after denying).
    dbPromise = null;
    throw err;
  });

  return dbPromise;
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
        tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
        tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
      }),
  );
}

function isAudioBlobRecord(value: unknown): value is AudioBlobRecord {
  if (typeof value !== "object" || value === null) return false;
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.id === "string" &&
    rec.blob instanceof Blob &&
    typeof rec.contentType === "string" &&
    typeof rec.createdAt === "string"
  );
}

export function isIndexedDbAudioUri(uri: string): boolean {
  return uri.startsWith(URI_PREFIX);
}

function extractId(uri: string): string {
  return uri.slice(URI_PREFIX.length);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Salva os bytes do blob no IndexedDB e retorna o URI sintético que identifica
// o registro. Esse URI pode ser persistido no AsyncStorage/localStorage sem
// problema — ele não referencia memória, só um id.
export async function saveAudioBlob(blob: Blob): Promise<string> {
  const id = generateId();
  const record: AudioBlobRecord = {
    id,
    blob,
    contentType: blob.type || "audio/webm",
    createdAt: new Date().toISOString(),
  };
  await runTransaction("readwrite", (store) => store.put(record));
  return `${URI_PREFIX}${id}`;
}

// Retorna o blob direto. Útil para upload via FormData no chat ou como body
// de PUT para S3 — os consumidores criam blob URLs próprias quando precisam
// (playback), para ter controle sobre `URL.revokeObjectURL` e não vazar memória.
// Retorna null se o registro não existir — pode acontecer se o usuário limpou
// os dados do site, se o browser reciclou storage por pressão de quota, ou se
// a ITP do Safari apagou depois de 7 dias sem uso.
export async function resolveAudioBlob(uri: string): Promise<Blob | null> {
  if (!isIndexedDbAudioUri(uri)) return null;
  const id = extractId(uri);
  try {
    const raw = await runTransaction("readonly", (store) => store.get(id));
    if (!isAudioBlobRecord(raw)) return null;
    return raw.blob;
  } catch {
    return null;
  }
}

// Verifica se o registro ainda existe. Usado na hidratação de drafts para
// detectar blobs perdidos (cotas, limpeza de dados) e mostrar erro claro.
export async function hasAudioBlob(uri: string): Promise<boolean> {
  if (!isIndexedDbAudioUri(uri)) return false;
  const id = extractId(uri);
  try {
    const raw = await runTransaction("readonly", (store) => store.get(id));
    return isAudioBlobRecord(raw);
  } catch {
    return false;
  }
}

export async function deleteAudioBlob(uri: string): Promise<void> {
  if (!isIndexedDbAudioUri(uri)) return;
  const id = extractId(uri);
  try {
    await runTransaction("readwrite", (store) => store.delete(id));
  } catch {
    // best-effort
  }
}

// Fecha a conexão com o IndexedDB. Usado em logout para garantir que operações
// pendentes terminem antes de limpar os dados do usuário. O navegador fecharia
// sozinho no unload da aba, mas fechar explicitamente evita state stale em
// sessão longa (ex: usuário que faz logout e login de novo sem reload).
export async function closeDatabase(): Promise<void> {
  if (!dbPromise) return;
  const pending = dbPromise;
  dbPromise = null;
  try {
    const db = await pending;
    db.close();
  } catch {
    // best-effort — se abrir falhou, não há nada a fechar
  }
}

export async function clearAllAudioBlobs(): Promise<void> {
  try {
    await runTransaction("readwrite", (store) => store.clear());
  } catch {
    // best-effort
  }
}
