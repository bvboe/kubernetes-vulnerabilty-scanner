kubectl logs -f $(kubectl get pods --no-headers | grep '^pod-scanner' | grep 'Running' | awk '{print $1}' | head -n 1)
