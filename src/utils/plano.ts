export type Plano = 'gratuito' | 'premium_mensal' | 'premium_anual';

// Lugar único pra mapear o valor real do backend (premium_mensal/premium_anual,
// nunca "premium" sozinho) pro rótulo em tela — evita comparações tipo
// `plano === 'premium'` espalhadas pelo código, que nunca bateriam com o valor
// de verdade e fariam assinante aparecer como gratuito.
export const PLANO_LABEL: Record<Plano, string> = {
  gratuito: 'Gratuito',
  premium_mensal: 'Premium Mensal',
  premium_anual: 'Premium Anual',
};

export const PLANO_COLOR: Record<Plano, string> = {
  gratuito: 'default',
  premium_mensal: 'blue',
  premium_anual: 'green',
};

export function isPremium(plano: Plano): boolean {
  return plano !== 'gratuito';
}
