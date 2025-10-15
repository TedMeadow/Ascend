class Http {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (!this.baseURL) {
      console.error("API base URL is not configured in .env.local");
      // В реальном приложении здесь можно показать ошибку пользователю
    }
  }

  // Этот метод остается практически без изменений
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers = new Headers(options.headers || {});
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.append('Content-Type', 'application/json');
    }

    const config: RequestInit = { ...options, headers };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown API error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      if (response.status === 204) {
        return null as T;
      }
      return response.json() as Promise<T>;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Экспортируем единственный экземпляр (Singleton)
export const http = new Http();