echo This requires access to a full deployment on a Kubernetes cluster
echo and the following running:
echo kubectl port-forward service/web-frontend 8080:80
echo
echo A local instance is then available on http://localhost:9000
docker run \
 -v $(pwd)/html:/usr/share/nginx/html \
 -v $(pwd)/nginx-conf/local-dev-nginx.conf:/etc/nginx/nginx.conf \
 -p 9000:8080 \
 cgr.dev/chainguard/nginx:latest
