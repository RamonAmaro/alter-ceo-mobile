import { API_ABSOLUTE_URL, API_VERSION } from "@/constants/env";

// Backend espera no máximo 1.2s por um transcript_final extra após receber `stop`
// (ver _STOP_FINAL_TIMEOUT_S no backend). Damos uma margem confortável aqui para
// cobrir latência de rede e o close do servidor — mesmo que o backend feche antes,
// o onclose abaixo resolve a Promise imediatamente com o que foi acumulado.
const STOP_FINALIZATION_TIMEOUT_MS = 5000;
const WS_CONNECT_TIMEOUT_MS = 5000;

export interface TranscriptionSession {
  readonly sendAudioData: (data: string | Float32Array) => void;
  readonly stop: () => Promise<string>;
  readonly close: () => void;
  readonly onError: (cb: (message: string) => void) => void;
}

type WsMessage = { type: string; text?: string; message?: string };

function buildWsUrl(): string {
  const base = API_ABSOLUTE_URL.replace(/^https?/, (m) => (m === "https" ? "wss" : "ws"));
  return `${base}/${API_VERSION}/audio/transcribe/ws?language=es`;
}

function float32ToPcm16Base64(samples: Float32Array): string {
  const pcm16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  const CHUNK = 8192;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return btoa(parts.join(""));
}

function encodeAudioChunk(data: string | Float32Array): string {
  return typeof data === "string" ? data : float32ToPcm16Base64(data);
}

function parseWsMessage(raw: unknown): WsMessage | null {
  try {
    return JSON.parse(raw as string) as WsMessage;
  } catch {
    return null;
  }
}

function connectWebSocket(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      reject(new Error("Timeout conectando al servidor."));
    }, WS_CONNECT_TIMEOUT_MS);
    ws.onopen = () => {
      clearTimeout(timeout);
      resolve(ws);
    };
    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("No se pudo conectar."));
    };
  });
}

function sendJson(ws: WebSocket, payload: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function safeClose(ws: WebSocket): void {
  if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
    ws.close();
  }
}

interface TranscriptAccumulator {
  final: string;
  delta: string;
}

function pickBestTranscript(acc: TranscriptAccumulator): string {
  // Final segments are authoritative; delta is the in-flight tail. Combine both
  // so we never lose the last unfinalized words when the server closes early.
  const final = acc.final.trim();
  const delta = acc.delta.trim();
  if (final && delta) return `${final} ${delta}`;
  return final || delta;
}

export async function createTranscriptionSession(): Promise<TranscriptionSession> {
  const wsUrl = buildWsUrl();
  const ws = await connectWebSocket(wsUrl);

  const accumulated: TranscriptAccumulator = { final: "", delta: "" };
  let errorCallback: ((message: string) => void) | null = null;
  let stopResolver: ((text: string) => void) | null = null;

  function resolveStop(): void {
    const resolver = stopResolver;
    if (!resolver) return;
    stopResolver = null;
    resolver(pickBestTranscript(accumulated));
  }

  ws.onmessage = (event) => {
    const msg = parseWsMessage(event.data);
    // eslint-disable-next-line no-console
    console.log("[transcription-service] WS message", msg);
    if (!msg) return;
    if (msg.type === "transcript_final" && msg.text) {
      accumulated.final = accumulated.final ? `${accumulated.final} ${msg.text}` : msg.text;
      accumulated.delta = "";
    } else if (msg.type === "transcript_delta" && msg.text) {
      accumulated.delta = accumulated.delta + msg.text;
    } else if (msg.type === "error") {
      const errorMsg = msg.message ?? msg.text ?? "Error de transcripción desconocido";
      errorCallback?.(errorMsg);
    }
  };

  ws.onclose = (e) => {
    // eslint-disable-next-line no-console
    console.log("[transcription-service] WS closed", { code: e.code, reason: e.reason });
    // Always resolve a pending stop() with whatever we accumulated when the
    // server closes the connection — backend closes after _STOP_FINAL_TIMEOUT_S
    // (~1.2s), which is normal and must not be treated as failure.
    resolveStop();
    if (e.code !== 1000 && e.code !== 1005) {
      const reason = e.reason || `Conexión cerrada inesperadamente (código ${e.code})`;
      errorCallback?.(reason);
    }
  };

  ws.onerror = (e) => {
    // eslint-disable-next-line no-console
    console.log("[transcription-service] WS error", e);
    errorCallback?.("Error de conexión con el servidor de transcripción");
    resolveStop();
  };

  return {
    sendAudioData: (data: string | Float32Array): void => {
      sendJson(ws, { type: "audio_chunk", data: encodeAudioChunk(data) });
    },

    stop: (): Promise<string> => {
      if (ws.readyState !== WebSocket.OPEN) {
        return Promise.resolve(pickBestTranscript(accumulated));
      }
      sendJson(ws, { type: "stop" });
      return new Promise<string>((resolve) => {
        stopResolver = resolve;
        // Safety net: if the server neither sends a closing frame nor more
        // transcripts within the timeout, resolve with what we have.
        setTimeout(() => {
          if (stopResolver === resolve) {
            stopResolver = null;
            safeClose(ws);
            resolve(pickBestTranscript(accumulated));
          }
        }, STOP_FINALIZATION_TIMEOUT_MS);
      });
    },

    close: () => safeClose(ws),

    onError: (cb: (message: string) => void) => {
      errorCallback = cb;
    },
  };
}
