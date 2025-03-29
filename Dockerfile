FROM node:22-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 依赖安装层
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建层
FROM dependencies AS builder
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# 生产层
FROM base AS runner
ENV NODE_ENV=production

# 复制需要的文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:7009/api/v1/health || exit 1

# 暴露端口
EXPOSE 7009

# 启动命令
CMD ["node", "dist/src/main.js"] 