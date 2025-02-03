// script.js

// Helper function to format the date as "Monday Feb. 3, 2025"
function formatDate(dateStr) {
  const dateObj = new Date(dateStr);
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  // Ensure the month abbreviation ends with a period.
  const monthWithPeriod = month.endsWith('.') ? month : month + '.';
  return `${weekday} ${monthWithPeriod} ${day}, ${year}`;
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('entryForm');
  const entriesTableBody = document.querySelector('#entriesTable tbody');
  const submitBtn = document.getElementById('submitBtn');
  const printSelectedBtn = document.getElementById('printSelectedBtn');

  // Load existing entries from localStorage, or start with an empty array.
  let entries = JSON.parse(localStorage.getItem('podiumEntries')) || [];
  // When editing, this will hold the index of the entry being updated.
  let editingIndex = null;

  renderEntries();

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get selected Podium Speaker (radio button)
    const podiumSpeaker = document.querySelector('input[name="podiumSpeaker"]:checked')?.value;
    // Get selected Time Slot from dropdown
    const timeSlot = document.getElementById('timeSlot').value;
    // Get Date value
    const date = document.getElementById('date').value;
    // Get all checked Sales Reps (checkboxes)
    const salesRepsChecked = document.querySelectorAll('input[name="salesReps"]:checked');
    const salesReps = Array.from(salesRepsChecked).map(checkbox => checkbox.value);

    // Validate required fields
    if (!podiumSpeaker || !timeSlot || !date) {
      alert("Please fill all required fields.");
      return;
    }

    // Create the entry object
    const entry = {
      podiumSpeaker,
      timeSlot,
      date,
      salesReps
    };

    if (editingIndex === null) {
      // Add new entry
      entries.push(entry);
    } else {
      // Update the existing entry
      entries[editingIndex] = entry;
      editingIndex = null;
      submitBtn.textContent = "Submit Entry";
    }

    // Save updated entries to localStorage and re-render the table
    localStorage.setItem('podiumEntries', JSON.stringify(entries));
    renderEntries();
    form.reset();
  });

  // Render all entries (Podiums) in the table
  function renderEntries() {
    entriesTableBody.innerHTML = '';
    entries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <input type="checkbox" class="selectEntry" data-index="${index}">
        </td>
        <td>${entry.podiumSpeaker}</td>
        <td>${entry.timeSlot}</td>
        <td>${formatDate(entry.date)}</td>
        <td>${entry.salesReps.join(', ')}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editEntry(${index})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteEntry(${index})">Delete</button>
        </td>
      `;
      entriesTableBody.appendChild(row);
    });
  }

  // Make the editEntry function available globally
  window.editEntry = function(index) {
    const entry = entries[index];
    // Populate the form with the entry data
    document.querySelector(`input[name="podiumSpeaker"][value="${entry.podiumSpeaker}"]`).checked = true;
    document.getElementById('timeSlot').value = entry.timeSlot;
    document.getElementById('date').value = entry.date;
    
    // Uncheck all Sales Reps checkboxes first
    document.querySelectorAll('input[name="salesReps"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    // Check the ones corresponding to the saved entry
    entry.salesReps.forEach(rep => {
      const checkbox = document.querySelector(`input[name="salesReps"][value="${rep}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
    // Set editingIndex so that submission updates this entry
    editingIndex = index;
    submitBtn.textContent = "Update Entry";
  };

  // Make the deleteEntry function available globally
  window.deleteEntry = function(index) {
    if (confirm("Are you sure you want to delete this entry?")) {
      entries.splice(index, 1);
      localStorage.setItem('podiumEntries', JSON.stringify(entries));
      renderEntries();
    }
  };

  // Print Selected Entries
  printSelectedBtn.addEventListener("click", printSelectedEntries);

  function printSelectedEntries() {
    const selectedCheckboxes = document.querySelectorAll('.selectEntry:checked');
    if (selectedCheckboxes.length === 0) {
      alert("No entries selected for printing.");
      return;
    }
    let selectedEntries = [];
    selectedCheckboxes.forEach(checkbox => {
      const index = checkbox.getAttribute('data-index');
      selectedEntries.push(entries[index]);
    });
    
    // Build HTML for a printer-friendly list
    let htmlContent = `
      <html>
      <head>
        <title>Print Podiums</title>
        <style>
          body { font-family: 'Roboto', sans-serif; margin: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background-color: #4285F4; color: #fff; }
        </style>
      </head>
      <body>
        <h1>Selected Podiums</h1>
        <table>
          <thead>
            <tr>
              <th>Podium Speaker</th>
              <th>Time Slot</th>
              <th>Date</th>
              <th>Sales Reps</th>
            </tr>
          </thead>
          <tbody>`;
    
    selectedEntries.forEach(entry => {
      htmlContent += `
            <tr>
              <td>${entry.podiumSpeaker}</td>
              <td>${entry.timeSlot}</td>
              <td>${formatDate(entry.date)}</td>
              <td>${entry.salesReps.join(', ')}</td>
            </tr>`;
    });
    
    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>`;
    
    // Open a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  // (Optional) You can add an EmailJS call here to send notifications on add/update.
});
