import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface UserProfile {
  id: string;
  email: string | null;
  nome: string | null;
  sobrenome: string | null;
  id_cargo: number | null;
  cargoName: string | null;
  id_unidade: number | null;       // unidade principal (is_primary ou fallback profiles.id_unidade)
  unitName: string | null;          // nome da unidade principal
  unitIds: number[];                // TODAS as unidades do usuário (via profile_units)
  unitNames: Record<number, string>; // mapa id→nome de todas as unidades
  isAdmin: boolean; // Supervisor+ (pode gerenciar)
  isManager: boolean; // Gerente+ (acesso dashboard)
  isFullAdmin: boolean; // Administrador (acesso total)
  isLoaded: boolean;
}

// Cache global para evitar re-fetches desnecessários
let cachedProfile: UserProfile | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Hook que carrega e cacheia o perfil do usuário logado,
 * incluindo id_cargo, cargoName (via tabela cargos), id_unidade e nome da unidade.
 * 
 * A detecção de admin/supervisor/gerente é feita por nome do cargo (string-based):
 * verifica se o campo `papeis` da tabela `cargos` contém
 * "Supervisor", "Gerente" ou "Administrador" (case-insensitive).
 */
const MANAGER_ROLE_NAMES = ['supervisor', 'gerente', 'administrador'];

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(
    cachedProfile || {
      id: '',
      email: null,
      nome: null,
      sobrenome: null,
      id_cargo: null,
      cargoName: null,
      id_unidade: null,
      unitName: null,
      unitIds: [],
      unitNames: {},
      isAdmin: false,
      isManager: false,
      isFullAdmin: false,
      isLoaded: false,
    }
  );
  const [loading, setLoading] = useState(!cachedProfile);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (force = false) => {
    // Usar cache se válido e não forçado
    if (!force && cachedProfile && Date.now() - cacheTimestamp < CACHE_TTL) {
      setProfile(cachedProfile);
      setLoading(false);
      return cachedProfile;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        const msg = 'Usuário não autenticado';
        setError(msg);
        setLoading(false);
        return null;
      }

      // 2. Buscar perfil completo com join na tabela cargos
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, email, nome, sobrenome, id_cargo, id_unidade,
          cargo:cargos!profiles_id_cargo_fkey(id, papeis)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(`Erro ao buscar perfil: ${profileError.message}`);
        setLoading(false);
        return null;
      }

      if (!profileData) {
        setError('Perfil não encontrado no banco de dados');
        setLoading(false);
        return null;
      }

      // 3. Extrair nome do cargo
      const cargoData = profileData.cargo as { id: number; papeis: string } | null;
      const cargoName = cargoData?.papeis || null;

      // 4. Buscar nome da unidade se tiver id_unidade
      let unitName: string | null = null;
      if (profileData.id_unidade != null) {
        const { data: unitData } = await supabase
          .from('units')
          .select('name')
          .eq('id', profileData.id_unidade)
          .single();

        unitName = unitData?.name || `Unidade ${profileData.id_unidade}`;
      }

      // 5. Buscar todas as unidades do usuário via servidor (bypassa RLS)
      let profileUnitsData: any[] | null = null;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (accessToken) {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/my-units`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'apikey': publicAnonKey,
                'X-User-Token': accessToken,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.units?.length > 0) {
              profileUnitsData = result.units;
            }
          }
        }
      } catch (fetchErr) {
        // Silently continue - will use fallback
      }

      // Fallback: tentar SELECT direto (pode funcionar se RLS permitir leitura do próprio perfil)
      if (!profileUnitsData) {
        const { data: directData, error: puError } = await supabase
          .from('profile_units')
          .select('unit_id, is_primary, unit:units!profile_units_unit_id_fkey(id, name)')
          .eq('profile_id', user.id);

        if (!puError && directData && directData.length > 0) {
          profileUnitsData = directData;
        }
      }

      const unitIds: number[] = [];
      const unitNamesMap: Record<number, string> = {};

      if (profileUnitsData && profileUnitsData.length > 0) {
        profileUnitsData.forEach((item: any) => {
          if (item.unit_id != null) {
            unitIds.push(item.unit_id);
            const unitObj = item.unit as { id: number; name: string } | null;
            unitNamesMap[item.unit_id] = unitObj?.name || `Unidade ${item.unit_id}`;
          }
        });

        // Se profile_units existe mas id_unidade no profiles não está na lista, priorizar profile_units
        // A unidade "principal" é a marcada como is_primary, ou a primeira da lista
        const primaryRow = profileUnitsData.find((r: any) => r.is_primary);
        if (primaryRow) {
          // Sobrescrever id_unidade e unitName com a primary de profile_units
          profileData.id_unidade = primaryRow.unit_id;
          const primaryUnit = primaryRow.unit as { id: number; name: string } | null;
          unitName = primaryUnit?.name || `Unidade ${primaryRow.unit_id}`;
        }
      } else if (profileData.id_unidade != null) {
        // Fallback: se profile_units está vazia, usar id_unidade do profiles
        unitIds.push(profileData.id_unidade);
        if (unitName) {
          unitNamesMap[profileData.id_unidade] = unitName;
        }
      }

      // 6. Determinar níveis de permissão
      // Hierarquia: Sem cargo < Atendente < Supervisor < Gerente < Administrador
      const cargoLower = cargoName?.toLowerCase() || '';
      
      // Se não tem cargo válido, negar tudo independente do ID
      const hasValidCargo = cargoLower !== '' && cargoLower !== 'sem cargo';
      
      // isAdmin = Supervisor+ (pode gerenciar: atribuir, excluir contato, editar unidade)
      const isAdmin = hasValidCargo && MANAGER_ROLE_NAMES.some(role => cargoLower.includes(role));

      // isManager = Gerente+ (acesso ao Dashboard)
      const isManager = hasValidCargo && (cargoLower.includes('gerente') || cargoLower.includes('administrador'));

      // isFullAdmin = Administrador (acesso total: configurações)
      const isFullAdmin = hasValidCargo && cargoLower.includes('administrador');
      
      // 7. Montar perfil
      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        nome: profileData.nome,
        sobrenome: profileData.sobrenome,
        id_cargo: profileData.id_cargo,
        cargoName,
        id_unidade: profileData.id_unidade,
        unitName,
        unitIds,
        unitNames: unitNamesMap,
        isAdmin,
        isManager,
        isFullAdmin,
        isLoaded: true,
      };

      // 8. Cachear
      cachedProfile = userProfile;
      cacheTimestamp = Date.now();

      setProfile(userProfile);
      setLoading(false);
      return userProfile;
    } catch (err) {
      setError('Erro inesperado ao carregar perfil');
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, error, reload: () => loadProfile(true) };
}

/**
 * Limpa o cache do perfil (usar ao fazer logout)
 */
export function clearProfileCache() {
  cachedProfile = null;
  cacheTimestamp = 0;
}