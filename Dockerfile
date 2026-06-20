FROM node:24-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY packages/package.json ./packages/
RUN cd packages && npm install
COPY . .
RUN cd packages && npx prisma generate --schema=prisma/schema.prisma
RUN npx prisma generate --schema=packages/prisma/schema.prisma
EXPOSE 3000
CMD ["sh", "-c", "cd packages && npx prisma migrate deploy && cd .. && npm run dev"]
