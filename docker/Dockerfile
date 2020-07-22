FROM node:12.13.0

WORKDIR /usr/src/app

COPY ./package.json /usr/src/app
RUN npm install --verbose

RUN git clone https://github.com/vishnubob/wait-for-it.git

COPY ./ /usr/src/app