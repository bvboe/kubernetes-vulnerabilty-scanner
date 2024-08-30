async function loadNamespaceTable(currentUrl) {
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
    addNamespaceRow(tableBody, "All Namespaces", currentUrl);
    data.forEach(item => {
        addNamespaceRow(tableBody, item, currentUrl + "?namespace=" + item);
    });
}

function addNamespaceRow(tableBody, name, namespaceUrl) {
    const newRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.innerHTML = "<h2><a href=\""+namespaceUrl+"\">" + name + "</a></h2>"
    newRow.appendChild(cell);
    tableBody.appendChild(newRow);
}
