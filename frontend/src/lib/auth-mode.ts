type AuthMode = 'mock' | 'real' | 'supabase';

function readAuthMode(): AuthMode | null {
  const rawMode = process.env.NEXT_PUBLIC_AUTH_MODE?.toLowerCase();
  if (rawMode === 'mock' || rawMode === 'real' || rawMode === 'supabase') {
    return rawMode;
  }

  return null;
}

export function isMockAuthMode(): boolean {
  const mode = readAuthMode();
  const useMock = process.env.NEXT_PUBLIC_AUTH_MOCK;

  if (mode === 'mock') {
    return true;
  }

  return useMock?.toLowerCase() === 'true';
}

export function isSupabaseAuthMode(): boolean {
  return readAuthMode() === 'supabase';
}

export function isRealAuthMode(): boolean {
  return readAuthMode() === 'real';
}
