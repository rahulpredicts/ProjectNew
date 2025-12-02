import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Globe2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  FileCheck,
  Calculator,
  Sparkles,
  Brain,
  Target,
  MapPin,
  ChevronRight,
  ArrowRightLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  RefreshCw,
  Car,
  Gauge,
  Package,
  Landmark,
  Receipt,
  BarChart3,
  Trophy,
  Zap,
  Star,
  Flag,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCars, useDealerships } from "@/lib/api-hooks";
import { decodeVIN } from "@/lib/nhtsa";
type Car = {
  id: string;
  vin: string | null;
  year: string | number;
  make: string;
  model: string;
  trim: string;
  bodyType: string | null;
  kilometers: string | number | null;
  price: string | number | null;
  [key: string]: any;
};

const CANADIAN_PROVINCES = [
  { code: "ON", name: "Ontario", region: "central" },
  { code: "QC", name: "Quebec", region: "central" },
  { code: "BC", name: "British Columbia", region: "west" },
  { code: "AB", name: "Alberta", region: "west" },
  { code: "SK", name: "Saskatchewan", region: "central" },
  { code: "MB", name: "Manitoba", region: "central" },
  { code: "NB", name: "New Brunswick", region: "atlantic" },
  { code: "NS", name: "Nova Scotia", region: "atlantic" },
  { code: "PE", name: "Prince Edward Island", region: "atlantic" },
  { code: "NL", name: "Newfoundland & Labrador", region: "atlantic" },
  { code: "YT", name: "Yukon", region: "north" },
  { code: "NT", name: "Northwest Territories", region: "north" },
  { code: "NU", name: "Nunavut", region: "north" },
];

const US_STATES = [
  { code: "AL", name: "Alabama", region: "southeast", titleFee: 23, regFee: 50, inspection: 0, salesTax: 0.04 },
  { code: "AK", name: "Alaska", region: "west", titleFee: 15, regFee: 100, inspection: 0, salesTax: 0 },
  { code: "AZ", name: "Arizona", region: "southwest", titleFee: 4, regFee: 40, inspection: 0, salesTax: 0.056 },
  { code: "AR", name: "Arkansas", region: "southeast", titleFee: 10, regFee: 25, inspection: 0, salesTax: 0.065 },
  { code: "CA", name: "California", region: "west", titleFee: 23, regFee: 175, inspection: 50, salesTax: 0.0725 },
  { code: "CO", name: "Colorado", region: "southwest", titleFee: 8, regFee: 70, inspection: 25, salesTax: 0.029 },
  { code: "CT", name: "Connecticut", region: "northeast", titleFee: 25, regFee: 120, inspection: 0, salesTax: 0.0635 },
  { code: "DE", name: "Delaware", region: "northeast", titleFee: 55, regFee: 40, inspection: 0, salesTax: 0 },
  { code: "FL", name: "Florida", region: "southeast", titleFee: 75, regFee: 225, inspection: 0, salesTax: 0.06 },
  { code: "GA", name: "Georgia", region: "southeast", titleFee: 18, regFee: 20, inspection: 25, salesTax: 0.066 },
  { code: "HI", name: "Hawaii", region: "west", titleFee: 5, regFee: 45, inspection: 0, salesTax: 0.04 },
  { code: "ID", name: "Idaho", region: "west", titleFee: 14, regFee: 69, inspection: 0, salesTax: 0.06 },
  { code: "IL", name: "Illinois", region: "midwest", titleFee: 150, regFee: 151, inspection: 0, salesTax: 0.0625 },
  { code: "IN", name: "Indiana", region: "midwest", titleFee: 15, regFee: 22, inspection: 0, salesTax: 0.07 },
  { code: "IA", name: "Iowa", region: "midwest", titleFee: 25, regFee: 35, inspection: 0, salesTax: 0.05 },
  { code: "KS", name: "Kansas", region: "midwest", titleFee: 10, regFee: 40, inspection: 0, salesTax: 0.065 },
  { code: "KY", name: "Kentucky", region: "southeast", titleFee: 9, regFee: 21, inspection: 0, salesTax: 0.06 },
  { code: "LA", name: "Louisiana", region: "southeast", titleFee: 68, regFee: 20, inspection: 0, salesTax: 0.0445 },
  { code: "ME", name: "Maine", region: "northeast", titleFee: 33, regFee: 35, inspection: 13, salesTax: 0.055 },
  { code: "MD", name: "Maryland", region: "northeast", titleFee: 100, regFee: 135, inspection: 14, salesTax: 0.06 },
  { code: "MA", name: "Massachusetts", region: "northeast", titleFee: 75, regFee: 60, inspection: 35, salesTax: 0.0625 },
  { code: "MI", name: "Michigan", region: "midwest", titleFee: 15, regFee: 150, inspection: 0, salesTax: 0.06 },
  { code: "MN", name: "Minnesota", region: "midwest", titleFee: 11, regFee: 35, inspection: 0, salesTax: 0.0653 },
  { code: "MS", name: "Mississippi", region: "southeast", titleFee: 9, regFee: 14, inspection: 0, salesTax: 0.05 },
  { code: "MO", name: "Missouri", region: "midwest", titleFee: 11, regFee: 25, inspection: 12, salesTax: 0.0423 },
  { code: "MT", name: "Montana", region: "west", titleFee: 12, regFee: 217, inspection: 0, salesTax: 0 },
  { code: "NE", name: "Nebraska", region: "midwest", titleFee: 15, regFee: 30, inspection: 0, salesTax: 0.055 },
  { code: "NV", name: "Nevada", region: "southwest", titleFee: 29, regFee: 33, inspection: 0, salesTax: 0.0685 },
  { code: "NH", name: "New Hampshire", region: "northeast", titleFee: 25, regFee: 36, inspection: 0, salesTax: 0 },
  { code: "NJ", name: "New Jersey", region: "northeast", titleFee: 60, regFee: 35, inspection: 0, salesTax: 0.0663 },
  { code: "NM", name: "New Mexico", region: "southwest", titleFee: 6, regFee: 27, inspection: 0, salesTax: 0.04 },
  { code: "NY", name: "New York", region: "northeast", titleFee: 50, regFee: 140, inspection: 21, salesTax: 0.04 },
  { code: "NC", name: "North Carolina", region: "southeast", titleFee: 56, regFee: 36, inspection: 13, salesTax: 0.03 },
  { code: "ND", name: "North Dakota", region: "midwest", titleFee: 5, regFee: 49, inspection: 0, salesTax: 0.05 },
  { code: "OH", name: "Ohio", region: "midwest", titleFee: 15, regFee: 31, inspection: 0, salesTax: 0.0575 },
  { code: "OK", name: "Oklahoma", region: "southwest", titleFee: 11, regFee: 96, inspection: 0, salesTax: 0.045 },
  { code: "OR", name: "Oregon", region: "west", titleFee: 93, regFee: 122, inspection: 0, salesTax: 0 },
  { code: "PA", name: "Pennsylvania", region: "northeast", titleFee: 53, regFee: 42, inspection: 35, salesTax: 0.06 },
  { code: "RI", name: "Rhode Island", region: "northeast", titleFee: 51, regFee: 30, inspection: 0, salesTax: 0.07 },
  { code: "SC", name: "South Carolina", region: "southeast", titleFee: 15, regFee: 40, inspection: 0, salesTax: 0.05 },
  { code: "SD", name: "South Dakota", region: "midwest", titleFee: 10, regFee: 36, inspection: 0, salesTax: 0.045 },
  { code: "TN", name: "Tennessee", region: "southeast", titleFee: 14, regFee: 26, inspection: 0, salesTax: 0.07 },
  { code: "TX", name: "Texas", region: "southwest", titleFee: 33, regFee: 65, inspection: 25, salesTax: 0.0625 },
  { code: "UT", name: "Utah", region: "southwest", titleFee: 6, regFee: 44, inspection: 0, salesTax: 0.0485 },
  { code: "VT", name: "Vermont", region: "northeast", titleFee: 35, regFee: 76, inspection: 0, salesTax: 0.06 },
  { code: "VA", name: "Virginia", region: "southeast", titleFee: 15, regFee: 40, inspection: 20, salesTax: 0.041 },
  { code: "WA", name: "Washington", region: "west", titleFee: 15, regFee: 30, inspection: 0, salesTax: 0.065 },
  { code: "WV", name: "West Virginia", region: "southeast", titleFee: 15, regFee: 51, inspection: 0, salesTax: 0.06 },
  { code: "WI", name: "Wisconsin", region: "midwest", titleFee: 165, regFee: 85, inspection: 0, salesTax: 0.05 },
  { code: "WY", name: "Wyoming", region: "west", titleFee: 15, regFee: 30, inspection: 0, salesTax: 0.04 },
];

const TRANSPORT_RATES: Record<string, Record<string, { min: number; max: number }>> = {
  ON: { northeast: { min: 400, max: 600 }, southeast: { min: 700, max: 1000 }, midwest: { min: 500, max: 800 }, southwest: { min: 1000, max: 1400 }, west: { min: 1400, max: 1800 } },
  QC: { northeast: { min: 450, max: 650 }, southeast: { min: 800, max: 1100 }, midwest: { min: 600, max: 900 }, southwest: { min: 1100, max: 1500 }, west: { min: 1500, max: 1900 } },
  BC: { northeast: { min: 1200, max: 1600 }, southeast: { min: 1400, max: 1800 }, midwest: { min: 1000, max: 1400 }, southwest: { min: 800, max: 1200 }, west: { min: 300, max: 500 } },
  AB: { northeast: { min: 1000, max: 1400 }, southeast: { min: 1200, max: 1600 }, midwest: { min: 800, max: 1200 }, southwest: { min: 700, max: 1000 }, west: { min: 500, max: 800 } },
  SK: { northeast: { min: 900, max: 1300 }, southeast: { min: 1100, max: 1500 }, midwest: { min: 700, max: 1000 }, southwest: { min: 800, max: 1200 }, west: { min: 700, max: 1000 } },
  MB: { northeast: { min: 700, max: 1000 }, southeast: { min: 900, max: 1200 }, midwest: { min: 500, max: 800 }, southwest: { min: 900, max: 1300 }, west: { min: 900, max: 1300 } },
  NB: { northeast: { min: 600, max: 900 }, southeast: { min: 900, max: 1200 }, midwest: { min: 800, max: 1100 }, southwest: { min: 1200, max: 1600 }, west: { min: 1600, max: 2000 } },
  NS: { northeast: { min: 600, max: 900 }, southeast: { min: 900, max: 1200 }, midwest: { min: 800, max: 1100 }, southwest: { min: 1200, max: 1600 }, west: { min: 1600, max: 2000 } },
  PE: { northeast: { min: 600, max: 900 }, southeast: { min: 900, max: 1200 }, midwest: { min: 800, max: 1100 }, southwest: { min: 1200, max: 1600 }, west: { min: 1600, max: 2000 } },
  NL: { northeast: { min: 600, max: 900 }, southeast: { min: 900, max: 1200 }, midwest: { min: 800, max: 1100 }, southwest: { min: 1200, max: 1600 }, west: { min: 1600, max: 2000 } },
  YT: { northeast: { min: 1400, max: 1800 }, southeast: { min: 1600, max: 2000 }, midwest: { min: 1200, max: 1600 }, southwest: { min: 1000, max: 1400 }, west: { min: 600, max: 900 } },
  NT: { northeast: { min: 1400, max: 1800 }, southeast: { min: 1600, max: 2000 }, midwest: { min: 1200, max: 1600 }, southwest: { min: 1000, max: 1400 }, west: { min: 600, max: 900 } },
  NU: { northeast: { min: 1800, max: 2400 }, southeast: { min: 2000, max: 2600 }, midwest: { min: 1600, max: 2000 }, southwest: { min: 1400, max: 1800 }, west: { min: 1200, max: 1600 } },
};

const VEHICLE_SIZE_MULTIPLIERS: Record<string, number> = {
  compact: 1.0,
  sedan: 1.0,
  coupe: 1.0,
  hatchback: 1.0,
  wagon: 1.05,
  suv_compact: 1.1,
  suv_midsize: 1.1,
  suv_fullsize: 1.2,
  crossover: 1.1,
  pickup: 1.25,
  pickup_fullsize: 1.35,
  van: 1.15,
  minivan: 1.15,
  convertible: 1.1,
  luxury: 1.15,
};

const BODY_TYPE_MAP: Record<string, string> = {
  "Sedan": "sedan",
  "SUV": "suv_midsize",
  "Truck": "pickup",
  "Coupe": "coupe",
  "Hatchback": "hatchback",
  "Wagon": "wagon",
  "Van": "van",
  "Minivan": "minivan",
  "Convertible": "convertible",
  "Crossover": "crossover",
};

const TRUCK_PREMIUMS: Record<string, { multiplier: number; bestStates: string[] }> = {
  "F-150": { multiplier: 1.08, bestStates: ["TX", "FL", "AZ", "OK", "LA"] },
  "Silverado": { multiplier: 1.07, bestStates: ["TX", "MI", "OH", "IN", "MO"] },
  "RAM 1500": { multiplier: 1.06, bestStates: ["TX", "FL", "NC", "TN", "GA"] },
  "Tahoe": { multiplier: 1.10, bestStates: ["TX", "FL", "CA", "AZ", "NV"] },
  "Suburban": { multiplier: 1.12, bestStates: ["TX", "FL", "AZ", "CA", "CO"] },
  "Expedition": { multiplier: 1.08, bestStates: ["TX", "FL", "AZ", "OK", "LA"] },
  "Yukon": { multiplier: 1.09, bestStates: ["TX", "FL", "CA", "AZ", "NV"] },
  "Tundra": { multiplier: 1.06, bestStates: ["TX", "CA", "AZ", "FL", "CO"] },
  "Sierra": { multiplier: 1.07, bestStates: ["TX", "MI", "OH", "IN", "MO"] },
};

interface ExportFormData {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyType: string;
  odometer: string;
  odometerUnit: "km" | "miles";
  purchasePriceCAD: string;
  condition: string;
  province: string;
  targetState: string;
  saleChannel: string;
  accidentHistory: string;
  titleStatus: string;
  numberOfOwners: string;
  serviceRecords: string;
  reconditioningCost: string;
  isUSMCAEligible: boolean;
}

interface ExportResult {
  purchasePriceCAD: number;
  purchasePriceUSD: number;
  exchangeRate: number;
  transportCost: number;
  customsDuty: number;
  mpf: number;
  customsBond: number;
  brokerFee: number;
  stateFees: number;
  auctionFees: number;
  otherCosts: number;
  totalLandedCost: number;
  expectedSalePrice: number;
  grossProfitUSD: number;
  grossProfitCAD: number;
  profitMargin: number;
  canadaProfit: number;
  canadaMargin: number;
  profitDifference: number;
  recommendation: {
    status: "STRONG_EXPORT" | "MARGINAL_EXPORT" | "SELL_CANADA" | "NO_BUY";
    color: string;
    message: string;
    confidence: string;
  };
  riskFactors: string[];
  costBreakdown: { label: string; amount: number; type: "cost" | "fee" | "tax" }[];
}

interface StateProfit {
  state: typeof US_STATES[0];
  profit: number;
  margin: number;
  transportCost: number;
  stateFees: number;
  totalCost: number;
  demandMultiplier: number;
  reason: string;
}

function AIBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
      <Brain className="w-3 h-3 text-violet-400" />
      <span className="text-[10px] font-medium text-violet-300">Powered by AI</span>
      <Sparkles className="w-3 h-3 text-indigo-400" />
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color = "blue", trend }: { 
  label: string; 
  value: string; 
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>; 
  color?: "blue" | "emerald" | "violet" | "amber" | "rose";
  trend?: "up" | "down";
}) {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-green-500",
    violet: "from-violet-500 to-purple-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-red-500"
  };
  
  return (
    <div className="relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden group hover:border-slate-600/50 transition-all">
      <div className={cn("absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 -translate-y-6 translate-x-6 rounded-full blur-xl", colorMap[color])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
          <p className="text-white text-xl font-bold">{value}</p>
          {subValue && <p className="text-slate-400 text-xs mt-1">{subValue}</p>}
        </div>
        <div className={cn("p-2 rounded-lg bg-gradient-to-br", colorMap[color])}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs", trend === "up" ? "text-emerald-400" : "text-rose-400")}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend === "up" ? "Higher" : "Lower"} than Canada</span>
        </div>
      )}
    </div>
  );
}

export default function ExportPage() {
  const { toast } = useToast();
  const { data: allCars = [] } = useCars();
  const { data: dealerships = [] } = useDealerships();
  
  const [selectedInventoryCar, setSelectedInventoryCar] = useState<Car | null>(null);
  const [inventorySearchOpen, setInventorySearchOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  
  const [formData, setFormData] = useState<ExportFormData>({
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    bodyType: "suv_midsize",
    odometer: "",
    odometerUnit: "km",
    purchasePriceCAD: "",
    condition: "good",
    province: "ON",
    targetState: "BEST",
    saleChannel: "auction_manheim",
    accidentHistory: "none",
    titleStatus: "clean",
    numberOfOwners: "1",
    serviceRecords: "complete",
    reconditioningCost: "0",
    isUSMCAEligible: true,
  });
  
  const [exchangeRate, setExchangeRate] = useState(0.72);
  const [manualExchangeRate, setManualExchangeRate] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [topStates, setTopStates] = useState<StateProfit[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinDecodeStatus, setVinDecodeStatus] = useState<"idle" | "success" | "error">("idle");
  
  const filteredCars = useMemo(() => {
    if (!inventorySearch.trim()) return allCars.slice(0, 20);
    const search = inventorySearch.toLowerCase();
    return allCars.filter(car => 
      car.vin?.toLowerCase().includes(search) ||
      car.make?.toLowerCase().includes(search) ||
      car.model?.toLowerCase().includes(search) ||
      `${car.year}`.includes(search)
    ).slice(0, 20);
  }, [allCars, inventorySearch]);

  const fetchExchangeRate = async () => {
    if (manualExchangeRate) return;
    setIsLoadingRate(true);
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/CAD");
      const data = await response.json();
      if (data.rates?.USD) {
        setExchangeRate(parseFloat(data.rates.USD.toFixed(4)));
        toast({ title: "Exchange Rate Updated", description: `1 CAD = ${data.rates.USD.toFixed(4)} USD` });
      }
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      toast({ title: "Rate Fetch Failed", description: "Using default rate", variant: "destructive" });
    } finally {
      setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const handleDecodeVin = async () => {
    if (!formData.vin || formData.vin.length < 11) {
      toast({ title: "Invalid VIN", description: "Please enter a valid VIN (at least 11 characters)", variant: "destructive" });
      return;
    }
    
    setIsDecodingVin(true);
    setVinDecodeStatus("idle");
    
    try {
      const result = await decodeVIN(formData.vin);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      let bodyType = "suv_midsize";
      if (result.bodyClass) {
        const body = result.bodyClass.toLowerCase();
        if (body.includes("sedan")) bodyType = "sedan";
        else if (body.includes("coupe")) bodyType = "coupe";
        else if (body.includes("hatchback")) bodyType = "hatchback";
        else if (body.includes("wagon")) bodyType = "wagon";
        else if (body.includes("convertible")) bodyType = "convertible";
        else if (body.includes("van") && !body.includes("minivan")) bodyType = "van";
        else if (body.includes("minivan")) bodyType = "minivan";
        else if (body.includes("pickup") || body.includes("truck")) {
          if (result.model?.toLowerCase().includes("f-250") || result.model?.toLowerCase().includes("f-350") || 
              result.model?.toLowerCase().includes("2500") || result.model?.toLowerCase().includes("3500")) {
            bodyType = "pickup_fullsize";
          } else {
            bodyType = "pickup";
          }
        }
        else if (body.includes("suv") || body.includes("sport utility")) {
          if (result.model?.toLowerCase().includes("tahoe") || result.model?.toLowerCase().includes("suburban") ||
              result.model?.toLowerCase().includes("expedition") || result.model?.toLowerCase().includes("yukon") ||
              result.model?.toLowerCase().includes("sequoia")) {
            bodyType = "suv_fullsize";
          } else {
            bodyType = "suv_midsize";
          }
        }
        else if (body.includes("crossover")) bodyType = "crossover";
      }
      
      const year = parseInt(result.year || "2020");
      const isUSMCA = year >= 2020 && (result.plantCountry === "UNITED STATES" || result.plantCountry === "CANADA" || result.plantCountry === "MEXICO");
      
      setFormData(prev => ({
        ...prev,
        year: result.year || prev.year,
        make: result.make || prev.make,
        model: result.model || prev.model,
        trim: result.trim || prev.trim,
        bodyType,
        isUSMCAEligible: isUSMCA,
      }));
      
      setVinDecodeStatus("success");
      toast({ 
        title: "VIN Decoded", 
        description: `${result.year} ${result.make} ${result.model}${isUSMCA ? " - USMCA Eligible" : ""}` 
      });
    } catch (error) {
      console.error("VIN decode error:", error);
      setVinDecodeStatus("error");
      toast({ title: "VIN Decode Failed", description: error instanceof Error ? error.message : "Could not decode VIN", variant: "destructive" });
    } finally {
      setIsDecodingVin(false);
    }
  };

  const loadFromInventory = (car: Car) => {
    setSelectedInventoryCar(car);
    setFormData(prev => ({
      ...prev,
      vin: car.vin || "",
      year: car.year?.toString() || "",
      make: car.make || "",
      model: car.model || "",
      trim: car.trim || "",
      bodyType: BODY_TYPE_MAP[car.bodyType || "SUV"] || "suv_midsize",
      odometer: car.kilometers?.toString() || "",
      odometerUnit: "km",
      purchasePriceCAD: car.price?.toString() || "",
    }));
    setInventorySearchOpen(false);
    toast({ title: "Vehicle Loaded", description: `${car.year} ${car.make} ${car.model}` });
  };

  const getSeasonalMultiplier = (): number => {
    const month = new Date().getMonth() + 1;
    if ([10, 11, 3, 4].includes(month)) return 1.15;
    if ([1, 2, 7, 8].includes(month)) return 0.90;
    return 1.0;
  };

  const calculateTransportCost = (province: string, stateRegion: string, bodyType: string): number => {
    const rates = TRANSPORT_RATES[province];
    if (!rates) return 1000;
    const regionRate = rates[stateRegion];
    if (!regionRate) return 1000;
    const baseRate = (regionRate.min + regionRate.max) / 2;
    const sizeMultiplier = VEHICLE_SIZE_MULTIPLIERS[bodyType] || 1.0;
    const seasonalMultiplier = getSeasonalMultiplier();
    return Math.round(baseRate * sizeMultiplier * seasonalMultiplier);
  };

  const calculateCustomsDuty = (valueUSD: number, isUSMCAEligible: boolean): number => {
    if (isUSMCAEligible) return 0;
    return valueUSD * 0.025;
  };

  const calculateMPF = (valueUSD: number): number => {
    let mpf = valueUSD * 0.003464;
    mpf = Math.max(mpf, 33.58);
    mpf = Math.min(mpf, 651.50);
    return mpf;
  };

  const calculateAuctionFee = (salePrice: number, channel: string): number => {
    const fees: Record<string, { base: number; percent: number }> = {
      auction_manheim: { base: 300, percent: 0.025 },
      auction_adesa: { base: 275, percent: 0.025 },
      direct_dealer: { base: 0, percent: 0 },
      retail: { base: 0, percent: 0.02 },
    };
    const fee = fees[channel] || fees.auction_manheim;
    return fee.base + (salePrice * fee.percent);
  };

  const getStateFees = (state: typeof US_STATES[0], vehicleValue: number): number => {
    const baseFees = state.titleFee + state.regFee + state.inspection;
    const salesTax = vehicleValue * state.salesTax;
    return baseFees + salesTax;
  };

  const getVehiclePremium = (make: string, model: string): number => {
    const modelKey = `${make} ${model}`.replace(/\s+/g, " ");
    for (const [key, data] of Object.entries(TRUCK_PREMIUMS)) {
      if (modelKey.toLowerCase().includes(key.toLowerCase())) {
        return data.multiplier;
      }
    }
    return 1.0;
  };

  const getDemandMultiplier = (state: string, bodyType: string): { multiplier: number; reason: string } => {
    const truckStates = ["TX", "OK", "LA", "AR", "MT", "WY"];
    const suvStates = ["TX", "FL", "AZ", "CA", "NV", "CO"];
    const evStates = ["CA", "WA", "OR", "CO", "MA", "NJ", "NY"];
    const luxuryStates = ["CA", "NY", "FL", "TX", "NJ"];
    
    if (["pickup", "pickup_fullsize"].includes(bodyType) && truckStates.includes(state)) {
      return { multiplier: 1.08, reason: "High truck demand region" };
    }
    if (["suv_fullsize", "suv_midsize"].includes(bodyType) && suvStates.includes(state)) {
      return { multiplier: 1.05, reason: "Strong SUV market" };
    }
    if (bodyType === "sedan" && !["TX", "FL"].includes(state)) {
      return { multiplier: 0.97, reason: "Lower sedan demand" };
    }
    if (luxuryStates.includes(state)) {
      return { multiplier: 1.03, reason: "Premium market" };
    }
    return { multiplier: 1.0, reason: "Standard market" };
  };

  const getRiskFactors = (): string[] => {
    const risks: string[] = [];
    const km = parseInt(formData.odometer) || 0;
    const year = parseInt(formData.year) || new Date().getFullYear();
    const age = new Date().getFullYear() - year;
    
    if (formData.titleStatus === "salvage") {
      risks.push("Salvage title - significantly reduced value and may not be exportable");
    } else if (formData.titleStatus === "rebuilt") {
      risks.push("Rebuilt title - reduced value and buyer hesitancy");
    }
    
    if (formData.accidentHistory === "major") {
      risks.push("Major accident history - significant value reduction");
    } else if (formData.accidentHistory === "moderate") {
      risks.push("Moderate accident history - value impact");
    }
    
    if (km > 150000) {
      risks.push("High mileage (>150,000 km) - reduced demand in US market");
    }
    
    if (age > 10) {
      risks.push("Vehicle age >10 years - may have compliance complications");
    }
    
    if (formData.serviceRecords === "none") {
      risks.push("No service records - buyer concern");
    }
    
    return risks;
  };

  const getRecommendation = (usaProfitUSD: number, canadaProfitCAD: number, marginPercent: number, risks: string[]): ExportResult["recommendation"] => {
    const usaProfitCAD = usaProfitUSD / exchangeRate;
    const profitDiff = usaProfitCAD - canadaProfitCAD;
    
    if (usaProfitUSD < 0 && canadaProfitCAD < 0) {
      return {
        status: "NO_BUY",
        color: "from-red-600 to-rose-700",
        message: "Do Not Buy - Negative profit in both markets",
        confidence: "HIGH"
      };
    }
    
    if (risks.some(r => r.includes("Salvage") || r.includes("Major accident"))) {
      return {
        status: "SELL_CANADA",
        color: "from-amber-500 to-orange-600",
        message: "Sell in Canada - Title/history issues limit export potential",
        confidence: "HIGH"
      };
    }
    
    if (profitDiff > 1500 && marginPercent > 12 && risks.length === 0) {
      return {
        status: "STRONG_EXPORT",
        color: "from-emerald-500 to-green-600",
        message: "Strong Export Opportunity - Significantly higher profit in USA",
        confidence: "HIGH"
      };
    }
    
    if (profitDiff > 500 && marginPercent > 8) {
      return {
        status: "MARGINAL_EXPORT",
        color: "from-amber-400 to-yellow-500",
        message: "Consider Export - Moderate profit advantage, review timing",
        confidence: "MEDIUM"
      };
    }
    
    return {
      status: "SELL_CANADA",
      color: "from-rose-500 to-red-600",
      message: "Sell in Canada - Export costs outweigh benefits",
      confidence: "HIGH"
    };
  };

  const calculateExport = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const purchasePriceCAD = parseFloat(formData.purchasePriceCAD) || 0;
      const purchasePriceUSD = purchasePriceCAD * exchangeRate;
      const odometerKm = formData.odometerUnit === "miles" 
        ? (parseFloat(formData.odometer) || 0) * 1.60934 
        : parseFloat(formData.odometer) || 0;
      
      const vehiclePremium = getVehiclePremium(formData.make, formData.model);
      const baseUSValue = purchasePriceUSD * 1.15 * vehiclePremium;
      
      const stateResults: StateProfit[] = [];
      
      for (const state of US_STATES) {
        const transportCost = calculateTransportCost(formData.province, state.region, formData.bodyType);
        const customsDuty = calculateCustomsDuty(purchasePriceUSD, formData.isUSMCAEligible);
        const mpf = calculateMPF(purchasePriceUSD);
        const customsBond = 150;
        const brokerFee = 250;
        const { multiplier: demandMult, reason } = getDemandMultiplier(state.code, formData.bodyType);
        const expectedSalePrice = baseUSValue * demandMult;
        const stateFees = getStateFees(state, expectedSalePrice);
        const auctionFees = calculateAuctionFee(expectedSalePrice, formData.saleChannel);
        const otherCosts = 135;
        
        const totalCost = purchasePriceUSD + transportCost + customsDuty + mpf + customsBond + brokerFee + stateFees + auctionFees + otherCosts;
        const profit = expectedSalePrice - totalCost;
        const margin = (profit / expectedSalePrice) * 100;
        
        stateResults.push({
          state,
          profit,
          margin,
          transportCost,
          stateFees,
          totalCost,
          demandMultiplier: demandMult,
          reason
        });
      }
      
      stateResults.sort((a, b) => b.profit - a.profit);
      setTopStates(stateResults.slice(0, 5));
      
      const targetState = formData.targetState === "BEST" 
        ? stateResults[0]?.state 
        : US_STATES.find(s => s.code === formData.targetState) || stateResults[0]?.state;
      
      const targetResult = stateResults.find(r => r.state.code === targetState?.code) || stateResults[0];
      
      const transportCost = targetResult.transportCost;
      const customsDuty = calculateCustomsDuty(purchasePriceUSD, formData.isUSMCAEligible);
      const mpf = calculateMPF(purchasePriceUSD);
      const customsBond = 150;
      const brokerFee = 250;
      const stateFees = targetResult.stateFees;
      const expectedSalePrice = targetResult.profit + targetResult.totalCost;
      const auctionFees = calculateAuctionFee(expectedSalePrice, formData.saleChannel);
      const otherCosts = 135;
      const reconditioningCost = parseFloat(formData.reconditioningCost) || 0;
      
      const totalLandedCost = purchasePriceUSD + transportCost + customsDuty + mpf + customsBond + brokerFee + stateFees + auctionFees + otherCosts + reconditioningCost;
      const grossProfitUSD = expectedSalePrice - totalLandedCost;
      const grossProfitCAD = grossProfitUSD / exchangeRate;
      const profitMargin = (grossProfitUSD / expectedSalePrice) * 100;
      
      const canadaWholesale = purchasePriceCAD * 1.08;
      const canadaCosts = 1500;
      const canadaProfit = canadaWholesale - purchasePriceCAD - canadaCosts;
      const canadaMargin = (canadaProfit / canadaWholesale) * 100;
      
      const riskFactors = getRiskFactors();
      const recommendation = getRecommendation(grossProfitUSD, canadaProfit, profitMargin, riskFactors);
      
      const costBreakdown: ExportResult["costBreakdown"] = [
        { label: `Transport (${formData.province} → ${targetState?.code})`, amount: transportCost, type: "cost" },
        { label: formData.isUSMCAEligible ? "Customs Duty (USMCA Exempt)" : "Customs Duty (2.5%)", amount: customsDuty, type: "tax" },
        { label: "Merchandise Processing Fee", amount: mpf, type: "fee" },
        { label: "Customs Bond", amount: customsBond, type: "fee" },
        { label: "Customs Broker Fee", amount: brokerFee, type: "fee" },
        { label: `State Fees (${targetState?.code})`, amount: stateFees, type: "fee" },
        { label: "Auction/Sale Fees", amount: auctionFees, type: "fee" },
        { label: "Other (Wire, Insurance, Misc)", amount: otherCosts, type: "cost" },
      ];
      
      if (reconditioningCost > 0) {
        costBreakdown.push({ label: "Reconditioning", amount: reconditioningCost, type: "cost" });
      }
      
      setResult({
        purchasePriceCAD,
        purchasePriceUSD,
        exchangeRate,
        transportCost,
        customsDuty,
        mpf,
        customsBond,
        brokerFee,
        stateFees,
        auctionFees,
        otherCosts,
        totalLandedCost,
        expectedSalePrice,
        grossProfitUSD,
        grossProfitCAD,
        profitMargin,
        canadaProfit,
        canadaMargin,
        profitDifference: grossProfitCAD - canadaProfit,
        recommendation,
        riskFactors,
        costBreakdown,
      });
      
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Globe2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                  Export Profit Calculator
                </h1>
                <p className="text-slate-400 text-sm">Canada to USA Vehicle Export Analysis</p>
              </div>
            </div>
          </div>
          <AIBadge />
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300 font-medium">1 CAD =</span>
            {manualExchangeRate ? (
              <Input
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0.72)}
                className="w-24 bg-slate-700 border-slate-600 text-white"
                data-testid="input-exchange-rate"
              />
            ) : (
              <span className="text-2xl font-bold text-emerald-400">{exchangeRate.toFixed(4)}</span>
            )}
            <span className="text-slate-300 font-medium">USD</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Switch
              checked={manualExchangeRate}
              onCheckedChange={setManualExchangeRate}
              data-testid="switch-manual-rate"
            />
            <Label className="text-slate-400 text-sm">Manual Override</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExchangeRate}
            disabled={isLoadingRate || manualExchangeRate}
            className="ml-auto border-slate-600 hover:bg-slate-700"
            data-testid="button-refresh-rate"
          >
            {isLoadingRate ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="ml-2">Refresh Rate</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Car className="w-5 h-5 text-emerald-400" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setInventorySearchOpen(!inventorySearchOpen)}
                    className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    data-testid="button-load-inventory"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Load from Inventory
                  </Button>
                  {selectedInventoryCar && (
                    <span className="text-slate-400 text-sm flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1" />
                      Loaded: {selectedInventoryCar.year} {selectedInventoryCar.make} {selectedInventoryCar.model}
                    </span>
                  )}
                </div>

                {inventorySearchOpen && (
                  <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 mb-4">
                    <Input
                      placeholder="Search by VIN, make, model, year..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white mb-3"
                      data-testid="input-inventory-search"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredCars.map((car) => (
                        <button
                          key={car.id}
                          onClick={() => loadFromInventory(car)}
                          className="w-full text-left p-3 rounded-lg bg-slate-600/50 hover:bg-slate-600 transition-colors"
                          data-testid={`button-select-car-${car.id}`}
                        >
                          <p className="text-white font-medium">{car.year} {car.make} {car.model} {car.trim}</p>
                          <p className="text-slate-400 text-xs">VIN: {car.vin} | {car.kilometers?.toLocaleString()} km | ${car.price?.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-slate-300 text-xs mb-1 block">VIN</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.vin}
                        onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                        placeholder="17-character VIN"
                        maxLength={17}
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                        data-testid="input-vin"
                      />
                      <Button
                        onClick={handleDecodeVin}
                        disabled={isDecodingVin || !formData.vin || formData.vin.length < 11}
                        className={cn(
                          "shrink-0",
                          vinDecodeStatus === "success" 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : vinDecodeStatus === "error"
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-violet-600 hover:bg-violet-700"
                        )}
                        data-testid="button-decode-vin"
                      >
                        {isDecodingVin ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : vinDecodeStatus === "success" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : vinDecodeStatus === "error" ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        <span className="ml-1.5 hidden sm:inline">
                          {isDecodingVin ? "Decoding..." : vinDecodeStatus === "success" ? "Decoded" : "Decode"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Year</Label>
                    <Input
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2024"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-year"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Make</Label>
                    <Input
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      placeholder="Toyota"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-make"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="RAV4"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-model"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Trim</Label>
                    <Input
                      value={formData.trim}
                      onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                      placeholder="XLE AWD"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-trim"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Body Type</Label>
                    <Select value={formData.bodyType} onValueChange={(v) => setFormData({ ...formData, bodyType: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-body-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="coupe">Coupe</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                        <SelectItem value="suv_compact">Compact SUV</SelectItem>
                        <SelectItem value="suv_midsize">Mid-size SUV</SelectItem>
                        <SelectItem value="suv_fullsize">Full-size SUV</SelectItem>
                        <SelectItem value="crossover">Crossover</SelectItem>
                        <SelectItem value="pickup">Pickup Truck</SelectItem>
                        <SelectItem value="pickup_fullsize">Full-size Truck (F-250+)</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="minivan">Minivan</SelectItem>
                        <SelectItem value="convertible">Convertible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Odometer</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.odometer}
                        onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                        placeholder="45000"
                        className="bg-slate-700 border-slate-600 text-white"
                        data-testid="input-odometer"
                      />
                      <Select value={formData.odometerUnit} onValueChange={(v: "km" | "miles") => setFormData({ ...formData, odometerUnit: v })}>
                        <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white" data-testid="select-odometer-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="km">KM</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Condition</Label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="below_average">Below Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Purchase Price (CAD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <Input
                        value={formData.purchasePriceCAD}
                        onChange={(e) => setFormData({ ...formData, purchasePriceCAD: e.target.value })}
                        placeholder="42000"
                        className="bg-slate-700 border-slate-600 text-white pl-8"
                        data-testid="input-purchase-price"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Province of Purchase</Label>
                    <Select value={formData.province} onValueChange={(v) => setFormData({ ...formData, province: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-province">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                        {CANADIAN_PROVINCES.map((p) => (
                          <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Target US State</Label>
                    <Select value={formData.targetState} onValueChange={(v) => setFormData({ ...formData, targetState: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-target-state">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                        <SelectItem value="BEST">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-400" />
                            Best State (Auto-recommend)
                          </div>
                        </SelectItem>
                        {US_STATES.map((s) => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Sale Channel</Label>
                    <Select value={formData.saleChannel} onValueChange={(v) => setFormData({ ...formData, saleChannel: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-sale-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="auction_manheim">Auction (Manheim)</SelectItem>
                        <SelectItem value="auction_adesa">Auction (ADESA)</SelectItem>
                        <SelectItem value="direct_dealer">Direct to Dealer</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Accident History</Label>
                    <Select value={formData.accidentHistory} onValueChange={(v) => setFormData({ ...formData, accidentHistory: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-accident-history">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Title Status</Label>
                    <Select value={formData.titleStatus} onValueChange={(v) => setFormData({ ...formData, titleStatus: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-title-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="clean">Clean</SelectItem>
                        <SelectItem value="rebuilt">Rebuilt</SelectItem>
                        <SelectItem value="salvage">Salvage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs mb-1 block">Reconditioning (USD)</Label>
                    <Input
                      value={formData.reconditioningCost}
                      onChange={(e) => setFormData({ ...formData, reconditioningCost: e.target.value })}
                      placeholder="0"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-reconditioning"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isUSMCAEligible}
                      onCheckedChange={(v) => setFormData({ ...formData, isUSMCAEligible: v })}
                      data-testid="switch-usmca"
                    />
                    <Label className="text-slate-300 text-sm flex items-center gap-1">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      USMCA Eligible (0% Duty)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-slate-700 max-w-xs">
                        <p className="text-sm">Vehicles manufactured in North America after July 2020 qualify for duty-free import under USMCA.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Button
                  onClick={calculateExport}
                  disabled={!formData.purchasePriceCAD || isCalculating}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6 mt-4"
                  data-testid="button-calculate-export"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Export Profitability...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Export Profit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {result && (
              <>
                <div className={cn(
                  "p-6 rounded-xl border-2 backdrop-blur-sm",
                  result.recommendation.status === "STRONG_EXPORT" && "bg-emerald-500/10 border-emerald-500/50",
                  result.recommendation.status === "MARGINAL_EXPORT" && "bg-amber-500/10 border-amber-500/50",
                  result.recommendation.status === "SELL_CANADA" && "bg-rose-500/10 border-rose-500/50",
                  result.recommendation.status === "NO_BUY" && "bg-red-600/10 border-red-600/50",
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-xl bg-gradient-to-br", result.recommendation.color)}>
                      {result.recommendation.status === "STRONG_EXPORT" && <CheckCircle2 className="w-8 h-8 text-white" />}
                      {result.recommendation.status === "MARGINAL_EXPORT" && <AlertTriangle className="w-8 h-8 text-white" />}
                      {result.recommendation.status === "SELL_CANADA" && <XCircle className="w-8 h-8 text-white" />}
                      {result.recommendation.status === "NO_BUY" && <XCircle className="w-8 h-8 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-xl">{result.recommendation.status.replace(/_/g, " ")}</p>
                      <p className="text-slate-300">{result.recommendation.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Confidence</p>
                      <p className={cn(
                        "font-bold text-lg",
                        result.recommendation.confidence === "HIGH" ? "text-emerald-400" : "text-amber-400"
                      )}>{result.recommendation.confidence}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        Sell in Canada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Market Value</span>
                          <span className="text-white font-medium">${Math.round(result.purchasePriceCAD * 1.08).toLocaleString()} CAD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Est. Costs</span>
                          <span className="text-white font-medium">$1,500 CAD</span>
                        </div>
                        <div className="h-px bg-slate-700" />
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Net Profit</span>
                          <span className={cn("font-bold text-lg", result.canadaProfit > 0 ? "text-emerald-400" : "text-rose-400")}>
                            ${Math.round(result.canadaProfit).toLocaleString()} CAD
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Profit Margin</span>
                          <span className="text-white font-medium">{result.canadaMargin.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-emerald-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-emerald-400" />
                        Export to USA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Sale Price (USD)</span>
                          <span className="text-white font-medium">${Math.round(result.expectedSalePrice).toLocaleString()} USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Costs</span>
                          <span className="text-white font-medium">${Math.round(result.totalLandedCost - result.purchasePriceUSD).toLocaleString()} USD</span>
                        </div>
                        <div className="h-px bg-slate-700" />
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Net Profit</span>
                          <span className={cn("font-bold text-lg", result.grossProfitUSD > 0 ? "text-emerald-400" : "text-rose-400")}>
                            ${Math.round(result.grossProfitUSD).toLocaleString()} USD
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Profit Margin</span>
                          <span className="text-white font-medium">{result.profitMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Profit (CAD)</span>
                          <span className="text-emerald-400 font-bold">${Math.round(result.grossProfitCAD).toLocaleString()} CAD</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Profit Difference (Export vs Canada)</p>
                        <p className={cn(
                          "text-3xl font-bold",
                          result.profitDifference > 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {result.profitDifference > 0 ? "+" : ""}${Math.round(result.profitDifference).toLocaleString()} CAD
                        </p>
                      </div>
                      <div className="text-right">
                        {result.profitDifference > 0 ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <TrendingUp className="w-6 h-6" />
                            <span className="font-medium">Export is more profitable</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-400">
                            <TrendingDown className="w-6 h-6" />
                            <span className="font-medium">Canada sale is better</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.riskFactors.length > 0 && (
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.riskFactors.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                            <span className="text-amber-400 mt-0.5">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            {result && (
              <>
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-violet-400" />
                      Cost Breakdown (USD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Purchase Price</span>
                        <span className="text-white font-medium">${Math.round(result.purchasePriceUSD).toLocaleString()}</span>
                      </div>
                      {result.costBreakdown.map((item, i) => (
                        <div key={i} className="flex justify-between py-1.5">
                          <span className="text-slate-400 text-sm">{item.label}</span>
                          <span className={cn(
                            "text-sm font-medium",
                            item.type === "tax" ? "text-amber-400" : item.type === "fee" ? "text-violet-400" : "text-white"
                          )}>
                            ${Math.round(item.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="h-px bg-slate-600 my-2" />
                      <div className="flex justify-between py-2">
                        <span className="text-white font-medium">Total Landed Cost</span>
                        <span className="text-white font-bold text-lg">${Math.round(result.totalLandedCost).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-emerald-500/10 rounded-lg px-3 -mx-3">
                        <span className="text-emerald-400 font-medium">Expected Sale Price</span>
                        <span className="text-emerald-400 font-bold text-lg">${Math.round(result.expectedSalePrice).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Top 5 Export Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topStates.map((stateProfit, i) => (
                        <div 
                          key={stateProfit.state.code}
                          className={cn(
                            "p-3 rounded-lg border transition-all",
                            i === 0 ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30" : "bg-slate-700/30 border-slate-700/50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {i === 0 && <Star className="w-4 h-4 text-amber-400" />}
                              <span className="text-white font-medium">{i + 1}. {stateProfit.state.name}</span>
                            </div>
                            <span className={cn(
                              "font-bold",
                              stateProfit.profit > 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                              ${Math.round(stateProfit.profit).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">{stateProfit.reason}</span>
                            <span className="text-slate-400">{stateProfit.margin.toFixed(1)}% margin</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">AI Market Insight</p>
                        <p className="text-slate-400 text-xs">Based on current market data</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {formData.bodyType.includes("pickup") || formData.bodyType.includes("suv_fullsize") ? (
                        "Trucks and full-size SUVs are in high demand in Texas, Florida, and the Southwest. Consider targeting these markets for maximum profit."
                      ) : formData.bodyType.includes("suv") ? (
                        "SUVs have strong year-round demand across most US states. Florida, Texas, and Arizona typically offer the best margins."
                      ) : (
                        "Sedan demand varies by region. Consider targeting northeast states or export during peak buying seasons for better results."
                      )}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 rounded-full bg-slate-700/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-2">Enter vehicle details and calculate</p>
                  <p className="text-slate-500 text-sm">Get comprehensive export profit analysis with state-by-state comparison</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>Exchange rates and market values are estimates. Actual results may vary based on market conditions.</p>
          <p className="mt-1">Carsellia Export Calculator - Ontario, Canada</p>
        </div>
      </div>
    </div>
  );
}
