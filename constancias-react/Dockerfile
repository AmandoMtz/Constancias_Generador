FROM node:20-slim

WORKDIR /app

COPY . .

RUN rm -f package-lock.json && npm install

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "--listen", "tcp://0.0.0.0:3000"]
