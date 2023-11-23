FROM node:21

WORKDIR /usr/src/clean-node-api
COPY package*.json ./
RUN npm cache clean --force && npm install --legacy-peer-deps --only=prod
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build
RUN ls -al /usr/src/clean-node-api/dist/main
ENV HUSKY_SKIP_INSTALL=1
CMD ["node", "dist/main/server.js", "--inspect=0.0.0.0:9222", "--nolazy"]
