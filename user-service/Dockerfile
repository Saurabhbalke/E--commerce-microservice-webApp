FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001 50051

CMD ["node", "-r", "dotenv/config", "src/app.js"]
