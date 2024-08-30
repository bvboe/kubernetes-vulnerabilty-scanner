#FROM cgr.dev/chainguard/nginx:latest
FROM cgr.dev/chainguard/nginx:latest-dev
USER root
RUN apk add --no-cache curl
USER nginx

COPY ./html/ /usr/share/nginx/html/
COPY ./nginx-conf/nginx.conf /etc/nginx/nginx.conf
