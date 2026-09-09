---
name: tailwind-ui
description: >
  Tailwind CSS와 기존 shadcn/ui·Radix 기반 React UI를 구현·리팩터링·검토할 때 사용한다.
  utility 배치, cn, variant, 도메인 UI와 components/ui의 경계, 반응형·다크·접근성
  상태를 다룬다. CSS framework 교체나 디자인 시스템 전면 도입을 위한 스킬은 아니다.
---

# Tailwind UI

## 이 스킬의 기준

스타일을 읽으면 **레이아웃, 의미와 상태**를 알 수 있어야 한다. 일회성 스타일은
사용처의 `className`에 두고, 반복되는 의미와 행동이 생기면 컴포넌트나 variant로 표현한다.

## 먼저 확인한다

1. Tailwind major, CSS 진입점, token, content/source 탐지 설정을 확인한다.
2. shadcn 컴포넌트의 실제 코드, 기반 primitive, `cn`, `cva`와 merge 도구를 확인한다.
   shadcn이라는 이름만 보고 모든 컴포넌트가 Radix 기반이라고 가정하지 않는다.
3. 기존 폰트·색상·spacing·focus·dark mode 규칙을 확인한다.
4. 바꿀 화면의 최소 폭, 긴 콘텐츠와 키보드 상호작용을 확인한다.

Tailwind 3의 config 방식과 4의 CSS 설정을 섞지 않는다. 기존 컴포넌트와 유틸을 재사용하며
이 스킬만을 이유로 패키지를 설치하거나 업그레이드하지 않는다.

## 클래스와 추출 판단

### 사용처에 둔다

- 한 화면의 grid, spacing, 배치와 일회성 상태 스타일은 `className`에 둔다.
- 프로젝트 formatter의 class 순서를 따른다. formatter가 없으면 배치·크기·타이포·색상·
  상태를 읽기 쉽게 모으되 순서 변경만으로 큰 diff를 만들지 않는다.
- 데이터로 결정되는 실제 수치나 CSS custom property는 `style`을 쓸 수 있다.
  알려진 상태의 utility를 문자열 보간으로 만들지 않는다.

### 컴포넌트 / variant로 올린다

- 같은 사용자 역할·접근성·상태가 반복되면 역할별 컴포넌트를 만든다.
- 같은 기본 요소가 반복되는 size·tone 계약을 가지면 기존 shadcn variant 또는 `cva`로
  표현한다. boolean props 여러 개보다 `variant="destructive"` 같은 선택지를 사용한다.
- 클래스가 길다는 이유만으로 한 번 쓰는 wrapper나 거대한 variant 함수를 만들지 않는다.
- 닮았어도 서로 다른 이유로 바뀌는 도메인 UI를 범용 컴포넌트 하나로 합치지 않는다.

## `components/ui`와 도메인 UI

- `components/ui`는 Button, Dialog, Input처럼 도메인을 모르는 기본 요소다.
- `ProjectStatusBadge`, `DeleteProjectDialog`는 해당 feature 또는 route 가까이에 둔다.
- 기본 UI에서 Query, Zustand, 서버 action이나 도메인 schema를 import하지 않는다.
- 소비자가 바꿀 수 있는 `className`은 기존 `cn(base, variants, className)` 계약으로
  합친다. `cn()`을 새로 중복 구현하지 않는다.
- `clsx`는 조건 결합, `tailwind-merge`는 충돌 해소라는 역할을 구분한다. 사용한 merge
  버전이 현재 Tailwind와 custom utility를 이해하는지 확인한다.

## 반응형·다크·상태

- 화면 폭에 따른 배치는 responsive utility로 표현한다. 같은 UI를 `window.innerWidth`
  분기로 두 번 렌더링하지 않는다.
- 다크 모드는 기존 semantic token과 `dark:` 정책을 따른다. theme 선택 저장·초기화는
  기존 provider가 맡고 SSR 첫 화면과 어긋나지 않는지 확인한다.
- CSS가 처리할 수 있는 hover, focus-visible, disabled, `aria-*`, `data-*` 상태를
  별도 React state로 복제하지 않는다. 실제 상호작용 상태는 primitive 계약을 따른다.
- 동적 class 이름 대신 완성된 문자열 map을 둬 빌드가 class를 탐지할 수 있게 한다.

## 접근성과 검증

- 원래 button·link 의미와 label 연결을 유지한다. Radix의 `asChild` 등을 쓸 때 실제
  DOM에 중첩 button/link가 생기지 않는지 확인하고 props·ref 전달 계약을 보존한다.
- 모달 title·description, focus 진입·복원, Escape와 Tab 동작을 확인한다.
- 색만으로 오류·선택을 표현하지 않는다. focus 표시를 지울 때는 동등한 표시를 제공한다.
- 작은 화면, 긴 문구, 200% 확대, 밝은·어두운 테마, disabled·오류 상태에서 잘림과
  대비를 확인한다. 동작을 추가했다면 [readable-ui](../readable-ui/SKILL.md)의 행동 검증을 따른다.

## 필요한 문서만 읽는다

- utility 나열을 variant·도메인 UI로 바꿀 때
  [references/classes-and-variants.md](references/classes-and-variants.md)를 읽는다.
- 이름·추출·주석의 공통 기준은 [readable-ui](../readable-ui/SKILL.md)를 따른다.

## 위험 신호

- `bg-${color}-500`처럼 빌드가 탐지할 수 없는 class 조합
- boolean props 조합마다 다른 padding과 색을 수동으로 덮어씀
- `components/ui`가 프로젝트 권한이나 API 응답을 알고 있음
- CSS로 표현할 상태를 Effect와 resize listener로 복제함
- primitive를 사용했다는 이유로 label·focus 검증을 생략함

## 완료 기준

- [ ] 설치된 Tailwind·primitive·merge API와 코드가 맞는다.
- [ ] 일회성 배치, 재사용 UI와 variant의 책임이 명확하다.
- [ ] class가 build에서 탐지되고 충돌 시 의도한 스타일이 남는다.
- [ ] 작은 화면·다크·긴 콘텐츠·focus·오류 상태를 확인했다.
- [ ] 변경한 상호작용의 의미와 키보드 동작을 유지했다.

## 공식 기준

- [Tailwind class 탐지](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Tailwind dark mode](https://tailwindcss.com/docs/dark-mode)
- [shadcn 수동 설정과 cn](https://ui.shadcn.com/docs/installation/manual)
- [CVA variants](https://cva.style/docs/getting-started/variants)
- [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
