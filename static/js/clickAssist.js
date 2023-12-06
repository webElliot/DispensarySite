function clickAssist(){
     // Bind a click event to every cell (td) in the table
    $("tbody").on("click", "tr", function() {
        var $row = $(this)//.closest("tr"); // Get the closest row
        var $checkboxes = $row.find("input[type='checkbox']"); // Find checkboxes in the row

        // Check if there is only one checkbox in the row
        if ($checkboxes.length === 1) {
            var $checkbox = $checkboxes.first(); // Get the first checkbox
            // Toggle the checkbox state
            $checkbox.prop("checked", !$checkbox.prop("checked"));
        }
    });
}
