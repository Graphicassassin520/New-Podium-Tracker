// script.js
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('entryForm');
  const entriesTableBody = document.querySelector('#entriesTable tbody');
  const submitBtn = document.getElementById('submitBtn');

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
        <td>${entry.podiumSpeaker}</td>
        <td>${entry.timeSlot}</td>
        <td>${entry.date}</td>
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

  // (Optional) You can add an EmailJS call in a similar fashion as before
  // to send an email notification when an entry is added/updated.
  function sendEmailNotification(entry) {
    const templateParams = {
      podium_speaker: entry.podiumSpeaker,
      time_slot: entry.timeSlot,
      date: entry.date,
      sales_reps: entry.salesReps.join(', ')
    };

    // Replace with your EmailJS service and template IDs
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
      .then(function(response) {
        console.log('Email sent successfully!', response.status, response.text);
      }, function(error) {
        console.error('Failed to send email:', error);
      });
  }
});
