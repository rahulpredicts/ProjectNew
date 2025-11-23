# BrowserAct Integration Guide for AutoManager

## Overview

BrowserAct is an AI-powered web scraping API that can significantly improve the "Extract from Listing URL" feature by handling:
- JavaScript-heavy websites (like modern Autotrader, Kijiji)
- CAPTCHA bypassing
- Dynamic content loading
- All 12 vehicle fields (vs current 7-8)

---

## Step 1: Get BrowserAct API Key

### Create Account (Free Tier Available)
1. Go to: https://www.browseract.com/
2. Sign up for a free account
3. You get **500 free credits daily** (no credit card required)

### Get API Key
1. Log in to BrowserAct dashboard
2. Navigate to: **Integrations & API → API Keys**
3. Click: **Create New API Key**
4. Copy the API key (looks like: `ba_xxxxxxxxxxxxxxxx`)

---

## Step 2: Test the API (Before Integration)

### Option A: Using Test Script

```bash
# Set your API key
export BROWSERACT_API_KEY="ba_your_key_here"

# Run test against a real vehicle listing
node test-browseract.js "https://www.autotrader.ca/a/toyota/camry/2020"
```

The test script will:
- Call BrowserAct API with natural language instruction
- Extract all 12 vehicle fields
- Show success rate
- Display credits used
- Compare with current regex approach

### Option B: Quick curl Test

```bash
curl -X POST https://api.browseract.com/v1/run \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.autotrader.ca/listing-url",
    "instruction": "Extract vehicle year, make, model, price, and VIN from this page",
    "outputFormat": "json"
  }'
```

---

## Step 3: Add API Key to Replit

Once you've tested and confirmed it works:

```bash
# In Replit, set as a secret (recommended)
# Or as environment variable
```

You can use the Replit Secrets tab or set it programmatically via the agent.

---

## Step 4: Integration Options

### Option A: Replace Current Regex (Recommended)

**Pros:**
- Better accuracy (AI understands context)
- Handles JavaScript sites
- Extracts all fields (transmission, fuel type, body type)
- Bypasses CAPTCHAs

**Cons:**
- Costs credits ($0.001 per step typically)
- Slower (10-30 seconds vs instant)

### Option B: Hybrid Approach (Best)

1. **Try regex first** (free, instant)
2. **If fails or incomplete** → offer BrowserAct upgrade
3. **User can choose** which method to use

**Benefits:**
- Free for simple pages
- Powerful fallback for complex sites
- User controls cost

---

## Cost Analysis

### Current Regex Approach
- **Cost:** $0 (free)
- **Speed:** Instant (<1 second)
- **Success rate:** 70-80% on simple HTML pages
- **Fields extracted:** 7-8 fields maximum

### BrowserAct Approach
- **Cost:** ~$0.001 - $0.003 per extraction (1-3 credits)
- **Speed:** 10-30 seconds
- **Success rate:** 90-95% on all pages
- **Fields extracted:** All 12 fields

### Daily Usage Estimate
If you extract **50 vehicles per day:**
- **Regex only:** $0/day
- **BrowserAct only:** $0.05 - $0.15/day ($1.50 - $4.50/month)
- **Hybrid (80% regex, 20% BrowserAct):** $0.01 - $0.03/day ($0.30 - $0.90/month)

**Free tier covers:** ~500 extractions/day (enough for most dealerships)

---

## Implementation Plan

### Phase 1: Backend Route (New Endpoint)
Create `/api/scrape-listing-ai` endpoint that:
1. Accepts URL + BrowserAct API key
2. Calls BrowserAct API with natural language instruction
3. Returns structured vehicle data
4. Includes credits used in response

### Phase 2: Frontend UI Enhancement
Add to the "Extract from Listing URL" panel:
- **Checkbox:** "Use AI-powered extraction (more accurate, costs credits)"
- **API Key Input:** For users who want to use their own BrowserAct account
- **Credits Display:** Show credits used after extraction

### Phase 3: Hybrid Logic
```
User pastes URL → Click "Extract"
  ↓
Try regex extraction first (free)
  ↓
If 6+ fields extracted → Success (use regex result)
  ↓
If <6 fields extracted → Show prompt:
  "Limited data found. Use AI-powered extraction for better results? (costs ~1-3 credits)"
  ↓
User chooses:
  - Yes → Call BrowserAct API
  - No → Use partial regex result
```

---

## Natural Language Instruction (What to Send BrowserAct)

```javascript
const instruction = `
Extract the following vehicle information from this car listing page:

Required fields:
- Year (model year, 4 digits)
- Make (manufacturer: Toyota, Honda, Ford, etc.)
- Model (vehicle model name: Camry, Civic, F-150, etc.)
- Trim (trim level: LE, EX, XLT, Sport, etc.)
- Price (selling price in dollars, numbers only)
- Kilometers or Mileage (odometer reading, numbers only)

Optional fields:
- VIN (17-character vehicle identification number)
- Stock Number (dealer stock/lot number)
- Color (exterior color)
- Transmission (automatic, manual, or CVT)
- Fuel Type (gasoline, diesel, hybrid, or electric)
- Body Type (sedan, SUV, truck, coupe, hatchback, van, convertible)

Return as JSON object with these keys:
{
  "year": "",
  "make": "",
  "model": "",
  "trim": "",
  "price": "",
  "kilometers": "",
  "vin": "",
  "stockNumber": "",
  "color": "",
  "transmission": "",
  "fuelType": "",
  "bodyType": ""
}

Only include values clearly visible on the page. Leave empty if not found.
`;
```

---

## API Request Format

```javascript
const response = await fetch('https://api.browseract.com/v1/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BROWSERACT_API_KEY}`
  },
  body: JSON.stringify({
    url: vehicleListingUrl,
    instruction: instruction,
    waitForSelector: 'body', // Wait for page to load
    outputFormat: 'json',
    timeout: 30000 // 30 second timeout
  })
});

const result = await response.json();
const vehicleData = result.data || result.output;
```

---

## Error Handling

### 401 Unauthorized
- API key is invalid or missing
- Show error: "Invalid BrowserAct API key"

### 402 Payment Required
- Out of credits
- Show error: "No credits remaining. Visit browseract.com to add credits"

### 429 Rate Limited
- Too many requests
- Show error: "Rate limit exceeded. Please wait and try again"

### 504 Timeout
- Page took too long to load
- Show error: "Website took too long to respond. Try a different URL"

---

## Security Notes

### API Key Storage
- **DON'T:** Store in frontend code
- **DO:** Store as Replit Secret or backend environment variable
- **DO:** Allow users to optionally provide their own API key

### User's Own API Key Option
Allow users to:
1. Create their own BrowserAct account
2. Enter their API key in settings
3. Use their own credits (full control over costs)

---

## Testing Checklist

Before full integration, test with:

- [ ] Simple HTML page (Autotrader classic view)
- [ ] JavaScript-heavy page (modern Kijiji listing)
- [ ] Page with CAPTCHA
- [ ] Page with image-based prices
- [ ] Page with missing fields
- [ ] Invalid URL
- [ ] Non-vehicle page (to test error handling)
- [ ] 10 different dealers/listing sites
- [ ] Measure actual credits used per extraction

---

## Next Steps

1. **Run test script** against 5-10 real vehicle listings
2. **Evaluate results:** Check accuracy vs current regex
3. **Check credits used:** Estimate monthly cost
4. **Decide on approach:** Replace, Hybrid, or Keep Current
5. **Request API key** if proceeding with integration
6. **Implement backend route** with BrowserAct API
7. **Update frontend UI** with AI option
8. **Test thoroughly** before deploying

---

## Questions to Consider

Before integrating:
- How many vehicles do you add per day/month?
- Is $0.001-$0.003 per extraction acceptable?
- Do your users add from JavaScript-heavy sites often?
- Would 10-30 second wait time be acceptable?
- Should users use your API key or their own?

---

## Alternative: Keep Both Options

**Best User Experience:**
```
Extract from Listing URL Panel:
┌──────────────────────────────────────┐
│ URL: [________________]   [Extract]  │
│                                       │
│ ☐ Use AI-powered extraction          │
│   (slower but more accurate)          │
│                                       │
│ After extraction:                     │
│ "Extracted 6/12 fields using regex.   │
│  Want better results? Try AI mode"    │
└──────────────────────────────────────┘
```

This gives users:
- Free option (regex) for quick extractions
- Paid option (BrowserAct) when they need it
- Transparency about what's being used
- Control over costs

---

**Ready to test? Run the test script and see the results!**
