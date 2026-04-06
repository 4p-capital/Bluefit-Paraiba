import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { clearProfileCache } from '../hooks/useUserProfile';
import { supabase, initialUrlHash, initialUrlSearch } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  accessToken: string;
  profile?: any;
}

interface AuthContextType {
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          // Clear Realtime auth so channels stop retrying with stale token
          supabase.realtime.setAuth(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthUser(prev => prev ? { ...prev, accessToken: session.access_token } : null);
          // Update Realtime client with the fresh token so channels reconnect
          supabase.realtime.setAuth(session.access_token);
        } else if (event === 'SIGNED_IN' && session) {
          // Also set Realtime auth on initial sign-in
          supabase.realtime.setAuth(session.access_token);
        } else if (event === 'PASSWORD_RECOVERY' && session) {
          localStorage.removeItem('pendingRecovery');
          // Redirecionar para /update-password de qualquer rota que os tokens cheguem
          if (window.location.pathname !== '/update-password') {
            window.location.replace('/update-password');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkExistingSession() {
    try {
      setIsLoading(true);
      const pathname = window.location.pathname;

      // === CALLBACK / UPDATE-PASSWORD / RESET-PASSWORD ===
      // Estas páginas têm seu próprio handling — não autenticar
      if (pathname === '/auth/callback' || pathname === '/update-password' || pathname === '/reset-password') {
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      // === RECOVERY FLOW ===
      // Com detectSessionInUrl: true, o Supabase JS processa tokens da URL automaticamente.
      // Se tokens de recovery chegaram na URL, o onAuthStateChange vai disparar PASSWORD_RECOVERY.
      // Manter isLoading=true para impedir AppLayout de redirecionar para /login.
      const pendingRecovery = localStorage.getItem('pendingRecovery') === 'true';
      const hasRecoveryInHash = initialUrlHash.includes('type=recovery') || initialUrlHash.includes('type%3Drecovery');
      const hasAccessTokenInHash = initialUrlHash.includes('access_token');
      const currentSearch = initialUrlSearch || window.location.search;
      const searchParams = new URLSearchParams(currentSearch);
      const hasPkceCode = searchParams.has('code');

      // Recovery flow: tokens na URL (qualquer path) + indicadores de recovery
      const hasAuthTokens = hasPkceCode || hasAccessTokenInHash || searchParams.has('token_hash');
      const isRecoveryFlow = hasRecoveryInHash || (pendingRecovery && hasAuthTokens);

      if (isRecoveryFlow && pathname !== '/update-password') {
        // O Supabase JS vai processar os tokens e disparar PASSWORD_RECOVERY
        // O handler em onAuthStateChange vai redirecionar para /update-password
        // Safety net: se não disparar em 8 segundos, forçar redirect
        setTimeout(() => {
          if (window.location.pathname !== '/update-password') {
            window.location.replace('/update-password');
          }
        }, 8000);
        return; // isLoading permanece true
      }

      // === AUTH TOKENS EM PATH ERRADO (não recovery) ===
      // Se há ?code= ou #access_token= numa rota não-callback, redirecionar
      // para /auth/callback para processamento controlado.
      if (hasAuthTokens && pathname !== '/auth/callback') {
        window.location.replace(`/auth/callback${currentSearch}${initialUrlHash || window.location.hash}`);
        return;
      }

      // === SESSION NORMAL ===
      // Aguardar um pouco para o Supabase JS terminar de processar tokens da URL
      await new Promise(r => setTimeout(r, 200));

      // Limpar flag pendingRecovery stale (de tentativas anteriores não completadas)
      if (pendingRecovery && !hasAuthTokens) {
        localStorage.removeItem('pendingRecovery');
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      // Validar o token com o servidor (getSession retorna do cache sem validar)
      const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !validatedUser) {
        // Limpar sessão stale
        await supabase.auth.signOut({ scope: 'local' });
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      // Set Realtime auth with the current valid token
      supabase.realtime.setAuth(session.access_token);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', validatedUser.id)
        .single();

      if (profileData && profileData.ativo === false) {
        await supabase.auth.signOut();
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      setAuthUser({
        id: validatedUser.id,
        email: validatedUser.email || '',
        accessToken: session.access_token,
        profile: profileData || validatedUser.user_metadata,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('[Auth] Session verification failed:', error);
      setAuthUser(null);
      setIsLoading(false);
    }
  }

  const login = useCallback(async (accessToken: string) => {
    // Pegar a sessão fresca (signInWithPassword acabou de criar)
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('[Auth] Failed to get session after login:', error);
      return;
    }

    // Validar com o servidor
    const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !validatedUser) {
      console.error('[Auth] Token invalid after login:', userError?.message);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', validatedUser.id)
      .single();

    if (profileData && profileData.ativo === false) {
      await supabase.auth.signOut();
      setAuthUser(null);
      return;
    }

    const user: AuthUser = {
      id: validatedUser.id,
      email: validatedUser.email || '',
      accessToken: session.access_token,
      profile: profileData || validatedUser.user_metadata,
    };

    setAuthUser(user);
  }, []);

  const logout = useCallback(async () => {
    clearProfileCache();
    await supabase.auth.signOut();
    setAuthUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        isAuthenticated: !!authUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}