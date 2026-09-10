# 읽기 쉬운 계약을 위한 공개 저장소 근거

새 팀 규칙, 공통 타입 계층 또는 넓은 공개 API를 설계할 때 읽는다. 이 문서는 저장소의
문법을 복제하기 위한 스타일 카탈로그가 아니라, 서로 다른 제약에서 반복되는 판단과 그대로
가져오면 안 되는 패턴을 구분하기 위한 근거다.

star 규모는 2026-09-10 GitHub 화면의 대략적인 값이며 이후 달라질 수 있다. star는 후보
발견에만 사용했다. 채택 여부는 공개 API의 사용성, 타입과 runtime의 일치, 유지보수 이유가
코드·문서에 드러나는지를 기준으로 판단했다.

## 비교한 사례

| 사례 | 대표성 | 관찰한 계약 설계 | 이 스킬에 반영한 판단 |
| --- | --- | --- | --- |
| [TanStack Query](https://github.com/TanStack/query) | 약 50k stars, 널리 쓰이는 TypeScript async-state library | pending·loading error·refetch error·success마다 `data`, `error`, status의 필수성이 다른 결과 타입을 선언하고 union으로 묶는다. | 값의 존재 여부가 상태에 의존하면 모든 필드를 optional로 만들지 않고 variant별 계약을 만든다. |
| [openapi-typescript / openapi-fetch](https://github.com/openapi-ts/openapi-typescript) | 약 8k stars, OpenAPI→TypeScript 도구 | OpenAPI의 path·params·body·response에서 타입을 생성하고 호출자가 응답 generic을 수기로 지정하지 않게 한다. | wire 계약 원본이 있으면 생성·추론 타입을 우선하며 같은 계약을 다시 선언하지 않는다. |
| [Stripe Node SDK](https://github.com/stripe/stripe-node) | 결제 회사의 공개 TypeScript SDK | `CustomerCreateParams`, update/list params와 반환 resource를 분리하고 타입을 API version 및 OpenAPI 생성 흐름과 연결한다. | request와 response는 모양이 비슷해도 허용 값·version 수명이 다르면 분리한다. |
| [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | 대규모 TypeScript declaration 저장소 | 입력 어디에도 나타나지 않는 `getMeAT<T>()`나 `parseJson<T>()`를 실제 generic이 아닌 숨은 assertion으로 설명한다. | 호출자가 원하는 반환형만 고르는 `request<T>()`를 타입 안전성으로 취급하지 않는다. |
| [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) | Google 내부 규칙을 공개 환경에 맞게 정리 | `I` 접두사보다 역할 이름을 사용하고, 단순 값은 추론에 맡기며 복잡한 반환 계약에는 annotation이 읽기와 변경 감지에 도움 된다고 설명한다. | 이름은 문법이 아니라 역할을 드러내고, annotation은 모든 줄이 아니라 공개·복잡 경계에 둔다. |
| [Azure SDK TypeScript Design Guidelines](https://azure.github.io/azure-sdk/typescript_design.html) | Microsoft의 다수 공개 SDK 공통 규칙 | operation별 options 이름, `abortSignal`, 단위가 포함된 duration 이름을 쓰며 서로 연관된 인자는 overload로 유효한 조합을 표현한다. | option bag과 시간 값은 사용처 의미가 보이게 이름 짓고 상관관계가 있는 인자를 독립 union으로 풀지 않는다. |
| [MUI Button types](https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Button/Button.d.ts) | 약 99k stars, 확장 가능한 공개 UI library | polymorphic root, theme 확장과 module augmentation을 위해 `OverridableStringUnion`, type map, conditional type을 사용한다. | 이 복잡성은 library 확장성의 비용이다. 동일한 확장 요구가 없는 app props에는 직접적인 타입을 우선한다. |
| [Ky type extension policy](https://github.com/sindresorhus/ky/blob/main/readme.md#extending-types) | 약 17k stars, fetch 기반 client | 전역 module augmentation 충돌을 피하려고 일부 공개 객체 타입을 의도적으로 type alias로 선언한다. | `type`과 `interface` 선택은 절대적인 가독성 순위가 아니라 외부 확장을 허용할지에 따른 계약 결정이다. |

## 반복해서 확인된 원칙

### 이름은 구조가 아니라 용도를 말한다

Google의 `IMyInterface` 회피, Azure의 operation별 `Options`, Stripe의 `CreateParams`는
표현 문법보다 사용 단계와 역할을 이름에 넣는다는 점에서 일치한다. 따라서 `Data`,
`Payload`, `IProject` 같은 구조 이름보다 `CreateProjectRequest`, `ProjectSummary`,
`ProjectEditorProps`를 기본으로 삼는다.

접미사 자체가 목표는 아니다. 같은 의미와 수명의 값에 `Dto`, `Model`, `Entity` 이름만
기계적으로 늘리는 방식은 이 근거와 맞지 않는다.

### 상태에 따라 보장이 달라지면 variant로 나눈다

TanStack Query는 단순한 성공/실패보다 복잡한 cache lifecycle을 지원하면서도 결과별
`data`와 `error`의 존재 여부를 개별 타입으로 고정한다. app의 action 결과는 대개 더
단순하므로 필요한 variant만 가진 discriminated union으로 같은 장점을 얻을 수 있다.

library가 호환성과 편의를 위해 여러 boolean flag도 함께 제공한다고 해서 app 결과 타입까지
그 구조를 복제할 필요는 없다. 중요한 근거는 state별 invariant가 타입에 있다는 점이다.

### 생성·추론은 원본이 있을 때만 강하다

openapi-fetch와 Stripe는 type parameter 하나로 외부 body를 믿는 것이 아니라 API 명세와
version에 타입을 연결한다. 따라서 OpenAPI나 runtime schema가 원본이면 생성·추론을
선택한다. 원본 없이 호출자가 지정하는 `request<T>()`는 DefinitelyTyped가 지적하는
`parseJson<T>()`와 같은 assertion이다.

생성 타입이 읽기 어렵다면 생성 파일을 복사해 다시 관리하지 않는다. transport 경계에서
작은 공개 모델로 변환하고 app 호출부에는 그 모델을 노출한다.

### 추상화는 같은 제약에서만 가져온다

MUI의 generic type map은 element 교체, props 상속, theme의 외부 확장을 동시에 보장한다.
이는 많은 소비자를 가진 component library에는 타당하지만, 고정된 element와 도메인 props를
가진 app 컴포넌트에는 탐색 비용만 남을 수 있다.

반대로 여러 공개 SDK에서 반복되는 operation options 이름, state variant, request/response
분리는 library와 app 모두에서 의미를 직접 드러내므로 공통 기준으로 채택할 수 있다.

## 충돌한 관례를 처리한 방식

### type과 interface

Google은 객체 계약에 interface를 선호한다. MUI는 interface의 module augmentation을 제품
기능으로 사용한다. Ky는 같은 전역 확장을 막기 위해 type alias를 선택한다. 이 사례들은 한
문법이 언제나 읽기 좋다는 결론을 지지하지 않는다.

따라서 기존 프로젝트 규칙을 우선하고, 규칙이 없다면 실제 외부 확장·선언 병합 여부와 union
표현 필요성으로 선택한다. 문법 통일만을 위한 대량 변경은 하지 않는다.

### 명시 annotation과 추론

Google은 자명한 지역 값의 annotation을 생략하면서 복잡한 결과에는 명시 타입의 문서화
효과를 인정한다. 공개 요청·응답, 공유 props와 복잡한 결과는 호출자가 의존하는 계약이므로
드러내고, 짧은 지역 계산은 추론에 맡기는 현재 기준을 유지한다.

## 적용 전 확인 질문

1. 참고한 코드가 app feature인가, 공개 library API인가, code generator 내부인가?
2. 그 타입의 복잡성이 해결하는 실제 확장·호환 요구가 현재 프로젝트에도 있는가?
3. 호출부 한 곳만 읽어도 허용 입력과 보장 결과를 알 수 있는가?
4. generic의 반환 타입이 실제 입력, schema 또는 명세와 연결되어 있는가?
5. 서로 다른 두 사례에서 반복된 원칙인가, 한 저장소의 지역 관례인가?

## 주요 원문

- [TanStack Query 결과 타입](https://github.com/TanStack/query/blob/main/packages/query-core/src/types.ts)
- [openapi-fetch 사용 예시](https://github.com/openapi-ts/openapi-typescript/blob/main/packages/openapi-fetch/README.md)
- [Stripe Node TypeScript 안내](https://github.com/stripe/stripe-node#usage-with-typescript)
- [DefinitelyTyped common mistakes](https://github.com/DefinitelyTyped/DefinitelyTyped#common-mistakes)
- [Google TypeScript type system과 naming](https://google.github.io/styleguide/tsguide.html)
- [Azure SDK TypeScript API design](https://azure.github.io/azure-sdk/typescript_design.html)
- [MUI Button 공개 타입](https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Button/Button.d.ts)
- [Ky type 확장 정책](https://github.com/sindresorhus/ky/blob/main/readme.md#extending-types)
