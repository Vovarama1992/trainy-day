
FROM node:18-alpine


WORKDIR /app

RUN apk add --no-cache openssl


COPY package.json package-lock.json ./
RUN npm install --unsafe-perm --allow-root


COPY . .



RUN npx prisma generate


RUN npm run build


CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]


EXPOSE 3001