#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"

#Version number that updates chart and images
VERSION="0.3"
POD_SCANNER_REPOSITORY="bjornvb/k8s-pod-scanner"
VULNERABILITY_COORDINATOR_REPOSITORY="bjornvb/k8s-scanner-vulnerability-coordinator"
WEB_FRONTEND_REPOSITORY="bjornvb/k8s-scanner-web-frontend"

echo Generate release $VERSION
./doreleasecontainer.sh "$POD_SCANNER_REPOSITORY:$VERSION" "pod-scanner"
./doreleasecontainer.sh "$VULNERABILITY_COORDINATOR_REPOSITORY:$VERSION" "vulnerability-coordinator"
./doreleasecontainer.sh "$WEB_FRONTEND_REPOSITORY:$VERSION" "web-frontend"

cat k8s-vuln-scanner/values.yaml | yq eval ".podScanner.image.tag = \"${VERSION}\" | 
                                            .vulnerabilityCoordinator.image.tag = \"${VERSION}\" 
                                            | .webFrontend.image.tag = \"${VERSION}\"" > k8s-vuln-scanner/newvalues.yaml
mv k8s-vuln-scanner/newvalues.yaml k8s-vuln-scanner/values.yaml

cat k8s-vuln-scanner/Chart.yaml | yq eval ".appVersion=\"${VERSION}\"" > k8s-vuln-scanner/newChart.yaml
mv k8s-vuln-scanner/newChart.yaml k8s-vuln-scanner/Chart.yaml

echo Complete and generated the following containers:
echo "$POD_SCANNER_REPOSITORY:$VERSION"
echo "$VULNERABILITY_COORDINATOR_REPOSITORY:$VERSION"
echo "$WEB_FRONTEND_REPOSITORY:$VERSION"
