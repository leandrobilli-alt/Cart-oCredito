import { getCategoryById } from '../data/categories'

export default function CategoryBadge({ categoryId, size = 'md' }) {
  const cat = getCategoryById(categoryId)
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-xs px-2.5 py-1', lg: 'text-sm px-3 py-1' }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizes[size]}`}
      style={{ backgroundColor: cat.color + '20', color: cat.color }}
    >
      <span>{cat.icon}</span>
      <span>{cat.name}</span>
    </span>
  )
}
