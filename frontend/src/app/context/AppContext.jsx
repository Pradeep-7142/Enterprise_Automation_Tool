import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as flowdeskApi from '../../services/flowdeskApi';
import { clearSession, getStoredUser, hasSession } from '../../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuth, setIsAuth] = useState(hasSession());
  const [user, setUser] = useState(getStoredUser());
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('fd_dark_mode');
    return stored ? stored === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('fd_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (!hasSession()) {
        setAuthLoading(false);
        return;
      }
      try {
        const me = await flowdeskApi.getMe();
        if (mounted) {
          setUser(me);
          setIsAuth(true);
        }
      } catch (error) {
        clearSession();
        if (mounted) {
          setIsAuth(false);
          setUser(null);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email, password) {
    const response = await flowdeskApi.login(email, password);
    const nextUser = response.user || (await flowdeskApi.getMe());
    setUser(nextUser);
    setIsAuth(true);
    return nextUser;
  }

  async function logout() {
    try {
      await flowdeskApi.logout();
    } finally {
      clearSession();
      setUser(null);
      setIsAuth(false);
    }
  }

  const value = useMemo(
    () => ({
      isAuth,
      user,
      authLoading,
      darkMode,
      setDarkMode,
      login,
      logout,
      setUser,
    }),
    [isAuth, user, authLoading, darkMode],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
