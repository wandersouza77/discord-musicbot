FROM node:alpine
WORKDIR /app
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    ffmpeg
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
