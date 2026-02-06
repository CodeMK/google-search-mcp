/**
 * Cookies Import Script
 * Convert EditThisCookie export format to our internal format
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../data/cookies/imported-cookies.json');
const targetDir = path.join(__dirname, '../data/cookies');
const targetFile = path.join(targetDir, 'cookies-google.com-imported.json');

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

try {
  // Read the exported cookies
  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: File not found: ${sourceFile}`);
    console.log('\nPlease follow these steps:');
    console.log('1. Install EditThisCookie extension in Chrome');
    console.log('2. Go to google.com');
    console.log('3. Click the EditThisCookie icon');
    console.log('4. Click "Export" and save to: ./data/cookies/imported-cookies.json');
    console.log('5. Run this script again: node scripts/import-cookies.js');
    process.exit(1);
  }

  const content = fs.readFileSync(sourceFile, 'utf-8');
  const imported = JSON.parse(content);

  // Convert format if needed
  let cookies = [];

  // Handle different export formats
  if (Array.isArray(imported)) {
    cookies = imported;
  } else if (imported.cookies && Array.isArray(imported.cookies)) {
    cookies = imported.cookies;
  } else {
    console.error('Error: Unknown cookies format');
    process.exit(1);
  }

  // Filter only Google-related cookies
  const googleCookies = cookies.filter(cookie =>
    cookie.domain && (
      cookie.domain === '.google.com' ||
      cookie.domain === 'google.com' ||
      cookie.domain.includes('google')
    )
  );

  if (googleCookies.length === 0) {
    console.warn('Warning: No Google cookies found in the export');
    console.log('Found cookies for domains:', [...new Set(cookies.map(c => c.domain))]);
  }

  // Create our internal format
  const data = {
    cookies: googleCookies,
    timestamp: new Date().toISOString(),
    domain: 'google.com',
  };

  // Save to file
  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));

  console.log('✓ Successfully imported cookies!');
  console.log(`  - Total cookies: ${cookies.length}`);
  console.log(`  - Google cookies: ${googleCookies.length}`);
  console.log(`  - Saved to: ${targetFile}`);
  console.log('\nYou can now use the search API. The cookies will be automatically loaded.');

} catch (error) {
  console.error('Error importing cookies:', error.message);
  process.exit(1);
}
