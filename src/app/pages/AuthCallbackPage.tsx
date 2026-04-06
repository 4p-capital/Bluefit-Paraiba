import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { supabase, initialUrlHash, initialUrlSearch } from '@/app/lib/supabase';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import blueDeskLogo from '../../assets/d1f7bbbdb5465392ff878250337517f331699beb.png';

/**
 * Pagina de callback para processar links de confirmacao de email e recovery.
 *
 * Estratégia simplificada:
 * - detectSessionInUrl está HABILITADO no cliente Supabase.
 * - O createClient processa automaticamente tokens da URL (hash ou ?code=).
 * - Esta página apenas ESPERA a sessão aparecer via getSession + onAuthStateChange.
 * - Não faz exchange manual (evita race condition / double consumption).
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando confirmacao...');
  const [errorDetail, setErrorDetail] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    processCallback();
  }, []);

  async function processCallback() {
    try {
      const search = initialUrlSearch || window.location.search;
      const hash = initialUrlHash || window.location.hash;


      const searchParams = new URLSearchParams(search);
      const hashParams = new URLSearchParams(hash.substring(1));

      // --- Verificar erros na URL ---
      const urlError = hashParams.get('error') || searchParams.get('error');
      const urlErrorDesc = hashParams.get('error_description') || searchParams.get('error_description');
      if (urlError) {
        setStatus('error');
        setMessage('Erro na confirmacao');
        setErrorDetail(urlErrorDesc || urlError);
        return;
      }

      // Detectar tipo
      const type = hashParams.get('type') || searchParams.get('type');
      const pendingRecovery = localStorage.getItem('pendingRecovery') === 'true';
      const hasHashRecovery = hash.includes('type=recovery') || hash.includes('type%3Drecovery');
      const effectiveType = type || (hasHashRecovery ? 'recovery' : (pendingRecovery ? 'recovery' : null));


      // Verificar se há tokens na URL (para saber se devemos esperar mais)
      const hasCode = searchParams.has('code');
      const hasTokenHash = searchParams.has('token_hash');
      const hasAccessToken = hashParams.has('access_token');
      const hasAnyTokens = hasCode || hasTokenHash || hasAccessToken || hash.includes('access_token');


      // ============================================================
      // ESTRATÉGIA: Esperar o Supabase JS processar os tokens da URL
      // automaticamente (detectSessionInUrl: true) e depois verificar
      // a sessão. Tempo generoso para cobrir PKCE exchange + network.
      // ============================================================

      // Se há tokens na URL, dar tempo ao Supabase JS para processar
      if (hasAnyTokens) {
        await sleep(1500);
      } else {
        // Sem tokens na URL — talvez Supabase JS já processou (limpa a URL)
        // ou GoTrue não enviou tokens (link expirado/usado)
        await sleep(800);
      }

      // Passo 1: Checar sessão (Supabase JS pode já ter processado)
      const { data: { session: session1 } } = await supabase.auth.getSession();
      if (session1) {
        return handleSessionEstablished(effectiveType || 'signup');
      }

      // Passo 2: Esperar via onAuthStateChange + polling (mais tempo)
      const result = await waitForSession(10000);
      if (result.session) {
        const resolvedType = result.type || effectiveType || 'signup';
        return handleSessionEstablished(resolvedType);
      }

      // Passo 3: Última tentativa — token_hash manual (fallback para email templates antigos)
      const tokenHash = searchParams.get('token_hash');
      if (tokenHash) {
        const otpType = (effectiveType === 'recovery' ? 'recovery' : 'signup') as any;
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });
        if (!error && data?.session) {
          return handleSessionEstablished(effectiveType || 'signup');
        }
        if (error) {
        }
      }

      // ============================================================
      // FALHA TOTAL
      // ============================================================

      // Limpar pendingRecovery stale para não interferir em futuros carregamentos
      localStorage.removeItem('pendingRecovery');

      setStatus('error');
      setMessage('Link invalido ou expirado');
      setErrorDetail(
        'Nao foi possivel processar este link. Ele pode ter expirado ou ja ter sido utilizado. ' +
        'Solicite um novo link de recuperacao.'
      );

    } catch (err) {
      setStatus('error');
      setMessage('Erro inesperado');
      setErrorDetail(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }

  /**
   * Aguarda sessao via onAuthStateChange + polling getSession
   */
  function waitForSession(timeoutMs: number): Promise<{
    session: any;
    event?: string;
    type?: string;
  }> {
    return new Promise((resolve) => {
      let resolved = false;

      const done = (result: { session: any; event?: string; type?: string }) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(result);
      };

      const timeout = setTimeout(() => done({ session: null }), timeoutMs);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          done({ session, event, type: 'recovery' });
        } else if (event === 'SIGNED_IN' && session) {
          done({ session, event, type: 'signup' });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          done({ session, event });
        } else if (event === 'INITIAL_SESSION' && session) {
          // Se INITIAL_SESSION tem sessão, o Supabase já processou os tokens
          done({ session, event });
        }
      });

      // Polling getSession a cada 500ms
      const poll = async () => {
        if (resolved) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            done({ session, event: 'polling' });
            return;
          }
        } catch (e) {
        }
        if (!resolved) setTimeout(poll, 500);
      };

      setTimeout(poll, 300);
    });
  }

  /**
   * Sessao estabelecida — decidir proximo passo
   */
  function handleSessionEstablished(type: string | null) {
    localStorage.removeItem('pendingRecovery');

    if (type === 'recovery') {
      navigate('/update-password', { replace: true });
      return;
    }

    supabase.auth.signOut().then(() => {
      setStatus('success');
      setMessage('Email confirmado com sucesso!');
    });
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ backgroundColor: '#0023D5' }}></div>
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ backgroundColor: '#0023D5' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
            <img src={blueDeskLogo} alt="Blue Desk" className="w-20 h-20 object-contain" />
          </div>

          {status === 'processing' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ backgroundColor: '#E6EAFF' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0023D5' }} />
              </div>
              <h2 className="text-xl font-semibold text-[#1B1B1B] mb-2">{message}</h2>
              <p className="text-[#6B7280] text-sm">Aguarde um momento...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ backgroundColor: '#D1FAE5' }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
              </div>
              <h2 className="text-xl font-semibold text-[#1B1B1B] mb-2">{message}</h2>
              <p className="text-[#6B7280] text-sm mb-6">
                Seu email foi verificado. Agora voce pode fazer login no Blue Desk.
              </p>
              <Button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full h-12 text-white font-semibold rounded-lg"
                style={{ backgroundColor: '#0023D5', boxShadow: '0 2px 4px rgba(0,35,213,0.2)' }}
              >
                <Mail className="w-5 h-5 mr-2" />
                Ir para Login
              </Button>
              <p className="text-xs text-[#9CA3AF] mt-4">
                Aguarde a aprovacao do administrador para acessar o sistema.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ backgroundColor: '#FEE2E2' }}>
                <XCircle className="w-8 h-8" style={{ color: '#EF4444' }} />
              </div>
              <h2 className="text-xl font-semibold text-[#1B1B1B] mb-2">{message}</h2>
              {errorDetail && (
                <p className="text-sm text-[#EF4444] mb-4 bg-[#FEF2F2] px-4 py-2 rounded-lg">
                  {errorDetail}
                </p>
              )}
              <p className="text-[#6B7280] text-sm mb-6">
                O link pode ter expirado ou ja ter sido utilizado. Tente fazer login ou solicitar um novo link.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full h-12 text-white font-semibold rounded-lg"
                  style={{ backgroundColor: '#0023D5', boxShadow: '0 2px 4px rgba(0,35,213,0.2)' }}
                >
                  Ir para Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/reset-password', { replace: true })}
                  className="w-full h-12 font-semibold rounded-lg border-[#E5E7EB] text-[#4B5563]"
                >
                  Solicitar Novo Link
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-[#9CA3AF] text-xs">
            &copy; 2026 Blue Desk by Bluefit
          </p>
        </div>
      </div>
    </div>
  );
}