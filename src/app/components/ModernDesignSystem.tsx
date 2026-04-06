/**
 * ============================================================================
 * BLUE DESK - MODERN DESIGN SYSTEM v3.0
 * 
 * Sistema de design normalizado e consistente para o Blue Desk.
 * Foco em harmonia visual, tipografia hierárquica e espaçamentos respiráveis.
 * 
 * USO: Importe os tokens e utilitários deste arquivo para manter
 * consistência visual em todos os componentes do chat.
 * ============================================================================
 */

// ─── PALETA DE CORES ─────────────────────────────────────────────────────────

export const colors = {
  // Cores Principais
  primary: '#0023D5',          // Azul Blue - interativos, mensagens enviadas, botões
  primaryHover: '#001AAA',     // Hover do primary
  primaryLight: '#E6EAFF',     // Background suave de tags, destaques
  white: '#FFFFFF',            // Backgrounds principais, cards, mensagens recebidas
  grayLight: '#F3F3F3',        // Backgrounds secundários, sidebar, inputs, hover
  black: '#1B1B1B',            // Textos primários, ícones

  // Cores de Suporte
  gray100: '#F9FAFB',          // Backgrounds alternativos
  gray200: '#E5E7EB',          // Bordas, divisores
  gray400: '#9CA3AF',          // Textos secundários, timestamps
  gray500: '#6B7280',          // Textos de preview
  gray600: '#4B5563',          // Textos terciários, labels, ícones
  green: '#10B981',            // Status online, positivos
  greenLight: '#D1FAE5',       // Background de status aberto
  greenDark: '#065F46',        // Texto de status aberto
  red: '#EF4444',              // Alertas, badges de notificação
  amber: '#F59E0B',            // Tags especiais, warnings
  amberLight: '#FEF3C7',       // Background de warnings
  amberDark: '#92400E',        // Texto de warnings
} as const;

// ─── TIPOGRAFIA ──────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Hierarquia de tamanhos
  sizes: {
    headerSection: '18px',     // Títulos principais (header de seção)
    headerChat: '16px',        // Títulos secundários (nome no chat)
    contactName: '15px',       // Nome na lista de conversas
    body: '15px',              // Corpo (mensagens) - line-height 1.5
    secondary: '14px',         // Prévia de mensagem, telefone
    label: '12px',             // Labels e tags
    timestamp: '11px',         // Timestamps, badges
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

// ─── ESPAÇAMENTO (8px Grid) ─────────────────────────────────────────────────

export const spacing = {
  micro: '4px',       // Espaço entre ícone e texto
  xs: '8px',          // Padding de tags/badges
  sm: '12px',         // Padding de botões pequenos
  md: '16px',         // Espaçamento entre elementos relacionados
  lg: '20px',         // Padding de cards menores
  xl: '24px',         // Padding de cards, containers
  '2xl': '32px',      // Espaçamento entre seções
  '3xl': '40px',      // Margens principais
  '4xl': '48px',      // Seções maiores
} as const;

// ─── SOMBRAS ─────────────────────────────────────────────────────────────────

export const shadows = {
  light: '0 1px 3px rgba(0,0,0,0.08)',
  medium: '0 2px 4px rgba(0,0,0,0.1)',
  blue: '0 2px 4px rgba(0,35,213,0.15)',
  blueStrong: '0 2px 4px rgba(0,35,213,0.2)',
  header: '0 1px 2px rgba(0,0,0,0.04)',
  messageSent: '0 1px 2px rgba(0,35,213,0.1)',
  messageReceived: '0 1px 3px rgba(0,0,0,0.08)',
} as const;

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────

export const radius = {
  sm: '4px',          // Tags, inputs pequenos
  md: '6px',          // Badges, filtros
  lg: '8px',          // Botões, cards, menus
  xl: '12px',         // Containers
  message: '16px',    // Bolhas de mensagem
  pill: '24px',       // Input de mensagem
  full: '9999px',     // Avatares, botão enviar
} as const;

// ─── TRANSIÇÕES ──────────────────────────────────────────────────────────────

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

// ─── AVATARES ────────────────────────────────────────────────────────────────

export const avatarColors = [
  '#0023D5', // Azul primário
  '#1E40AF', // Azul escuro
  '#2563EB', // Azul royal
  '#3B82F6', // Azul médio
  '#0284C7', // Azul sky
  '#0891B2', // Azul cyan
  '#4F46E5', // Indigo
  '#6366F1', // Indigo claro
] as const;

export const avatarSizes = {
  sm: '32px',   // Dentro do chat
  md: '48px',   // Lista de conversas (padrão)
  lg: '56px',   // Perfis
} as const;

// ─── CLASSES UTILITÁRIAS TAILWIND ────────────────────────────────────────────
// Conjuntos de classes pré-definidos para uso rápido nos componentes

export const ds = {
  // Backgrounds
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-[#F3F3F3]',
  bgAlt: 'bg-[#F9FAFB]',
  bgBlue: 'bg-[#0023D5]',
  bgBlueLight: 'bg-[#E6EAFF]',

  // Textos
  textPrimary: 'text-[#1B1B1B]',
  textSecondary: 'text-[#6B7280]',
  textTertiary: 'text-[#4B5563]',
  textTimestamp: 'text-[#9CA3AF]',
  textBlue: 'text-[#0023D5]',
  textWhite: 'text-white',

  // Bordas
  border: 'border-[#E5E7EB]',
  borderLight: 'border-[#F3F3F3]',

  // Sombras
  shadowLight: 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
  shadowBlue: 'shadow-[0_2px_4px_rgba(0,35,213,0.15)]',
  shadowHeader: 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',

  // Transições
  transition: 'transition-all duration-150 ease-in-out',

  // Mensagens
  messageSent: 'bg-[#0023D5] text-white rounded-[16px_16px_4px_16px] shadow-[0_1px_2px_rgba(0,35,213,0.1)]',
  messageReceived: 'bg-white text-[#1B1B1B] rounded-[16px_16px_16px_4px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]',

  // Menu items
  menuItem: 'flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-150',
  menuItemActive: 'bg-[#0023D5] text-white',
  menuItemHover: 'hover:bg-[#F3F3F3]',
  menuItemIcon: 'text-[#4B5563]',
  menuItemIconActive: 'text-white',

  // Badges
  badgeNotification: 'bg-[#EF4444] text-white rounded-[10px] min-w-[20px] h-5 text-[11px] font-semibold',
  badgeTag: 'bg-[#E5E7EB] text-[#4B5563] rounded px-2 py-0.5 text-[11px]',
  badgeTagSpecial: 'bg-[#E6EAFF] text-[#0023D5] rounded-md px-3 py-1 text-xs font-medium',
  badgeStatusOpen: 'bg-[#D1FAE5] text-[#065F46] rounded-md px-3 py-1 text-xs',

  // Input
  input: 'bg-[#F3F3F3] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm text-[#1B1B1B] placeholder:text-[#9CA3AF]',
  inputFocus: 'focus:border-[#0023D5] focus:ring-2 focus:ring-[#0023D5]/10',
  inputMessage: 'bg-[#F3F3F3] border border-[#E5E7EB] rounded-3xl px-4 py-2.5 text-sm text-[#1B1B1B] placeholder:text-[#9CA3AF]',

  // Botão enviar
  btnSend: 'bg-[#0023D5] text-white rounded-full w-10 h-10 shadow-[0_2px_4px_rgba(0,35,213,0.2)] hover:bg-[#001AAA]',

  // Botões de ação
  btnAction: 'text-[#9CA3AF] hover:text-[#0023D5] p-2 transition-all duration-150',
} as const;

// ─── COMPONENTES HELPER ──────────────────────────────────────────────────────

/** Retorna a cor do avatar baseada no nome */
export function getAvatarColorByName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/** Retorna iniciais do nome */
export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default {
  colors,
  typography,
  spacing,
  shadows,
  radius,
  transitions,
  avatarColors,
  avatarSizes,
  ds,
  getAvatarColorByName,
  getInitialsFromName,
};