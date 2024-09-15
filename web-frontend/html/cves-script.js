async function loadCVEsTable(selectedNamespace) {
    console.log("loadCVEsTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/vulnsummary/cve" + namespaceString);
    console.log("loadCVEsTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#cvesTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    data.forEach(item => {
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        addCellToRow(newRow, "left", item.vulnerability_severity);
        addCellToRow(newRow, "left", item.vulnerability_id);
        addCellToRow(newRow, "left", item.artifact_name);
        addCellToRow(newRow, "left", item.artifact_version);
        addCellToRow(newRow, "left", item.vulnerability_fix_versions);
        addCellToRow(newRow, "left", item.vulnerability_fix_state);
        addCellToRow(newRow, "left", item.artifact_type);
        addCellToRow(newRow, "right", item.image_count);

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

loadCVEsTable(namespace);
loadNamespaceTable("cves.html", namespace);
renderHeaderTable("cves.html", namespace);
