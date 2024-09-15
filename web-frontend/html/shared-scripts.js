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
        headerType = "h2";
    } else {
        headerType = "h3";
    }
    cell.innerHTML = "<" + headerType + "><a href=\""+namespaceUrl+"\">" + name + "</a></" + headerType + ">"
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
        headerType = "h1";
    } else {
        headerType = "h2";
    }
    cell.innerHTML = "<" + headerType + "><a href=\"" + fullUrl + "\">" + title + "</a></" + headerType + ">";
    tableRow.appendChild(cell);
}

function renderHeaderTable(currentUrl, currentNamespace) {
    const tableRow = document.querySelector("#headerRow")
    doRenderHeaderCell(tableRow, "Container Images", "index.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableRow, "Pods", "pods.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableRow, "CVEs", "cves.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableRow, "SBOM", "sbom.html", currentUrl, currentNamespace);
}