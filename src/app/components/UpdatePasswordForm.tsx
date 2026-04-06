import { useState, useEffect } from 'react';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '@/app/lib/supabase';
import { validatePassword } from '@/app/lib/passwordValidation';
import blueDeskLogo from '../../assets/d1f7bbbdb5465392ff878250337517f331699beb.png';

interface UpdatePasswordFormProps {
  onSuccess: () => void;
}

/**
 * Formulario para definir nova senha.
 * Renderizado quando o usuario chega em /update-password.
 * 
 * Cenarios de chegada:
 * 1. Redirecionado pelo AuthCallbackPage (sessao ja estabelecida)
 * 2. Chegada direta com ?code=xxx (PKCE) — troca o code por sessao
 * 3. Chegada direta com #access_token=... (implicito) — Supabase JS processa
 * 4. Evento PASSWORD_RECOVERY do onAuthStateChange
 */
export function UpdatePasswordForm({ onSuccess }: UpdatePasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    checkRecoverySession();

    // Ouvir evento PASSWORD_RECOVERY (pode disparar apos hash processing)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 [UpdatePassword] Auth event:', event);
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('✅ [UpdatePassword] PASSWORD_RECOVERY event detectado!');
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkRecoverySession() {
    try {
      console.log('🔑 [UpdatePassword] Verificando sessao de recovery...');
      console.log('   - URL:', window.location.href);

      // Com detectSessionInUrl: true, o Supabase JS pode já ter processado
      // os tokens automaticamente. Apenas verificar se a sessão existe.

      // Aguardar um pouco para o Supabase JS terminar o processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ [UpdatePassword] Erro ao verificar sessao:', sessionError);
        setError('Sessao de recuperacao invalida ou expirada. Solicite um novo link.');
        setCheckingSession(false);
        return;
      }

      if (session) {
        console.log('✅ [UpdatePassword] Sessao de recovery encontrada:', session.user.email);
        setSessionReady(true);
        setCheckingSession(false);
        return;
      }

      // Se não tem sessão, aguardar mais um pouco via onAuthStateChange
      console.log('⏳ [UpdatePassword] Sem sessao imediata. Aguardando auth events (5s)...');
      const waitResult = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          sub.unsubscribe();
          resolve(false);
        }, 5000);

        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, sess) => {
          console.log('🔔 [UpdatePassword] Auth event (wait):', event);
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && sess) {
            clearTimeout(timeout);
            sub.unsubscribe();
            resolve(true);
          }
        });
      });

      if (waitResult) {
        // Verificar sessão novamente
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          console.log('✅ [UpdatePassword] Sessao via event:', newSession.user.email);
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }
      }

      console.warn('⚠️ [UpdatePassword] Nenhuma sessao encontrada.');
      setError('Link de recuperacao invalido ou expirado. Solicite um novo link.');
    } catch (err) {
      console.error('❌ [UpdatePassword] Excecao:', err);
      setError('Erro ao verificar link de recuperacao.');
    } finally {
      setCheckingSession(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.isValid) {
      setError('Senha fraca: ' + pwValidation.errors.join(', '));
      return;
    }

    setLoading(true);

    try {
      console.log('🔑 [UpdatePassword] Atualizando senha...');

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error('❌ [UpdatePassword] Erro:', updateError);
        throw new Error(updateError.message || 'Erro ao atualizar senha');
      }

      console.log('✅ [UpdatePassword] Senha atualizada com sucesso!');
      
      // Fazer logout para que o usuario faca login com a nova senha
      await supabase.auth.signOut();
      
      setSuccess(true);

    } catch (err) {
      console.error('❌ [UpdatePassword] Excecao:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  }

  // Loading - verificando sessao
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
              <img src={blueDeskLogo} alt="Blue Desk" className="w-20 h-20 object-contain" />
            </div>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#0023D5' }} />
            <p className="text-[#6B7280]">Verificando link de recuperacao...</p>
          </div>
        </div>
      </div>
    );
  }

  // Sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
              <img src={blueDeskLogo} alt="Blue Desk" className="w-20 h-20 object-contain" />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ backgroundColor: '#D1FAE5' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
            </div>
            <h2 className="text-xl font-semibold text-[#1B1B1B] mb-2">Senha atualizada!</h2>
            <p className="text-[#6B7280] text-sm mb-6">
              Sua senha foi alterada com sucesso. Faca login com a nova senha.
            </p>
            <Button
              onClick={onSuccess}
              className="w-full h-12 text-white font-semibold rounded-lg"
              style={{ backgroundColor: '#0023D5', boxShadow: '0 2px 4px rgba(0,35,213,0.2)' }}
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ backgroundColor: '#0023D5' }}></div>
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ backgroundColor: '#0023D5' }}></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white rounded-2xl p-8 md:p-10" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-5">
              <img src={blueDeskLogo} alt="Blue Desk" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1B1B1B] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Nova Senha
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Defina sua nova senha de acesso
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-lg border-l-[3px]" style={{ backgroundColor: '#FEF2F2', borderLeftColor: '#EF4444' }}>
              <AlertCircle className="h-4 w-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-[#EF4444]">{error}</p>
                {!sessionReady && (
                  <button
                    onClick={onSuccess}
                    className="text-sm text-[#0023D5] hover:text-[#001AAA] font-medium mt-1"
                  >
                    Voltar para o login
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          {sessionReady && (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#4B5563] font-medium text-sm">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF] pointer-events-none z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-12 bg-[#F3F3F3] border-[#E5E7EB] text-[#1B1B1B] placeholder:text-[#9CA3AF] rounded-lg focus:border-[#0023D5] focus:ring-2 focus:ring-[#0023D5]/10 transition-all duration-150"
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors duration-150"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#4B5563] font-medium text-sm">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF] pointer-events-none z-10" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-12 bg-[#F3F3F3] border-[#E5E7EB] text-[#1B1B1B] placeholder:text-[#9CA3AF] rounded-lg focus:border-[#0023D5] focus:ring-2 focus:ring-[#0023D5]/10 transition-all duration-150"
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors duration-150"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              <p className="text-xs text-[#9CA3AF]">
                Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.
              </p>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-150 group mt-2"
                style={{ backgroundColor: '#0023D5', boxShadow: '0 2px 4px rgba(0,35,213,0.2)' }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Atualizar Senha</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[#9CA3AF] text-xs">
            &copy; 2026 Blue Desk by Bluefit
          </p>
        </div>
      </div>
    </div>
  );
}