FROM node:20-slim

WORKDIR /app

COPY . .

RUN rm -f package-lock.json && npm install

RUN npm run build

RUN npm install -g http-server

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "--proxy", "http://localhost:3000?"]
