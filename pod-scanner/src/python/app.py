from kubernetes import client, config, watch
from flask import Flask, request, jsonify
import os
import json
import subprocess
import ast
import threading

NODE_NAME=os.getenv("NODE_NAME")
POD_NAME=os.getenv("POD_NAME")
POD_NAMESPACE=os.getenv("POD_NAMESPACE")
POD_IP=os.getenv("POD_IP")
POTENTIAL_DOCKER_SOCKET_LOCATIONS = os.getenv("POTENTIAL_DOCKER_SOCKET_LOCATIONS")
POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS = os.getenv("POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS")
HOST_CONFIGURATION = None
GET_SBOM_LOCK = threading.Lock()

print(f"Starting app on node {NODE_NAME}")
print(f"NODE_NAME {NODE_NAME}")
print(f"POD_NAME {POD_NAME}")
print(f"POD_NAMESPACE {POD_NAMESPACE}")
print(f"POD_IP {POD_IP}")
print(f"POTENTIAL_DOCKER_SOCKET_LOCATIONS {POTENTIAL_DOCKER_SOCKET_LOCATIONS}")
print(f"POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS {POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS}")

def get_container_runtime():
    print("get_container_runtime()")
    config.load_incluster_config()
    v1 = client.CoreV1Api()
    nodes = v1.list_node()

    for node in nodes.items:
        node_name = node.metadata.name
        if node_name == NODE_NAME:
            print(f"Found {node.status.node_info.container_runtime_version}")
            return node.status.node_info.container_runtime_version
    
    return None

def get_host_configuration():
    print("get_host_configuration()")
    container_runtime = get_container_runtime()
    config_file_location = "/tmp/scanner-configuration.json"
    console_out = None

    if container_runtime.startswith("containerd"):
        print("Loading ContainerD runtime configuration")
        console_out = subprocess.run(["./containerd-check-environment.sh", config_file_location, POTENTIAL_CONTAINERD_SNAPSHOT_LOCATIONS], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True)
    elif container_runtime.startswith("docker"):
        print("Loading Docker runtime configuration")
        console_out = subprocess.run(["./docker-check-environment.sh", config_file_location, POTENTIAL_DOCKER_SOCKET_LOCATIONS], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True)
    else:
        print(f"ERROR - Unknown runtime {container_runtime}")
        return None

    print(console_out.stdout)

    with open(config_file_location, 'r') as file:
        scanner_configuration = file.read()
        print(scanner_configuration)
        return json.loads(scanner_configuration)

HOST_CONFIGURATION = get_host_configuration()
print(f"Current host configuration: {HOST_CONFIGURATION}")

app = Flask(__name__)

def is_ready():
    if HOST_CONFIGURATION is None:
        return False
    else:
        return True

@app.route('/health')
def health_check():
    if is_ready():
        return jsonify({"status": "healthy"}), 200
    else:
        return jsonify({"status": "not ready"}), 400

@app.route("/hello")
def sayHello():
    status = None
    if is_ready():
        status = "ready"
    else:
        status = "not ready"

    result = {
        "status": status,
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
    if "@" in image:
        image_sha = image
    else:
        image_sha = image.split(":")[0] + "@" + image_id
    print(f"image_sha: {image_sha}")

    # This function is currently designed to only handle one call at the time
    # which is also the way the vulnerability coordinator works
    # The lock is just a safety feature
    with GET_SBOM_LOCK:
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
            containerd_snapshot_folder = HOST_CONFIGURATION['CONTAINERD_SNAPSHOT_LOCATION']
            create_sbom(["./containerd-filesystem-sbom.sh", container_id, image, containerd_snapshot_folder, sbom_file])
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
        result = subprocess.run(sbom_call, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True)
        #result = subprocess.run(sbom_call, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True, timeout=120)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Command failed with return code {e.returncode}")
        print(f"Command output:\n{e.output}")
        print(f"Command error:\n{e.stderr}")
    except FileNotFoundError:
        print("The specified command was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
