// Native: os URIs são `file://` reais que `fetch` lê direto. Nada a resolver.

export async function resolveRecordingBlob(_uri: string): Promise<Blob | null> {
  return null;
}
