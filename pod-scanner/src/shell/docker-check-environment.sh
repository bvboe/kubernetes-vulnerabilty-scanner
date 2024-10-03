#!/bin/bash
echo "docker-check-environment.sh \"$1\" \"$2\""
CONFIG_OUTPUT_FILE=$1
POTENTIAL_DOCKER_SOCKET_LOCATIONS=$2

echo "CONFIG_OUTPUT_FILE $CONFIG_OUTPUT_FILE"
echo "POTENTIAL_DOCKER_SOCKET_LOCATIONS $POTENTIAL_DOCKER_SOCKET_LOCATIONS"

echo "Look for Docker runtime"
IFS=',' read -r -a array <<< "$POTENTIAL_DOCKER_SOCKET_LOCATIONS"
for item in "${array[@]}"; do
  export DOCKER_HOST="unix://$item"
  echo "Look for Docker at $DOCKER_HOST"

  #Check if Docker is running
  if docker info > /dev/null 2>&1; then
      echo "Found docker runtime"
      result="{\"runtime\": \"docker\", \"DOCKER_HOST\":\"$DOCKER_HOST\"}"
      echo $result
      echo $result > $CONFIG_OUTPUT_FILE
      exit 0
  fi
done
