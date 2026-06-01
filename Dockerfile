FROM node:24-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY packages/package.json ./packages/
RUN cd packages && npm install

COPY . .

RUN cd packages && npx prisma generate --schema=prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "cd packages && DATABASE_URL=$DATABASE_URL npx prisma migrate deploy --schema=prisma/schema.prisma && cd .. && npm run dev"]