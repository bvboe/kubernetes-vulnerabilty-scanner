#!/bin/bash
OUTPUT_FILE=${1}

echo "./host-sbom.sh \"${1}\""

echo OUTPUT_FILE: $OUTPUT_FILE

cd /tmp
syft dir:/host --exclude './**/snapshots/**' --exclude './**/rootfs/**' --exclude './**/overlay2/**' -o json > $OUTPUT_FILE
