---
name: readable-contracts
description: >
  TypeScript의 API 요청·응답, 함수 입력·결과와 컴포넌트 props 계약을 설계·구현·
  리팩터링·검토할 때 사용한다. 용도가 드러나는 이름, 필수·생략·null의 의미,
  요청·응답·편집 초안의 구분, 상태 union과 계약 원본을 다룬다. 런타임 검증 위치나
  HTTP 실행·cache 정책을 정하는 스킬은 아니다.
---

# Readable Contracts

## 이 스킬의 기준

타입을 읽으면 **어떤 값을 주고받고, 무엇을 허용하며, 무엇이 보장되는지** 알 수 있어야
한다. 필드 수를 줄이거나 타입을 재사용하는 것보다 호출자와 구현자가 같은 의미를 읽게
만드는 일을 우선한다.

## 먼저 확인한다

1. 기존 이름, `type` / `interface` 규칙과 TypeScript의 `strictNullChecks`,
   `exactOptionalPropertyTypes` 설정을 확인한다.
2. 값이 요청, 응답, 저장 모델, 편집 초안, 함수 인자·결과, props 중 어디에서 쓰이는지
   확인한다.
3. 각 필드의 누락, `undefined`, `null`, 빈 문자열과 실패 상태가 실제로 무엇을 뜻하는지
   정한다.
4. OpenAPI 생성 타입, schema 추론 타입, 수기 타입 중 해당 계약의 원본을 확인한다.
5. 공개 계약 변경이면 기존 호출자와 직렬화 형식의 호환 범위를 확인한다.

## 필요한 근거만 읽는다

새 팀 규칙을 정하거나 공통 타입 계층·공개 API를 크게 바꿀 때는
[references/repository-evidence.md](references/repository-evidence.md)를 읽는다. 일반적인
feature 구현에서는 아래에 정리한 기준을 바로 적용하며 매번 유명 저장소를 다시 조사하지
않는다.

- 공식 문서는 언어 동작과 호환성 판단에 사용하고, 성숙한 공개 저장소는 호출부와 유지보수
  경험을 비교하는 사례로 사용한다.
- star 수는 널리 검토된 후보를 찾는 신호일 뿐 가독성 점수가 아니다. 같은 계층과 비슷한
  제약의 코드인지 먼저 확인한다.
- app 코드, 공개 library API, code generator 내부 구현은 최적화 대상이 다르다. library의
  module augmentation·다형성용 generic을 일반 app 계약에 그대로 옮기지 않는다.
- 서로 다른 프로젝트에서 반복되고 현재 계약에도 맞는 패턴만 기본 규칙으로 채택한다.
  충돌하는 관례는 프로젝트 일관성과 실제 확장 요구를 기준으로 선택한다.

## 용도가 드러나는 이름

- `Data`, `Payload`, `IProject`보다 `CreateProjectRequest`, `ProjectSummary`,
  `ProjectEditorProps`처럼 사용처와 의미가 보이는 이름을 선택한다.
- 짧은 지역 함수에서 대상이 이미 분명하면 `input`, `result` 같은 이름을 허용한다.
  모든 값에 도메인 이름을 반복해 길게 만들지 않는다.
- `Request`, `Response`, `Dto`, `Draft`, `FormValues`, `Props` 같은 접미사는 실제 수명과
  경계를 구분할 때만 붙인다. 형태와 의미, 변경 이유가 같다면 이름만 다른 타입을 늘리지
  않는다.
- 타입은 소유한 feature와 공개 경계 가까이에 둔다. 서로 무관한 계약을 거대한
  `types/index.ts`에 모으지 않는다.

## 요청·응답·초안을 구분한다

같은 프로젝트를 표현해도 단계마다 허용 값과 보장이 다르면 계약을 분리한다.

```ts
// 요청과 응답이 섞여 필수 값이 보이지 않는다.
type Project = {
  id?: string
  name?: string
  createdAt?: string
}

type RenameProjectRequest = Partial<Project>
```

```ts
type RenameProjectRequest = {
  name: string
}

type ProjectResponse = {
  id: string
  name: string
  createdAt: string
}
```

- 요청은 호출자가 보내도 되는 값만, 응답은 성공 시 제공한다고 보장하는 값을 담는다.
- 편집 초안은 미완성 입력을 허용할 수 있지만 저장 요청이나 저장된 모델까지 같은
  optional 필드로 만들지 않는다.
- 서버 DTO와 공개 화면 모델의 이름·형식이 다르면 변환 경계를 둔다. 우연히 같은 현재
  모양만 보고 하나의 타입으로 묶지 않는다.
- 여러 계층에서 의미까지 같은 작은 값 객체는 공유한다. 요청과 응답에 모두 등장한다는
  이유만으로 기계적으로 복제하지 않는다.
- 서로 연관된 인자가 함께 바뀌면 각각 넓은 union으로 선언하지 않는다. 이름 있는 객체의
  discriminated union이나 읽기 쉬운 overload로 유효한 조합만 표현한다.

## 생략·빈 값·null의 의미

| 표현 | 계약이 말하는 것 |
| --- | --- |
| `name: string` | 값이 반드시 존재한다. 빈 문자열 허용 여부는 별도 규칙이다. |
| `name?: string` | key를 생략할 수 있다. 생략의 업무 의미를 정해야 한다. |
| `name: string \| null` | key는 존재하며 `null`이 명시적인 상태다. |
| `name?: string \| null` | 생략과 명시적인 `null`이 서로 다른 상태일 수 있다. |

- optional은 “아직 설계하지 않음”이나 fixture 작성 편의를 뜻하지 않는다.
- `exactOptionalPropertyTypes`가 꺼져 있으면 `name?: string`에 명시적인 `undefined`가
  들어갈 수 있다. JSON에는 `undefined`가 보존되지 않으므로 wire 계약의 상태로 기대하지
  않는다.
- 빈 문자열, 빈 배열과 `null`을 모두 “값 없음”으로 합치지 않는다. 제품과 API가 실제로
  구분하는 상태만 타입에 남긴다.
- PATCH에서는 생략이 유지, `null`이 삭제라는 식의 의미를 endpoint 계약에 맞춰 정한다.
  모든 필드를 `Partial<Entity>`로 만드는 것으로 이 결정을 대신하지 않는다.

```ts
type UpdateProjectRequest = {
  name?: string // 생략하면 유지
  description?: string | null // 생략하면 유지, null이면 삭제
}
```

## 불가능한 상태를 허용하지 않는다

상태마다 필수 값이 다르면 boolean과 optional 필드를 조합하지 말고 구분 가능한 union을
사용한다.

```ts
type SaveProjectResult =
  | { status: 'success'; project: ProjectSummary }
  | {
      status: 'validation-error'
      message: string
      fieldErrors: { name?: string[] }
    }
```

이 계약에서는 성공 결과에 오류 필드가 없고, 검증 실패에 `project`가 없다. 호출자는
`status`로 자연스럽게 좁힌다.

- variant 이름은 `idle`, `submitting`, `success`, `validation-error`처럼 실제 상태를
  표현한다. 의미가 다른 실패를 하나의 `hasError`로 뭉개지 않는다.
- 예상 가능한 실패를 반환 값으로 다루는 API에 union을 사용한다. 기존 정책상 예외로
  전달하는 통신·프로그램 오류까지 임의로 `{ success: false }`로 바꾸지 않는다.
- variant가 추가될 때 모든 분기를 갱신해야 한다면 `never`를 이용한 exhaustive check를
  고려한다.

## 계약 원본을 하나로 정한다

- OpenAPI가 원본이면 생성 타입을 transport 계약으로 사용하고 생성 파일을 수기로
  복제·수정하지 않는다.
- runtime schema가 원본이면 추론 타입을 사용한다. transform 전 입력과 이후 출력의
  모양이 다르면 둘을 구분한다.
- 외부 명세나 schema가 없다면 공개 함수 가까이에 수기 계약을 두고 테스트와 호출자가
  그 계약을 기준으로 삼게 한다.
- 외부 DTO와 내부 도메인·화면 모델은 목적이 다를 수 있다. “원본 하나”는 모든 계층이
  동일한 타입 하나를 써야 한다는 뜻이 아니라, 같은 계약을 여러 방식으로 중복 선언하지
  않는다는 뜻이다.
- 공개 함수의 입력과 반환, 공유 props처럼 호출자가 의존하는 경계는 계약을 드러낸다.
  명확한 내부 지역 변수와 짧은 callback 결과는 추론에 맡긴다.

## 추상화 비용을 읽는 비용으로 판단한다

- 한 단계의 짧은 `Pick`·`Omit`이 공유 의미를 정확히 보이면 사용할 수 있다.
- `Partial`, 여러 단계의 mapped/conditional type과 generic을 따라가야 실제 필드나
  필수성을 알 수 있으면 사용처의 계약을 직접 선언한다.
- 반환 타입만 호출자가 고르는 `request<T>()`, `parseJson<T>()`처럼 입력·schema와 연결되지
  않은 generic은 타입 안전한 추상화가 아니라 숨은 assertion이다. 외부 값은 `unknown`에서
  검증하거나 계약 원본에서 생성된 타입 관계를 사용한다.
- utility type으로 필드 목록은 줄었지만 서로 다른 계약의 변경 이유가 결합되면 분리한다.
- 단순한 객체 인자마다 `Base`, `Common`, `WithId` 계층을 만들지 않는다. 실제 확장점이나
  반복되는 불변 조건이 있을 때만 추상화한다.

## type과 interface

기존 프로젝트 규칙을 우선하고 문법만 바꾸는 리팩터링을 하지 않는다. 규칙이 없다면 일반
앱 계약은 `type`을 기본으로 둘 수 있고, 선언 병합이나 외부 확장이 실제로 필요한 객체
계약은 `interface`를 선택할 수 있다. union과 mapped type처럼 `type`이 필요한 표현은
그대로 사용한다. 어느 문법이 항상 더 읽기 쉽다고 가정하지 않는다.

## 관련 스킬의 책임

- 외부 값의 런타임 검증과 DTO→공개 모델 변환:
  [schema-at-boundary](../schema-at-boundary/SKILL.md)
- 요청 실행, HTTP 상태와 통신 실패 처리: [http-client](../http-client/SKILL.md)
- 검증된 모델로 화면·행동 표현: [readable-ui](../readable-ui/SKILL.md)

## 검증 방법

계약을 바꾸면 호출부와 구현부를 함께 typecheck한다. 직렬화되는 요청은 누락, `null`, 빈 값이
실제 payload에 어떻게 나타나는지 확인하고, 결과 union은 각 variant에서 필요한 값만 접근할
수 있는지 확인한다. 생성 타입이나 schema 추론 타입을 사용하면 원본 변경 후 중복 수기 타입이
남지 않았는지도 검색한다.

## 위험 신호

- 한 entity 타입의 모든 필드가 optional이고 요청·응답·draft가 이를 함께 사용함
- `data`, `payload`, `result`만으로 서로 다른 계약을 구분함
- `as`와 non-null assertion으로 필수성 차이를 덮음
- 성공 여부 boolean과 서로 의존하는 optional 필드가 함께 있음
- 간단한 요청의 필드를 알려면 utility type과 generic 여러 파일을 따라가야 함
- 명세·schema·수기 interface가 같은 wire 계약을 각각 정의함

## 완료 기준

- [ ] 이름만으로 계약의 용도와 수명을 구분할 수 있다.
- [ ] 요청이 허용하는 값과 성공 결과가 보장하는 값이 분명하다.
- [ ] 생략·빈 값·`null`과 예상 실패의 의미가 실제 동작과 일치한다.
- [ ] 불가능한 상태를 optional 필드 조합으로 허용하지 않는다.
- [ ] 같은 계약의 원본이 하나이며 추상화가 필드를 숨기지 않는다.
- [ ] 변경한 호출부, 직렬화 경로와 typecheck를 검증했다.

## 참고 기준

- [TypeScript Narrowing과 discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript의 type alias와 interface](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [TypeScript Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Azure SDK TypeScript API Design](https://azure.github.io/azure-sdk/typescript_design.html)
- [오픈소스·기업 저장소 비교](references/repository-evidence.md)
