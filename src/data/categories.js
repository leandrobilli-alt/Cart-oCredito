export const CATEGORIES = [
  { id: 'alimentacao',  name: 'Alimentação',    icon: '🍽️', color: '#f97316' },
  { id: 'supermercado', name: 'Supermercado',   icon: '🛒', color: '#22c55e' },
  { id: 'delivery',     name: 'Delivery',        icon: '🛵', color: '#ef4444' },
  { id: 'transporte',   name: 'Transporte',      icon: '🚗', color: '#3b82f6' },
  { id: 'pet',          name: 'Pet',             icon: '🐾', color: '#a855f7' },
  { id: 'vestuario',    name: 'Vestuário',       icon: '👗', color: '#ec4899' },
  { id: 'educacao',     name: 'Educação',        icon: '📚', color: '#0ea5e9' },
  { id: 'saude',        name: 'Saúde/Farmácia',  icon: '💊', color: '#84cc16' },
  { id: 'casa',         name: 'Casa',            icon: '🏠', color: '#f59e0b' },
  { id: 'assinaturas',  name: 'Assinaturas',     icon: '📺', color: '#8b5cf6' },
  { id: 'contas',       name: 'Contas',          icon: '💡', color: '#14b8a6' },
  { id: 'trabalho',     name: 'Trabalho',        icon: '💼', color: '#6366f1' },
  { id: 'compras',      name: 'Compras Online',  icon: '🛍️', color: '#f43f5e' },
  { id: 'seguros',      name: 'Seguros',         icon: '🔒', color: '#64748b' },
  { id: 'financeiro',   name: 'Financeiro',      icon: '💰', color: '#475569' },
  { id: 'outros',       name: 'Outros',          icon: '❓', color: '#94a3b8' },
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}
