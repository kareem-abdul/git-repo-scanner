FROM node:lts-alpine3.14 as build

WORKDIR /usr/app
COPY package*.json  ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:lts-alpine3.14
WORKDIR /usr/app
RUN chown -R node:node /usr/app
COPY --from=build --chown=node:node /usr/app/package*.json ./
COPY --from=build --chown=node:node /usr/app/dist ./dist
RUN npm ci --only=prod --ignore-scripts
USER node
CMD npm start