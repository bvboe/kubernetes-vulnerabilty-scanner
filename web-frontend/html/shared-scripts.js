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

    const select = document.getElementById("namespaceSelect")

    addNamespaceSelect(select, "All Namespaces", currentUrl, currentNamespace, false);
    addNamespaceSelect(select, "─────", currentUrl, currentNamespace, true);
    data.forEach(item => {
        addNamespaceSelect(select, item, currentUrl + "?namespace=" + item, currentNamespace, false);
    });
}

function addNamespaceSelect(select, namespace, namespaceUrl, selectedNamespace, disabled) {
    var option = document.createElement("option");

    // Set the text and value
    option.text = namespace;
    option.value = namespaceUrl;

    if (selectedNamespace == namespace) {
        option.selected = true;
    }
    option.disabled = disabled;
    
    // Add the option to the select element
    select.add(option);
}

function doRenderHeaderCell(tableBody, title, url, currentUrl, currentNamespace) {
    const row = document.createElement("tr");
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
    cell.innerHTML = "<h2><a href=\"" + fullUrl + "\">" + decorationFront + title + decorationEnd + "</a></h2>";
    //cell.innerHTML = "<a href=\"" + fullUrl + "\">" + decorationFront + title + decorationEnd + "</a>";
    row.appendChild(cell);
    tableBody.appendChild(row);
}

async function renderSectionTable(currentUrl, currentNamespace) {
    const tableBody = document.querySelector("#headerTable tbody");
    tableBody.replaceChildren();

    doRenderHeaderCell(tableBody, "Summary", "index.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableBody, "Images", "images.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableBody, "Pods", "pods.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableBody, "Nodes", "nodes.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableBody, "CVEs", "cves.html", currentUrl, currentNamespace);
    doRenderHeaderCell(tableBody, "SBOM", "sbom.html", currentUrl, currentNamespace);
}

function formatNumber(num, digits = 0) {
    return num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function onNamespaceChange(selectedNamespace) {
    window.location.href = selectedNamespace;
}

async function initClusterName(pageTitle) {
    console.log("initClusterName()");
    const response = await fetch("/api/clustername");
    console.log("initClusterName() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const clusterName = await response.text();
    const clusternameDiv = document.getElementById("clusterName");
    clusternameDiv.innerText = pageTitle + " - " + clusterName;
}

async function initFilters() {
    const response = await fetch("/api/filters");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const filterData = await response.json();
    initSelect("namespaceFilter", filterData.namespaces);
    initSelect("vulnerabilityStatusFilter", filterData['fix-states']);
    initSelect("packageTypeFilter", filterData['unique-packages']);
    initSelect("vulnerabilitySeverityFilter", filterData['severities']);
    if ($('#categories').length) {
        $('#categories').multiSelect({
            noneText: 'All categories',
            presets: [
                {
                    name: 'All categories',
                    all: true
                }
            ]
        });
    }
    if ($('#namespaceFilter').length) {
        $('#namespaceFilter').multiSelect({
            noneText: 'All namespaces',
            presets: [
                {
                    name: 'All namespaces',
                    all: true
                }
            ]
        });
    }
    if ($('#vulnerabilityStatusFilter').length) {
        $('#vulnerabilityStatusFilter').multiSelect({
            noneText: 'All statuses',
            presets: [
                {
                    name: 'All statuses',
                    all: true
                }
            ]
        });
    }
    if ($('#packageTypeFilter').length) {
        $('#packageTypeFilter').multiSelect({
            noneText: 'All package types',
            presets: [
                {
                    name: 'All package types',
                    all: true
                }
            ]
        });
    }
    if ($('#vulnerabilitySeverityFilter').length) {
        $('#vulnerabilitySeverityFilter').multiSelect({
            noneText: 'All severities',
            presets: [
                {
                    name: 'All severities',
                    all: true
                }
            ]
        });
    }
}

function initSelect(selectID, values) {
    select = document.getElementById(selectID);
    if (select != null) {
        values.forEach(item => {
            //console.log(item)
            // Create a new row
            var option = document.createElement("option");
    
            // Set the text and value
            option.text = item;
            option.value = item;
        
            // Add the option to the select element
            select.add(option);
        });
    }
}
