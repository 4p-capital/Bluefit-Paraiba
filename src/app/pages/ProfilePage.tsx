import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';
import { validatePassword } from '../lib/passwordValidation';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import {
  User, Mail, Phone, Building, Shield, Key, Save, Loader2, ArrowLeft, MapPin,
  Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { colors } from '../components/ModernDesignSystem';
import { usePresence, PresenceStatus } from '../hooks/usePresence';

export function ProfilePage() {
  const { authUser } = useAuth();
  const { profile, loading: profileLoading, reload: reloadProfile } = useUserProfile();
  const navigate = useNavigate();
  const { myStatus, myMode, changeStatus } = usePresence();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
  });

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'verify' | 'change' | 'success'>('verify');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  function handleStartEdit() {
    setFormData({
      nome: profile.nome || '',
      sobrenome: profile.sobrenome || '',
      telefone: authUser?.profile?.telefone || '',
    });
    setEditMode(true);
  }

  async function handleSaveProfile() {
    if (!authUser) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome.trim(),
          sobrenome: formData.sobrenome.trim(),
          telefone: formData.telefone.trim(),
        })
        .eq('id', authUser.id);

      if (error) {
        toast.error('Erro ao salvar perfil: ' + error.message);
        return;
      }

      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
      reloadProfile();
    } catch (error) {
      toast.error('Erro inesperado ao salvar perfil');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    const pwValidation = validatePassword(passwordData.newPassword);
    if (!pwValidation.isValid) {
      toast.error('Senha fraca: ' + pwValidation.errors[0]);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('A nova senha deve ser diferente da senha atual');
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError('');

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        toast.error('Erro ao alterar senha: ' + error.message);
        return;
      }

      toast.success('Senha alterada com sucesso!');
      setPasswordStep('success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erro inesperado ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  }

  function resetPasswordForm() {
    setShowPasswordForm(false);
    setPasswordStep('verify');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  async function verifyCurrentPassword() {
    if (!passwordData.currentPassword) {
      setPasswordError('Por favor, insira sua senha atual');
      return;
    }

    try {
      setVerifyingPassword(true);
      setPasswordError('');

      const { error } = await supabase.auth.signInWithPassword({
        email: authUser?.email || '',
        password: passwordData.currentPassword,
      });

      if (error) {
        setPasswordError('Senha atual incorreta. Tente novamente.');
        return;
      }

      setPasswordStep('change');
      setPasswordError('');
    } catch (error) {
      setPasswordError('Erro inesperado ao verificar senha');
    } finally {
      setVerifyingPassword(false);
    }
  }

  function getCargoColor(cargo: string | null): string {
    const c = cargo?.toLowerCase() || '';
    if (c.includes('administrador')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (c.includes('gerente')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (c.includes('supervisor')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (c.includes('atendente')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  }

  if (profileLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0023D5]" />
      </div>
    );
  }

  const initials = `${(profile.nome?.[0] || '').toUpperCase()}${(profile.sobrenome?.[0] || '').toUpperCase()}` || 'U';
  const fullName = [profile.nome, profile.sobrenome].filter(Boolean).join(' ') || 'Usuário';

  return (
    <div className="h-full bg-[#F9FAFB] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 md:px-6 py-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#F3F3F3] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#1B1B1B]">Meu Perfil</h1>
            <p className="text-sm text-[#6B7280]">Gerencie suas informações pessoais</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl"
                  style={{ backgroundColor: colors.primary }}
                >
                  {initials}
                </div>
                <span
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white transition-colors duration-300 ${
                    myStatus === 'online' ? 'bg-green-500' :
                    myStatus === 'away' ? 'bg-yellow-500' :
                    myStatus === 'busy' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}
                  title={
                    myStatus === 'online' ? 'Online' :
                    myStatus === 'away' ? 'Ausente' :
                    myStatus === 'busy' ? 'Ocupado' :
                    'Offline'
                  }
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-[#1B1B1B]">{fullName}</h2>
                <p className="text-[#6B7280] mt-1">{authUser?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <Badge className={`${getCargoColor(profile.cargoName)} border text-xs font-medium`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {profile.cargoName || 'Sem cargo'}
                  </Badge>
                  {profile.unitName && (
                    <Badge className="bg-[#E6EAFF] text-[#0023D5] border-[#C7D0FF] border text-xs font-medium">
                      <Building className="w-3 h-3 mr-1" />
                      {profile.unitName}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              {!editMode && (
                <Button
                  variant="outline"
                  onClick={handleStartEdit}
                  className="border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F3F3]"
                >
                  Editar perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status de Presença Card */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg text-[#1B1B1B]">
              <div className="inline-flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  myStatus === 'online' ? 'bg-green-500' :
                  myStatus === 'away' ? 'bg-yellow-500' :
                  myStatus === 'busy' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
                Status de Presença
              </div>
            </CardTitle>
            <CardDescription>
              {myMode === 'available'
                ? 'Modo automático — seu status muda conforme sua atividade'
                : 'Modo manual — seu status permanece fixo até você alterar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Disponível (modo automático) */}
              <button
                onClick={() => changeStatus('available')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  myMode === 'available'
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-200'
                    : 'border-[#E5E7EB] hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <span className="block w-4 h-4 bg-green-500 rounded-full" />
                  {myMode === 'available' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white border border-green-500 rounded-full" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${myMode === 'available' ? 'text-green-700' : 'text-[#1B1B1B]'}`}>
                    Disponível
                  </div>
                  <div className="text-xs text-[#6B7280]">Automático</div>
                </div>
              </button>

              {/* Ocupado */}
              <button
                onClick={() => changeStatus('busy')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  myMode === 'manual' && myStatus === 'busy'
                    ? 'border-red-500 bg-red-50 ring-1 ring-red-200'
                    : 'border-[#E5E7EB] hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <span className="block w-4 h-4 bg-red-500 rounded-full" />
                  {myMode === 'manual' && myStatus === 'busy' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white border border-red-500 rounded-full" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${myMode === 'manual' && myStatus === 'busy' ? 'text-red-700' : 'text-[#1B1B1B]'}`}>
                    Ocupado
                  </div>
                  <div className="text-xs text-[#6B7280]">Sem atribuições</div>
                </div>
              </button>

              {/* Ausente */}
              <button
                onClick={() => changeStatus('away')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  myMode === 'manual' && myStatus === 'away'
                    ? 'border-yellow-500 bg-yellow-50 ring-1 ring-yellow-200'
                    : 'border-[#E5E7EB] hover:border-yellow-300 hover:bg-yellow-50/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <span className="block w-4 h-4 bg-yellow-500 rounded-full" />
                  {myMode === 'manual' && myStatus === 'away' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white border border-yellow-500 rounded-full" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${myMode === 'manual' && myStatus === 'away' ? 'text-yellow-700' : 'text-[#1B1B1B]'}`}>
                    Ausente
                  </div>
                  <div className="text-xs text-[#6B7280]">Fora temporariamente</div>
                </div>
              </button>
            </div>

            {myMode === 'available' && (
              <p className="text-xs text-[#9CA3AF] mt-3 flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  myStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                Atualmente: {myStatus === 'online' ? 'Online' : 'Ausente por inatividade'} (muda automaticamente após 5 min sem atividade)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info/Edit Card */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg text-[#1B1B1B]">
              <User className="w-5 h-5 inline-block mr-2 text-[#0023D5]" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              {editMode ? 'Edite suas informações abaixo' : 'Suas informações de cadastro'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="mt-1 border-[#E5E7EB] focus:border-[#0023D5] focus:ring-[#0023D5]/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input
                      id="sobrenome"
                      value={formData.sobrenome}
                      onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                      className="mt-1 border-[#E5E7EB] focus:border-[#0023D5] focus:ring-[#0023D5]/10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="mt-1 border-[#E5E7EB] focus:border-[#0023D5] focus:ring-[#0023D5]/10"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{ backgroundColor: '#0023D5' }}
                    className="text-white"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="border-[#E5E7EB]"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <InfoRow icon={<User className="w-4 h-4" />} label="Nome completo" value={fullName} />
                <InfoRow icon={<Mail className="w-4 h-4" />} label="E-mail" value={authUser?.email || 'N/A'} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={authUser?.profile?.telefone || 'Não informado'} />
                <InfoRow icon={<Shield className="w-4 h-4" />} label="Cargo" value={profile.cargoName || 'Sem cargo'} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Unidade" value={profile.unitName || 'Nenhuma'} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg text-[#1B1B1B]">
              <Key className="w-5 h-5 inline-block mr-2 text-[#0023D5]" />
              Segurança
            </CardTitle>
            <CardDescription>Gerencie sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            {showPasswordForm ? (
              <div className="space-y-5">
                {/* Step Indicator */}
                {passwordStep !== 'success' && (
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                      passwordStep === 'verify'
                        ? 'bg-[#0023D5] text-white'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {passwordStep === 'verify' ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      1. Verificar identidade
                    </div>
                    <div className="w-6 h-px bg-[#E5E7EB]" />
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                      passwordStep === 'change'
                        ? 'bg-[#0023D5] text-white'
                        : 'bg-[#F3F3F3] text-[#9CA3AF]'
                    }`}>
                      <Key className="w-3 h-3" />
                      2. Nova senha
                    </div>
                  </div>
                )}

                {/* Step 1: Verify Current Password */}
                {passwordStep === 'verify' && (
                  <>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Confirmação de identidade</p>
                        <p className="text-xs text-amber-600 mt-0.5">Para sua segurança, insira sua senha atual antes de definir uma nova.</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="currentPassword" className="text-[#4B5563] font-medium text-sm">Senha atual</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none z-10" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => { setPasswordData({ ...passwordData, currentPassword: e.target.value }); setPasswordError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && verifyCurrentPassword()}
                          placeholder="Digite sua senha atual"
                          className={`pl-10 pr-10 border-[#E5E7EB] focus:border-[#0023D5] focus:ring-[#0023D5]/10 ${passwordError ? 'border-red-400 focus:border-red-400' : ''}`}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {passwordError}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Button
                        onClick={verifyCurrentPassword}
                        disabled={verifyingPassword || !passwordData.currentPassword}
                        style={{ backgroundColor: '#0023D5' }}
                        className="text-white"
                      >
                        {verifyingPassword ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 mr-2" />
                        )}
                        Verificar
                      </Button>
                      <Button variant="outline" onClick={resetPasswordForm} className="border-[#E5E7EB]">
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}

                {/* Step 2: Set New Password */}
                {passwordStep === 'change' && (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Identidade confirmada</p>
                        <p className="text-xs text-green-600 mt-0.5">Agora defina sua nova senha abaixo.</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-[#4B5563] font-medium text-sm">Nova senha</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none z-10" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Mínimo 8 caracteres com maiúscula, número e especial"
                          className="pl-10 pr-10 border-[#E5E7EB] focus:border-[#0023D5] focus:ring-[#0023D5]/10"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordData.newPassword && (() => { const v = validatePassword(passwordData.newPassword); return !v.isValid ? (
                        <p className="text-xs text-amber-600 mt-1">{v.errors.join(' | ')}</p>
                      ) : null; })()}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-[#4B5563] font-medium text-sm">Confirmar nova senha</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none z-10" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                          placeholder="Repita a nova senha"
                          className={`pl-10 pr-10 border-[#E5E7EB] focus:border-[#0023D5] focus:ring-[#0023D5]/10 ${
                            passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                              ? 'border-red-400'
                              : ''
                          }`}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                      )}
                      {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length >= 6 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Senhas coincidem
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !validatePassword(passwordData.newPassword).isValid || passwordData.newPassword !== passwordData.confirmPassword}
                        style={{ backgroundColor: '#0023D5' }}
                        className="text-white"
                      >
                        {changingPassword ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4 mr-2" />
                        )}
                        Alterar Senha
                      </Button>
                      <Button variant="outline" onClick={resetPasswordForm} className="border-[#E5E7EB]">
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}

                {/* Step 3: Success */}
                {passwordStep === 'success' && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">Senha alterada com sucesso!</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Sua nova senha já está ativa. Use-a no próximo login.</p>
                    <Button variant="outline" onClick={resetPasswordForm} className="border-[#E5E7EB]">
                      Fechar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => { setShowPasswordForm(true); setPasswordStep('verify'); }}
                className="border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F3F3]"
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-[#0023D5]">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-[#9CA3AF] uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-[#1B1B1B]">{value}</div>
      </div>
    </div>
  );
}