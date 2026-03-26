import { API_BASE_URL, API_VERSION } from "@/constants/env";

const STOP_FINALIZATION_TIMEOUT_MS = 4000;
const WS_CONNECT_TIMEOUT_MS = 5000;

export interface TranscriptionSession {
  readonly sendAudioData: (data: string | Float32Array) => void;
  readonly stop: () => Promise<string>;
  readonly close: () => void;
}

type WsMessage = { type: string; text?: string };

function buildWsUrl(): string {
  const base = API_BASE_URL.replace(/^https?/, (m) =>
    m === "https" ? "wss" : "ws",
  );
  return `${base}/${API_VERSION}/audio/transcribe/ws?language=es`;
}

function float32ToPcm16Base64(samples: Float32Array): string {
  const pcm16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
    const timeout = setTimeout(
      () => reject(new Error("Timeout conectando al servidor.")),
      WS_CONNECT_TIMEOUT_MS,
    );
    ws.onopen = () => { clearTimeout(timeout); resolve(ws); };
    ws.onerror = () => { clearTimeout(timeout); reject(new Error("No se pudo conectar.")); };
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

function awaitFinalTranscript(
  ws: WebSocket,
  accumulatedBeforeStop: string,
  timeoutMs: number,
): Promise<string> {
  return new Promise((resolve) => {
    const finish = (text: string) => {
      clearTimeout(timer);
      safeClose(ws);
      resolve(text);
    };

    const timer = setTimeout(
      () => finish(accumulatedBeforeStop),
      timeoutMs,
    );

    ws.onmessage = (event) => {
      const msg = parseWsMessage(event.data);
      if (!msg) return;
      if (msg.type === "transcript_final" && msg.text) {
        const full = accumulatedBeforeStop
          ? `${accumulatedBeforeStop} ${msg.text}`
          : msg.text;
        finish(full);
      }
    };
  });
}

export async function createTranscriptionSession(): Promise<TranscriptionSession> {
  const ws = await connectWebSocket(buildWsUrl());

  const accumulated = { final: "", delta: "" };

  ws.onmessage = (event) => {
    const msg = parseWsMessage(event.data);
    if (!msg) return;
    if (msg.type === "transcript_final" && msg.text) {
      accumulated.final = accumulated.final
        ? `${accumulated.final} ${msg.text}`
        : msg.text;
      accumulated.delta = "";
    } else if (msg.type === "transcript_delta" && msg.text) {
      accumulated.delta = msg.text;
    }
  };

  return {
    sendAudioData: (data: string | Float32Array): void => {
      sendJson(ws, { type: "audio_chunk", data: encodeAudioChunk(data) });
    },

    stop: (): Promise<string> => {
      if (ws.readyState !== WebSocket.OPEN) {
        return Promise.resolve(accumulated.final || accumulated.delta);
      }
      const snapshotBeforeStop = accumulated.final || accumulated.delta;
      sendJson(ws, { type: "stop" });
      return awaitFinalTranscript(ws, snapshotBeforeStop, STOP_FINALIZATION_TIMEOUT_MS);
    },

    close: () => safeClose(ws),
  };
}
