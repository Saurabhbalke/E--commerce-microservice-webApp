FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Protos will be copied by build script

EXPOSE 3002 50052

CMD ["node", "src/app.js"]
