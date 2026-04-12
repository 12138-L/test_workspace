export const SPACING = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  xxl: '32px'
} as const

export const GRID = {
  gap: SPACING.lg,
  cardGap: SPACING.lg
} as const

export const CARD = {
  headerIconSize: '18px'
} as const

export const DESIGN_TOKENS = {
  primaryPurple: '#8080f2',
  primaryGreen: '#63e2b7',
  primaryBlue: '#70c0e8',
  primaryYellow: '#f7c861',
  primaryRed: '#d03050',
  textPrimary: '#333647',
  textSecondary: '#8c9aa8',
  bgLight: '#f8fafc'
} as const

export type SpacingKey = keyof typeof SPACING
export type DesignTokenKey = keyof typeof DESIGN_TOKENS

export default {
  SPACING,
  GRID,
  CARD,
  DESIGN_TOKENS
}
