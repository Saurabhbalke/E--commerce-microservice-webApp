FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Protos will be copied by build script

EXPOSE 3001 50051

CMD ["node", "src/app.js"]
