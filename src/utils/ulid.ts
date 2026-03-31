const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeBase32(value: bigint, length: number): string {
  let next = value;
  const chars = Array<string>(length);
  for (let i = length - 1; i >= 0; i -= 1) {
    const remainder = Number(next % 32n);
    chars[i] = CROCKFORD_BASE32[remainder];
    next /= 32n;
  }
  return chars.join("");
}

export function ulid(): string {
  const timestampMs = BigInt(Date.now());
  const randomBytes = new Uint8Array(10);
  for (let i = 0; i < randomBytes.length; i += 1) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }

  let randomness = 0n;
  for (const byte of randomBytes) {
    randomness = (randomness << 8n) | BigInt(byte);
  }

  return `${encodeBase32(timestampMs, 10)}${encodeBase32(randomness, 16)}`;
}
