import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle2, Loader2, ShieldOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '@/app/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import blueDeskLogo from '../../assets/d1f7bbbdb5465392ff878250337517f331699beb.png';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1`;

interface LoginFormProps {
  onLoginSuccess: (accessToken: string) => void;
  onSwitchToSignup: () => void;
  onSwitchToResetPassword?: () => void;
}

export function LoginForm({ onLoginSuccess, onSwitchToSignup, onSwitchToResetPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [userDeactivated, setUserDeactivated] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setEmailNotConfirmed(false);
    setUserDeactivated(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        if (error.message.includes('Email not confirmed')) {
          setEmailNotConfirmed(true);
          throw new Error('Seu email ainda não foi confirmado. Verifique sua caixa de entrada ou reenvie o email de confirmação.');
        }
        if (error.message.includes('User not found')) {
          throw new Error('Usuário não encontrado');
        }
        
        throw new Error(error.message || 'Erro ao fazer login');
      }

      if (!data.session) {
        throw new Error('Erro ao criar sessão');
      }

      // Limpar pendingRecovery stale ao fazer login normal
      localStorage.removeItem('pendingRecovery');

      // Verificar se o usuário está ativo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('ativo')
        .eq('id', data.session.user.id)
        .single();

      if (profileError) {
        // Se não conseguir verificar, permite o login (fail-open para não bloquear)
      } else if (profileData && profileData.ativo === false) {
        await supabase.auth.signOut();
        setUserDeactivated(true);
        throw new Error('Sua conta está desativada. Entre em contato com um administrador para reativar seu acesso.');
      }

      onLoginSuccess(data.session.access_token);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (cooldown > 0) return;
    setResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/auth/callback`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.autoConfirmed) {
          // Email foi auto-confirmado via Admin API — user pode fazer login agora
          setEmailNotConfirmed(false);
          setError('');
          setResendSuccess(true);
          // Show success message briefly then reset
          setTimeout(() => setResendSuccess(false), 8000);
        } else {
          setResendSuccess(true);
          setCooldown(60);
          setTimeout(() => setResendSuccess(false), 8000);
        }
      } else if (result.rateLimited) {
        setCooldown(result.waitSeconds || 60);
        setError(`Limite de envio atingido. Aguarde ${result.waitSeconds || 60}s e tente novamente.`);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      // Resend error - silently continue
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ backgroundColor: '#0023D5' }}></div>
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ backgroundColor: '#0023D5' }}></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#0023D5] opacity-20"></div>
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 rounded-full bg-[#0023D5] opacity-15"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-[#0023D5] opacity-25"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white rounded-2xl p-8 md:p-10" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-5">
              <img src={blueDeskLogo} alt="Blue Desk" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1B1B1B] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Blue Desk
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Bem-vindo de volta
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              {userDeactivated ? (
                /* Alerta especial para conta desativada */
                <div className="flex items-start gap-3 px-4 py-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center mt-0.5">
                    <ShieldOff className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#991B1B] mb-1">Conta desativada</p>
                    <p className="text-sm text-[#B91C1C] leading-relaxed">
                      Sua conta foi desativada por um administrador. Para reativar seu acesso, entre em contato com o administrador do sistema.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 px-4 py-3 rounded-lg border-l-[3px]" style={{ backgroundColor: emailNotConfirmed ? '#FEF9C3' : '#FEF2F2', borderLeftColor: emailNotConfirmed ? '#EAB308' : '#EF4444' }}>
                  <AlertCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${emailNotConfirmed ? 'text-[#EAB308]' : 'text-[#EF4444]'}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${emailNotConfirmed ? 'text-[#713F12]' : 'text-[#EF4444]'}`}>{error}</p>
                    
                    {/* Resend confirmation button */}
                    {emailNotConfirmed && (
                      <div className="mt-3">
                        <button
                          onClick={handleResendConfirmation}
                          disabled={resending || cooldown > 0}
                          className="inline-flex items-center gap-1.5 text-sm text-[#0023D5] hover:text-[#001AAA] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          {resending
                            ? 'Reenviando...'
                            : cooldown > 0
                              ? `Reenviar em ${cooldown}s`
                              : 'Reenviar email de confirmação'}
                        </button>

                        {resendSuccess && (
                          <div className="flex items-center gap-1.5 mt-2 text-sm text-[#10B981]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Email reenviado! Verifique sua caixa de entrada.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auto-confirmed success banner — shown when email was auto-confirmed and user can now login */}
          {resendSuccess && !emailNotConfirmed && !error && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border-l-[3px]" style={{ backgroundColor: '#D1FAE5', borderLeftColor: '#10B981' }}>
              <CheckCircle2 className="h-4 w-4 text-[#10B981] flex-shrink-0" />
              <p className="text-sm text-[#065F46] font-medium">Email confirmado! Você já pode fazer login.</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4B5563] font-medium text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF] pointer-events-none z-10" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-11 h-12 bg-[#F3F3F3] border-[#E5E7EB] text-[#1B1B1B] placeholder:text-[#9CA3AF] rounded-lg focus:border-[#0023D5] focus:ring-2 focus:ring-[#0023D5]/10 transition-all duration-150"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#4B5563] font-medium text-sm">
                  Senha
                </Label>
                {onSwitchToResetPassword && (
                  <button
                    type="button"
                    onClick={onSwitchToResetPassword}
                    className="text-sm text-[#0023D5] hover:text-[#001AAA] font-medium transition-colors duration-150"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
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
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors duration-150"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-150 group"
              style={{ 
                backgroundColor: '#0023D5',
                boxShadow: '0 2px 4px rgba(0,35,213,0.2)',
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Entrar</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#9CA3AF]">ou</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-[14px] text-[#6B7280]">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-[#0023D5] hover:text-[#001AAA] font-semibold transition-colors duration-150"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[#9CA3AF] text-xs">
            © 2026 Blue Desk by Bluefit
          </p>
        </div>
      </div>
    </div>
  );
}