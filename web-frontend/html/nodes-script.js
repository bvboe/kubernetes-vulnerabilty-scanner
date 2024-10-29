async function loadNodeTable() {
    console.log("loadNodeTable()");
    namespaceString="";
    const response = await fetch("/api/vulnsummary/node");
    console.log("loadNodeTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#vulnerabilityTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    data.forEach(item => {
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");

        addCellToRow(newRow, "left", "<a href=\"node.html?nodename=" + item.node_name + "\">" + item.node_name + "</a>");
        switch(item.scan_status) {
            case "COMPLETE":
                addCellToRow(newRow, "left", item.distro_name + " (" + item.distro_id + ")");
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
                newCell.colSpan = 8;
                break;
            case "TO_BE_SCANNED":
                newCell = addCellToRow(newRow, "left", "To be scanned");
                newCell.colSpan = 8;
                break;
            case "NO_SCAN_AVAILABLE":
                newCell = addCellToRow(newRow, "left", "No scan information");
                newCell.colSpan = 8;
                break;
            case "SCAN_FAILED":
                newCell = addCellToRow(newRow, "left", "Scan failed");
                newCell.colSpan = 8;
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

const urlParams = new URLSearchParams(window.location.search);
const namespace = urlParams.get('namespace');

loadNodeTable();
loadNamespaceTable("nodes.html", namespace);
renderHeaderTable("nodes.html", namespace);
