# k3s 배포 (crm.delvrio.com)

이 포크(`hyungjin7/tnc-crm`)는 원본 Railway 배포(`deploy/railway`, `.github/workflows/ci.yml`)를 그대로 두고,
사내 k3s 에 따로 올리는 파일만 더한다. 흐름은 hyungjin7/slp·iii 와 같다.

```
GitHub main → Sync to Gitea(.github/workflows/sync-to-gitea.yml) → Gitea hyungjin7/tnc-crm main
→ Gitea CI(.gitea/workflows/ci.yml) → gitea.delvrio.com/hyungjin7/tnc-crm/{api,web}:<sha> → kubectl set image -n crm
```

| 자원 | 이름 |
| --- | --- |
| Namespace | `crm` |
| API | Deployment·Service `crm-api` (:3002, initContainer 가 DB 마이그레이션) |
| Web | Deployment·Service `crm-web` (:3000) |
| Ingress | `crm-ingress` — `/api` → crm-api, `/` → crm-web, 인증서 `crm-tls` |
| 문지기 | Traefik Middleware `crm-sso` — bbb 계정 공유 로그인(forwardAuth → bbb dcore `/api/core/auth/forward/`) |
| 로그인 화면 | `crm.delvrio.com/admin/login/` — bbb 저장소 `infra/k8s/v1.0/crm-auth-ingress.yaml` 이 `/admin`·`/static` 을 dcore 로 보낸다 |
| DB | 운영 DB(CNPG `postgre/prod-pg`)의 `tnc_crm`, 계정 `tnc_crm` |

## 처음 한 번 (사용자)

1. **GitHub secret** — 이 저장소 Settings › Secrets › Actions 에 `GITEA_USER`, `GITEA_TOKEN`(bbb·slp 와 같은 값).
   포크라서 Actions 탭에서 워크플로 실행도 한 번 켜야 한다.
2. **DNS** — `crm.delvrio.com` 을 `bbb.delvrio.com` 과 같은 곳으로.
3. **DB** — 운영 DB 에 DB·계정 만들기
   ```bash
   PW=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)
   PRIMARY=$(kubectl get pod -n postgre -l cnpg.io/cluster=prod-pg,cnpg.io/instanceRole=primary -o name)
   kubectl exec -n postgre $PRIMARY -c postgres -- psql -U postgres \
     -c "CREATE USER tnc_crm WITH PASSWORD '$PW';" -c "CREATE DATABASE tnc_crm OWNER tnc_crm;"
   kubectl create namespace crm --dry-run=client -o yaml | kubectl apply -f -
   kubectl create secret generic crm-db-secret -n crm \
     --from-literal=DATABASE_URL="postgresql://tnc_crm:$PW@prod-pg-rw.postgre.svc.cluster.local:5432/tnc_crm"
   ```
4. **사용 권한** — bbb Admin › 그룹에 `crm` 그룹을 만들고 쓸 사람을 넣는다(superuser 는 항상 통과).
   권한 기준은 bbb `navigation_apps` 의 `crm` 행(`required_group`)이라 bbb 앱 목록에서 바꿀 수 있다. 비우면 bbb 계정 전원.
   로그인 화면은 bbb Admin 로그인과 같아서 **staff 계정**만 로그인된다.

시크릿을 먼저 만들고 GitHub main 에 push(또는 Gitea 에서 Run workflow)하면 api·web 이 뜬다.

## 확인

```bash
kubectl get pod -n crm
kubectl logs -n crm deploy/crm-api -c migrate     # applied 001_mvp_core.sql
kubectl exec -n crm deploy/crm-web -- wget -qO- http://crm-api:3002/api/v1/health   # storage.ready: true
```

브라우저로 `https://crm.delvrio.com` 을 열면 bbb 로그인 화면이 뜨고, 로그인하면 CRM 으로 돌아온다(관리 › 로그아웃).
API 문서(Swagger)는 `https://crm.delvrio.com/api/docs`(로그인 뒤).

## 원본 따라가기

원본(`soonseek/tnc-crm`)이 바뀌면 GitHub 포크 화면의 **Sync fork** 로 받는다. 이 폴더·`.gitea/`·`.dockerignore`·
`.github/workflows/sync-to-gitea.yml`·`apps/web/src/lib/current-user.ts`, `apps/web/src/lib/app-users.ts`·`components/users-section.tsx` 를 더하고, 원본은 `apps/web/src/app/more/page.tsx`(로그인 사용자·로그아웃)·`more/[section]/page.tsx`(사용자·권한 = bbb 계정 목록)만 고쳤다. 그 파일이 원본에서 바뀌면 충돌을 직접 푼다. 원본에 새 환경 변수가 생기면 `app-*.yaml` 에 더한다.
