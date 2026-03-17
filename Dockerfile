FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN chmod +x index.js && npm link

VOLUME ["/root/.log-cli"]

ENTRYPOINT ["log"]
CMD ["help"]
