# crm-web (Next.js). 저장소 루트를 빌드 컨텍스트로 쓴다: docker build -f deploy/k3s/web.Dockerfile .
# 브라우저는 같은 주소의 /api/v1 을 부른다(Ingress 가 crm-api 로 보낸다). NEXT_PUBLIC_* 는 빌드 때 번들에 박힌다.
# 서버(SSR)는 실행 때 CRM_API_BASE_URL(클러스터 내부 주소)을 쓴다.
FROM node:24-alpine
WORKDIR /app
# packageManager(pnpm@11.19.0)와 같은 버전. corepack 은 이미지마다 서명 키가 낡아 실패할 수 있어 npm 으로 깐다.
RUN npm install -g pnpm@11.19.0
COPY . .
ARG NEXT_PUBLIC_CRM_API_BASE_URL=/api/v1
ENV NEXT_PUBLIC_CRM_API_BASE_URL=$NEXT_PUBLIC_CRM_API_BASE_URL \
    CRM_DEPLOYMENT_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm install --frozen-lockfile \
    && pnpm --filter @tnc-crm/contracts build \
    && pnpm --filter @tnc-crm/web build \
    && chown -R node:node /app/apps/web/.next
ENV NODE_ENV=production PORT=3000 TZ=Asia/Seoul
WORKDIR /app/apps/web
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
