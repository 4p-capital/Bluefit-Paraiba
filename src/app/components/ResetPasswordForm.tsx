import { useState } from 'react';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import blueDeskLogo from '../../assets/d1f7bbbdb5465392ff878250337517f331699beb.png';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1`;

interface ResetPasswordFormProps {
  onSwitchToLogin: () => void;
}

export function ResetPasswordForm({ onSwitchToLogin }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setRecoveryUrl(null);
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      // Usar o endpoint do servidor que tem service role key e fallback com generateLink
      const response = await fetch(`${API_BASE}/api/auth/recovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, redirectTo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar recuperação de senha');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar solicitação');
      }

      // Marcar no localStorage que estamos em fluxo de recovery
      localStorage.setItem('pendingRecovery', 'true');

      // Se o servidor retornou um recoveryUrl (fallback quando email falhou)
      if (data.recoveryUrl && !data.emailSent) {
        setRecoveryUrl(data.recoveryUrl);
      }

      setSuccess(true);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar solicitação';
      if (message.includes('rate') || message.includes('429') || message.includes('limitado')) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#D1FAE5' }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: '#10B981' }} />
            </div>
            <h2 className="text-2xl font-semibold text-[#1B1B1B] mb-3">
              {recoveryUrl ? 'Link Gerado!' : 'Email Enviado!'}
            </h2>
            <p className="text-[#6B7280] mb-6">
              {recoveryUrl
                ? 'O envio de email está temporariamente limitado. Use o link abaixo para redefinir sua senha.'
                : 'Verifique sua caixa de entrada e clique no link para redefinir sua senha.'}
            </p>

            {/* Fallback: link direto quando email não foi enviado */}
            {recoveryUrl && (
              <div className="mb-6">
                <a
                  href={recoveryUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0023D5', boxShadow: '0 2px 4px rgba(0,35,213,0.2)' }}
                >
                  <ExternalLink className="w-5 h-5" />
                  Redefinir Senha Agora
                </a>
              </div>
            )}

            {/* Info Box */}
            {!recoveryUrl && (
              <div className="mb-6 px-4 py-3 rounded-lg border-l-[3px]" style={{ backgroundColor: '#E6EAFF', borderLeftColor: '#0023D5' }}>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  <strong className="text-[#0023D5]">Importante:</strong> O link deve ser aberto no <strong>mesmo navegador</strong> onde voce fez a solicitacao.
                </p>
              </div>
            )}

            <Button
              onClick={onSwitchToLogin}
              variant="outline"
              className="w-full h-12 font-semibold rounded-lg border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
            >
              Voltar para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ backgroundColor: '#0023D5' }}></div>
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ backgroundColor: '#0023D5' }}></div>
      </div>

      {/* Reset Password Card */}
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white rounded-2xl p-8 md:p-10" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
          {/* Back Button */}
          <button
            onClick={onSwitchToLogin}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#1B1B1B] mb-6 transition-colors duration-150 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Voltar</span>
          </button>

          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-5">
              <img src={blueDeskLogo} alt="Blue Desk" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1B1B1B] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Recuperar Senha
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Digite seu email para receber o link de redefinicao
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border-l-[3px]" style={{ backgroundColor: '#FEF2F2', borderLeftColor: '#EF4444' }}>
              <AlertCircle className="h-4 w-4 text-[#EF4444] flex-shrink-0" />
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleResetPassword} className="space-y-5">
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-150"
              style={{ 
                backgroundColor: '#0023D5',
                boxShadow: '0 2px 4px rgba(0,35,213,0.2)',
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                'Enviar Link de Recuperacao'
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 px-4 py-3 rounded-lg border-l-[3px]" style={{ backgroundColor: '#E6EAFF', borderLeftColor: '#0023D5' }}>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              <strong className="text-[#0023D5]">Dica:</strong> Verifique sua caixa de spam se nao receber o email em alguns minutos.
            </p>
          </div>
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
