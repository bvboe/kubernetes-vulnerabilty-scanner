async function loadContainerTable(selectedNamespace) {
    console.log("loadContainerTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/vulnsummary/container" + namespaceString);
    console.log("loadContainerTable() - Got data")
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

        addCellToRow(newRow, "left", item.image + "</br>" + item.image_id);
        addCellToRow(newRow, "right", item.container_instances.length);

        if(Object.keys(item.vulnarbility_summary).length > 0) {
            addCellToRow(newRow, "right", item.vulnarbility_summary.number_of_packages);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_severity.critical);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_severity.high);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_severity.medium);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_severity.low);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_severity.negligible);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_severity.unknown);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_status.fixed);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_status.not_fixed);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_status.wont_fix);
            addCellToRow(newRow, "right", item.vulnarbility_summary.by_status.unknown);
        } else {
            newCell = addCellToRow(newRow, "left", "No Scan Information");
            newCell.colSpan = 11;
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

loadContainerTable(namespace)
loadNamespaceTable("index.html")
