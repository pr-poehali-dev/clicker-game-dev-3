const AUTH_API = 'https://functions.poehali.dev/93ced0b1-de92-4eb5-b82f-a45bdb5f5423';
const PROGRESS_API = 'https://functions.poehali.dev/26bdbb86-589d-4c44-bfca-9cd0c76b7b2e';

export const auth = {
  getLoginUrl: async (): Promise<string> => {
    const response = await fetch(`${AUTH_API}?action=login`);
    const data = await response.json();
    return data.authUrl;
  },

  verify: async (token: string): Promise<{ valid: boolean; user_id?: number; email?: string }> => {
    const response = await fetch(`${AUTH_API}?action=verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  clearToken: () => {
    localStorage.removeItem('auth_token');
  },
};

export const progress = {
  save: async (data: any) => {
    const token = auth.getToken();
    if (!token) return;

    const response = await fetch(PROGRESS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  load: async () => {
    const token = auth.getToken();
    if (!token) return null;

    const response = await fetch(PROGRESS_API, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
