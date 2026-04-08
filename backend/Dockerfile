FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm run start"]
