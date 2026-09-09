# 클래스에서 의미로

## 상태별 class를 완성된 문자열로 둔다

Before:

```tsx
<span className={`bg-${status === 'active' ? 'green' : 'slate'}-100 rounded px-2`}>
  {status}
</span>
```

After — 이미 Badge가 있다면 도메인 의미만 결합한다.

```tsx
import { Badge } from '@/components/ui/badge'

type ProjectStatus = 'active' | 'archived'

const statusLabel = { active: '진행 중', archived: '보관됨' }
const statusVariant = { active: 'default', archived: 'secondary' } as const

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
}
```

`default`·`secondary`는 예시다. 실제 Badge가 제공하는 variant를 확인한다. 없으면 기존
token으로 완성된 class map을 두는 것으로 시작한다. 이 컴포넌트는 feature에 둔다.

## 재사용 primitive의 variant

기존 `class-variance-authority`와 `cn()`이 있을 때의 축약 예시다. 토큰은 프로젝트 값을 쓴다.

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

const noticeVariants = cva('rounded-md border p-4', {
  variants: {
    tone: {
      neutral: 'bg-background text-foreground',
      danger: 'border-destructive text-destructive',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

type NoticeProps = ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof noticeVariants>

function Notice({ tone, className, ...props }: NoticeProps) {
  return <div className={cn(noticeVariants({ tone }), className)} {...props} />
}
```

tone은 표현만 결정한다. 모든 danger 문구를 자동 `role="alert"`로 만들지 않고 상태 안내가
필요한 사용처가 적절한 role을 선택한다. `Notice`는 실제 반복되는 계약이 있을 때 만든다.
