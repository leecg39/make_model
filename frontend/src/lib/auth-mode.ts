export function isMockAuthMode(): boolean {
  const mode = process.env.NEXT_PUBLIC_AUTH_MODE;
  const useMock = process.env.NEXT_PUBLIC_AUTH_MOCK;

  if (mode?.toLowerCase() === 'mock') {
    return true;
  }

  return useMock?.toLowerCase() === 'true';
}
