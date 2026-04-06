import { MessageSquare, Users, BarChart3, ArrowRight, Zap, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

export function HomePage() {
  const { authUser } = useAuth();
  const { profile } = useUserProfile();
  const userEmail = authUser?.email;

  // Determinar quais módulos o usuário pode acessar
  const cargoLower = profile.cargoName?.toLowerCase() || '';
  const hasCargo = profile.isLoaded && cargoLower !== 'sem cargo' && cargoLower !== '';

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Hero Section - Using 8pt grid spacing */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-[#00e5ff] text-[#0028e6] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#00e5ff]" />
            Sistema de Atendimento WhatsApp
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight px-4">
            Bem-vindo ao <span className="text-[#0028e6]">Blue Desk</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
            {hasCargo
              ? 'Escolha um módulo para começar a gerenciar seus atendimentos e leads'
              : 'Seu acesso está sendo configurado pelo administrador'
            }
          </p>
          {userEmail && (
            <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 px-4">
              Conectado como <span className="font-semibold text-[#0028e6]">{userEmail}</span>
            </p>
          )}
        </div>

        {/* Sem cargo - mensagem informativa */}
        {!hasCargo && profile.isLoaded && (
          <div className="max-w-lg mx-auto px-4 mb-12">
            <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg p-8 text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ShieldAlert className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Acesso pendente</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Sua conta ainda não possui um cargo atribuído. Entre em contato com o administrador do sistema para que ele configure seu perfil com o cargo e a unidade adequados.
              </p>
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-xs font-medium border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                Cargo atual: {profile.cargoName || 'Nenhum'}
              </div>
            </div>
          </div>
        )}

        {/* Módulos Cards — só exibidos para quem tem cargo */}
        {hasCargo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
            {/* Módulo Conversas */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-[#d10073]">
              <div className="absolute inset-0 bg-[#d10073]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-6 sm:p-8">
                <div className="bg-[#0028e6] w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-[#0028e6]/30 group-hover:shadow-[#d10073]/40 transition-all duration-300">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                  Conversas WhatsApp
                </h2>
                
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                  Gerencie todas as conversas do WhatsApp Business em um único lugar. 
                  Envie templates, acompanhe mensagens e ofereça atendimento profissional.
                </p>

                <div className="space-y-2 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full flex-shrink-0 shadow-sm shadow-[#00e5ff]/50"></div>
                    <span>Envio de templates aprovados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full flex-shrink-0 shadow-sm shadow-[#00e5ff]/50"></div>
                    <span>Histórico completo de mensagens</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full flex-shrink-0 shadow-sm shadow-[#00e5ff]/50"></div>
                    <span>Gestão de contatos e unidades</span>
                  </div>
                </div>

                <Link to="/conversations">
                  <Button
                    className="w-full bg-[#0028e6] hover:bg-[#d10073] text-white font-semibold h-11 sm:h-12 rounded-xl shadow-lg shadow-[#0028e6]/30 hover:shadow-xl hover:shadow-[#d10073]/40 transition-all text-sm sm:text-base"
                  >
                    Acessar Conversas
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Módulo CRM */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-[#d10073]">
              <div className="absolute inset-0 bg-[#d10073]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-6 sm:p-8">
                <div className="bg-[#d10073] w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-[#d10073]/30 group-hover:shadow-[#d10073]/50 transition-all duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                  CRM de Leads
                </h2>
                
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                  Organize e gerencie seus leads de forma eficiente. 
                  Acompanhe o funil de vendas e converta mais oportunidades.
                </p>

                <div className="space-y-2 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full flex-shrink-0 shadow-sm shadow-[#00e5ff]/50"></div>
                    <span>Gestão completa de leads</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full flex-shrink-0 shadow-sm shadow-[#00e5ff]/50"></div>
                    <span>Funil de vendas visual</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full flex-shrink-0 shadow-sm shadow-[#00e5ff]/50"></div>
                    <span>Relatórios e métricas</span>
                  </div>
                </div>

                <Link to="/crm">
                  <Button
                    className="w-full bg-[#d10073] hover:bg-[#d10073]/80 text-white font-semibold h-11 sm:h-12 rounded-xl shadow-lg shadow-[#d10073]/30 hover:shadow-xl hover:shadow-[#d10073]/50 transition-all text-sm sm:text-base"
                  >
                    Acessar CRM
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Footer — só para quem tem cargo */}
        {hasCargo && (
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto px-4">
            <div className="text-center p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">2</div>
              <div className="text-xs sm:text-sm text-slate-600">Módulos Ativos</div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">Online</div>
              <div className="text-xs sm:text-sm text-slate-600">Status do Sistema</div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">CRM</div>
              <div className="text-xs sm:text-sm text-slate-600">Gestão de Clientes</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}