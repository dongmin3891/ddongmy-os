# Database migrations

`database/migrations`에는 `ddongmy` PostgreSQL 데이터베이스의 스키마 변경을 순서대로
보관합니다. 애플리케이션 콘텐츠는 계속 Notion이 원본이며, 이 데이터베이스에는
애플리케이션이 직접 소유하는 운영 데이터만 저장합니다.

## 파일 규칙

- 파일명은 `NNN_description.sql` 형식을 사용합니다.
- 적용된 migration은 수정하지 않습니다. 변경이 필요하면 다음 번호의 파일을 추가합니다.
- 각 migration은 하나의 트랜잭션 안에서 실행하고, 성공한 번호를
  `public.schema_migrations`에 기록합니다.
- 날짜별 통계의 날짜 기준은 `Asia/Seoul`로 고정합니다. PostgreSQL session timezone에
  의존하지 않고 쿼리에서 명시합니다.
- 비밀번호와 연결 문자열은 Git에 저장하지 않습니다.

현재 migration은 다음과 같습니다.

| 번호 | 설명 |
| --- | --- |
| `000` | 적용된 migration을 기록하는 `schema_migrations` 생성 |
| `001` | Notion page ID 기준으로 KST 일자별 조회수를 저장하는 `log_view_stats` 생성 |

## 개발 로그 identity

- `post_id`는 변경되지 않는 Notion page ID입니다. DB 집계, primary key와 브라우저의
  30분 중복 방지는 이 값을 기준으로 합니다.
- `post_slug`는 현재 공개 URL과 게시글 검증에 사용합니다. slug가 변경되면 같은
  `post_id`의 다음 upsert에서 최신 값으로 갱신합니다.

## 적용

홈서버에서 PostgreSQL Pod의 관리자 계정으로 접속해 번호순으로 적용합니다.

```bash
kubectl exec -i -n database postgres-0 -- \
  psql -U postgres -d ddongmy -v ON_ERROR_STOP=1 \
  < database/migrations/000_create_schema_migrations.sql
kubectl exec -i -n database postgres-0 -- \
  psql -U postgres -d ddongmy -v ON_ERROR_STOP=1 \
  < database/migrations/001_create_log_view_stats.sql
```

적용 상태는 다음 쿼리로 확인합니다.

```bash
kubectl exec -n database postgres-0 -- psql -U postgres -d ddongmy -c \
  'SELECT version, description, applied_at FROM public.schema_migrations ORDER BY version;'
```

운영 환경에서는 migration을 한 번에 하나씩 번호순으로 적용합니다. 이미 기록된 파일을
다시 실행하지 않으며, 실패한 파일은 원인을 수정한 뒤 같은 파일을 다시 실행합니다.

## 애플리케이션 권한 검증

`001`은 기존 로그인 역할 `ddongmy_app`에 `SELECT`, `INSERT`, `UPDATE`만 부여합니다.
애플리케이션 연결 문자열로 아래 트랜잭션을 실행하면 데이터를 남기지 않고 권한과
atomic upsert를 확인할 수 있습니다.

```bash
export DATABASE_URL='postgresql://ddongmy_app:<password>@<host>:5432/ddongmy'

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

INSERT INTO public.log_view_stats (
  post_id,
  post_slug,
  view_date,
  views
)
VALUES (
  'migration-smoke-test-id',
  'migration-smoke-test',
  (NOW() AT TIME ZONE 'Asia/Seoul')::date,
  1
)
ON CONFLICT (post_id, view_date)
DO UPDATE SET
  views = log_view_stats.views + 1,
  post_slug = EXCLUDED.post_slug;

SELECT post_id, post_slug, view_date, views
FROM public.log_view_stats
WHERE post_id = 'migration-smoke-test-id';

ROLLBACK;
SQL
```
