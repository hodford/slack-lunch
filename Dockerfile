FROM node:lts-alpine As development
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /usr/src/app
ADD package*.json ./
RUN npm install
ARG CACHE_DATE=1995-09-20
RUN echo $CACHE_DATE
ADD . .
RUN npm run build

FROM node:lts-alpine as production
WORKDIR /usr/src/app
ARG CACHE_DATE=1995-09-20
RUN echo $CACHE_DATE
ADD package*.json ./
COPY --from=0 /usr/src/app/node_modules/ ./node_modules/
RUN npm install
COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3000
# CMD [ "pm2-runtime", "start", "pm2.json" ]
CMD ["node", "/usr/src/app/dist/main.js"]
