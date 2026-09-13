import Link from 'next/link'
import {
  developmentLogCategories,
  type DevelopmentLogCategory,
} from '../development-log'

type DevelopmentLogCategoryFilterProps = {
  selectedCategory?: DevelopmentLogCategory
}

export default function DevelopmentLogCategoryFilter({
  selectedCategory,
}: DevelopmentLogCategoryFilterProps) {
  return (
    <nav aria-label="개발 기록 분류">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/log"
            aria-current={selectedCategory ? undefined : 'page'}
            className={getCategoryLinkClassName(!selectedCategory)}
          >
            전체
          </Link>
        </li>
        {developmentLogCategories.map((category) => {
          const isSelected = selectedCategory === category.value

          return (
            <li key={category.value}>
              <Link
                href={`/log?category=${category.value}`}
                aria-current={isSelected ? 'page' : undefined}
                className={getCategoryLinkClassName(isSelected)}
              >
                {category.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function getCategoryLinkClassName(isSelected: boolean) {
  const baseClassName =
    'inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

  if (isSelected) {
    return `${baseClassName} border-primary-400 bg-primary-500/15 text-primary-300`
  }

  return `${baseClassName} border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white`
}
