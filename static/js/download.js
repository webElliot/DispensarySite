document.getElementById('download').addEventListener('click', function() {
    // Extract IDs from the currentCompanies array
    const selectedIds = currentCompanies.map(company => company.id);

    // Check if there are selected IDs
    if (selectedIds.length === 0) {
        alert("No companies available for download.");
        return;
    }

    // Create payload
    const payload = {
        ids: selectedIds
    };

    // Send POST request to '/excel' route
    fetch('/excel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.blob())
    .then(blob => {
        // Create a URL for the blob object
        const url = window.URL.createObjectURL(blob);
        // Create a new anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = "licenses.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error('Error:', error));
});
