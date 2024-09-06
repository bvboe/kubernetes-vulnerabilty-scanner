# Kubernetes Vulnerability Scanner
Application for scanning the containers in your Kubernetes cluster for vulnerabilities!

## Installation
```
$ git clone https://github.com/bvboe/kubernetes-vulnerabilty-scanner/
$ cd kubernetes-vulnerabilty-scanner/
$ helm upgrade --install k8s-scanner k8s-vuln-scanner
Release "k8s-scanner" does not exist. Installing it now.
Congratulations! The Kubernetes Vulnerability Scanner is now up and running.

To access the web ui, run the following command:
kubectl port-forward service/web-frontend 8080:80
And access the UI on http://localhost:8080
```
