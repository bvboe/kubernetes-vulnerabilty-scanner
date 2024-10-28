function calculateAveragePerContainer(total, numberOfContainers) {
    if (numberOfContainers == 0) {
        return 0;
    } else {
        return (total / numberOfContainers);
    }
}

async function loadNamespaceSummaryTable(selectedNamespace) {
    console.log("loadNamespaceSummaryTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/image/summary" + namespaceString);
    console.log("loadNamespaceSummaryTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#namespaceSummaryTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    rowCounter = 0;
    data.forEach(item => {
        rowCounter++;
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        const scannedContainers = item.scanned_containers;
        addCellToRow(newRow, "left", item.namespace);
        addCellToRow(newRow, "right", formatNumber(scannedContainers));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_critical, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_high, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_medium, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_low, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_negligible, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_unknown, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.number_of_packages, scannedContainers), 0));

        // Append the new row to the table body
        tableBody.appendChild(newRow);
    });

    if(rowCounter == 0) {
        const newRow = document.createElement("tr");
        const newCell = addCellToRow(newRow, "left", "No Data Available");
        newCell.colSpan = 9;
        tableBody.appendChild(newRow);
    }
}

async function loadDistroTable(selectedNamespace) {
    console.log("loadDistroTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/distro/container-summary" + namespaceString);
    console.log("loadDistroTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#distroSummaryTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    rowCounter = 0;
    data.forEach(item => {
        rowCounter++;
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        const scannedContainers = item.scanned_containers;
        addCellToRow(newRow, "left", item.distro_name + " (" + item.distro_id + ")");
        addCellToRow(newRow, "right", formatNumber(scannedContainers));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_critical, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_high, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_medium, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_low, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_negligible, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_unknown, scannedContainers), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.number_of_packages, scannedContainers), 0));
          
        // Append the new row to the table body
        tableBody.appendChild(newRow);
    });

    if(rowCounter == 0) {
        const newRow = document.createElement("tr");
        const newCell = addCellToRow(newRow, "left", "No Data Available");
        newCell.colSpan = 9;
        tableBody.appendChild(newRow);
    }
}

async function loadNodeTable() {
    console.log("loadNodeTable()");
    const response = await fetch("/api/distro/node-summary");
    console.log("loadDistroTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#nodeSummaryTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    rowCounter = 0;
    data.forEach(item => {
        rowCounter++;
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        const scannedNodes = item.scanned_nodes;
        addCellToRow(newRow, "left", item.distro_name + " (" + item.distro_id + ")");
        addCellToRow(newRow, "right", formatNumber(scannedNodes));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_critical, scannedNodes), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_high, scannedNodes), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_medium, scannedNodes), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_low, scannedNodes), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_negligible, scannedNodes), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_unknown, scannedNodes), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.number_of_packages, scannedNodes), 0));
          
        // Append the new row to the table body
        tableBody.appendChild(newRow);
    });

    if(rowCounter == 0) {
        const newRow = document.createElement("tr");
        const newCell = addCellToRow(newRow, "left", "No Data Available");
        newCell.colSpan = 9;
        tableBody.appendChild(newRow);
    }
}

async function loadContainerScanStatus(selectedNamespace) {
    console.log("loadContainerScanStatus(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/image/scanstatus" + namespaceString);
    console.log("loadContainerScanStatus() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#containerScanStatus tbody");
    tableBody.replaceChildren();

    addStatusTableRow(tableBody, "Scanning", data.SCANNING);
    addStatusTableRow(tableBody, "To Be Scanned", data.TO_BE_SCANNED);
    addStatusTableRow(tableBody, "Successfully Scanned", data.COMPLETE);
    addStatusTableRow(tableBody, "Failed", data.SCAN_FAILED);
    addStatusTableRow(tableBody, "Missing Scan Information", data.NO_SCAN_AVAILABLE);
}

async function loadNodeScanStatus() {
    console.log("loadNodeScanStatus()");
    const response = await fetch("/api/host/scanstatus");
    console.log("loadNodeScanStatus() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#nodeScanStatus tbody");
    tableBody.replaceChildren();

    addStatusTableRow(tableBody, "Scanning", data.SCANNING);
    addStatusTableRow(tableBody, "To Be Scanned", data.TO_BE_SCANNED);
    addStatusTableRow(tableBody, "Successfully Scanned", data.COMPLETE);
    addStatusTableRow(tableBody, "Failed", data.SCAN_FAILED);
    addStatusTableRow(tableBody, "Missing Scan Information", data.NO_SCAN_AVAILABLE);
}

function addStatusTableRow(tableBody, status, count) {
    if(count == 0) {
        return;
    }
    const newRow = document.createElement("tr");
    const statusCell = document.createElement("td");
    statusCell.innerHTML = "<b>" + status + "</b>"
    newRow.appendChild(statusCell);
    const countCell = document.createElement("td");
    countCell.innerHTML = formatNumber(count);
    countCell.textAlign = "right";
    newRow.appendChild(countCell);
    tableBody.appendChild(newRow);
}

function addCellToRow(toRow, align, text) {
    const cell = document.createElement("td");
    cell.innerHTML = text;
    cell.style.textAlign = align;
    toRow.appendChild(cell);
    return cell;
}

function initCsvLink(selectedNamespace) {
    const namespaceCsvLink = document.getElementById("namespaceCsvlink");
    const distroCsvLink = document.getElementById("distroCsvlink");
    if(selectedNamespace !== null) {
        namespaceCsvLink.href = "/api/image/summary?output=csv&namespace=" + selectedNamespace;
        distroCsvLink.href = "/api/distro/summary?output=csv&namespace=" + selectedNamespace;
    } else {
        namespaceCsvLink.href = "/api/image/summary?output=csv"
        distroCsvLink.href = "/api/distro/summary?output=csv"
    }
}

const urlParams = new URLSearchParams(window.location.search);
const namespace = urlParams.get('namespace');

loadNamespaceSummaryTable(namespace);
loadDistroTable(namespace);
loadNodeTable();
loadContainerScanStatus(namespace);
loadNodeScanStatus();
loadNamespaceTable("index.html", namespace);
renderHeaderTable("index.html", namespace);
initCsvLink(namespace);
