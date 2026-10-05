# Site traffic one-time Backfill

이 Job은 Argo CD가 감시하는 `k8s/` 밖에 둔 수동 실행 전용 리소스다. 배포된 web
image에는 Backfill 진입점과 필요한 TypeScript source가 포함되어 있으므로 별도 image를
만들거나 Secret 값을 shell로 읽을 필요가 없다.

## 실행 전

1. Backfill 코드가 포함된 commit을 먼저 정상 배포한다.
2. `job.yaml`을 임시 복사하고 `REPLACE_WITH_DEPLOYED_COMMIT_SHA`만 현재
   `web-app` Deployment와 같은 image tag로 교체한다.
3. 원본 manifest에는 실행 당시 SHA를 커밋하지 않는다.

Job은 다음 Secret key를 `secretKeyRef`로 직접 읽는다.

- `default/web-app-db`: `DATABASE_URL`
- `default/web-app-cloudflare`: `CLOUDFLARE_ANALYTICS_API_TOKEN`, `CLOUDFLARE_ZONE_ID`

Secret 값 자체를 조회하거나 임시 파일에 복사하지 않는다.

## 실행

SHA를 교체한 임시 manifest를 사용해 Job을 한 번 생성한다.

```bash
kubectl create -f /tmp/site-traffic-backfill-job.yaml
kubectl wait --for=condition=complete --timeout=15m job/site-traffic-backfill
kubectl logs job/site-traffic-backfill
```

실패하면 Job log에 실패한 KST 날짜 또는 DB 오류가 기록되고 non-zero로 종료된다.
원인을 해결한 뒤 기존 Job을 삭제하고 같은 image로 다시 생성할 수 있다. UPSERT는
Cloudflare 절대값을 사용하므로 재실행해도 중복 증가하지 않는다.

## 정리

성공 확인 후 즉시 삭제할 수 있다.

```bash
kubectl delete job site-traffic-backfill
```

수동으로 삭제하지 않아도 완료 후 24시간이 지나면 TTL controller가 정리한다.
