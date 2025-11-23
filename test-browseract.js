/**
 * BrowserAct API Test Script
 * 
 * This script tests the BrowserAct API for vehicle listing scraping
 * before integrating it into the main application.
 * 
 * SETUP:
 * 1. Sign up at https://www.browseract.com/
 * 2. Get API key from: Integrations & API → API Keys → Create New API Key
 * 3. Set your API key as environment variable: BROWSERACT_API_KEY
 * 
 * USAGE:
 * node test-browseract.js <vehicle-listing-url>
 * 
 * Example:
 * node test-browseract.js "https://www.autotrader.ca/a/toyota/camry/2020"
 */

const BROWSERACT_API_KEY = process.env.BROWSERACT_API_KEY;

if (!BROWSERACT_API_KEY) {
  console.error('❌ Error: BROWSERACT_API_KEY environment variable not set');
  console.log('\nPlease set your API key:');
  console.log('  export BROWSERACT_API_KEY="your-api-key-here"');
  console.log('\nOr run with:');
  console.log('  BROWSERACT_API_KEY="your-key" node test-browseract.js <url>');
  process.exit(1);
}

const testUrl = process.argv[2];
if (!testUrl) {
  console.error('❌ Error: Please provide a URL to scrape');
  console.log('\nUsage:');
  console.log('  node test-browseract.js <vehicle-listing-url>');
  console.log('\nExample:');
  console.log('  node test-browseract.js "https://www.autotrader.ca/listing"');
  process.exit(1);
}

async function testBrowserAct() {
  console.log('🚀 Testing BrowserAct API...\n');
  console.log(`📍 Target URL: ${testUrl}\n`);
  
  try {
    // BrowserAct API endpoint (based on documentation)
    const endpoint = 'https://api.browseract.com/v1/run';
    
    // Natural language instruction for extracting vehicle data
    const instruction = `
      Extract the following vehicle information from this page:
      - Year (model year)
      - Make (manufacturer like Toyota, Honda, Ford)
      - Model (like Camry, Civic, F-150)
      - Trim (like LE, EX, XLT)
      - VIN (17-character vehicle identification number)
      - Price (selling price in dollars)
      - Kilometers or Mileage
      - Stock Number (dealer stock/lot number)
      - Color (exterior color)
      - Transmission (automatic, manual, CVT)
      - Fuel Type (gasoline, diesel, hybrid, electric)
      - Body Type (sedan, SUV, truck, coupe, etc.)
      
      Return the data as a JSON object with these exact keys:
      {
        "year": "",
        "make": "",
        "model": "",
        "trim": "",
        "vin": "",
        "price": "",
        "kilometers": "",
        "stockNumber": "",
        "color": "",
        "transmission": "",
        "fuelType": "",
        "bodyType": ""
      }
      
      Only include values that are clearly visible on the page.
      Leave fields empty if not found.
    `;
    
    console.log('⏳ Sending request to BrowserAct API...');
    console.log('   (This may take 10-30 seconds depending on page complexity)\n');
    
    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BROWSERACT_API_KEY}`
      },
      body: JSON.stringify({
        url: testUrl,
        instruction: instruction,
        waitForSelector: 'body', // Wait for page to load
        outputFormat: 'json'
      })
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ API Error (${response.status}):`, error);
      
      if (response.status === 401) {
        console.log('\n💡 Tip: Check that your API key is valid');
      } else if (response.status === 402) {
        console.log('\n💡 Tip: You may be out of credits. Check your account at https://www.browseract.com/');
      }
      
      return;
    }
    
    const result = await response.json();
    
    console.log('✅ Request completed successfully!\n');
    console.log(`⏱️  Time taken: ${elapsed}s\n`);
    
    // Display results
    console.log('📊 EXTRACTED DATA:\n');
    console.log('═══════════════════════════════════════\n');
    
    const extracted = result.data || result.output || result;
    
    // Try to parse if it's a string
    let vehicleData;
    if (typeof extracted === 'string') {
      try {
        vehicleData = JSON.parse(extracted);
      } catch (e) {
        console.log('Raw response:', extracted);
        vehicleData = {};
      }
    } else {
      vehicleData = extracted;
    }
    
    // Display each field
    const fields = [
      'year', 'make', 'model', 'trim', 'vin', 'price', 
      'kilometers', 'stockNumber', 'color', 'transmission', 
      'fuelType', 'bodyType'
    ];
    
    let foundCount = 0;
    fields.forEach(field => {
      const value = vehicleData[field];
      if (value && value.trim()) {
        console.log(`  ${field.padEnd(15)}: ${value}`);
        foundCount++;
      } else {
        console.log(`  ${field.padEnd(15)}: [not found]`);
      }
    });
    
    console.log('\n═══════════════════════════════════════\n');
    console.log(`📈 Success Rate: ${foundCount}/${fields.length} fields extracted\n`);
    
    // Credits used
    if (result.creditsUsed) {
      console.log(`💰 Credits Used: ${result.creditsUsed}\n`);
    }
    
    // Full response for debugging
    console.log('🔍 Full API Response (for debugging):\n');
    console.log(JSON.stringify(result, null, 2));
    
    // Comparison with current regex approach
    console.log('\n\n📊 COMPARISON: BrowserAct vs Current Regex Approach\n');
    console.log('═══════════════════════════════════════');
    console.log('Current (Regex):');
    console.log('  ✅ Free, instant');
    console.log('  ✅ Works on simple HTML pages');
    console.log('  ❌ Fails on JavaScript-heavy sites');
    console.log('  ❌ Cannot handle CAPTCHAs');
    console.log('  ❌ Limited to basic pattern matching');
    console.log('  ❌ Extracts only 7-8 fields maximum');
    console.log('');
    console.log('BrowserAct (AI):');
    console.log('  ✅ Handles JavaScript-rendered content');
    console.log('  ✅ Bypasses CAPTCHAs automatically');
    console.log('  ✅ Can extract all 12 fields');
    console.log('  ✅ Better accuracy with context understanding');
    console.log('  ⚠️  Costs credits ($0.001 per step typically)');
    console.log('  ⚠️  Takes 10-30 seconds per request');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check your internet connection');
    console.log('  2. Verify API key is correct');
    console.log('  3. Ensure you have credits available');
    console.log('  4. Try a different URL');
  }
}

// Run the test
testBrowserAct();
