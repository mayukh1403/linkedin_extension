

const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjDU2xF7S2EFMjlpKuUWlbTRFKp1tAgcDIxNWSmTKeOJxfM7bpMk1tdtvPvPwvxn5b/exec";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SEND_DATA") {
    fetch(APP_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(request.payload)
    })
    .then(() => sendResponse({message: "Success"}))
    .catch(error => sendResponse({message: "Error: " + error.message}));
    return true; 
  }
});
