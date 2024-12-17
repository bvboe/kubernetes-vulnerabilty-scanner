#!/bin/bash
echo "./containerd-check-environment.sh \"$1\" \"$2\""
date
CONFIG_OUTPUT_FILE=$1
POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS=$2

echo "CONFIG_OUTPUT_FILE $CONFIG_OUTPUT_FILE"
echo "POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS $POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS"

#Go through all potential locations where ContainerD could be storing its snapshots
CONTAINERD_SNAPSHOT_LOCATION=""
IFS=',' read -r -a array <<< "$POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS"
for item in "${array[@]}"; do
  echo "Try $item"
  if [ -d "$item" ]; then
    # Found a directory that exists
    CONTAINERD_SNAPSHOT_LOCATION=$item
    break
  fi
done

result="{\"runtime\": \"containerd\", \"CONTAINERD_SNAPSHOT_LOCATION\": \"$CONTAINERD_SNAPSHOT_LOCATION\"}"
echo $result
echo $result > $CONFIG_OUTPUT_FILE
