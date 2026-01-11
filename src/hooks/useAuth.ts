import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; user_id: number } | null>(null);

  useEffect(() => {
    const token = auth.getToken();
    if (token) {
      auth.verify(token).then((result) => {
        if (result.valid) {
          setIsAuthenticated(true);
          setUser({ email: result.email!, user_id: result.user_id! });
        } else {
          auth.clearToken();
        }
        setIsLoading(false);
      }).catch(() => {
        auth.clearToken();
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        auth.setToken(event.data.token);
        auth.verify(event.data.token).then((result) => {
          if (result.valid) {
            setIsAuthenticated(true);
            setUser({ email: result.email!, user_id: result.user_id! });
          }
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = async () => {
    const authUrl = await auth.getLoginUrl();
    window.open(authUrl, '_blank', 'width=500,height=600');
  };

  const logout = () => {
    auth.clearToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, isLoading, user, login, logout };
};
