# 基础镜像使用轻量稳定的 Node.js 20 Alpine
FROM node:20-alpine AS builder

WORKDIR /app

# 1. 安装根目录依赖
COPY package*.json ./
RUN npm ci

# 2. 安装前端依赖并构建静态产物
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# 3. 运行阶段
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

CMD ["node", "server/index.js"]
