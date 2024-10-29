#!/bin/bash
export DOCKER_HOST=${1}
OUTPUT_FILE=${2}
IMAGE_ID=${3}

echo docker-sbom.sh $DOCKER_HOST $OUTPUT_FILE $IMAGE_ID

rm -f ${OUTPUT_FILE}

nice -n 10 syft docker:${IMAGE_ID} -o json > $OUTPUT_FILE
echo Wrote SBOM to $OUTPUT_FILE
