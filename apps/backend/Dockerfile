FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm ci --verbose
COPY . .
RUN npx nx build backend
#RUN node ./apps/backend/node_modules.js ./package.json ./dist/apps/backend/main.js


FROM node:alpine
ENV PORT=80
WORKDIR /usr/src/app
RUN npm install -g pm2@latest
COPY --from=builder /usr/src/app/dist/apps/backend .
RUN npm install --production
EXPOSE $PORT
ENTRYPOINT ["pm2-runtime","main.js"]
