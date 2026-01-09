// Intelligent text parser to extract LinkedIn profile data from clipboard text
// This avoids LinkedIn's DOM restrictions by parsing user-provided text

function parseLinkedInData(clipboardText) {
  const data = {
    name: "No Name Found",
    title: "No Title Found",
    company: "No Company Found",
    college: "No College Found",
    gradYear: "No Grad Year Found"
  };

  // Clean and normalize the text
  const lines = clipboardText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const fullText = clipboardText;

  // Extract Name - Usually first line or prominent text
  // Look for patterns like "John Doe" (2-3 words, capitalized)
  const namePatterns = [
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})$/m,  // "John Doe" or "John Michael Doe"
    /^([A-Z][a-z]+\s+[A-Z]\.?\s+[A-Z][a-z]+)$/m,  // "John M. Doe"
  ];
  
  for (const pattern of namePatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      data.name = match[1].trim();
      break;
    }
  }
  
  // If no pattern match, try first line if it looks like a name
  if (data.name === "No Name Found" && lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/) && firstLine.split(' ').length <= 4) {
      data.name = firstLine;
    }
  }

  // Extract Title/Headline - Look for job titles
  const titleKeywords = [
    'engineer', 'developer', 'manager', 'director', 'lead', 'senior', 'junior',
    'analyst', 'consultant', 'specialist', 'coordinator', 'executive', 'president',
    'ceo', 'cto', 'cfo', 'founder', 'co-founder', 'designer', 'architect', 'scientist',
    'researcher', 'professor', 'instructor', 'student', 'intern'
  ];
  
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].toLowerCase();
    if (titleKeywords.some(keyword => line.includes(keyword))) {
      data.title = lines[i];
      break;
    }
  }

  // Extract Company - Look for company indicators
  const companyIndicators = [
    ' at ', ' @ ', ' | ', ' - ', '—', '–'
  ];
  
  // Check if title line contains company (e.g., "Software Engineer at Google")
  if (data.title !== "No Title Found") {
    for (const indicator of companyIndicators) {
      if (data.title.includes(indicator)) {
        const parts = data.title.split(indicator);
        if (parts.length >= 2) {
          data.title = parts[0].trim();
          data.company = parts.slice(1).join(indicator).trim();
          break;
        }
      }
    }
  }

  // Look for company names in separate lines (common patterns)
  const companyPatterns = [
    /(?:at|@|works? at|employed at)\s+([A-Z][A-Za-z0-9\s&.,-]+)/i,
    /(?:company|organization|employer):\s*([A-Z][A-Za-z0-9\s&.,-]+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1] && data.company === "No Company Found") {
      data.company = match[1].trim();
      break;
    }
  }

  // Extract College/University - Look for education keywords
  const educationKeywords = [
    'university', 'college', 'institute', 'school', 'bachelor', 'master', 'phd',
    'degree', 'graduated', 'education', 'studied', 'alumni'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      // Extract the institution name (usually the line itself or next line)
      const eduLine = lines[i];
      // Remove common prefixes
      const cleaned = eduLine.replace(/^(studied|graduated|education|degree|bachelor|master|phd|b\.?s\.?|m\.?s\.?|ph\.?d\.?)\s+/i, '').trim();
      if (cleaned.length > 3) {
        data.college = cleaned;
      }
      break;
    }
  }

  // Extract Graduation Year - Look for 4-digit years (1900-2099)
  const yearPattern = /\b(19|20)\d{2}\b/;
  const yearMatches = fullText.match(yearPattern);
  if (yearMatches) {
    // Prefer years that are likely graduation years (recent or reasonable range)
    const years = yearMatches.map(m => parseInt(m));
    const currentYear = new Date().getFullYear();
    // Filter reasonable graduation years (between 1950 and current year + 5)
    const validYears = years.filter(y => y >= 1950 && y <= currentYear + 5);
    if (validYears.length > 0) {
      // Take the most recent reasonable year
      data.gradYear = Math.max(...validYears).toString();
    }
  }

  // Additional parsing: Look for structured data patterns
  // Some users might copy in format like "Name: John Doe"
  const structuredPatterns = {
    name: /(?:name|full name):\s*([^\n]+)/i,
    title: /(?:title|position|role|headline):\s*([^\n]+)/i,
    company: /(?:company|organization|employer|current company):\s*([^\n]+)/i,
    college: /(?:college|university|school|education|institution):\s*([^\n]+)/i,
    gradYear: /(?:graduation|grad|year|graduated):\s*(\d{4})/i
  };

  for (const [key, pattern] of Object.entries(structuredPatterns)) {
    const match = fullText.match(pattern);
    if (match && match[1] && data[key] === `No ${key.charAt(0).toUpperCase() + key.slice(1)} Found`) {
      data[key] = match[1].trim();
    }
  }

  return data;
}

// Make function globally available for popup.js
window.parseLinkedInData = parseLinkedInData;

