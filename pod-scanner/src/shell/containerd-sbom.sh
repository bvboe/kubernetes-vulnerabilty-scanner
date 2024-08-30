#!/bin/bash
export CONTAINERD_ADDRESS=${1}
export CONTAINERD_NAMESPACE=${2}
OUTPUT_FILE=${3}
I1=${4}
I2=${5}
I3=${6}

echo containerd-sbom.sh - $CONTAINERD_ADDRESS $CONTAINERD_NAMESPACE $OUTPUT_FILE $I1 $I2 $I3

ctr_export() {
    local image=$1
    echo Try exporting with image reference $image
    ctr i export "$TMP_TAR_FILE" "$image"
    local exit_code=$?
    return $exit_code
}

TMP_TAR_FILE="/tmp/out.tar"
rm -f $OUTPUT_FILE
rm -f /tmp/out.tar

ctr_export $I1
export_result=$?
if [ $export_result != "0" ]; then
  echo Export failed, retry
  ctr_export $I2
  export_result=$?
  if [ $export_result != "0" ]; then
    echo Export failed, retry
    ctr_export $I3
    export_result=$?
  fi
fi

if [ $export_result -eq 0 ]; then
  echo Successful export, generate SBOM
  syft "$TMP_TAR_FILE" -o json > $OUTPUT_FILE
  exit 0
else
  echo Failed export, returning
  exit 1
fi
