// script.js
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('entryForm');
  const entriesTableBody = document.querySelector('#entriesTable tbody');

  // Load existing entries from localStorage, or start with an empty array.
  let entries = JSON.parse(localStorage.getItem('podiumEntries')) || [];
  renderEntries();

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Retrieve form values
    const speakerName = document.getElementById('speakerName').value;
    const topic = document.getElementById('topic').value;
    const date = document.getElementById('date').value;
    const salesRepsSelect = document.getElementById('salesReps');
    const salesReps = Array.from(salesRepsSelect.selectedOptions).map(option => option.value);

    // Create a new entry object
    const entry = {
      speakerName,
      topic,
      date,
      salesReps
    };

    // Save the new entry to localStorage
    entries.push(entry);
    localStorage.setItem('podiumEntries', JSON.stringify(entries));

    // Update the table with the new entry
    addEntryToTable(entry);

    // Send email notification via EmailJS
    sendEmailNotification(entry);

    // Reset the form for the next entry
    form.reset();
  });

  // Render all entries stored in localStorage
  function renderEntries() {
    entriesTableBody.innerHTML = '';
    entries.forEach(entry => {
      addEntryToTable(entry);
    });
  }

  // Append a new row to the table for an entry
  function addEntryToTable(entry) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.speakerName}</td>
      <td>${entry.topic}</td>
      <td>${entry.date}</td>
      <td>${entry.salesReps.join(', ')}</td>
    `;
    entriesTableBody.appendChild(row);
  }

  // Send an email notification using EmailJS
  function sendEmailNotification(entry) {
    // Set up the parameters according to your EmailJS email template
    const templateParams = {
      speaker_name: entry.speakerName,
      topic: entry.topic,
      date: entry.date,
      sales_reps: entry.salesReps.join(', ')
    };

    // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS service and template IDs
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
      .then(function(response) {
        console.log('Email sent successfully!', response.status, response.text);
      }, function(error) {
        console.error('Failed to send email:', error);
      });
  }
});
