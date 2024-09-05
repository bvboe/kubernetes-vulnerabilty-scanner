#!/bin/bash
CONTAINERD_RUNTIME_TASK_DIR=${1}
CONTAINER_ID=${2}
IMAGE=${3}
OUTPUT_FILE=${4}

echo "./containerd-filesystem-sbom.sh \"${1}\" \"${2}\" \"${3}\" \"${4}\""

echo CONTAINERD_RUNTIME_TASK_DIR: $CONTAINERD_RUNTIME_TASK_DIR
echo CONTAINER_ID: $CONTAINER_ID
echo IMAGE: $IMAGE
echo OUTPUT_FILE: $OUTPUT_FILE

cleaned_container_id="${CONTAINER_ID#containerd://}"

SOURCE_NAME=${IMAGE%%[:@]*}

# Extract after ':' or '@', only if the delimiter exists
if [[ "$IMAGE" == *[:@]* ]]; then
    SOURCE_VERSION="${IMAGE##*[:@]}"
else
    SOURCE_VERSION=""
fi

echo SOURCE_NAME: $SOURCE_NAME
echo SOURCE_VERSION: $SOURCE_VERSION
rm -f $OUTPUT_FILE

current_config=`cat /host/mounts | grep ${cleaned_container_id}`
lower_dir_path=$(echo "$current_config" | sed -n 's/.*lowerdir=\([^,]*\),upperdir=.*/\1/p')

cd /tmp
rm -fr tmpcontainer
mkdir tmpcontainer

IFS=':' read -ra paths <<< "$lower_dir_path" # Split the string into an array
for (( idx=${#paths[@]}-1 ; idx>=0 ; idx-- )); do
    tmp_path="/host${paths[idx]}"
    echo Copying $tmp_path to folder
    cp -rf $tmp_path tmpcontainer
done

syft dir:tmpcontainer/fs --source-name "${SOURCE_NAME}" --source-version "${SOURCE_VERSION}" -o json > $OUTPUT_FILE
echo Result written to $OUTPUT_FILE
rm -rf tmpcontainer
