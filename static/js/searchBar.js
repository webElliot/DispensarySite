/*
The Popup Javascript is first.
 */


function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

const fieldMap = {
    'city': 'city',
    'county': 'county',
    'email': 'email',
    'hours': 'hours',
    'id': 'id', // Add this if you want to copy the 'id' field
    'legal-name': 'legalName',
    'valid-until': 'licenseExpiryDate',
    'license-number': 'licenseNumber',
     'license-type': 'licenseType', // Add this if you want to copy the 'licenseType' field
    'phone': 'phone',
    'address': 'streetAddress',
    'trade-name': 'tradeName',
    'zip': 'zip'
};

let notificationTimeout; // To keep track of the timeout

document.querySelectorAll('.dialog-hover-effect').forEach(p => {
    p.addEventListener('click', function() {
        const companyData = JSON.parse(document.querySelector('.cd-popup-container').getAttribute('data-company'));
        const fieldKey = this.id.replace('dialog-', '');
        const valueToCopy = companyData[fieldMap[fieldKey]];
        copyToClipboard(valueToCopy);

        const notification = document.getElementById('copy-notification');
        notification.textContent = `Copied: "${valueToCopy}"`;

        // Clear any existing timeout and hide previous notification immediately
        clearTimeout(notificationTimeout);
        notification.style.animation = 'none';
        notification.classList.remove('show');

        // Force reflow to reset the animation
        void notification.offsetWidth;

        // Show the new notification
        notification.classList.add('show');
        notification.style.animation = '';

        // Set a new timeout to hide the notification after 3 seconds
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            notification.style.animation = 'fadeOut 0.5s forwards';
        }, 3000);
    });
});



let currentIndex = 0; // Index of the currently displayed company
let currentCompanies = []; // Currently filtered companies

function updateDialog(index) {
    const company = currentCompanies[index];
    if (!company) return;

    document.getElementById('dialog-title').innerText = `${index + 1}/${currentCompanies.length}`;
    document.getElementById('dialog-license-number').innerText = `License Number: ${company.licenseNumber || ''}`;
    document.getElementById('dialog-legal-name').innerText = `Legal Name: ${company.legalName || ''}`;
    document.getElementById('dialog-trade-name').innerText = `Trade Name: ${company.tradeName || ''}`;
    document.getElementById('dialog-county').innerText = `County: ${company.county || ''}`;
    document.getElementById('dialog-city').innerText = `City: ${company.city || ''}`;
    document.getElementById('dialog-zip').innerText = `Zip: ${company.zip || ''}`;
    document.getElementById('dialog-address').innerText = `Address: ${company.streetAddress || ''}`;
    document.getElementById('dialog-valid-until').innerText = `Valid Until: ${company.licenseExpiryDate || ''}`;
    document.getElementById('dialog-phone').innerText = `Phone: ${company.phone || ''}`;
    document.getElementById('dialog-email').innerText = `Email: ${company.email || ''}`;
    document.getElementById('dialog-hours').innerText = `Hours: ${company.hours || ''}`;
    document.getElementById('dialog-id').innerText = `ID: ${company.id || ''}`;
    document.getElementById('dialog-license-type').innerText = `License Type: ${company.licenseType || ''}`;

    // Store the current company data in a data attribute for copy functionality
    document.querySelector('.cd-popup-container').setAttribute('data-company', JSON.stringify(company));
}


// Function to handle 'Next' button click
document.querySelector('.cd-buttons button').addEventListener('click', function() {
    if (currentIndex < currentCompanies.length - 1) {
        currentIndex++;
        updateDialog(currentIndex);
    }
});




function onTableRowClick(event) {
    const companyData = JSON.parse(event.currentTarget.getAttribute('data-value'));
    currentCompanies = [companyData]; // Set the currentCompanies to just this company
    updateDialog(0); // Update the dialog with this company
    document.querySelector('.cd-popup').classList.add('is-visible'); // Show the dialog
}

// Add this event listener to each row in the updateTableWithCompanies function

// Function to show the popup
function showPopup() {
    document.querySelector('.cd-popup').classList.add('is-visible');
}

// Function to hide the popup
function hidePopup() {
    document.querySelector('.cd-popup').classList.remove('is-visible');
}

// Add event listener to the close button
document.querySelector('.cd-popup-close').addEventListener('click', hidePopup);



        // Search Functions //

let allCompanies = [];

    // Mapping from display string to JSON key
    const searchTypeMap = {
        "License": "licenseNumber",
        "Legal name": "legalName",
        "Trade name": "tradeName",
        "County": "county",
        "City": "city",
        "Zip": "zip"
    };
function performSearch() {
        const searchInput = document.getElementById('searchInput').value;
        const searchType = document.getElementById('searchType').value;
        const result_counter = document.getElementById('count_results');


        const filteredCompanies = filterCompanies(searchInput, searchType);
        console.log('Filtered companies:', filteredCompanies);
        result_counter.innerText = `${filteredCompanies.length} results`

        updateTableWithCompanies(filteredCompanies);
        // Update the DOM with the filtered companies as needed
    }

    function filterCompanies(searchTerm, searchType) {
        const jsonKey = searchTypeMap[searchType]; // Convert display string to JSON key
        return allCompanies.filter(company => {
            if (company.hasOwnProperty(jsonKey)) {
                const value = company[jsonKey].toString().toLowerCase();
                return value.includes(searchTerm.toLowerCase());
            }
            return false;
        });
    }

    function updateTableWithCompanies(companies) {
        const tableBody = document.querySelector('.table tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        currentCompanies = companies;
        currentIndex = 0;

        companies.forEach((company, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-value', JSON.stringify(company)); // Set data-value with company JSON

            // Create and append table cells (td) for each required field
            row.innerHTML = `
                <td>${company.licenseNumber}</td>
                <td>${company.legalName}</td>
                <td>${company.tradeName}</td>
                <td>${company.county}</td>
                <td>${company.city}</td>
                <td>${company.zip}</td>
               
                <td><i class="fa fa-check" aria-hidden="true"></i></td>
                
            `;

            row.addEventListener('click', function() {
                currentIndex = index; // Update the current index
                updateDialog(currentIndex); // Update the dialog with the clicked company
                document.querySelector('.cd-popup').classList.add('is-visible'); // Show the dialog
            });

            tableBody.appendChild(row);
        });
    }

document.getElementById('searchInput').addEventListener('input', performSearch);


document.addEventListener('DOMContentLoaded', function() {


    // Fetch companies from the API
    function fetchCompanies() {
        fetch('/api/getCompanies')
            .then(response => response.json())
            .then(data => {
                allCompanies = data;
                console.log('Companies loaded:', allCompanies);
                performSearch();
            })
            .catch(error => console.error('Error fetching companies:', error));
    }

    fetchCompanies();


    // Filter companies based on search input and type





    // Event listener for search button



});



