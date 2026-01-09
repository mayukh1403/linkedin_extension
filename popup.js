// Step-by-step workflow with localStorage persistence
// This ensures no data is lost and both email and profile are captured

// Initialize - Load saved data if exists
let savedData = {
  email: '',
  name: '',
  title: '',
  company: '',
  college: '',
  gradYear: '',
  linkedinUrl: '',
  currentStep: 1
};

// Load from localStorage on startup
async function loadSavedData() {
  const saved = localStorage.getItem('linkedinExtensionData');
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      savedData = { ...savedData, ...loaded };
      
      // Restore form fields if data exists
      if (savedData.email) document.getElementById('email').value = savedData.email;
      if (savedData.name) document.getElementById('name').value = savedData.name;
      if (savedData.title) document.getElementById('title').value = savedData.title;
      if (savedData.company) document.getElementById('company').value = savedData.company;
      if (savedData.college) document.getElementById('college').value = savedData.college;
      if (savedData.gradYear) document.getElementById('gradYear').value = savedData.gradYear;
      
      // Restore LinkedIn URL and update display
      await updateLinkedInUrl();
      
      // Restore step position
      if (savedData.currentStep && savedData.currentStep >= 1 && savedData.currentStep <= 3) {
        goToStep(savedData.currentStep, false); // false = don't save again
      }
      
      updateStepIndicators();
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  } else {
    // First time - check LinkedIn URL
    await updateLinkedInUrl();
  }
}

// Save data to localStorage
function saveData() {
  // Always save current step
  const activeStep = document.querySelector('.step-content.active');
  if (activeStep) {
    const stepNum = parseInt(activeStep.id.replace('stepContent', ''));
    savedData.currentStep = stepNum;
  }
  localStorage.setItem('linkedinExtensionData', JSON.stringify(savedData));
}

// Update LinkedIn URL from active tab
// SAFE: Only reads URL from browser tab - NO DOM access, NO scraping, NO LinkedIn interaction
async function updateLinkedInUrl() {
  try {
    // Only uses chrome.tabs.query to get URL - completely safe, no LinkedIn detection
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      // Check if it's a LinkedIn URL (just reading the URL string - safe!)
      if (tab.url.includes('linkedin.com')) {
        savedData.linkedinUrl = tab.url;
        // Update URL display if element exists
        const urlDisplay = document.getElementById('linkedinUrlDisplay');
        if (urlDisplay) {
          urlDisplay.textContent = tab.url;
          urlDisplay.style.color = '#ff1744';
          const statusEl = urlDisplay.parentElement.querySelector('.url-status');
          if (statusEl) {
            statusEl.textContent = 'LinkedIn Detected';
            statusEl.className = 'url-status success';
          }
        }
        saveData();
        return true;
      } else {
        // Not LinkedIn - use saved URL if exists, or show warning
        const urlDisplay = document.getElementById('linkedinUrlDisplay');
        if (urlDisplay) {
          if (savedData.linkedinUrl) {
            urlDisplay.textContent = savedData.linkedinUrl;
            urlDisplay.style.color = '#ffc107';
            const statusEl = urlDisplay.parentElement.querySelector('.url-status');
            if (statusEl) {
              statusEl.textContent = 'Using Saved URL';
              statusEl.className = 'url-status warning';
            }
          } else {
            urlDisplay.textContent = 'Not on LinkedIn page';
            urlDisplay.style.color = '#dc143c';
            const statusEl = urlDisplay.parentElement.querySelector('.url-status');
            if (statusEl) {
              statusEl.textContent = 'Not LinkedIn';
              statusEl.className = 'url-status error';
            }
          }
        }
        return false;
      }
    }
  } catch (error) {
    console.error('Error getting tab URL:', error);
    return false;
  }
}

// Update step indicators based on captured data
function updateStepIndicators() {
  const hasEmail = savedData.email && savedData.email.trim().length > 0;
  const hasProfile = savedData.name && savedData.name.trim().length > 0;
  
  // Update step 1
  if (hasEmail) {
    document.getElementById('step1').classList.add('completed');
    document.getElementById('step1').classList.remove('active');
    document.getElementById('emailStatus').textContent = 'Captured';
    document.getElementById('emailStatus').className = 'capture-status success';
    document.getElementById('email').classList.add('captured');
    document.getElementById('nextToStep2').disabled = false;
  } else {
    document.getElementById('step1').classList.remove('completed');
    document.getElementById('emailStatus').textContent = 'Not Captured';
    document.getElementById('emailStatus').className = 'capture-status pending';
    document.getElementById('email').classList.remove('captured');
    document.getElementById('nextToStep2').disabled = true;
  }
  
  // Update step 2
  if (hasProfile) {
    document.getElementById('step2').classList.add('completed');
    document.getElementById('step2').classList.remove('active');
    updateProfileStatus('name', savedData.name);
    updateProfileStatus('title', savedData.title);
    updateProfileStatus('company', savedData.company);
    updateProfileStatus('college', savedData.college);
    updateProfileStatus('gradYear', savedData.gradYear);
    document.getElementById('nextToStep3').disabled = false;
  } else {
    document.getElementById('step2').classList.remove('completed');
    document.getElementById('nextToStep3').disabled = true;
  }
  
  // Update progress line
  let progress = 0;
  if (hasEmail) progress += 33.33;
  if (hasProfile) progress += 33.33;
  document.getElementById('stepLineFill').style.width = progress + '%';
}

function updateProfileStatus(field, value) {
  if (value && value.trim().length > 0 && value !== `No ${field.charAt(0).toUpperCase() + field.slice(1)} Found`) {
    const statusEl = document.getElementById(field + 'Status');
    if (statusEl) {
      statusEl.textContent = 'Captured';
      statusEl.className = 'capture-status success';
    }
    const inputEl = document.getElementById(field);
    if (inputEl) inputEl.classList.add('captured');
  }
}

// Navigate to step
function goToStep(stepNumber, saveState = true) {
  // Hide all step contents
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.step').forEach(el => {
    el.classList.remove('active');
  });
  
  // Show target step
  document.getElementById('stepContent' + stepNumber).classList.add('active');
  document.getElementById('step' + stepNumber).classList.add('active');
  
  // Save step state
  if (saveState) {
    savedData.currentStep = stepNumber;
    saveData();
  }
  
  // Update LinkedIn URL when navigating
  if (stepNumber === 2 || stepNumber === 3) {
    updateLinkedInUrl();
  }
  
  // Update review section if going to step 3
  if (stepNumber === 3) {
    updateReviewSection();
  }
}

// Helper function to update status message
function updateStatus(message, color = "#e0e0e0") {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.color = color;
  }
}

// Helper function to capture email from clipboard
async function captureEmailFromClipboard() {
  try {
    updateStatus("Reading clipboard...", "#ff1744");
    
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText || clipboardText.trim().length === 0) {
      updateStatus("Error: Clipboard is empty! Copy the email first.", "#dc143c");
      return;
    }

    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = clipboardText.match(emailRegex);
    
    if (emailMatch) {
      savedData.email = emailMatch[0];
      document.getElementById('email').value = savedData.email;
      saveData();
      updateStepIndicators();
      updateStatus("Email captured: " + savedData.email + " (Saved! You can close popup now)", "#ff1744");
      setTimeout(() => updateStatus(""), 3000);
    } else {
      updateStatus("No email found in clipboard. Please copy an email address.", "#dc143c");
    }

  } catch (error) {
    updateStatus("Error: " + error.message, "#dc143c");
  }
}

// Step 1: Capture Email
document.getElementById('captureEmailBtn').addEventListener('click', captureEmailFromClipboard);

// Email field change handler
document.getElementById('email').addEventListener('input', (e) => {
  savedData.email = e.target.value.trim();
  saveData();
  updateStepIndicators();
});

// Helper function to capture profile from clipboard
async function captureProfileFromClipboard() {
  try {
    // Check if we're on LinkedIn (ONLY reads URL, no DOM access - safe!)
    const isLinkedIn = await updateLinkedInUrl();
    if (!isLinkedIn && !savedData.linkedinUrl) {
      updateStatus("Warning: Not on LinkedIn page. Please navigate to a LinkedIn profile first.", "#ffc107");
      // Still allow capture, but warn user
    }
    
    updateStatus("Reading clipboard...", "#ff1744");
    
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText || clipboardText.trim().length === 0) {
      updateStatus("Error: Clipboard is empty! Copy the profile text first.", "#dc143c");
      return;
    }

    updateStatus("Parsing profile data...", "#ff1744");

    // Parse LinkedIn data from clipboard (ONLY parsing user-provided text - safe!)
    const parsedData = parseLinkedInData(clipboardText);

    // Save parsed data
    savedData.name = parsedData.name || '';
    savedData.title = parsedData.title || '';
    savedData.company = parsedData.company || '';
    savedData.college = parsedData.college || '';
    savedData.gradYear = parsedData.gradYear || '';

    // Fill form fields
    document.getElementById('name').value = savedData.name;
    document.getElementById('title').value = savedData.title;
    document.getElementById('company').value = savedData.company;
    document.getElementById('college').value = savedData.college;
    document.getElementById('gradYear').value = savedData.gradYear;

    saveData();
    updateStepIndicators();
    
    updateStatus("Profile data captured! Review the fields below.", "#ff1744");
    setTimeout(() => updateStatus(""), 3000);

  } catch (error) {
    updateStatus("Error: " + error.message, "#dc143c");
  }
}

// Step 2: Capture Profile Data
document.getElementById('captureProfileBtn').addEventListener('click', captureProfileFromClipboard);

// Refresh clipboard button (for when popup was closed)
document.getElementById('refreshClipboardBtn').addEventListener('click', async () => {
  updateStatus("Refreshing from clipboard...", "#ff1744");
  await captureProfileFromClipboard();
});

// Profile field change handlers
['name', 'title', 'company', 'college', 'gradYear'].forEach(field => {
  document.getElementById(field).addEventListener('input', (e) => {
    savedData[field] = e.target.value.trim();
    saveData();
    updateStepIndicators();
  });
});

// Navigation buttons
document.getElementById('nextToStep2').addEventListener('click', () => {
  if (savedData.email && savedData.email.trim().length > 0) {
    goToStep(2);
  } else {
    updateStatus("Please capture an email first!", "#dc143c");
  }
});

document.getElementById('backToStep1').addEventListener('click', () => {
  goToStep(1);
});

document.getElementById('nextToStep3').addEventListener('click', () => {
  goToStep(3);
});

document.getElementById('backToStep2').addEventListener('click', () => {
  goToStep(2);
});

// Step 3: Send to Google Sheets
document.getElementById('sendBtn').addEventListener('click', async () => {
  try {
    // Validate email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!savedData.email || !emailRegex.test(savedData.email)) {
      updateStatus("Error: Please enter a valid email address!", "#dc143c");
      goToStep(1);
      return;
    }

    // Get current LinkedIn URL (use saved if not on LinkedIn page)
    await updateLinkedInUrl();
    const linkedinUrl = savedData.linkedinUrl || "No URL Found";

    // Prepare data
    const data = {
      "name": savedData.name || "No Name Found",
      "title": savedData.title || "No Title Found",
      "company": savedData.company || "No Company Found",
      "college": savedData.college || "No College Found",
      "gradYear": savedData.gradYear || "No Grad Year Found",
      "email": savedData.email,
      "linkedinUrl": linkedinUrl
    };

    updateStatus("Sending data to Google Sheets...", "#ff1744");

    // Send to background to post to Google Sheets
    chrome.runtime.sendMessage({ type: "SEND_DATA", payload: data }, (response) => {
      if (response && response.message) {
        updateStatus("Success! Data sent: " + data.email, "#ff1744");
        
        // Clear saved data after successful send (but keep step state for next entry)
        savedData = {
          email: '',
          name: '',
          title: '',
          company: '',
          college: '',
          gradYear: '',
          linkedinUrl: '',
          currentStep: 1
        };
        localStorage.removeItem('linkedinExtensionData');
        
        // Clear form
        document.getElementById('email').value = '';
        document.getElementById('name').value = '';
        document.getElementById('title').value = '';
        document.getElementById('company').value = '';
        document.getElementById('college').value = '';
        document.getElementById('gradYear').value = '';
        
        // Reset to step 1
        setTimeout(() => {
          updateStepIndicators();
          goToStep(1);
          updateStatus("");
          updateLinkedInUrl(); // Refresh URL
        }, 3000);
      } else {
        updateStatus("Error sending data to Google Sheets", "#dc143c");
      }
    });

  } catch (error) {
    updateStatus("Error: " + error.message, "#dc143c");
  }
});

// Fix async function issue
async function updateReviewSection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    document.getElementById('reviewEmail').textContent = savedData.email || 'Not provided';
    document.getElementById('reviewName').textContent = savedData.name || 'Not provided';
    document.getElementById('reviewTitle').textContent = savedData.title || 'Not provided';
    document.getElementById('reviewCompany').textContent = savedData.company || 'Not provided';
    document.getElementById('reviewCollege').textContent = savedData.college || 'Not provided';
    document.getElementById('reviewGradYear').textContent = savedData.gradYear || 'Not provided';
    // Use saved LinkedIn URL if available, otherwise use current tab
    const urlToShow = savedData.linkedinUrl || tab.url || 'Not available';
    document.getElementById('reviewUrl').textContent = urlToShow;
    document.getElementById('reviewUrl').style.fontSize = '11px';
    document.getElementById('reviewUrl').style.wordBreak = 'break-all';
  } catch (error) {
    document.getElementById('reviewEmail').textContent = savedData.email || 'Not provided';
    document.getElementById('reviewName').textContent = savedData.name || 'Not provided';
    document.getElementById('reviewTitle').textContent = savedData.title || 'Not provided';
    document.getElementById('reviewCompany').textContent = savedData.company || 'Not provided';
    document.getElementById('reviewCollege').textContent = savedData.college || 'Not provided';
    document.getElementById('reviewGradYear').textContent = savedData.gradYear || 'Not provided';
    document.getElementById('reviewUrl').textContent = savedData.linkedinUrl || 'Not available';
  }
}

// Initialize on load - ensures state is preserved when popup reopens
async function initialize() {
  await loadSavedData();
  updateStepIndicators();
  
  // Auto-refresh LinkedIn URL when popup reopens
  await updateLinkedInUrl();
  
  // Auto-save on any input change to prevent data loss
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      saveData();
    });
  });
  
  // Periodic auto-save (every 2 seconds) as backup
  setInterval(() => {
    // Update current step before saving
    const activeStep = document.querySelector('.step-content.active');
    if (activeStep) {
      const stepNum = parseInt(activeStep.id.replace('stepContent', ''));
      savedData.currentStep = stepNum;
    }
    saveData();
  }, 2000);
  
  // Auto-check clipboard when popup reopens (if on step 2 and no profile data)
  setTimeout(async () => {
    const activeStep = document.querySelector('.step-content.active');
    if (activeStep && activeStep.id === 'stepContent2') {
      if (!savedData.name || savedData.name === 'No Name Found') {
        // User might have copied profile text while popup was closed
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.trim().length > 10) {
            // Check if it looks like profile data (has name-like patterns)
            const hasNamePattern = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(clipboardText);
            if (hasNamePattern) {
              updateStatus("Clipboard has text! Click 'Capture Profile' or 'Refresh' to parse it.", "#ff1744");
            }
          }
        } catch (e) {
          // Clipboard access denied or empty - that's okay
        }
      }
    }
  }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM already loaded
  initialize();
}
