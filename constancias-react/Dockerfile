FROM node:20-slim

WORKDIR /app

COPY . .

RUN rm -f package-lock.json && npm install

ARG VITE_API_URL=https://constanciasgenerador-production.up.railway.app/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

RUN npm install -g http-server

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "--proxy", "http://localhost:3000?"]
