/** In-memory access token — never touches localStorage. */
let _accessToken: string | null = null;
let _refreshingPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

async function attemptRefresh(): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
      { method: 'POST', credentials: 'include' }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const token = data.access_token ?? null;
    setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

class Http {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (!this.baseURL) {
      console.error('API base URL is not configured in .env.local');
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers = new Headers(options.headers || {});
    if (_accessToken) {
      headers.set('Authorization', `Bearer ${_accessToken}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = { ...options, headers, credentials: 'include' };

    const response = await fetch(url, config);

    if (response.status === 401 && !_isRetry && !endpoint.includes('/auth/refresh')) {
      // Deduplicate concurrent refresh calls
      if (!_refreshingPromise) {
        _refreshingPromise = attemptRefresh().finally(() => {
          _refreshingPromise = null;
        });
      }
      const newToken = await _refreshingPromise;

      if (newToken) {
        return this.request<T>(endpoint, options, true);
      }
      // Refresh failed — dispatch event so AuthProvider can redirect to login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:logout'));
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown API error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }
}

export const http = new Http();
