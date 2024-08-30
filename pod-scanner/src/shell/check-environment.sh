#!/bin/bash
#Writing debug log to /tmp/check-environment.log
echo "Starting" >> /tmp/check-environment.log
CONTAINER_MANAGER=$1
POTENTIAL_DOCKER_SOCKET_LOCATIONS=$2
POTENTIAL_CONTAINERD_SOCKET_LOCATIONS=$3
POTENTIAL_CONTAINERD_NAMESPACES=$4

echo "CONTAINER_MANAGER $CONTAINER_MANAGER" >> /tmp/check-environment.log
echo "POTENTIAL_DOCKER_SOCKET_LOCATIONS $POTENTIAL_DOCKER_SOCKET_LOCATIONS" >> /tmp/check-environment.log
echo "POTENTIAL_CONTAINERD_SOCKET_LOCATIONS $POTENTIAL_CONTAINERD_SOCKET_LOCATIONS" >> /tmp/check-environment.log
echo "POTENTIAL_CONTAINERD_NAMESPACES $POTENTIAL_CONTAINERD_NAMESPACES" >> /tmp/check-environment.log

#Figure out if this is a ContainerD based configuration
if [ "$CONTAINER_MANAGER" = "containerd" ] || [ "$CONTAINER_MANAGER" = "autodetect" ]; then
  #Go through all potential locations of ContainerD running and find the right one
  IFS=',' read -r -a array <<< "$POTENTIAL_CONTAINERD_SOCKET_LOCATIONS"
  for item in "${array[@]}"; do
    echo "Try $item" >> /tmp/check-environment.log
    export CONTAINERD_ADDRESS=$item
    # Try to connect
    #ctr namespaces list > /dev/null 2>&1
    ctr namespaces list > /dev/null 2>&1  >> /tmp/check-environment.log
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
      # Found a working configuration, break
      break
    fi
  done

  # Go through all namespaces provded and see which one has containers running
  IFS=',' read -r -a array <<< "$POTENTIAL_CONTAINERD_NAMESPACES"
  for namespace in "${array[@]}"; do
    # Count the number of running containers in the current namespace
    echo "Try ctr namespace $namespace" >> /tmp/check-environment.log
    running_containers=$(ctr -n "$namespace" containers list --quiet | wc -l)

    # If it has containers running, then we've found our namespace
    if [ "$running_containers" -gt 0 ]; then
      echo "Found containers, returning" >> /tmp/check-environment.log
      result="{\"runtime\": \"containerd\", \"CONTAINERD_NAMESPACE\": \"$namespace\", \"CONTAINERD_ADDRESS\": \"$CONTAINERD_ADDRESS\"}"
      echo $result >> /tmp/check-environment.log
      echo $result
      exit 0
    fi
  done
fi

#Figure out if this is a Docker based configuration
if [ "$CONTAINER_MANAGER" = "docker" ] || [ "$CONTAINER_MANAGER" = "autodetect" ]; then
  echo "Look for Docker runtime" >> /tmp/check-environment.log
  IFS=',' read -r -a array <<< "$POTENTIAL_DOCKER_SOCKET_LOCATIONS"
  for item in "${array[@]}"; do
    export DOCKER_HOST="unix://$item"
    echo "Look for Docker at $DOCKER_HOST" >> /tmp/check-environment.log

    #Check if Docker is running
    if docker info > /dev/null 2>&1; then
        echo "Found docker runtime" >> /tmp/check-environment.log
        result="{\"runtime\": \"docker\", \"DOCKER_HOST\":\"$DOCKER_HOST\"}"
        echo $result >> /tmp/check-environment.log
        echo $result
        exit 0
    fi
  done
fi

# No valid configuration found
echo "Found no valid configuration, returning nothing" >> /tmp/check-environment.log
echo "{}