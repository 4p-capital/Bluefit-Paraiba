import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Waves } from 'lucide-react';

type RequiredRole = 'attendant' | 'supervisor' | 'manager' | 'admin';

interface RoleGuardProps {
  requiredRole: RequiredRole;
  children: ReactNode;
}

/**
 * Guarda de rota baseado em cargo.
 * 
 * Hierarquia:
 * - attendant: Atendente+ (qualquer cargo válido)
 * - supervisor: Supervisor+ (isAdmin)
 * - manager: Gerente+ (isManager)
 * - admin: Administrador (isFullAdmin)
 * 
 * Se o cargo não for suficiente, redireciona silenciosamente para "/".
 */
export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { profile, loading } = useUserProfile();

  // Ainda carregando perfil
  if (loading || !profile.isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              backgroundColor: '#0023D5',
              boxShadow: '0 8px 32px rgba(0,35,213,0.2)',
            }}
          >
            <Waves className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-[#9CA3AF] text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificar permissão
  const hasAccess = checkAccess(profile, requiredRole);

  if (!hasAccess) {
    console.log(`🔐 [ROLE_GUARD] Acesso negado: cargo "${profile.cargoName}" não tem permissão para "${requiredRole}". Redirecionando para /`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function checkAccess(
  profile: { cargoName: string | null; isAdmin: boolean; isManager: boolean; isFullAdmin: boolean; isLoaded: boolean },
  requiredRole: RequiredRole
): boolean {
  const cargoLower = profile.cargoName?.toLowerCase() || '';
  const hasCargo = profile.isLoaded && cargoLower !== 'sem cargo' && cargoLower !== '';

  switch (requiredRole) {
    case 'attendant':
      return hasCargo; // Qualquer cargo válido
    case 'supervisor':
      return profile.isAdmin; // Supervisor+
    case 'manager':
      return profile.isManager; // Gerente+
    case 'admin':
      return profile.isFullAdmin; // Administrador
    default:
      return false;
  }
}
