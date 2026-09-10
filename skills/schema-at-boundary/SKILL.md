---
name: schema-at-boundary
description: >
  route params, searchParams, API 응답, form과 저장소 복원 값 등 외부 입력을 Zod로
  검증하고 공개 화면 모델로 변환할 때 사용한다. 검증 위치와 오류 계약을 UI에서
  분리한다. 내부 props마다 재검증하거나 검증 라이브러리를 일괄 교체하는 용도는 아니다.
---

# Schema at Boundary

## 이 스킬의 기준

신뢰하지 않는 값은 **들어오는 경계에서 검증**하고, 그 경계 밖에는 통과한 모델만
전달한다. UI가 서버 DTO 형식이나 검증 도구의 오류 구조를 알 필요가 없게 만든다.

## 먼저 확인한다

1. 설치된 Zod major와 기존 validator, API client, 오류 계약을 확인한다.
2. 입력 출처, 중복 key, 누락·빈 문자열·`null`의 의미를 정한다.
3. 허용할 필드, 값 범위와 사용자에게 공개할 필드를 정한다.
4. framework의 params async 규칙과 body·storage의 실패 경로를 확인한다.

Zod가 없으면 기존 검증 도구를 우선한다. 이 스킬만을 이유로 의존성을 추가하거나
업그레이드하지 않는다. 아래 reference는 Zod 4 기준이다.

## 검증 위치

| 입력 | 검증 위치 | 실패 처리 |
| --- | --- | --- |
| route params | route 진입점 또는 route parser | 제품 의미에 맞는 not-found/잘못된 요청 |
| searchParams | URL parser | 잘못된 검색 안내 또는 명시한 기본값 정책 |
| 외부 API 응답 | transport 함수의 반환 전 | data layer 오류로 전달, cache에 저장하지 않음 |
| form / JSON mutation | 서버 action / Route Handler | 필드 오류 또는 public form 오류 |
| persisted state | storage 복원·migration 경계 | 안전한 기본값과 복원 실패 정책 |

요청 JSON 자체를 읽지 못한 오류와 schema 오류도 구분해 처리한다. `as SomeType`이나
`response.json()`의 타입 지정은 런타임 검증이 아니다.

## 사용한다 / 사용하지 않는다

- 외부 값을 `unknown`으로 받아 schema로 좁힌다. 예상 가능한 입력 실패에는 `safeParse`,
  상위 오류 경계로 전달할 계약 위반에는 `parse`를 사용할 수 있다.
- async refinement/transform을 사용하면 async parse API를 사용한다.
- 누락에만 기본값을 줄지, 잘못된 값도 대체할지 명시한다. `.catch(default)`로 모든
  입력 오류를 정상 값으로 숨기지 않는다.
- coercion 전에 허용 입력을 제한한다. `Number('')`와 `Boolean('false')`의 의미를
  제품 요구사항으로 착각하지 않는다.
- form 필드는 명시적으로 추출하고 반복 필드는 `getAll()`을 사용한다. `File`과
  문자열을 구분한다. hidden input, bind 인수와 client previous state도 검증 대상이다.
- 이미 검증된 내부 모델을 props마다 재검증하지 않는다. client 사전 검증은 사용성을
  위한 보조이며 서버 검증을 대체하지 않는다.
- schema가 타입 원본이면 `z.infer`를 사용한다. transform 전 입력 타입이 필요한 경우
  `z.input`과 출력 타입을 구분한다.

## DTO와 오류 계약

- transport 가까이에 schema와 `toProjectSummary` 같은 변환을 둔다. 작으면 한 파일로
  시작하고 UI에는 공개 화면 모델만 반환한다.
- DTO를 spread해 공개 모델을 만들지 않는다. 표시할 필드를 명시적으로 선택한다.
- 형식 검증과 권한·중복·재고 같은 도메인 검사를 구분한다. session에서 신원을 얻고
  서버에서 대상 자원에 대한 권한을 확인한다.
- 필드 문구는 schema 또는 도메인 오류 mapper 한곳에서 관리한다. UI는 전달받은
  `fieldErrors`와 form 수준 `message`를 표시하고 Zod issue를 직접 해석하지 않는다.
- 예상 밖 오류의 stack·원문 API 응답·민감 입력을 사용자 메시지로 반환하지 않는다.

## 필요한 문서만 읽는다

- 요청·응답의 이름·필수성·상태와 계약 원본은
  [readable-contracts](../readable-contracts/SKILL.md)를 따른다.
- 외부 API 요청 실행, HTTP·network·취소·timeout 오류는
  [http-client](../http-client/SKILL.md)를 따른다.
- URL 정규화, API 응답→화면 모델 구현 시
  [references/parsing-and-models.md](references/parsing-and-models.md)를 읽는다.
- form 결과 계약과 pending 연결은 [next-forms](../next-forms/SKILL.md)를 읽는다.
- 공통 이름·추출·접근성·행동 검증은 [readable-ui](../readable-ui/SKILL.md)를 따른다.

## 검증 방법

경계 계약을 바꾸면 정상 값, 누락, 빈 문자열, 중복 query key, 잘못된 타입 중 실제
입력 경로에 해당하는 사례를 확인한다. 실패 시 DB 작업이나 cache 저장이 실행되지 않는지,
DTO의 비공개 필드가 반환 모델에서 제외되는지를 검증한다.

## 위험 신호

- UI 내부에 `safeParse`, 타입 단언과 오류 문자열이 반복됨
- schema 통과를 권한 확인으로 취급함
- `Object.fromEntries`가 반복 필드를 조용히 잃어버림
- API 계약 위반을 빈 배열로 바꿔 성공 화면을 표시함

## 완료 기준

- [ ] 모든 외부 입력 경로에 검증 위치와 실패 정책이 있다.
- [ ] 정규화한 값이 실제 조회·query key·mutation에 사용된다.
- [ ] UI는 공개 모델과 안정적인 오류 계약만 받는다.
- [ ] 형식 검증과 서버 인가가 각각 수행된다.
- [ ] 변경한 경계의 정상·실패 사례를 검증했다.

## 공식 기준

- [Zod 기본 사용](https://zod.dev/basics)
- [Zod schema와 coercion](https://zod.dev/api)
- [Zod 오류 포맷](https://zod.dev/error-formatting)
