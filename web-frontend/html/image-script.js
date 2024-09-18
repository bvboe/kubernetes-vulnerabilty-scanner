async function loadImageSummary(imageid) {
    console.log("loadImageSummary(" + imageid + ")");
    if(imageid == null) {
        console.log("No image, returning");
        return;
    }

    console.log("/api/image/summary?imageid=" + imageid);
    const response = await fetch("/api/image/summary?imageid=" + imageid);
    console.log("loadImageSummary() - Got data")
    // Check if the response is OK (status code 200)
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON data from the response
    const data = await response.json();
    document.querySelector("#image_id").innerHTML = data.image_id;

    repositoryString = "";
    data.repositories.forEach(item => {
        repositoryString = repositoryString + item + "</br>";
    })
    document.querySelector("#repositories").innerHTML = repositoryString;

    instanceString = "";
    data.instances.forEach(item => {
        instanceString = instanceString + item.namespace + "." + item.pod_name + "." + item.container_name + "</br>";
    })
    document.querySelector("#instances").innerHTML = instanceString;

    scan_status_description = "";
    switch(data.scan_status) {
        case "COMPLETE":
            scan_status_description = "Complete";
            break;
        case "SCANNING":
            scan_status_description = "Scanning";
            break;
        case "TO_BE_SCANNED":
            scan_status_description = "To be scanned";
            break;
        case "NO_SCAN_AVAILABLE":
            scan_status_description = "No scan information";
            break;
        case "SCAN_FAILED":
            scan_status_description = "Scan failed";
            break;
        default:
            scan_status_description = data.scan_status;
            // code block
      }

    document.querySelector("#scan_status").innerHTML = scan_status_description;

    loadCVEsTable(imageid, data.scan_status);
    loadSBOMTable(imageid, data.scan_status);
}

async function loadCVEsTable(imageid, scanStatus) {
    console.log("loadCVEsTable(" + imageid + ")");
    if(imageid == null) {
        console.log("No image, returning");
        return;
    }

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#cvesTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    if(scanStatus == "COMPLETE") {
        const response = await fetch("/api/image/vulnerabilities?imageid=" + imageid);
        console.log("loadCVEsTable() - Got data")
        // Check if the response is OK (status code 200)
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
    
        // Parse the JSON data from the response
        const data = await response.json();
    
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
    
            // Append the new row to the table body
            tableBody.appendChild(newRow);
        });
    } else {
        const newRow = document.createElement("tr");
        const newCell = addCellToRow(newRow, "left", "Vulnerability data missing");
        newCell.colSpan = 7;
        tableBody.appendChild(newRow);
    }
}

async function loadSBOMTable(imageid, scanStatus) {
    console.log("loadSBOMTable(" + imageid + ")");
    if(imageid == null) {
        console.log("No image, returning");
        return;
    }

    // Get the table body element where rows will be added
    const tableBody = document.querySelector("#sbomTable tbody");

    //Clear the table
    tableBody.replaceChildren();

    if(scanStatus == "COMPLETE") {
        const response = await fetch("/api/image/sbom?imageid=" + imageid);
        console.log("loadSBOMTable() - Got data")
        // Check if the response is OK (status code 200)
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        // Parse the JSON data from the response
        const data = await response.json();


        data.forEach(item => {
            console.log(item)
            // Create a new row
            const newRow = document.createElement("tr");
            addCellToRow(newRow, "left", item.name);
            addCellToRow(newRow, "left", item.version);
            addCellToRow(newRow, "left", item.type);

            // Append the new row to the table body
            tableBody.appendChild(newRow);
        });
    } else {
        const newRow = document.createElement("tr");
        const newCell = addCellToRow(newRow, "left", "SBOM missing");
        newCell.colSpan = 3;
        tableBody.appendChild(newRow);
    }
}

function addCellToRow(toRow, align, text) {
    const cell = document.createElement("td");
    cell.innerHTML = text;
    cell.style.textAlign=align;
    toRow.appendChild(cell);
    return cell;
}

function showVulnerabilityTable() {
    document.querySelector("#cvesTable").style.display = "table";
    document.querySelector("#sbomTable").style.display = "none";
    document.querySelector("#cvesHeader").style.textDecoration = "underline";
    document.querySelector("#sbomHeader").style.textDecoration = "none";
}

function showSBOMTable() {
    document.querySelector("#cvesTable").style.display = "none";
    document.querySelector("#sbomTable").style.display = "table";
    document.querySelector("#cvesHeader").style.textDecoration = "none";
    document.querySelector("#sbomHeader").style.textDecoration = "underline";
}



const urlParams = new URLSearchParams(window.location.search);
const imageid = urlParams.get('imageid');

loadImageSummary(imageid);
