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

print(f"Starting app on node {NODE_NAME}")
print(f"NODE_NAME {NODE_NAME}")
print(f"POD_NAME {POD_NAME}")
print(f"POD_NAMESPACE {POD_NAMESPACE}")
print(f"POD_IP {POD_IP}")
print(f"CONTAINER_MANAGER {CONTAINER_MANAGER}")
print(f"POTENTIAL_DOCKER_SOCKET_LOCATIONS {POTENTIAL_DOCKER_SOCKET_LOCATIONS}")
print(f"POTENTIAL_CONTAINERD_SOCKET_LOCATIONS {POTENTIAL_CONTAINERD_SOCKET_LOCATIONS}")

def get_host_configuration():
    print("get_host_configuration()")
    result = subprocess.run(["./check-environment.sh", CONTAINER_MANAGER, POTENTIAL_DOCKER_SOCKET_LOCATIONS, POTENTIAL_CONTAINERD_SOCKET_LOCATIONS], capture_output=True, text=True, check=True)

    if result.stderr:
        print("Command error:")
        print(result.stderr)
        return None
    else:
        print(f"Result:")
        print(result.stdout)
        return json.loads(result.stdout)

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
    sbom_file = "/tmp/sbom.json"
    print(f"get_sbom()")
    print(f"image: {image}")
    print(f"image_id: {image_id}")
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
        create_sbom(["./containerd-sbom.sh", containerd_address, containerd_namespace, sbom_file, image_sha, image, image_id])
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
