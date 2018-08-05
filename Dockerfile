FROM keymetrics/pm2:8-alpine

RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base
RUN pm2 install typescript

# Bundle APP files
COPY src src/
COPY "@types" "@types/"
COPY package.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
ENV DUCOR_EOS_ORACLE_PRIVATEKEY 5HqECDpMfwJcdsUVKgkGQHXy8XBaubqxUnyDcazP9TXvuXQVatx
ENV DUCOR_EOS_ORACLE_ACCOUNT workshop2221
ENV DUCOR_API_PORT 3091
ENV DUCOR_EOS_WATCH_DELAY 10000
ENV DUCOR_EOS_CHAINID 038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca
ENV DUCOR_EOS_ENDPOINT http://peer.test.alohaeos.com:8888
ENV DUCOR_EOS_MASTER_ORACLE ducormaster
ENV DUCOR_EOS_RETHINKHOST localhost
ENV DUCOR_EOS_RETHINKPORT 28015
ENV DUCOR_EOS_RETHINKDATABASE ducor
ENV DUCOR_EOS_RETHINKTABLE eos_requests

RUN npm install --production
RUN apk del \
    python-dev \
    py-pip \
    build-base
# Expose the listening port of your app
EXPOSE $DUCOR_API_PORT

COPY ecosystem.config.js .

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]