FROM node:14-alpine3.11

WORKDIR /app
COPY . .
RUN npm ci --production

EXPOSE 3000

CMD ["npm", "start"]