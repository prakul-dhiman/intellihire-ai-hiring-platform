# -------- BACKEND DOCKERFILE --------
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install native dependencies for node-canvas / pdf-parse if needed
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
