FROM node:24.11.1-alpine AS builder

WORKDIR /home/app

COPY package*.json ./
RUN npm ci --ignore-scripts && npm rebuild bcrypt

COPY . .
RUN npm run build

# ---

FROM node:24.11.1-alpine

RUN apk add --no-cache curl

WORKDIR /home/app

RUN addgroup -S appuser && adduser -S appuser -G appuser

COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/dist/ ./dist/
COPY --from=builder /home/app/node_modules/ ./node_modules/
COPY --from=builder /home/app/prisma/ ./prisma/

RUN chown -R appuser:appuser /home/app

USER appuser

CMD ["npm", "run", "start:prod"]
