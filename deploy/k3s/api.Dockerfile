# crm-api (NestJS). 저장소 루트를 빌드 컨텍스트로 쓴다: docker build -f deploy/k3s/api.Dockerfile .
# 마이그레이션(tsx scripts/migrate.ts)을 initContainer 에서 돌리므로 devDependencies 도 이미지에 둔다.
FROM node:24-alpine
WORKDIR /app
# packageManager(pnpm@11.19.0)와 같은 버전. corepack 은 이미지마다 서명 키가 낡아 실패할 수 있어 npm 으로 깐다.
RUN npm install -g pnpm@11.19.0
COPY . .
RUN pnpm install --frozen-lockfile \
    && pnpm --filter @tnc-crm/contracts build \
    && pnpm --filter @tnc-crm/api build
ENV NODE_ENV=production PORT=3002 TZ=Asia/Seoul
WORKDIR /app/apps/api
USER node
EXPOSE 3002
CMD ["node", "dist/main.js"]
