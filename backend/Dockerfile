FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .

RUN yarn run build

ENV PORT=3000

EXPOSE 3000

CMD ["yarn", "start"]