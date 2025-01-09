#!/bin/bash
IMAGE=$1
DIRECTORY=$2

# Helper script to build and release an image
echo Build image $IMAGE from directory $DIRECTORY

cd $DIRECTORY
docker buildx create --name k8s-scanner-builder --use --driver docker-container
docker buildx build --builder k8s-scanner-builder --platform linux/amd64,linux/arm64 -t $1 --push .
