async function loadPodsTable(selectedNamespace) {
    console.log("loadPodsTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/podsummary" + namespaceString);
    console.log("loadPodsTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#podsTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    data.forEach(item => {
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        addCellToRow(newRow, "left", "<a href=\"image.html?imageid=" + item.image_id + "\">" + item.namespace + "</a");
        addCellToRow(newRow, "left", "<a href=\"image.html?imageid=" + item.image_id + "\">" + item.pod_name + "</a");
        addCellToRow(newRow, "left", "<a href=\"image.html?imageid=" + item.image_id + "\">" + item.container_name + "</a");

        switch(item.scan_status) {
            case "COMPLETE":
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.by_severity.critical));
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.by_severity.high));
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.by_severity.medium));
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.by_severity.low));
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.by_severity.negligible));
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.by_severity.unknown));
                addCellToRow(newRow, "right", formatNumber(item.vulnarbility_summary.number_of_packages));
                break;
            case "SCANNING":
                newCell = addCellToRow(newRow, "left", "Scanning");
                newCell.colSpan = 11;
                break;
            case "TO_BE_SCANNED":
                newCell = addCellToRow(newRow, "left", "To be scanned");
                newCell.colSpan = 11;
                break;
            case "NO_SCAN_AVAILABLE":
                newCell = addCellToRow(newRow, "left", "No scan information");
                newCell.colSpan = 11;
                break;
            case "SCAN_FAILED":
                newCell = addCellToRow(newRow, "left", "Scan failed");
                newCell.colSpan = 11;
                break;
            default:
              // code block
          }

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
    const csvLink = document.getElementById("csvlink");
    if(selectedNamespace !== null) {
        csvLink.href = "/api/podsummary?output=csv&namespace=" + selectedNamespace;
    } else {
        csvLink.href = "/api/podsummary?output=csv";
    }
}

const urlParams = new URLSearchParams(window.location.search);
const namespace = urlParams.get('namespace');

loadPodsTable(namespace);
loadNamespaceTable("pods.html", namespace);
renderSectionTable("pods.html", namespace);
initCsvLink(namespace);
initClusterName("Pod Summary");
