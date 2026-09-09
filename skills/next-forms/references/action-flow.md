# 폼을 한 방향으로 읽는 예시

React 19+, Next.js App Router, Zod 4 기준의 발췌다. auth·DB 함수와 import 경로는
프로젝트 계약에 맞춘다. 여기서는 자기 프로필의 표시 이름을 변경하고 같은 화면에 머문다.

## 1. 공개 결과 — `profile-form-state.ts`

```ts
export type ProfileFormState = {
  status: 'idle' | 'error' | 'success'
  message: string
  fieldErrors: { displayName?: string[] }
}

export const initialProfileFormState: ProfileFormState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
}
```

이 모듈은 server/client가 공유하는 순수 계약이다. `'use server'` 파일에서 일반 상수를
export하지 않는다.

## 2. 서버 변경 — `update-profile.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { saveOwnProfile } from './profile-repository'
import type { ProfileFormState } from './profile-form-state'

const profileInputSchema = z.object({
  displayName: z.string().trim().min(1, '표시 이름을 입력해 주세요.')
    .max(80, '표시 이름은 80자 이하여야 합니다.'),
})

export async function updateProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser()
  const result = profileInputSchema.safeParse({
    displayName: formData.get('displayName'),
  })
  if (!result.success) {
    return {
      status: 'error',
      message: '입력을 확인해 주세요.',
      fieldErrors: z.flattenError(result.error).fieldErrors,
    }
  }

  await saveOwnProfile({ userId: user.id, displayName: result.data.displayName })
  revalidatePath('/settings/profile')
  return { status: 'success', message: '저장했습니다.', fieldErrors: {} }
}
```

`saveOwnProfile`은 `server-only` 모듈이며 신뢰한 session의 ID로 자기 프로필만 갱신한다.
다른 자원을 변경하는 action에서는 자원 ID 검증과 해당 자원에 대한 인가를 추가한다.
예상 도메인 실패가 있는 repository는 그 결과만 오류 mapper에서 변환한다.

이 예시는 프로필 route의 Next.js cache만 갱신한다. 다른 route도 같은 데이터를 사용하면
그 관계에 맞는 tag/path 정책을 선택한다. 저장 뒤 발생하는 예외를 모두 잡아 “저장 실패”로
반환하지 않는다. 별도 refresh 실패 안내가 필요하면 commit 완료 상태를 구분한다.

## 3. 입력과 결과 — `profile-form.tsx`

```tsx
'use client'

import { useActionState, useId, useState } from 'react'
import { updateProfile } from './update-profile'
import { initialProfileFormState } from './profile-form-state'

export function ProfileForm({ initialName }: { initialName: string }) {
  const [displayName, setDisplayName] = useState(initialName)
  const [state, submitProfile, isPending] = useActionState(
    updateProfile,
    initialProfileFormState,
  )
  const nameId = useId()
  const errorId = `${nameId}-error`
  const nameError = state.fieldErrors.displayName?.[0]

  return (
    <form action={submitProfile} aria-busy={isPending}>
      <label htmlFor={nameId}>표시 이름</label>
      <input
        id={nameId}
        name="displayName"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        readOnly={isPending}
        required
        maxLength={80}
        aria-invalid={Boolean(nameError)}
        aria-describedby={nameError ? errorId : undefined}
      />
      {nameError && <p id={errorId}>{nameError}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중…' : '저장'}
      </button>
      <p role="status">{isPending ? '프로필을 저장하고 있습니다.' : state.message}</p>
    </form>
  )
}
```

입력은 controlled draft이므로 실패 결과가 돌아와도 유지된다. `initialName`은 편집 시작
값이며 서버 props가 바뀔 때 Effect로 덮어쓰지 않는다. 사용자 전환은 부모의 user ID key,
명시적인 취소·다시 불러오기는 별도 초기화 동작으로 처리한다. 서버 정규화 결과까지 입력에
반영해야 한다면 성공 결과에 공개 값을 담아 그 시점에만 draft를 갱신한다.

## Optimistic이 필요한 경우에만

즐겨찾기처럼 실패 후 쉽게 복구할 수 있는 행동의 client component 내부 발췌:

```tsx
const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)
const [errorMessage, setErrorMessage] = useState('')

async function toggleFavorite() {
  const nextFavorite = !isFavorite
  setErrorMessage('')
  setOptimisticFavorite(nextFavorite)

  try {
    const result = await saveFavorite({ projectId, isFavorite: nextFavorite })
    if (!result.ok) setErrorMessage(result.message)
  } catch {
    setErrorMessage('결과를 확인하지 못했습니다. 최신 상태를 다시 확인해 주세요.')
  }
}

return (
  <form action={toggleFavorite}>
    <FavoriteButton isFavorite={optimisticFavorite} />
    <p role="status">{errorMessage}</p>
  </form>
)
```

`FavoriteButton`은 form 자식으로 `useFormStatus`를 읽어 pending 중 제출을 막고
`aria-pressed`로 상태를 표현한다. `saveFavorite`은 서버에서 검증·인가하고 성공 시 이
화면의 원본 `isFavorite`을 갱신하는 revalidation까지 소유한다. 실패하면 Action이 끝날 때
optimistic 값이 원본으로 돌아간다. 원본 갱신을 별도 Effect로 미루지 않는다. 이 예시는
순차 제출 기준이며 여러 요청을 허용하면 순서·충돌 정책을 추가해야 한다.
