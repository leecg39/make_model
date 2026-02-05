/**
 * @TEST P1-S1-V - Login connection point verification
 * @SPEC Phase 1 Login Screen + Authentication
 *
 * This file verifies contract alignment between frontend and backend:
 * - API endpoint URLs match
 * - Request/response schemas align
 * - Authentication flow works end-to-end
 * - Navigation redirects to correct roles
 */

// ============================================================================
// 1. ENDPOINT VERIFICATION
// ============================================================================

// Backend: POST /api/auth/login (auth.py line 70)
const BACKEND_LOGIN_ENDPOINT = '/api/auth/login';

// Frontend: authService.login() calls (auth.ts line 54)
const FRONTEND_LOGIN_URL = '/api/v1/auth/login/json';

// VERIFICATION: URL Mismatch
export const EndpointCheck = {
  backend: BACKEND_LOGIN_ENDPOINT,
  frontend: FRONTEND_LOGIN_URL,
  match: BACKEND_LOGIN_ENDPOINT === FRONTEND_LOGIN_URL,
  issue: `URL MISMATCH: Backend endpoint is "${BACKEND_LOGIN_ENDPOINT}" but frontend calls "${FRONTEND_LOGIN_URL}"`,
};

// Backend: POST /api/auth/social/google (auth.py line 157)
const BACKEND_SOCIAL_GOOGLE = '/api/auth/social/google';
export const SocialGoogleCheck = {
  backend: BACKEND_SOCIAL_GOOGLE,
  exists: true,
  status: 501, // NOT_IMPLEMENTED
  message: 'Stub endpoint exists',
};

// ============================================================================
// 2. REQUEST/RESPONSE SCHEMA VERIFICATION
// ============================================================================

/**
 * Backend LoginRequest schema (schemas/auth.py line 28)
 */
interface BackendLoginRequest {
  email: string; // EmailStr
  password: string;
}

/**
 * Backend TokenResponse schema (schemas/auth.py line 18)
 */
interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    nickname?: string;
    role?: 'brand' | 'creator';
    company_name?: string;
    is_active: boolean;
    created_at: string;
  };
}

/**
 * Frontend LoginRequest type (types/auth.ts line 16)
 */
interface FrontendLoginRequest {
  email: string;
  password: string;
}

/**
 * Frontend AuthResponse type (types/auth.ts line 30)
 * NOTE: Missing refresh_token and user!
 */
interface FrontendAuthResponse {
  access_token: string;
  token_type: string;
}

export const RequestSchemaCheck = {
  name: 'LoginRequest',
  backend: {
    fields: ['email', 'password'],
  },
  frontend: {
    fields: ['email', 'password'],
  },
  match: true,
  note: 'Request schema matches perfectly',
};

export const ResponseSchemaCheck = {
  name: 'LoginResponse / AuthResponse',
  backend: {
    fields: ['access_token', 'refresh_token', 'token_type', 'user'],
    source: 'schemas/auth.py:TokenResponse',
  },
  frontend: {
    fields: ['access_token', 'token_type'],
    source: 'types/auth.ts:AuthResponse',
  },
  match: false,
  issues: [
    'Frontend AuthResponse missing refresh_token field',
    'Frontend AuthResponse missing user field',
    'Frontend stores token but never uses refresh_token (may need for token refresh)',
  ],
  severity: 'HIGH',
};

// ============================================================================
// 3. AUTHENTICATION FLOW VERIFICATION
// ============================================================================

/**
 * Frontend auth flow (auth.ts line 43)
 */
export const AuthFlowCheck = {
  login: {
    file: 'services/auth.ts',
    line: 53,
    steps: [
      'Call authService.login(data)',
      'Store access_token via authLib.setToken()',
      'Return AuthResponse',
    ],
    issue: 'refresh_token returned from backend but NOT stored',
  },
  store: {
    file: 'stores/auth.ts',
    line: 46,
    action: 'Set token from response.access_token',
    note: 'Token stored in Zustand + localStorage (via persist middleware)',
    refreshTokenHandling: 'NOT IMPLEMENTED - backend returns refresh_token but frontend ignores it',
  },
};

// ============================================================================
// 4. TOKEN STORAGE VERIFICATION
// ============================================================================

/**
 * Token storage mechanism (stores/auth.ts line 102)
 */
export const TokenStorageCheck = {
  storage: 'localStorage',
  middleware: 'zustand/persist',
  key: 'auth-storage',
  persisted: ['token'],
  tokenLocation: 'authLib.getToken() / authLib.setToken()',
  refreshTokenLocation: 'NOT STORED - backend returns but frontend ignores',
  severity: 'MEDIUM',
  impact: 'Token refresh may not work correctly if refresh_token not available',
};

// ============================================================================
// 5. NAVIGATION/REDIRECT VERIFICATION
// ============================================================================

/**
 * Role-based navigation (page.tsx line 64)
 */
export const NavigationCheck = {
  file: 'app/auth/login/page.tsx',
  redirectLogic: {
    'brand': '/dashboard/brand',
    'creator': '/dashboard/creator',
    'unknown': '/',
  },
  lines: 66-72,
  verification: {
    roleFieldExists: true,
    redirectsExist: true,
    issue: 'NONE - role-based redirects correctly implemented',
  },
};

/**
 * Signup link verification (page.tsx line 115)
 */
export const SignupLinkCheck = {
  file: 'app/auth/login/page.tsx',
  line: 115,
  href: '/auth/signup',
  text: '회원가입하기',
  verification: {
    linkExists: true,
    routeExists: true,
    note: 'Link correctly points to /auth/signup',
  },
};

// ============================================================================
// 6. TYPE CONSISTENCY VERIFICATION
// ============================================================================

/**
 * User type definitions
 * Backend: User model with id, email, nickname, role, company_name
 * Frontend: User interface with similar fields
 */
export const UserTypeCheck = {
  backendFields: [
    'id',
    'email',
    'nickname',
    'role',
    'company_name',
    'hashed_password',
    'is_active',
    'created_at',
  ],
  frontendFields: [
    'id',
    'email',
    'name',
    'nickname',
    'role',
    'company_name',
    'is_active',
    'created_at',
  ],
  mismatch: {
    frontend_has_name: true,
    backend_doesnt_have_name: true,
    note: 'Backend has no "name" field, but frontend User interface includes it',
    severity: 'MEDIUM',
  },
};

/**
 * RegisterRequest type mismatch
 */
export const RegisterTypeCheck = {
  backend: {
    file: 'schemas/auth.py',
    fields: {
      email: 'required (EmailStr)',
      password: 'required (min 8 chars)',
      nickname: 'required',
      role: 'required (default: "creator")',
      company_name: 'optional (required if role="brand")',
    },
  },
  frontend: {
    file: 'types/auth.ts',
    fields: {
      email: 'required',
      password: 'required',
      name: 'optional',
      nickname: 'optional',
      role: 'optional (default: "creator")',
      company_name: 'optional',
    },
  },
  mismatch: {
    nickname: 'required in backend, optional in frontend',
    severity: 'HIGH',
  },
};

// ============================================================================
// 7. SOCIAL LOGIN VERIFICATION
// ============================================================================

export const SocialLoginCheck = {
  google: {
    endpoint: '/api/auth/social/google',
    status: 501,
    implemented: false,
    frontend: {
      button: 'Exists on login page (line 266)',
      handler: 'handleSocialLogin("google") shows toast (line 94)',
    },
    note: 'Placeholder UI exists, backend stub endpoint exists',
  },
  kakao: {
    endpoint: '/api/auth/social/kakao',
    status: 501,
    implemented: false,
    frontend: {
      button: 'Exists on login page (line 302)',
      handler: 'handleSocialLogin("kakao") shows toast (line 94)',
    },
    note: 'Placeholder UI exists, backend stub endpoint exists',
  },
};

// ============================================================================
// 8. VERIFICATION SUMMARY
// ============================================================================

export const VerificationSummary = {
  checks: [
    {
      name: 'Endpoint: POST /api/auth/login',
      status: 'FAIL',
      detail: `Backend: ${BACKEND_LOGIN_ENDPOINT}, Frontend: ${FRONTEND_LOGIN_URL}`,
      fix: 'Change frontend to call /api/auth/login (remove /v1 and /json)',
    },
    {
      name: 'Endpoint: POST /api/auth/social/google',
      status: 'PASS',
      detail: 'Endpoint exists as 501 stub',
    },
    {
      name: 'Navigation: Role-based redirect',
      status: 'PASS',
      detail: 'brand -> /dashboard/brand, creator -> /dashboard/creator',
    },
    {
      name: 'Navigation: /auth/signup link',
      status: 'PASS',
      detail: 'Link exists in login page header',
    },
    {
      name: 'Auth: Token storage',
      status: 'PARTIAL',
      detail: 'access_token stored, refresh_token ignored',
      fix: 'Store refresh_token for token refresh flow',
    },
    {
      name: 'Auth: Type consistency',
      status: 'PARTIAL',
      detail: 'Multiple type mismatches between BE/FE schemas',
      issues: [
        'AuthResponse missing refresh_token and user',
        'RegisterRequest nickname required/optional mismatch',
        'User type has name field but backend has no name column',
      ],
    },
  ],
  totalChecks: 6,
  passed: 3,
  failed: 1,
  partial: 2,
};

// ============================================================================
// EXPORT VERIFICATION RESULTS
// ============================================================================

export default {
  EndpointCheck,
  SocialGoogleCheck,
  RequestSchemaCheck,
  ResponseSchemaCheck,
  AuthFlowCheck,
  TokenStorageCheck,
  NavigationCheck,
  SignupLinkCheck,
  UserTypeCheck,
  RegisterTypeCheck,
  SocialLoginCheck,
  VerificationSummary,
};
