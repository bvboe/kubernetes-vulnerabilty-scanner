from flask import Flask, request
import os
import json
import subprocess
import ast

NODE_NAME=os.getenv("NODE_NAME")
POD_NAME=os.getenv("POD_NAME")
POD_NAMESPACE=os.getenv("POD_NAMESPACE")
POD_IP=os.getenv("POD_IP")
CONTAINER_MANAGER = os.getenv("CONTAINER_MANAGER")
POTENTIAL_DOCKER_SOCKET_LOCATIONS = os.getenv("POTENTIAL_DOCKER_SOCKET_LOCATIONS")
POTENTIAL_CONTAINERD_SOCKET_LOCATIONS = os.getenv("POTENTIAL_CONTAINERD_SOCKET_LOCATIONS")
POTENTIAL_CONTAINERD_NAMESPACES = os.getenv("POTENTIAL_CONTAINERD_NAMESPACES")
POTENTIAL_CONTAINERD_RUNTIME_TASK_LOCATIONS = os.getenv("POTENTIAL_CONTAINERD_RUNTIME_TASK_LOCATIONS")

print(f"Starting app on node {NODE_NAME}")
print(f"NODE_NAME {NODE_NAME}")
print(f"POD_NAME {POD_NAME}")
print(f"POD_NAMESPACE {POD_NAMESPACE}")
print(f"POD_IP {POD_IP}")
print(f"CONTAINER_MANAGER {CONTAINER_MANAGER}")
print(f"POTENTIAL_DOCKER_SOCKET_LOCATIONS {POTENTIAL_DOCKER_SOCKET_LOCATIONS}")
print(f"POTENTIAL_CONTAINERD_SOCKET_LOCATIONS {POTENTIAL_CONTAINERD_SOCKET_LOCATIONS}")
print(f"POTENTIAL_CONTAINERD_NAMESPACES {POTENTIAL_CONTAINERD_NAMESPACES}")

def get_host_configuration():
    print("get_host_configuration()")
    conig_file_location = "/tmp/scanner-configuration.json"
    result = subprocess.run(["./check-environment.sh", conig_file_location, CONTAINER_MANAGER, POTENTIAL_DOCKER_SOCKET_LOCATIONS, POTENTIAL_CONTAINERD_SOCKET_LOCATIONS, POTENTIAL_CONTAINERD_NAMESPACES, POTENTIAL_CONTAINERD_RUNTIME_TASK_LOCATIONS], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True)
    print(result.stdout)

    with open(conig_file_location, 'r') as file:
        scanner_configuration = file.read()
        print(scanner_configuration)
        return json.loads(scanner_configuration)

HOST_CONFIGURATION = get_host_configuration()
print(f"Current host configuration: {HOST_CONFIGURATION}")

app = Flask(__name__)

@app.route("/hello")
def sayHello():
    result = {
        "result": "success",
        "node_name": NODE_NAME,
        "pod_ip": POD_IP
    }
    strresult=json.dumps(result)
    print(f"sayHello(): {strresult}")
    return strresult


@app.route("/")
def index():
    print("index()")
    return "Scanner application running!\n"

@app.route("/sbom" , methods=['GET'])
def get_sbom():
    image = request.args.get('image')
    image_id = request.args.get('image_id')
    container_id = request.args.get('container_id')
    sbom_file = "/tmp/sbom.json"
    print(f"get_sbom()")
    print(f"image: {image}")
    print(f"image_id: {image_id}")
    print(f"container_id: {container_id}")
    image_sha = image.split(":")[0] + "@" + image_id

    if HOST_CONFIGURATION['runtime'] == "docker":
        print("Do Docker based scan")
        docker_host = HOST_CONFIGURATION['DOCKER_HOST']
        create_sbom(["./docker-sbom.sh", docker_host, sbom_file, image_sha])
        sbom = load_sbom(sbom_file)
        if sbom:
            return {"result": "success", "sbom": sbom}
        else:
            return {"result": "fail"}
    elif HOST_CONFIGURATION['runtime'] == "containerd":
        print("Do Containerd based scan")
        containerd_address = HOST_CONFIGURATION['CONTAINERD_ADDRESS']
        containerd_namespace = HOST_CONFIGURATION['CONTAINERD_NAMESPACE']
        containerd_runtime_task_location = HOST_CONFIGURATION['CONTAINERD_RUNTIME_TASK_LOCATION']
        create_sbom(["./containerd-filesystem-sbom.sh", containerd_runtime_task_location, container_id, image, sbom_file])
#        create_sbom(["./containerd-containerfile-sbom.sh", containerd_address, containerd_namespace, sbom_file, image_sha, image, image_id])
        sbom = load_sbom(sbom_file)
        if sbom:
            return {"result": "success", "sbom": sbom}
        else:
            return {"result": "fail"}
    else:
        print(f"Invalid configuration - {HOST_CONFIGURATION}, returning none")
        return {"result": "fail"}

def load_sbom(file_path):
    print(f"load_sbom({file_path})")
    try:
        with open(file_path, 'r') as file:
            return file.read()
    except FileNotFoundError:
        # Handle the error if the file doesn't exist
        print(f"The file {file_path} does not exist.")
        return None


def create_sbom(sbom_call):
    print(f"create_sbom({sbom_call})")

    try:
        result = subprocess.run(sbom_call, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True, timeout=120)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Command failed with return code {e.returncode}")
        print(f"Command output:\n{e.output}")
        print(f"Command error:\n{e.stderr}")
    except FileNotFoundError:
        print("The specified command was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
