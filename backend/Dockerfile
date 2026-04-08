FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push && npm run seed && npm run start"]

