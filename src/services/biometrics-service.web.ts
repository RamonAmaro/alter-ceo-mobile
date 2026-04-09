export async function isBiometricsAvailable(): Promise<boolean> {
  return false;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  return false;
}

export async function saveCredentials(_email: string, _password: string): Promise<void> {}

export async function getCredentials(): Promise<{ email: string; password: string } | null> {
  return null;
}

export async function clearCredentials(): Promise<void> {}

export async function hasStoredCredentials(): Promise<boolean> {
  return false;
}
