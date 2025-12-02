export const CANADIAN_TRIMS_BY_MAKE: Record<string, string[]> = {
  "Acura": ["Base", "Tech", "A-Spec", "Elite", "Elite A-Spec", "Platinum Elite", "Platinum Elite A-Spec", "Type S", "Type S Ultra", "Tech SH-AWD", "Type S Ultra SH-AWD", "CSX", "Dynamic", "Premium", "Navi", "Tech Plus", "Advance", "SH-AWD", "Launch Edition", "PMC Edition"],
  "Audi": ["Komfort", "Progressiv", "Technik", "S Line", "RS"],
  "BMW": ["218i", "220i", "228i", "230i", "320i", "328i", "330i", "335i", "340i", "428i", "430i", "440i", "528i", "530i", "535i", "540i", "640i", "740i", "750i", "Base", "M", "M Sport", "M2", "M3", "M4", "M5", "M6", "M8", "M40i", "M50i", "M550i", "M760i", "X1", "X3", "X5", "X6", "X7", "Z4", "i3", "i4", "i5", "i7", "i8", "iX", "iX3", "xDrive28i", "xDrive35i", "xDrive40i", "xDrive50i"],
  "Chevrolet": ["Base", "C1500", "Crew Cab", "Diesel", "EUV LT", "EUV Premier", "Extended", "High Country", "K1500", "L", "LS", "LT", "LTZ", "Maxx", "Premier", "RS", "RST", "Regular", "SS", "Suburban", "Work Truck", "Z24", "Z34", "Z71", "ZR2"],
  "Ford": ["4WD", "Base", "Big Bend", "Black Diamond", "Boss", "Cobra", "Dark Horse", "EcoBoost", "Eddie Bauer", "Energi", "FX4", "GL", "GT", "Hybrid", "King Ranch", "LX", "Lariat", "Limited", "Mach 1", "Mach-E", "Platinum", "RS", "Raptor", "Regular", "Regular Cab", "S", "SE", "SEL", "SES", "SHO", "ST", "SVT Cobra", "Shelby", "Shelby GT500", "Sport", "SuperCab", "SuperCrew", "Titanium", "Wagon", "Wildtrak", "XL", "XLS", "XLT", "ZX3", "ZX4"],
  "GMC": ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate", "Elevation", "AT4X"],
  "Honda": ["Base", "Black Edition", "DX", "EX", "EX-L", "EX-T", "Elite", "Hybrid", "LX", "RT", "RTL", "RTL-E", "RTL-T", "RTS", "RTX", "SE", "Si", "Sport", "Touring", "Type R"],
  "Hyundai": ["Base", "Essential", "GL", "GLS", "GT", "GT-Line", "L", "LE", "Limited", "Luxury", "N", "N-Line", "Preferred", "Premium", "SE", "SEL", "Sport", "Ultimate"],
  "Infiniti": ["AUTOGRAPH", "AWD", "Base", "Deluxe Tech", "ESSENTIAL", "Hybrid", "Journey", "LUXE", "LUXE BLACK EDITION", "Limited", "Luxury", "PURE", "Premium", "Premium Tech", "Pure", "SENSORY", "SPORT", "Sport", "Touring"],
  "Jeep": ["Sport", "Willys", "Sahara", "Rubicon", "Overland", "Summit", "Trailhawk", "High Altitude", "Laredo", "Limited"],
  "Kia": ["Base", "EX", "GT", "GT-Line", "LX", "LX Plus", "LXS", "Limited", "S", "SX", "SX Limited", "SX Turbo", "SXL", "Sportage", "X-Line"],
  "Lexus": ["250", "350", "350h", "450h+", "500h", "570S", "600h L", "AWD", "Base", "F", "F Sport", "F Sport Ultra", "Limited", "Luxury", "Premium", "SE", "Sport", "Sport Luxury", "Standard", "Ultra Luxury"],
  "Mazda": ["GS", "GS-L", "GT", "GX", "Kuro", "S", "SE", "Signature", "Sport", "Touring", "100th Anniversary"],
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
    "EQB 350 4MATIC", "EQE 350 4MATIC", "EQE 500 4MATIC", "AMG EQE 4MATIC+",
    "EQS 450 4MATIC", "EQS 580 4MATIC", "AMG EQS 4MATIC+", "EQS 450 SUV", "EQS 580 SUV",
    // Legacy Trims (older models often seen in used inventory)
    "B 250", "C 250", "C 350", "E 250 BlueTEC", "E 300", "E 400", "E 550",
    "GLK 250 BlueTEC", "GLK 350", "ML 350", "ML 550", "ML 63 AMG",
    "GL 350 BlueTEC", "GL 450", "GL 550", "SLK 250", "SLK 350", "SLC 300", "SLC 43 AMG",
    // Generic Packages/Lines
    "Avantgarde Edition", "AMG Line", "Night Package", "Premium Package", "Intelligent Drive Package"
  ],
  "Nissan": ["AWD", "Base", "FWD", "GLE", "GXE", "Hybrid", "LE", "Midnight Edition", "Nismo", "PRO", "PRO-4X", "PRO-X", "Platinum", "Rock Creek", "S", "SE", "SL", "SR", "SV", "SV AWD", "SV Premium", "Tech", "XE"],
  "Ram": ["Tradesman", "Big Horn", "Sport", "Rebel", "Laramie", "Longhorn", "Limited", "TRX"],
  "Subaru": ["2.5i", "Base", "Convenience", "GT", "Limited", "Onyx", "Outdoor XT", "Outback XT", "Premier", "Sport", "Touring", "Wilderness", "WRX", "XT"],
  "Toyota": ["1794", "1794 Edition", "4WD", "AWD", "Access", "Access Cab", "Adventure", "Base", "CE", "CrewMax", "DX", "Deluxe", "Double Cab", "Five", "Four", "Hybrid", "I", "II", "III", "IV", "L", "L Eco", "LE", "Limited", "Nightshade", "Platinum", "PreRunner", "Prime", "S", "SE", "SR", "SR5", "SR5 Plus", "TRD", "TRD Off-Road", "TRD Pro", "TRD Sport", "Three", "Two", "V8", "XLE", "XSE", "Xtracab"],
  "Volkswagen": ["Trendline", "Comfortline", "Highline", "Execline", "GTI", "R", "Wolfsburg Edition"],
  "Dodge": ["SXT", "GT", "R/T", "Scat Pack", "Hellcat", "SRT", "Citadel"],
  "Tesla": ["Standard Range", "Standard Range Plus", "Long Range", "Performance", "Plaid"],
  "Other": ["Base", "S", "SE", "LE", "XLE", "Limited", "Premium", "Sport", "Touring", "Platinum"]
};

// Keep a flat list for backward compatibility or generic fallback
export const CANADIAN_TRIMS = Array.from(
  new Set(Object.values(CANADIAN_TRIMS_BY_MAKE).flat())
).sort();

export function getTrimsForMake(make: string): string[] {
    if (!make) return Array.from(new Set(CANADIAN_TRIMS_BY_MAKE["Other"])).sort();

    let trims: string[] = [];

    // 1. Try exact match
    if (CANADIAN_TRIMS_BY_MAKE[make]) {
        trims = CANADIAN_TRIMS_BY_MAKE[make];
    } else {
        // 2. Try case-insensitive match
        const keys = Object.keys(CANADIAN_TRIMS_BY_MAKE);
        const exactCaseMatch = keys.find(k => k.toLowerCase() === make.toLowerCase());
        if (exactCaseMatch) {
            trims = CANADIAN_TRIMS_BY_MAKE[exactCaseMatch];
        } else {
            // 3. Try partial match (e.g. "Ford Motor Company" -> "Ford")
            // Check if any key is contained in the make string (case-insensitive)
            const partialMatch = keys.find(k => make.toLowerCase().includes(k.toLowerCase()));
            if (partialMatch) {
                trims = CANADIAN_TRIMS_BY_MAKE[partialMatch];
            } else {
                trims = CANADIAN_TRIMS_BY_MAKE["Other"];
            }
        }
    }

    // Remove duplicates and sort
    return Array.from(new Set(trims)).sort();
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

// Enhanced VIN Decoder Interface
export interface EnhancedVINResult {
  vin: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  series?: string;
  bodyClass?: string;
  vehicleType?: string;
  doors?: string;
  
  // Engine details
  engineDescription?: string;
  engineCylinders?: string;
  engineDisplacement?: string;
  fuelType?: string;
  
  // Drivetrain
  driveType?: string;
  transmission?: string;
  
  // Manufacturing
  manufacturer?: string;
  plantCountry?: string;
  plantState?: string;
  plantCity?: string;
  
  // Canadian-specific
  canadianTrims?: string[];
  hasCanadianData?: boolean;
  
  // Status
  error?: string;
  errorCode?: string;
}

// VIN Decoder cache
const vinCache = new Map<string, EnhancedVINResult>();

/**
 * Advanced VIN Decoder with enhanced NHTSA data extraction
 * Combines NHTSA API with Canadian trim database
 */
export async function decodeVIN(vin: string): Promise<EnhancedVINResult> {
  // Validate VIN
  if (!vin || vin.length < 11) {
    return {
      vin,
      error: "VIN must be at least 11 characters long",
      errorCode: "INVALID_VIN"
    };
  }

  const cleanVIN = vin.toUpperCase().trim();

  // Check cache
  if (vinCache.has(cleanVIN)) {
    return vinCache.get(cleanVIN)!;
  }

  try {
    // Call NHTSA API
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${cleanVIN}?format=json`
    );
    
    if (!response.ok) {
      throw new Error(`NHTSA API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data.Results || data.Results.length === 0) {
      return {
        vin: cleanVIN,
        error: "VIN not found in NHTSA database",
        errorCode: "VIN_NOT_FOUND"
      };
    }

    const vehicle = data.Results[0];

    console.log("NHTSA API Response:", vehicle);

    // Extract comprehensive vehicle data
    const result: EnhancedVINResult = {
      vin: cleanVIN,
      year: vehicle.ModelYear || vehicle.Model_Year || undefined,
      make: vehicle.Make || undefined,
      model: vehicle.Model || undefined,
      trim: vehicle.Trim || undefined,
      series: vehicle.Series || undefined,
      bodyClass: vehicle.BodyClass || vehicle.Body_Class || undefined,
      vehicleType: vehicle.VehicleType || vehicle.Vehicle_Type || undefined,
      doors: vehicle.Doors || undefined,
      
      // Engine
      engineDescription: vehicle.EngineModel || vehicle.EngineConfiguration || vehicle.Engine_Model || undefined,
      engineCylinders: vehicle.EngineCylinders || vehicle.Engine_Cylinders || undefined,
      engineDisplacement: vehicle.DisplacementL || vehicle.DisplacementCC || vehicle.Displacement_L || vehicle.Displacement_CC || undefined,
      fuelType: vehicle.FuelTypePrimary || vehicle.Fuel_Type_Primary || undefined,
      
      // Drivetrain
      driveType: vehicle.DriveType || vehicle.Drive_Type || undefined,
      transmission: vehicle.TransmissionStyle || vehicle.Transmission_Style || undefined,
      
      // Manufacturing
      manufacturer: vehicle.Manufacturer || undefined,
      plantCountry: vehicle.PlantCountry || vehicle.Plant_Country || undefined,
      plantState: vehicle.PlantState || vehicle.Plant_State || undefined,
      plantCity: vehicle.PlantCity || vehicle.Plant_City || undefined,
    };

    console.log("Extracted result:", result);

    // Check if we got any useful data
    if (!result.make && !result.model && !result.year) {
      return {
        vin: cleanVIN,
        error: vehicle.ErrorText || "Could not decode VIN - no vehicle data returned",
        errorCode: vehicle.ErrorCode || "NO_DATA"
      };
    }

    // Add Canadian trims if available
    if (result.make) {
      const canadianTrims = getTrimsForMake(result.make);
      if (canadianTrims && canadianTrims.length > 0) {
        result.canadianTrims = canadianTrims;
        result.hasCanadianData = true;
      }
    }

    // Cache the result
    vinCache.set(cleanVIN, result);

    return result;

  } catch (error) {
    console.error("VIN decode error:", error);
    return {
      vin: cleanVIN,
      error: error instanceof Error ? error.message : "Failed to decode VIN",
      errorCode: "API_ERROR"
    };
  }
}

/**
 * Clear VIN decoder cache
 */
export function clearVINCache() {
  vinCache.clear();
}
