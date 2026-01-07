document.getElementById('startBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if it's LinkedIn
  if (tab.url.includes("linkedin.com")) {
    
    // Get Clipboard Email
    const clipboardText = await navigator.clipboard.readText();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = clipboardText.match(emailRegex);

    if (emailMatch) {
      // Your exact requested data structure
      const data = {
        "name": "No Name Found",
        "title": "No Title Found",
        "company": "No Company Found",
        "college": "No College Found",
        "gradYear" : "No Grad Year Found",
        "email": emailMatch[0],
        "linkedinUrl": tab.url
      };

      // Send to background to post to Google Sheets
      chrome.runtime.sendMessage({type: "SEND_DATA", payload: data}, (response) => {
        alert("Data sent: " + emailMatch[0]);
      });
      
    } else {
      alert("No email found in clipboard!");
    }
  } else {
    alert("This is not a LinkedIn page.");
  }
});
