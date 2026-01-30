function doPost(e) {
  const ss = SpreadsheetApp.openById("17xOA-qkxWjb3Q4j3MkoiLcI1gxZurwRT7c7xqtW4tFE"); //replace sheet id here
  const sheet = ss.getSheets()[0];

  const data = JSON.parse(e.postData.contents); 

  sheet.appendRow([
    data.name || "",
    data.company || "",
    data.title || "",
    data.college || "",
    data.gradYear || "",
    data.email || "",
    data.linkedinUrl || "",
    new Date()
  ]);

  return ContentService
    .createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}


function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        name: "Test User",
        company: "Test Company",
        title: "Tester",
        college: "Test College",
        gradYear: "2026",
        email: "test@email.com",
        linkedinUrl: "https://linkedin.com/in/test"
      })
    }
  };

  doPost(fakeEvent);
}
