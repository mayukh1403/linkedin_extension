# Beautiful & Intuitive Lead Generator for Your New Job

This Chrome extension helps you capture LinkedIn profile details along with emails from Apollo.io and save them directly into Google Sheets.

---

## Backend Setup Procedure

1. Open Google Sheets and create a new sheet.  
2. From the URL tab on top, copy the **Sheet ID** (you’ll need this later).  
   - Example:  
     ```
     https://docs.google.com/spreadsheets/d/17xOA-qkxWjb3Q4j3MkoiLcI1gxZurwRT7c7xqtW4tFE/edit?gid=0#gid=0
     ```
     Copy the portion between `/d/` and `/edit` →  
     ```
     17xOA-qkxWjb3Q4j3MkoiLcI1gxZurwRT7c7xqtW4tFE
     ```
3. Go to **Extensions → Apps Script** in Google Sheets.  
4. Copy the code from `test.gs` file and paste it there.  
5. Replace the Sheet ID in the code (as indicated in the comments).  
6. Click **Deploy → New Deployment**.  
7. Give it a name and set **Who has access** to **Anyone** (⚠️ very important step).  
8. Click **Deploy** and copy the Web App URL shown. Save it for later.  
   - Example:  
     ```
     https://script.google.com/macros/s/AKfycbyQ7gtAmbVbzIPO9E5WvHxSSyqd5SWcQf-gppiQEgAH/dev
     ```
9. Open `background.js` file and replace `APP_SCRIPT_URL` with your Web App URL.  
10. ✅ One-time setup complete!  

---

## Extension Setup Steps

1. Download the zip file and unzip the folder to a location on your computer.  
2. Open Chrome → go to **Extensions** → enable **Developer Mode**.  
3. Click **Load unpacked**.  
4. Select the unzipped folder.  
5. Open LinkedIn and go to any profile.  
6. Open Apollo.io Chrome extension → click **Reveal Email** → copy the email (or use any other email source).  
7. Open **LinkedIn Clipboard Linker Extension** and follow the steps.  
8. Check your linked Google Sheet to see the updates.  

---

## Notes

- Make sure you’ve deployed the Apps Script correctly and set access to **Anyone**.  
- The extension UI lets you verify details before submitting, so parsing errors can be corrected manually.  
