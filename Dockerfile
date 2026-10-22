FROM php:8.2-cli-alpine

WORKDIR /app

RUN apk add --no-cache sqlite-libs

COPY . /app

RUN mkdir -p /app/database && chmod -R 777 /app/database

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t /app"]
