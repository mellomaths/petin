FROM node:22-alpine as builder
WORKDIR /app
COPY package*.json yarn.lock ./
COPY . .
RUN yarn install && \
    yarn run build

FROM node:22-alpine as runner
WORKDIR /app
COPY package*.json yarn.lock ./
COPY --from=builder /app/dist ./dist
RUN yarn install --frozen-lockfile
CMD ["yarn", "start"]
