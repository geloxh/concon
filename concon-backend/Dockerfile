FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
USER nodeuser

CMD ["node", "src/server.js"]