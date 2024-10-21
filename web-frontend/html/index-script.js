function calculateAveragePerContainer(total, numberOfContainers) {
    if (numberOfContainers == 0) {
        return 0;
    } else {
        return (total / numberOfContainers);
    }
}

function formatNumber(num, digits) {
    return num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
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

    data.forEach(item => {
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        const scannedImages = item.scanned_images;
        addCellToRow(newRow, "left", item.namespace);
        addCellToRow(newRow, "right", formatNumber(scannedImages, 0));
        addCellToRow(newRow, "right", formatNumber(item.not_scanned_images, 0));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_critical, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_high, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_medium, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_low, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_negligible, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_unknown, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.number_of_packages, scannedImages), 2));

        // Append the new row to the table body
        tableBody.appendChild(newRow);
    });
}

async function loadDistroTable(selectedNamespace) {
    console.log("loadDistroTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/distro/summary" + namespaceString);
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

    data.forEach(item => {
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");

        const scannedImages = item.scanned_images;
        addCellToRow(newRow, "left", formatNumber(item.distro_name, 0));
        addCellToRow(newRow, "right", formatNumber(scannedImages, 0));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_critical, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_high, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_medium, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_low, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_negligible, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.cves_unknown, scannedImages), 2));
        addCellToRow(newRow, "right", formatNumber(calculateAveragePerContainer(item.number_of_packages, scannedImages), 2));
          
        // Append the new row to the table body
        tableBody.appendChild(newRow);
    });
}

function addCellToRow(toRow, align, text) {
    const cell = document.createElement("td");
    cell.innerHTML = text;
    cell.style.textAlign=align;
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
loadNamespaceTable("index.html", namespace);
renderHeaderTable("index.html", namespace);
initCsvLink(namespace);
