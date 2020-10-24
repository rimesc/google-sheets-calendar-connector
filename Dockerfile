FROM node:8
VOLUME /var/token
ENV TOKEN_DIR /var/token/
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm install
RUN npm run build
CMD [ "node", "dist/cli.js" ]
