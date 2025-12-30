FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev || npm install --production

COPY . .

ENV PORT=80
ENV DATA_DIR=/app/data
ENV COOKIE_SECRET=supersecret

RUN mkdir -p /app/data

EXPOSE 80

CMD ["npm", "run", "start"]
