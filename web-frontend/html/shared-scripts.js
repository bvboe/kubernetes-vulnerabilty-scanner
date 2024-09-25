async function loadNamespaceTable(currentUrl, currentNamespace) {
    console.log("loadNamespaceTable()")
    const response = await fetch("/api/namespaces");
    console.log("loadNamespaceTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();
    console.log(data)

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#namespaceTable tbody");

    //Clear the table
    tableBody.replaceChildren();
    addNamespaceRow(tableBody, "All Namespaces", currentUrl, null, currentNamespace);
    data.forEach(item => {
        addNamespaceRow(tableBody, item, currentUrl + "?namespace=" + item, item, currentNamespace);
    });
}

function addNamespaceRow(tableBody, name, namespaceUrl, selectedNamespace, currentNamespace) {
    const newRow = document.createElement("tr");
    const cell = document.createElement("td");
    if(selectedNamespace == currentNamespace) {
        decorationFront="<u>"
        decorationEnd="</u>"
    } else {
        decorationFront=""
        decorationEnd=""
    }
    cell.innerHTML = "<h2><a href=\""+namespaceUrl+"\">" + decorationFront + name + decorationEnd + "</a></h2>"
    newRow.appendChild(cell);
    tableBody.appendChild(newRow);
}

function doRenderHeaderCell(tableRow, title, url, currentUrl, currentNamespace) {
    const cell = document.createElement("td");
    if(currentNamespace == null) {
        fullUrl = url;
    } else {
        fullUrl = url + "?namespace=" + currentNamespace;
    }
    if(currentUrl == url) {
        decorationFront="<u>"
        decorationEnd="</u>"
    } else {
        decorationFront=""
        decorationEnd=""
    }
    cell.innerHTML = "<h1><a href=\"" + fullUrl + "\">" + decorationFront + title + decorationEnd + "</a></h1>";
    tableRow.appendChild(cell);
}

async function renderHeaderTable(currentUrl, currentNamespace) {
    const tableRow = document.querySelector("#headerRow")
/*
    console.log("renderHeaderTable(...)")
    const response = await fetch("/api/clustername");
    console.log("renderHeaderTable() - Got data")
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const clusterName = await response.text();

    const tableRow = document.querySelector("#headerRow")
    const cell = document.createElement("td");
    cell.innerHTML = "<h1>" + clusterName + ":</h1>"
    tableRow.appendChild(cell);
*/
    doRenderHeaderCell(tableRow, "Container Images", "index.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableRow, "Pods", "pods.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableRow, "CVEs", "cves.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableRow, "SBOM", "sbom.html", currentUrl, currentNamespace);
}