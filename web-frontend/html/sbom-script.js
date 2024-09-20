async function loadSBOMTable(selectedNamespace) {
    console.log("loadSBOMTable(" + selectedNamespace + ")");
    namespaceString="";
    if(selectedNamespace !== null) {
        console.log("Namespace is set");
        namespaceString = "?namespace="+selectedNamespace;
    }
    const response = await fetch("/api/sbomsummary" + namespaceString);
    console.log("loadSBOMTable() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#sbomTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    data.forEach(item => {
        console.log(item)
        // Create a new row
        const newRow = document.createElement("tr");
        addCellToRow(newRow, "left", item.name);
        addCellToRow(newRow, "left", item.version);
        addCellToRow(newRow, "left", item.type);
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

function initCsvLink(selectedNamespace) {
    const csvLink = document.getElementById("csvlink");
    if(selectedNamespace !== null) {
        csvLink.href = "/api/sbomsummary?output=csv&namespace=" + selectedNamespace;
    } else {
        csvLink.href = "/api/sbomsummary?output=csv";
    }
}


const urlParams = new URLSearchParams(window.location.search);
const namespace = urlParams.get('namespace');

loadSBOMTable(namespace);
loadNamespaceTable("sbom.html", namespace);
renderHeaderTable("sbom.html", namespace);
initCsvLink(namespace);
