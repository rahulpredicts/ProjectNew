import { useState, useMemo, useEffect } from "react";
import { useCars, useDealerships, type Car, type Dealership } from "@/lib/api-hooks";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calculator, 
  Car as CarIcon, 
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  Info,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Database,
  Target,
  DollarSign,
  Shield,
  Clock,
  MapPin,
  Gauge,
  Settings2,
  Download,
  RefreshCw,
  Wrench,
  FileWarning,
  Users,
  Car as CarType
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { decodeVIN } from "@/lib/nhtsa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

const PROVINCES = [
  { code: "BC", name: "British Columbia" },
  { code: "AB", name: "Alberta" },
  { code: "SK", name: "Saskatchewan" },
  { code: "MB", name: "Manitoba" },
  { code: "ON", name: "Ontario" },
  { code: "QC", name: "Quebec" },
  { code: "NB", name: "New Brunswick" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NL", name: "Newfoundland" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "YT", name: "Yukon" }
];

const BODY_TYPES = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Van", "Convertible", "Wagon"];
const TRANSMISSIONS = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "cvt", label: "CVT" }
];

const NAAA_GRADES = [
  { grade: 5, label: "Excellent", description: "Only minor chips; original finish; no tears, burns, or odors", reconditionLow: 500, reconditionHigh: 1000 },
  { grade: 4, label: "Good", description: "Minor scratches/chips; may need PDR or minor touch-up", reconditionLow: 1000, reconditionHigh: 1500 },
  { grade: 3, label: "Fair", description: "Normal wear including parking dings, small scratches", reconditionLow: 1500, reconditionHigh: 2500 },
  { grade: 2, label: "Poor", description: "Multiple dents, scratches; panels may need replacement", reconditionLow: 2500, reconditionHigh: 4000 },
  { grade: 1, label: "Very Poor", description: "Severe abuse or major collision damage", reconditionLow: 4000, reconditionHigh: 6000 },
  { grade: 0, label: "Inoperative", description: "Non-running; parts missing; suitable only for salvage", reconditionLow: 0, reconditionHigh: 0 }
];

const TITLE_TYPES = [
  { value: "clean", label: "Clean Title", deduction: 0 },
  { value: "rebuilt", label: "Rebuilt Title", deduction: 0.30 },
  { value: "salvage", label: "Salvage Title", deduction: 1.0 },
  { value: "flood", label: "Flood Title", deduction: 1.0 }
];

const ACCIDENT_LEVELS = [
  { value: "none", label: "No Accidents", deduction: 0 },
  { value: "cosmetic", label: "Cosmetic Only (<$3,000)", deduction: 0.075 },
  { value: "minor", label: "Minor Panel Damage", deduction: 0.10 },
  { value: "moderate", label: "Moderate ($3,000-$10,000)", deduction: 0.125 },
  { value: "major", label: "Major Structural (>$10,000)", deduction: 0.20 },
  { value: "severe", label: "Severe (Rebuilt/Rollover)", deduction: 0.35 }
];

const REGIONAL_MULTIPLIERS: Record<string, number> = {
  "BC": 1.12, "AB": 1.09, "SK": 1.05, "MB": 1.05, "ON": 0.99, "QC": 0.92,
  "NB": 0.91, "NS": 0.91, "NL": 0.91, "PE": 0.91, "NT": 1.00, "NU": 1.00, "YT": 1.00
};

const SEASONAL_FACTORS: Record<number, number> = {
  1: 0.965, 2: 0.965, 3: 1.025, 4: 1.025, 5: 1.005, 6: 1.005,
  7: 0.99, 8: 0.99, 9: 0.975, 10: 0.975, 11: 0.97, 12: 0.97
};

const BRAND_MULTIPLIERS: Record<string, number> = {
  "Toyota": 1.08, "Lexus": 1.10, "Honda": 1.07, "Acura": 1.05,
  "Chrysler": 0.92, "Dodge": 0.93, "Mitsubishi": 0.90, "Fiat": 0.88,
  "Jeep": 0.98, "Ram": 1.02
};

const BODY_TYPE_DEPRECIATION: Record<string, { year1: number, annual: number }> = {
  "truck": { year1: 0.175, annual: 0.11 },
  "suv": { year1: 0.20, annual: 0.135 },
  "sedan": { year1: 0.25, annual: 0.175 },
  "compact": { year1: 0.275, annual: 0.165 },
  "hatchback": { year1: 0.275, annual: 0.165 },
  "luxury": { year1: 0.30, annual: 0.20 },
  "electric": { year1: 0.35, annual: 0.175 },
  "coupe": { year1: 0.22, annual: 0.15 },
  "van": { year1: 0.25, annual: 0.16 },
  "convertible": { year1: 0.28, annual: 0.18 }
};

type DecisionType = "buy" | "wholesale" | "reject";

interface AppraisalResult {
  decision: DecisionType;
  decisionReasons: string[];
  retailValue: number;
  wholesaleValue: number;
  tradeInOffer: number;
  tradeInLow: number;
  tradeInHigh: number;
  adjustments: { label: string; amount: number; type: "add" | "subtract" | "multiply"; }[];
  reconditioning: number;
  profitMargin: number;
  holdingCosts: number;
  mileageAdjustment: number;
  regionalMultiplier: number;
  seasonalFactor: number;
  conditionDeduction: number;
  accidentDeduction: number;
  historyDeductions: number;
  similarCars: Car[];
  aiConfidence: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 16 }, (_, i) => currentYear - i);

function AIBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-medium shadow-lg shadow-violet-500/25">
      <Brain className="w-3 h-3" />
      <span>Powered by AI</span>
      <Sparkles className="w-3 h-3" />
    </div>
  );
}

function GlowCard({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn(
      "relative rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden",
      glow && "shadow-xl shadow-violet-500/10",
      className
    )}>
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color = "blue" }: { 
  label: string; 
  value: string; 
  icon: any; 
  trend?: "up" | "down" | null;
  color?: "blue" | "green" | "violet" | "amber";
}) {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
    violet: "from-violet-500 to-purple-500",
    amber: "from-amber-500 to-orange-500"
  };
  
  return (
    <div className="relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden group hover:border-slate-600/50 transition-all">
      <div className={cn("absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 -translate-y-6 translate-x-6 rounded-full blur-xl", colorMap[color])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
          <p className="text-white text-xl font-bold">{value}</p>
        </div>
        <div className={cn("p-2 rounded-lg bg-gradient-to-br", colorMap[color])}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs", trend === "up" ? "text-emerald-400" : "text-rose-400")}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend === "up" ? "Above" : "Below"} market avg</span>
        </div>
      )}
    </div>
  );
}

function ConditionSelector({ value, onChange }: { value: number; onChange: (grade: number) => void }) {
  const grades = [
    { grade: 5, label: "Excellent", color: "from-emerald-500 to-green-500", desc: "Like new" },
    { grade: 4, label: "Good", color: "from-blue-500 to-cyan-500", desc: "Minor wear" },
    { grade: 3, label: "Fair", color: "from-amber-500 to-yellow-500", desc: "Normal wear" },
    { grade: 2, label: "Poor", color: "from-orange-500 to-red-500", desc: "Visible damage" },
    { grade: 1, label: "Very Poor", color: "from-red-500 to-rose-600", desc: "Major issues" },
    { grade: 0, label: "Inoperative", color: "from-gray-600 to-gray-700", desc: "Non-running" }
  ];
  
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {grades.map(g => (
        <button
          key={g.grade}
          onClick={() => onChange(g.grade)}
          data-testid={`button-grade-${g.grade}`}
          className={cn(
            "p-3 rounded-xl border-2 transition-all text-center",
            value === g.grade 
              ? "border-violet-500 bg-violet-500/10" 
              : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
          )}
        >
          <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r mx-auto mb-1", g.color)} />
          <p className="text-white font-medium text-xs">{g.label}</p>
          <p className="text-slate-400 text-[10px]">{g.desc}</p>
        </button>
      ))}
    </div>
  );
}

export default function AppraisalPage() {
  const { data: allCars = [] } = useCars();
  const { data: dealerships = [] } = useDealerships();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedInventoryCar, setSelectedInventoryCar] = useState<Car | null>(null);
  const [inventorySearchOpen, setInventorySearchOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  
  const [formData, setFormData] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    kilometers: "",
    trim: "",
    transmission: "automatic",
    fuelType: "gasoline",
    drivetrain: "fwd",
    bodyType: "sedan",
    engineCylinders: "",
    engineDisplacement: "",
    msrp: "",
    province: "ON",
    colour: ""
  });

  const [conditionData, setConditionData] = useState({
    naagGrade: 4,
    brakePadThickness: 4,
    tireTreadDepth: 5,
    checkEngineLight: false,
    roughIdle: false,
    excessiveSmoke: false,
    transmissionSlipping: false,
    rustLevel: "none" as "none" | "minor" | "moderate" | "severe"
  });

  const [historyData, setHistoryData] = useState({
    titleType: "clean",
    accidentLevel: "none",
    accidentCount: 0,
    odometerTampering: false,
    activeRecalls: false,
    frameDamage: false,
    frameDamageRepaired: false,
    stolenFlag: false,
    previousRental: false,
    previousTaxi: false,
    missingServiceRecords: false,
    ownerCount: 1,
    isSpecialtyVehicle: false,
    bcAlbertaHistory: false
  });

  const [businessSettings, setBusinessSettings] = useState({
    profitMarginPercent: 15,
    holdingCostPerDay: 50,
    estimatedHoldingDays: 10,
    safetyBufferPercent: 12
  });

  const [reconditioning, setReconditioning] = useState<number | null>(null);
  const [profitOverride, setProfitOverride] = useState<number | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mechanicalOpen, setMechanicalOpen] = useState(false);

  const [appraisal, setAppraisal] = useState<AppraisalResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const filteredInventoryCars = useMemo(() => {
    if (!inventorySearch) return allCars.slice(0, 50);
    const search = inventorySearch.toLowerCase();
    return allCars.filter(car => 
      car.vin?.toLowerCase().includes(search) ||
      car.make.toLowerCase().includes(search) ||
      car.model.toLowerCase().includes(search) ||
      car.year.includes(search)
    ).slice(0, 50);
  }, [allCars, inventorySearch]);

  const loadFromInventory = (car: Car) => {
    setSelectedInventoryCar(car);
    setFormData({
      vin: car.vin || "",
      make: car.make,
      model: car.model,
      year: car.year,
      kilometers: car.kilometers,
      trim: car.trim,
      transmission: car.transmission.toLowerCase(),
      fuelType: car.fuelType?.toLowerCase() || "gasoline",
      drivetrain: car.drivetrain?.toLowerCase() || "fwd",
      bodyType: car.bodyType?.toLowerCase() || "sedan",
      engineCylinders: car.engineCylinders || "",
      engineDisplacement: car.engineDisplacement || "",
      msrp: "",
      province: "ON",
      colour: car.color || ""
    });
    setInventorySearchOpen(false);
    toast({ title: "Vehicle loaded", description: `${car.year} ${car.make} ${car.model} loaded from inventory` });
  };

  const handleDecodeVin = async () => {
    if (formData.vin.length < 11) return;
    setIsDecoding(true);
    try {
      const decoded = await decodeVIN(formData.vin);
      if (decoded) {
        setFormData(prev => ({
          ...prev,
          make: decoded.make || prev.make,
          model: decoded.model || prev.model,
          year: decoded.year?.toString() || prev.year,
          bodyType: decoded.bodyClass?.toLowerCase() || prev.bodyType,
          engineCylinders: decoded.engineCylinders || prev.engineCylinders,
          fuelType: decoded.fuelType?.toLowerCase() || prev.fuelType,
          drivetrain: decoded.driveType?.toLowerCase() || prev.drivetrain,
          transmission: decoded.transmission?.toLowerCase() || prev.transmission
        }));
        toast({ title: "VIN Decoded", description: `Found ${decoded.year} ${decoded.make} ${decoded.model}` });
      }
    } catch (error) {
      toast({ title: "Decode failed", description: "Could not decode VIN", variant: "destructive" });
    }
    setIsDecoding(false);
  };

  const calculateDepreciation = (msrp: number, age: number, bodyType: string, make: string): number => {
    const bodyDep = BODY_TYPE_DEPRECIATION[bodyType.toLowerCase()] || { year1: 0.25, annual: 0.15 };
    let depreciation = bodyDep.year1;
    for (let i = 1; i < age; i++) {
      depreciation += bodyDep.annual * Math.pow(0.92, i - 1);
    }
    depreciation = Math.min(depreciation, 0.85);
    let value = msrp * (1 - depreciation);
    const brandMult = BRAND_MULTIPLIERS[make] || 1.0;
    value *= brandMult;
    return value;
  };

  const calculateMileageAdjustment = (baseValue: number, km: number, vehicleAge: number): number => {
    const avgAnnualKm = 20000;
    const expectedKm = vehicleAge * avgAnnualKm;
    const kmVariance = km - expectedKm;
    // Canadian methodology: $0.02 per km variance
    // High mileage (positive variance) = deduction (negative adjustment)
    // Low mileage (negative variance) = credit (positive adjustment)
    const rawAdjustment = -kmVariance * 0.02;
    const maxAdj = baseValue * 0.20;
    // Cap adjustment to ±20% of base value
    return Math.max(Math.min(rawAdjustment, maxAdj), -maxAdj);
  };

  const getSeasonalFactor = (bodyType: string): number => {
    const currentMonth = new Date().getMonth() + 1;
    let baseFactor = SEASONAL_FACTORS[currentMonth] || 1.0;
    const isSummerMonth = currentMonth >= 5 && currentMonth <= 8;
    const isWinterMonth = currentMonth >= 11 || currentMonth <= 2;
    
    if (bodyType === "convertible") {
      if (isSummerMonth) baseFactor *= 1.10;
      else if (isWinterMonth) baseFactor *= 0.88;
    }
    if (bodyType === "truck" && isWinterMonth) baseFactor *= 1.03;
    return baseFactor;
  };

  const calculateMechanicalRecondition = (): number => {
    let cost = 0;
    if (conditionData.brakePadThickness < 2) cost += 450;
    else if (conditionData.brakePadThickness < 3) cost += 250;
    if (conditionData.tireTreadDepth < 4) cost += 800;
    else if (conditionData.tireTreadDepth < 5) cost += 400;
    if (conditionData.checkEngineLight) cost += 350;
    if (conditionData.roughIdle) cost += 200;
    if (conditionData.excessiveSmoke) cost += 1500;
    if (conditionData.transmissionSlipping) cost += 2500;
    if (conditionData.rustLevel === "minor") cost += 300;
    else if (conditionData.rustLevel === "moderate") cost += 800;
    else if (conditionData.rustLevel === "severe") cost += 2000;
    return cost;
  };

  const evaluateDecision = (): { decision: DecisionType; reasons: string[] } => {
    const reasons: string[] = [];
    const km = parseInt(formData.kilometers) || 0;
    const vehicleAge = formData.year ? currentYear - parseInt(formData.year) : 0;
    
    if (["salvage", "flood"].includes(historyData.titleType)) {
      reasons.push(`${TITLE_TYPES.find(t => t.value === historyData.titleType)?.label} - automatic rejection`);
      return { decision: "reject", reasons };
    }
    if (historyData.odometerTampering) {
      reasons.push("Odometer tampering detected");
      return { decision: "reject", reasons };
    }
    if (historyData.stolenFlag) {
      reasons.push("Stolen vehicle flag");
      return { decision: "reject", reasons };
    }
    if (historyData.frameDamage && !historyData.frameDamageRepaired) {
      reasons.push("Unrepaired structural damage");
      return { decision: "reject", reasons };
    }
    if (km > 300000) {
      reasons.push("Mileage exceeds 300,000 km");
      return { decision: "reject", reasons };
    }
    if (vehicleAge > 15 && !historyData.isSpecialtyVehicle) {
      reasons.push("Vehicle age exceeds 15 years");
      return { decision: "reject", reasons };
    }
    if (conditionData.naagGrade === 0) {
      reasons.push("Inoperative vehicle");
      return { decision: "reject", reasons };
    }
    if (conditionData.excessiveSmoke || conditionData.transmissionSlipping) {
      reasons.push("Major mechanical issues - wholesale only");
      return { decision: "wholesale", reasons };
    }

    let decision: DecisionType = "buy";
    if (historyData.titleType === "rebuilt") {
      decision = "wholesale";
      reasons.push("Rebuilt title - wholesale only");
    }
    if (historyData.accidentLevel === "major" || historyData.accidentLevel === "severe") {
      decision = "wholesale";
      reasons.push("Major accident history - wholesale only");
    }
    if (historyData.frameDamageRepaired) {
      decision = "wholesale";
      reasons.push("Structural damage (repaired) - wholesale only");
    }
    if (conditionData.naagGrade <= 2) {
      decision = "wholesale";
      reasons.push("Poor condition - wholesale only");
    }
    if (historyData.previousTaxi) {
      decision = "wholesale";
      reasons.push("Previous taxi/rideshare - wholesale only");
    }

    if (reasons.length === 0 && decision === "buy") {
      reasons.push("Vehicle meets retail criteria");
    }
    return { decision, reasons };
  };

  const handleAppraise = async () => {
    if (!formData.make || !formData.model) return;
    setIsCalculating(true);
    
    await new Promise(r => setTimeout(r, 500));

    const km = parseInt(formData.kilometers) || 0;
    const vehicleAge = formData.year ? currentYear - parseInt(formData.year) : 0;
    const msrp = parseFloat(formData.msrp) || 35000;
    const effectiveGrade = conditionData.naagGrade;
    
    const { decision, reasons } = evaluateDecision();
    
    let similar = allCars.filter(car => 
      car.make.toLowerCase() === formData.make.toLowerCase() &&
      car.model.toLowerCase() === formData.model.toLowerCase() &&
      (!formData.year || Math.abs(parseInt(car.year) - parseInt(formData.year)) <= 2)
    );
    
    if (formData.trim && formData.trim !== "Other") {
      const trimMatches = similar.filter(car => car.trim.toLowerCase().includes(formData.trim.toLowerCase()));
      if (trimMatches.length > 0) similar = trimMatches;
    }

    let baseValue: number;
    if (similar.length > 0) {
      const prices = similar.map(c => parseFloat(c.price)).filter(p => !isNaN(p));
      baseValue = prices.reduce((a, b) => a + b, 0) / prices.length;
    } else {
      baseValue = calculateDepreciation(msrp, vehicleAge, formData.bodyType, formData.make);
    }

    const adjustments: AppraisalResult["adjustments"] = [];
    
    const mileageAdj = calculateMileageAdjustment(baseValue, km, vehicleAge);
    if (Math.abs(mileageAdj) > 100) {
      const expectedKm = vehicleAge * 20000;
      const isHighMileage = km > expectedKm;
      adjustments.push({
        label: isHighMileage ? `High mileage (${km.toLocaleString()} km)` : `Low mileage (${km.toLocaleString()} km)`,
        amount: Math.abs(mileageAdj),
        type: mileageAdj > 0 ? "add" : "subtract"
      });
    }
    
    const regionalMult = REGIONAL_MULTIPLIERS[formData.province] || 1.0;
    if (regionalMult !== 1.0) {
      const regionalAdj = baseValue * Math.abs(regionalMult - 1);
      adjustments.push({
        label: `Regional (${PROVINCES.find(p => p.code === formData.province)?.name || formData.province})`,
        amount: regionalAdj,
        type: regionalMult > 1 ? "add" : "subtract"
      });
    }
    
    if (historyData.bcAlbertaHistory && ["ON", "QC", "NB", "NS", "NL", "PE"].includes(formData.province)) {
      adjustments.push({ label: "BC/Alberta history (rust-free)", amount: baseValue * 0.075, type: "add" });
    }
    
    const seasonalFactor = getSeasonalFactor(formData.bodyType);
    if (Math.abs(seasonalFactor - 1) > 0.01) {
      adjustments.push({
        label: "Seasonal adjustment",
        amount: baseValue * Math.abs(seasonalFactor - 1),
        type: seasonalFactor > 1 ? "add" : "subtract"
      });
    }
    
    const titleInfo = TITLE_TYPES.find(t => t.value === historyData.titleType);
    if (titleInfo && titleInfo.deduction > 0 && titleInfo.deduction < 1) {
      adjustments.push({ label: `Title (${titleInfo.label})`, amount: baseValue * titleInfo.deduction, type: "subtract" });
    }
    
    const accidentInfo = ACCIDENT_LEVELS.find(a => a.value === historyData.accidentLevel);
    if (accidentInfo && accidentInfo.deduction > 0) {
      adjustments.push({ label: `Accident (${accidentInfo.label})`, amount: baseValue * accidentInfo.deduction, type: "subtract" });
    }
    
    const gradeInfo = NAAA_GRADES.find(g => g.grade === effectiveGrade);
    if (effectiveGrade < 5) {
      const condDed = baseValue * ((5 - effectiveGrade) * 0.03);
      adjustments.push({ label: `Condition (${gradeInfo?.label || 'Fair'})`, amount: condDed, type: "subtract" });
    }

    if (historyData.ownerCount > 2) {
      adjustments.push({ label: `${historyData.ownerCount} owners`, amount: baseValue * ((historyData.ownerCount - 2) * 0.025), type: "subtract" });
    }
    
    if (historyData.previousRental) {
      adjustments.push({ label: "Previous rental", amount: baseValue * 0.075, type: "subtract" });
    }
    if (historyData.previousTaxi) {
      adjustments.push({ label: "Previous taxi/rideshare", amount: baseValue * 0.20, type: "subtract" });
    }
    if (historyData.missingServiceRecords) {
      adjustments.push({ label: "Missing service records", amount: baseValue * 0.075, type: "subtract" });
    }
    
    let retailValue = baseValue + mileageAdj;
    for (const adj of adjustments) {
      if (adj.label.startsWith("Mileage")) continue;
      if (adj.type === "add") retailValue += adj.amount;
      else if (adj.type === "subtract") retailValue -= adj.amount;
    }
    
    const gradeRecondition = gradeInfo ? (gradeInfo.reconditionLow + gradeInfo.reconditionHigh) / 2 : 1500;
    const mechanicalCost = calculateMechanicalRecondition();
    const reconditioningCost = reconditioning !== null ? reconditioning : gradeRecondition + mechanicalCost;
    
    const calculatedProfitMargin = retailValue * (businessSettings.profitMarginPercent / 100);
    const profitMargin = profitOverride !== null ? profitOverride : calculatedProfitMargin;
    
    const holdingCosts = businessSettings.holdingCostPerDay * businessSettings.estimatedHoldingDays;
    const safetyBuffer = retailValue * (businessSettings.safetyBufferPercent / 100);
    
    const wholesaleValue = retailValue * 0.82;
    const tradeInOffer = wholesaleValue - reconditioningCost - profitMargin - holdingCosts - safetyBuffer;
    
    const tradeInLow = Math.max(tradeInOffer * 0.92, 0);
    const tradeInHigh = tradeInOffer * 1.08;
    
    const conditionDeduction = baseValue * ((5 - effectiveGrade) * 0.03);
    const accidentDeduction = accidentInfo ? baseValue * accidentInfo.deduction : 0;
    let historyDeductions = 0;
    if (historyData.previousRental) historyDeductions += baseValue * 0.075;
    if (historyData.previousTaxi) historyDeductions += baseValue * 0.20;
    if (historyData.missingServiceRecords) historyDeductions += baseValue * 0.075;
    if (historyData.ownerCount > 2) historyDeductions += baseValue * ((historyData.ownerCount - 2) * 0.025);

    const aiConfidence = Math.min(95, 70 + similar.length * 5);

    setAppraisal({
      decision,
      decisionReasons: reasons,
      retailValue: Math.max(retailValue, 0),
      wholesaleValue: Math.max(wholesaleValue, 0),
      tradeInOffer: Math.max(tradeInOffer, 0),
      tradeInLow: Math.max(tradeInLow, 0),
      tradeInHigh: Math.max(tradeInHigh, 0),
      adjustments,
      reconditioning: reconditioningCost,
      profitMargin,
      holdingCosts,
      mileageAdjustment: mileageAdj,
      regionalMultiplier: regionalMult,
      seasonalFactor,
      conditionDeduction,
      accidentDeduction,
      historyDeductions,
      similarCars: similar.slice(0, 5),
      aiConfidence
    });

    setIsCalculating(false);
  };

  useEffect(() => {
    if (formData.make && formData.model && formData.year) {
      handleAppraise();
    }
  }, [formData, conditionData, historyData, reconditioning, profitOverride]);

  const decisionColors: Record<DecisionType, { bg: string; text: string; border: string }> = {
    buy: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" },
    wholesale: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
    reject: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Vehicle Appraisal</h1>
                <p className="text-slate-400 text-sm">Canadian market intelligence • NAAA grading</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AIBadge />
            <Dialog open={inventorySearchOpen} onOpenChange={setInventorySearchOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-load-inventory"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Load from Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Select Vehicle from Inventory
                  </DialogTitle>
                </DialogHeader>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by VIN, make, model, or year..."
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    data-testid="input-inventory-search"
                  />
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredInventoryCars.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <CarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No vehicles found</p>
                      </div>
                    ) : (
                      filteredInventoryCars.map(car => (
                        <button
                          key={car.id}
                          onClick={() => loadFromInventory(car)}
                          data-testid={`button-select-car-${car.id}`}
                          className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{car.year} {car.make} {car.model}</p>
                              <p className="text-slate-400 text-sm">{car.trim} • {parseInt(car.kilometers).toLocaleString()} km</p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-400 font-semibold">${parseInt(car.price).toLocaleString()}</p>
                              <p className="text-slate-500 text-xs font-mono">{car.vin?.slice(-6) || 'No VIN'}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlowCard glow>
              <div className="p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">Vehicle Information</h2>
                  {selectedInventoryCar && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-auto">From Inventory</Badge>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-slate-400 text-xs mb-1.5 block">VIN</Label>
                    <div className="flex gap-2">
                      <Input
                        data-testid="input-vin"
                        placeholder="Enter 17-character VIN"
                        value={formData.vin}
                        onChange={e => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                        className="bg-slate-800/50 border-slate-700 text-white font-mono uppercase h-11"
                        maxLength={17}
                      />
                      <Button 
                        onClick={handleDecodeVin} 
                        disabled={isDecoding || formData.vin.length < 11}
                        data-testid="button-decode-vin"
                        className="h-11 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                      >
                        {isDecoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Brain className="w-4 h-4 mr-1.5" />Decode</>}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Year</Label>
                    <Select value={formData.year} onValueChange={val => setFormData({ ...formData, year: val })}>
                      <SelectTrigger data-testid="select-trigger-year" className="bg-slate-800/50 border-slate-700 text-white h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-slate-700">{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Make</Label>
                    <Select value={formData.make} onValueChange={val => setFormData({ ...formData, make: val })}>
                      <SelectTrigger data-testid="select-trigger-make" className="bg-slate-800/50 border-slate-700 text-white h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-[300px]">
                        {POPULAR_MAKES.map(make => (
                          <SelectItem key={make} value={make} className="text-white hover:bg-slate-700">{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Model</Label>
                    <Input
                      data-testid="input-model"
                      placeholder="Enter model"
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Trim</Label>
                    <Input
                      data-testid="input-trim"
                      placeholder="e.g. Sport"
                      value={formData.trim}
                      onChange={e => setFormData({ ...formData, trim: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" />Odometer (km)
                    </Label>
                    <Input
                      data-testid="input-kilometers"
                      type="number"
                      placeholder="e.g. 85000"
                      value={formData.kilometers}
                      onChange={e => setFormData({ ...formData, kilometers: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Body Type</Label>
                    <Select value={formData.bodyType} onValueChange={val => setFormData({ ...formData, bodyType: val.toLowerCase() })}>
                      <SelectTrigger data-testid="select-trigger-body" className="bg-slate-800/50 border-slate-700 text-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {BODY_TYPES.map(type => (
                          <SelectItem key={type} value={type.toLowerCase()} className="text-white hover:bg-slate-700">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block flex items-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5" />Transmission
                    </Label>
                    <Select value={formData.transmission} onValueChange={val => setFormData({ ...formData, transmission: val })}>
                      <SelectTrigger data-testid="select-trigger-transmission" className="bg-slate-800/50 border-slate-700 text-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TRANSMISSIONS.map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />Province
                    </Label>
                    <Select value={formData.province} onValueChange={val => setFormData({ ...formData, province: val })}>
                      <SelectTrigger data-testid="select-trigger-province" className="bg-slate-800/50 border-slate-700 text-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-[300px]">
                        {PROVINCES.map(p => (
                          <SelectItem key={p.code} value={p.code} className="text-white hover:bg-slate-700">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </GlowCard>

            <GlowCard>
              <div className="p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Condition & History</h2>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <Label className="text-slate-400 text-xs mb-3 block">Carsellia Grade</Label>
                  <ConditionSelector value={conditionData.naagGrade} onChange={grade => setConditionData(prev => ({ ...prev, naagGrade: grade }))} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Title Status</Label>
                    <Select value={historyData.titleType} onValueChange={val => setHistoryData(prev => ({ ...prev, titleType: val }))}>
                      <SelectTrigger data-testid="select-trigger-title" className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TITLE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block">Accident History</Label>
                    <Select value={historyData.accidentLevel} onValueChange={val => setHistoryData(prev => ({ ...prev, accidentLevel: val }))}>
                      <SelectTrigger data-testid="select-trigger-accident" className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {ACCIDENT_LEVELS.map(a => (
                          <SelectItem key={a.value} value={a.value} className="text-white hover:bg-slate-700">{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 block flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />Previous Owners
                    </Label>
                    <Select value={historyData.ownerCount.toString()} onValueChange={val => setHistoryData(prev => ({ ...prev, ownerCount: parseInt(val) }))}>
                      <SelectTrigger data-testid="select-trigger-owners" className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={n.toString()} className="text-white hover:bg-slate-700">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: "previousRental", label: "Previous Rental" },
                    { key: "previousTaxi", label: "Taxi/Rideshare" },
                    { key: "missingServiceRecords", label: "Missing Records" },
                    { key: "bcAlbertaHistory", label: "BC/AB History" }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setHistoryData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      data-testid={`button-${item.key}`}
                      className={cn(
                        "p-3 rounded-xl border transition-all text-left text-sm",
                        historyData[item.key as keyof typeof historyData]
                          ? item.key === "bcAlbertaHistory" 
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                          : "border-slate-700 bg-slate-800/30 text-slate-400"
                      )}
                    >
                      {historyData[item.key as keyof typeof historyData] ? <CheckCircle className="w-4 h-4 mb-1" /> : <XCircle className="w-4 h-4 mb-1 opacity-50" />}
                      <span className="block">{item.label}</span>
                    </button>
                  ))}
                </div>

                <Collapsible open={mechanicalOpen} onOpenChange={setMechanicalOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-800" data-testid="button-mechanical-toggle">
                      <span className="flex items-center gap-2"><Wrench className="w-4 h-4" />Mechanical Inspection</span>
                      {mechanicalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400 text-xs mb-2 block">Brake Pad Thickness (mm)</Label>
                        <Slider
                          value={[conditionData.brakePadThickness]}
                          onValueChange={([val]) => setConditionData(prev => ({ ...prev, brakePadThickness: val }))}
                          min={0} max={10} step={1}
                          className="w-full"
                          data-testid="slider-brake"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0mm</span>
                          <span className={conditionData.brakePadThickness < 2 ? "text-rose-400" : conditionData.brakePadThickness < 3 ? "text-amber-400" : "text-emerald-400"}>
                            {conditionData.brakePadThickness}mm
                          </span>
                          <span>10mm</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-2 block">Tire Tread Depth (mm)</Label>
                        <Slider
                          value={[conditionData.tireTreadDepth]}
                          onValueChange={([val]) => setConditionData(prev => ({ ...prev, tireTreadDepth: val }))}
                          min={0} max={10} step={1}
                          className="w-full"
                          data-testid="slider-tire"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0mm</span>
                          <span className={conditionData.tireTreadDepth < 4 ? "text-rose-400" : conditionData.tireTreadDepth < 5 ? "text-amber-400" : "text-emerald-400"}>
                            {conditionData.tireTreadDepth}mm
                          </span>
                          <span>10mm</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { key: "checkEngineLight", label: "Check Engine", icon: AlertTriangle },
                        { key: "roughIdle", label: "Rough Idle", icon: AlertTriangle },
                        { key: "excessiveSmoke", label: "Smoke", icon: FileWarning },
                        { key: "transmissionSlipping", label: "Trans Slip", icon: FileWarning }
                      ].map(item => (
                        <button
                          key={item.key}
                          onClick={() => setConditionData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                          data-testid={`button-${item.key}`}
                          className={cn(
                            "p-3 rounded-xl border transition-all text-center text-xs",
                            conditionData[item.key as keyof typeof conditionData]
                              ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                              : "border-slate-700 bg-slate-800/30 text-slate-400"
                          )}
                        >
                          <item.icon className="w-4 h-4 mx-auto mb-1" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-800" data-testid="button-advanced-toggle">
                      <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" />Business Settings</span>
                      {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-slate-400 text-xs mb-1.5 block">Reconditioning ($)</Label>
                        <Input
                          type="number"
                          placeholder="Auto"
                          value={reconditioning ?? ""}
                          onChange={e => setReconditioning(e.target.value ? parseInt(e.target.value) : null)}
                          className="bg-slate-800/50 border-slate-700 text-white"
                          data-testid="input-reconditioning"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1.5 block">Profit Override ($)</Label>
                        <Input
                          type="number"
                          placeholder="Auto"
                          value={profitOverride ?? ""}
                          onChange={e => setProfitOverride(e.target.value ? parseInt(e.target.value) : null)}
                          className="bg-slate-800/50 border-slate-700 text-white"
                          data-testid="input-profit"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1.5 block">Profit Margin %</Label>
                        <Input
                          type="number"
                          value={businessSettings.profitMarginPercent}
                          onChange={e => setBusinessSettings(prev => ({ ...prev, profitMarginPercent: parseInt(e.target.value) || 15 }))}
                          className="bg-slate-800/50 border-slate-700 text-white"
                          data-testid="input-margin-percent"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1.5 block">Holding Days</Label>
                        <Input
                          type="number"
                          value={businessSettings.estimatedHoldingDays}
                          onChange={e => setBusinessSettings(prev => ({ ...prev, estimatedHoldingDays: parseInt(e.target.value) || 10 }))}
                          className="bg-slate-800/50 border-slate-700 text-white"
                          data-testid="input-holding-days"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </GlowCard>

            {appraisal && appraisal.adjustments.length > 0 && (
              <GlowCard>
                <div className="p-5 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-white">Value Adjustments</h2>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-2">
                    {appraisal.adjustments.map((adj, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                        <span className="text-slate-300 text-sm">{adj.label}</span>
                        <span className={cn("font-medium", adj.type === "add" ? "text-emerald-400" : "text-rose-400")}>
                          {adj.type === "add" ? "+" : "-"}${Math.round(adj.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            )}
          </div>

          <div className="space-y-6">
            {isCalculating ? (
              <GlowCard glow className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse" />
                    <Brain className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-white font-medium mb-1">AI Analyzing Vehicle</p>
                  <p className="text-slate-400 text-sm">Processing market data...</p>
                </div>
              </GlowCard>
            ) : appraisal ? (
              <>
                <GlowCard glow>
                  <div className="p-5 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-violet-400" />
                        <h2 className="text-lg font-semibold text-white">AI Valuation</h2>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs">
                        <Sparkles className="w-3 h-3" />
                        {appraisal.aiConfidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className={cn(
                      "p-4 rounded-xl border-2 text-center",
                      decisionColors[appraisal.decision].bg,
                      decisionColors[appraisal.decision].border
                    )}>
                      <p className="text-slate-400 text-xs mb-1">Recommendation</p>
                      <p className={cn("text-2xl font-bold uppercase", decisionColors[appraisal.decision].text)}>
                        {appraisal.decision === "buy" ? "Buy" : appraisal.decision === "wholesale" ? "Wholesale" : "Reject"}
                      </p>
                      {appraisal.decisionReasons.length > 0 && (
                        <p className="text-slate-400 text-xs mt-2">{appraisal.decisionReasons[0]}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                        <p className="text-slate-400 text-xs mb-1">Retail Value</p>
                        <p className="text-2xl font-bold text-emerald-400">${Math.round(appraisal.retailValue).toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">Wholesale Value</p>
                        <p className="text-xl font-bold text-white">${Math.round(appraisal.wholesaleValue).toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                        <p className="text-slate-400 text-xs mb-1">Trade-In Range</p>
                        <p className="text-xl font-bold text-blue-400">
                          ${Math.round(appraisal.tradeInLow).toLocaleString()} - ${Math.round(appraisal.tradeInHigh).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlowCard>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Reconditioning" value={`$${Math.round(appraisal.reconditioning).toLocaleString()}`} icon={Settings2} color="amber" />
                  <StatCard label="Profit Target" value={`$${Math.round(appraisal.profitMargin).toLocaleString()}`} icon={TrendingUp} color="green" />
                  <StatCard label="Market Comps" value={appraisal.similarCars.length.toString()} icon={BarChart3} color="blue" />
                </div>

                {appraisal.similarCars.length > 0 && (
                  <GlowCard>
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-medium text-white">Market Comparables</h3>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {appraisal.similarCars.slice(0, 3).map(car => (
                        <div key={car.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                          <div>
                            <p className="text-white text-sm">{car.year} {car.make} {car.model}</p>
                            <p className="text-slate-400 text-xs">{parseInt(car.kilometers).toLocaleString()} km</p>
                          </div>
                          <p className="text-emerald-400 font-medium">${parseInt(car.price).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAppraise}
                    data-testid="button-refresh"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline"
                    data-testid="button-export"
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </>
            ) : (
              <GlowCard className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                    <CarIcon className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Enter Vehicle Details</h3>
                  <p className="text-slate-400 text-sm">Fill in the vehicle information to get an AI-powered valuation</p>
                </div>
              </GlowCard>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-slate-500 text-xs">
            Carsellia AI • Canadian Market Intelligence • NAAA Grading • Regional Pricing
          </p>
        </div>
      </div>
    </div>
  );
}
