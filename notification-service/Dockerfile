FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD ["node", "-r", "dotenv/config", "src/app.js"]
