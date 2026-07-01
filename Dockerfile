FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL npx prisma migrate deploy --schema=prisma/schema.prisma && TURBOPACK=0 npm run dev"]