document.addEventListener('DOMContentLoaded', function() {
    var flexItems = document.querySelectorAll('.flex-item');

    flexItems.forEach(function(item) {
        item.addEventListener('click', function() {
            var text = this.textContent.trim(); // Get the text

            var searchTypeInput = document.getElementById('searchType');
            var headerSearchingBy = document.getElementById('searchingBy');

            searchTypeInput.value = text; // Set the value of the input
            headerSearchingBy.innerHTML = `Searching by <i class='black-text'>${text}</i>`; // Update the header

            // Remove 'black-text' class from all flex-items
            flexItems.forEach(function(flexItem) {
                flexItem.classList.remove('black-text');
            });

            // Add 'black-text' class to the clicked flex-item
            this.classList.add('black-text');

            console.log('Search Type Changed to:', searchTypeInput.value); // For debugging
            performSearch();
        });
    });
    var licenseItem = Array.from(flexItems).find(item => item.textContent.trim() === "License");
        if (licenseItem) {
            licenseItem.click();
        }

});
