FROM node

WORKDIR /code
COPY server.js .
COPY package.json .
COPY yarn.lock .
RUN yarn

ENTRYPOINT [ "node" ]
CMD [ "server.js" ]
