FROM node:alpine AS builder
ENV PORT=80
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL="diax.website"
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm install
COPY . .
RUN npx nx build frontend

FROM node:alpine
ENV PORT=80
WORKDIR /usr/src/app
RUN npm install -g pm2@latest
COPY --from=builder /usr/src/app/apps/frontend/.next/standalone .
COPY --from=builder /usr/src/app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY apps/frontend/public ./apps/frontend/public
EXPOSE $PORT

ENTRYPOINT ["pm2-runtime","apps/frontend/server.js"]
