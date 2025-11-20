export const CANADIAN_TRIMS_BY_MAKE: Record<string, string[]> = {
  "Acura": ["Base", "Tech", "A-Spec", "Elite", "Elite A-Spec", "Platinum Elite", "Platinum Elite A-Spec", "Type S", "Type S Ultra", "Tech SH-AWD", "Type S Ultra SH-AWD", "CSX", "Dynamic", "Premium", "Navi", "Tech Plus", "Advance", "SH-AWD", "Launch Edition", "PMC Edition"],
  "Toyota": ["CE", "LE", "XLE", "SE", "XSE", "Limited", "Platinum", "TRD", "TRD Sport", "TRD Off-Road", "TRD Pro", "Nightshade"],
  "Honda": ["DX", "LX", "EX", "EX-L", "Touring", "Sport", "Si", "Type R", "Black Edition", "SE"],
  "Nissan": ["S", "SV", "SL", "SR", "Platinum", "Midnight Edition", "PRO-4X", "Nismo"],
  "Volkswagen": ["Trendline", "Comfortline", "Highline", "Execline", "GTI", "R", "Wolfsburg Edition"],
  "Hyundai": ["Essential", "Preferred", "Luxury", "Ultimate", "N Line", "N", "Limited", "Calligraphy"],
  "Kia": ["LX", "EX", "EX Premium", "SX", "SX Limited", "X-Line", "GT-Line", "GT"],
  "Mazda": ["GX", "GS", "GS-L", "GT", "Kuro", "Signature", "100th Anniversary"],
  "Subaru": ["Convenience", "Touring", "Sport", "Limited", "Premier", "Wilderness", "GT"],
  "Chevrolet": ["LS", "LT", "LTZ", "High Country", "Premier", "RS", "Redline", "Z71", "ZR2", "Work Truck"],
  "GMC": ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate", "Elevation", "AT4X"],
  "Ford": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Tremor", "Raptor", "ST", "Titanium"],
  "Ram": ["Tradesman", "Big Horn", "Sport", "Rebel", "Laramie", "Longhorn", "Limited", "TRX"],
  "Jeep": ["Sport", "Willys", "Sahara", "Rubicon", "Overland", "Summit", "Trailhawk", "High Altitude", "Laredo", "Limited"],
  "Dodge": ["SXT", "GT", "R/T", "Scat Pack", "Hellcat", "SRT", "Citadel"],
  "BMW": ["Base", "xLine", "M Sport", "M40i", "M50i", "M", "Competition"],
  "Mercedes-Benz": [
    // Sedans & Coupes (A, C, E, S, CLA, CLS)
    "A 220", "A 220 4MATIC", "A 35 AMG 4MATIC", "A 45 AMG 4MATIC",
    "C 300 4MATIC", "C 43 AMG 4MATIC", "C 63 S AMG", "C 63 S E Performance",
    "E 350 4MATIC", "E 450 4MATIC", "E 53 AMG 4MATIC+", "E 63 S AMG 4MATIC+",
    "S 500 4MATIC", "S 580 4MATIC", "S 63 E Performance", "Maybach S 580", "Maybach S 680",
    "CLA 250 4MATIC", "CLA 35 AMG 4MATIC", "CLA 45 AMG 4MATIC+",
    "CLS 450 4MATIC", "CLS 53 AMG 4MATIC+",

    // SUVs (GLA, GLB, GLC, GLE, GLS, G-Class)
    "GLA 250 4MATIC", "GLA 35 AMG 4MATIC", "GLA 45 AMG 4MATIC+",
    "GLB 250 4MATIC", "GLB 35 AMG 4MATIC",
    "GLC 300 4MATIC", "GLC 43 AMG 4MATIC", "GLC 63 S AMG 4MATIC+",
    "GLE 350 4MATIC", "GLE 450 4MATIC", "GLE 53 AMG 4MATIC+", "GLE 63 S AMG 4MATIC+",
    "GLS 450 4MATIC", "GLS 580 4MATIC", "GLS 63 AMG 4MATIC+", "Maybach GLS 600",
    "G 550", "G 63 AMG",

    // Roadsters & GT
    "SL 55 AMG 4MATIC+", "SL 63 AMG 4MATIC+",
    "AMG GT 53 4MATIC+", "AMG GT 63 4MATIC+", "AMG GT 63 S E Performance",

    // Electric (EQ)
    "EQB 350 4MATIC",
    "EQE 350 4MATIC", "EQE 500 4MATIC", "AMG EQE 4MATIC+",
    "EQS 450 4MATIC", "EQS 580 4MATIC", "AMG EQS 4MATIC+",
    "EQS 450 SUV", "EQS 580 SUV",

    // Legacy Trims (older models often seen in used inventory)
    "B 250", "C 250", "C 350", "E 250 BlueTEC", "E 300", "E 400", "E 550",
    "GLK 250 BlueTEC", "GLK 350", "ML 350", "ML 550", "ML 63 AMG",
    "GL 350 BlueTEC", "GL 450", "GL 550",
    "SLK 250", "SLK 350", "SLC 300", "SLC 43 AMG",
    
    // Generic Packages/Lines
    "Avantgarde Edition", "AMG Line", "Night Package", "Premium Package", "Intelligent Drive Package"
  ],
  "Audi": ["Komfort", "Progressiv", "Technik", "S Line", "RS"],
  "Infiniti": ["PURE", "LUXE", "LUXE BLACK EDITION", "ESSENTIAL", "SENSORY", "SPORT", "AUTOGRAPH"],
  "Lexus": ["Base", "Premium", "Luxury", "Ultra Luxury", "Executive", "F Sport 1", "F Sport 2", "F Sport 3"],
  "Tesla": ["Standard Range", "Standard Range Plus", "Long Range", "Performance", "Plaid"],
  "Other": ["Base", "S", "SE", "LE", "XLE", "Limited", "Premium", "Sport", "Touring", "Platinum"]
};

// Keep a flat list for backward compatibility or generic fallback
export const CANADIAN_TRIMS = Array.from(
  new Set(Object.values(CANADIAN_TRIMS_BY_MAKE).flat())
).sort();

export function getTrimsForMake(make: string): string[] {
    if (!make) return CANADIAN_TRIMS_BY_MAKE["Other"];

    // 1. Try exact match
    if (CANADIAN_TRIMS_BY_MAKE[make]) {
        return CANADIAN_TRIMS_BY_MAKE[make];
    }
    
    // 2. Try case-insensitive match
    const keys = Object.keys(CANADIAN_TRIMS_BY_MAKE);
    const exactCaseMatch = keys.find(k => k.toLowerCase() === make.toLowerCase());
    if (exactCaseMatch) {
        return CANADIAN_TRIMS_BY_MAKE[exactCaseMatch];
    }

    // 3. Try partial match (e.g. "Ford Motor Company" -> "Ford")
    // Check if any key is contained in the make string (case-insensitive)
    const partialMatch = keys.find(k => make.toLowerCase().includes(k.toLowerCase()));
    if (partialMatch) {
        return CANADIAN_TRIMS_BY_MAKE[partialMatch];
    }

    return CANADIAN_TRIMS_BY_MAKE["Other"];
}

export async function fetchCanadianTrims(year: string, make: string, model: string): Promise<string[]> {
  if (!year || !make || !model) return [];

  try {
    // NHTSA API parameters
    const params = new URLSearchParams({
      Year: year,
      Make: make,
      Model: model,
      units: "US", // Canadian specific endpoint might default to metric or accept this
      format: "json"
    });

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetCanadianVehicleSpecifications/?${params.toString()}`
    );
    
    const data = await response.json();

    if (data.Results && Array.isArray(data.Results)) {
      const trims = new Set<string>();
      
      data.Results.forEach((vehicle: any) => {
        // The API returns a Specs array. We need to find the "Trim" variable.
        if (vehicle.Specs) {
            const trimSpec = vehicle.Specs.find((s: any) => s.Name === "Trim");
            if (trimSpec && trimSpec.Value && trimSpec.Value !== "N/A" && trimSpec.Value !== "null") {
                trims.add(trimSpec.Value);
            }
            
            const seriesSpec = vehicle.Specs.find((s: any) => s.Name === "Series");
            if (seriesSpec && seriesSpec.Value && seriesSpec.Value !== "N/A" && seriesSpec.Value !== "null") {
                trims.add(seriesSpec.Value);
            }
        }
      });

      if (trims.size > 0) {
          return Array.from(trims).sort();
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching Canadian trims:", error);
    return [];
  }
}
