
kubectl exec -it $(kubectl get pods --no-headers --field-selector=status.phase=Running -o custom-columns=":metadata.name" | grep '^pod-scanner' | head -n 1) -- /bin/sh
