export const CANADIAN_TRIMS_BY_MAKE: Record<string, string[]> = {
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
  "Mercedes-Benz": ["Avantgarde", "AMG Line", "Night Package", "AMG 43", "AMG 53", "AMG 63", "Maybach"],
  "Audi": ["Komfort", "Progressiv", "Technik", "S Line", "RS"],
  "Lexus": ["Base", "Premium", "Luxury", "Ultra Luxury", "Executive", "F Sport 1", "F Sport 2", "F Sport 3"],
  "Tesla": ["Standard Range", "Standard Range Plus", "Long Range", "Performance", "Plaid"],
  "Other": ["Base", "S", "SE", "LE", "XLE", "Limited", "Premium", "Sport", "Touring", "Platinum"]
};

// Keep a flat list for backward compatibility or generic fallback
export const CANADIAN_TRIMS = [
  ...new Set(Object.values(CANADIAN_TRIMS_BY_MAKE).flat())
].sort();

export function getTrimsForMake(make: string): string[] {
    // Try to find exact match
    if (CANADIAN_TRIMS_BY_MAKE[make]) {
        return CANADIAN_TRIMS_BY_MAKE[make];
    }
    
    // Try partial match (e.g. "Ford Motor Company" -> "Ford")
    const keys = Object.keys(CANADIAN_TRIMS_BY_MAKE);
    const match = keys.find(k => make.includes(k));
    if (match) {
        return CANADIAN_TRIMS_BY_MAKE[match];
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
