import Link from 'next/link'
import type { DevelopmentLogCategory } from '../development-log'
import {
  developmentLogSortOptions,
  getDevelopmentLogListHref,
  type DevelopmentLogSort,
} from '../development-log-list'

type DevelopmentLogSortFilterProps = {
  selectedCategory?: DevelopmentLogCategory
  selectedSort: DevelopmentLogSort
}

export default function DevelopmentLogSortFilter({
  selectedCategory,
  selectedSort,
}: DevelopmentLogSortFilterProps) {
  return (
    <nav aria-label="개발 기록 정렬">
      <ul className="flex flex-wrap gap-2">
        {developmentLogSortOptions.map((option) => {
          const isSelected = selectedSort === option.value

          return (
            <li key={option.value}>
              <Link
                href={getDevelopmentLogListHref({
                  category: selectedCategory,
                  sort: option.value,
                })}
                aria-current={isSelected ? 'page' : undefined}
                className={getSortLinkClassName(isSelected)}
              >
                {option.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function getSortLinkClassName(isSelected: boolean) {
  const baseClassName =
    'inline-flex min-h-9 items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

  if (isSelected) {
    return `${baseClassName} border-slate-500 bg-slate-700 text-white`
  }

  return `${baseClassName} border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-200`
}
