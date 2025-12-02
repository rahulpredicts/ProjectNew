import { useState, useMemo, useEffect, useCallback } from "react";
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
  Car as CarType,
  Copy,
  Printer,
  FileText,
  Building2,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Store,
  Calendar,
  Hash
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function normalizeBodyType(bodyClass: string | undefined): string {
  if (!bodyClass) return "sedan";
  const lower = bodyClass.toLowerCase();
  if (lower.includes("pickup") || lower.includes("truck")) return "truck";
  if (lower.includes("suv") || lower.includes("sport utility")) return "suv";
  if (lower.includes("sedan") || lower.includes("saloon")) return "sedan";
  if (lower.includes("coupe") || lower.includes("coupé")) return "coupe";
  if (lower.includes("hatchback") || lower.includes("hatch")) return "hatchback";
  if (lower.includes("van") || lower.includes("minivan") || lower.includes("mpv")) return "van";
  if (lower.includes("convertible") || lower.includes("roadster") || lower.includes("cabriolet")) return "convertible";
  if (lower.includes("wagon") || lower.includes("estate")) return "wagon";
  if (lower.includes("crossover")) return "suv";
  return "sedan";
}

function normalizeTransmission(transmission: string | undefined): string {
  if (!transmission) return "automatic";
  const lower = transmission.toLowerCase();
  if (lower.includes("cvt") || lower.includes("continuously variable")) return "cvt";
  if (lower.includes("manual")) return "manual";
  return "automatic";
}

function normalizeDrivetrain(driveType: string | undefined): string {
  if (!driveType) return "fwd";
  const lower = driveType.toLowerCase();
  if (lower.includes("4wd") || lower.includes("4x4") || lower.includes("4-wheel")) return "4wd";
  if (lower.includes("awd") || lower.includes("all-wheel") || lower.includes("all wheel")) return "awd";
  if (lower.includes("rwd") || lower.includes("rear-wheel") || lower.includes("rear wheel")) return "rwd";
  return "fwd";
}

function normalizeFuelType(fuelType: string | undefined): string {
  if (!fuelType) return "gasoline";
  const lower = fuelType.toLowerCase();
  if (lower.includes("diesel")) return "diesel";
  if (lower.includes("electric") && !lower.includes("hybrid")) return "electric";
  if (lower.includes("hybrid") || lower.includes("plug-in")) return "hybrid";
  if (lower.includes("flex") || lower.includes("e85")) return "flex";
  return "gasoline";
}

type DecisionType = "buy" | "wholesale" | "reject";

interface MarketIntelligence {
  totalComparables: number;
  exactMatches: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  priceStdDev: number;
  avgKilometers: number;
  medianKilometers: number;
  minKilometers: number;
  maxKilometers: number;
  avgDaysOnMarket: number;
  dealershipDistribution: { name: string; count: number; avgPrice: number }[];
  pricePerKmAvg: number;
  yearDistribution: { year: string; count: number; avgPrice: number }[];
  trimDistribution: { trim: string; count: number; avgPrice: number }[];
  pricePosition: "below" | "competitive" | "above";
  pricePositionPercent: number;
  recommendedPriceRange: { low: number; high: number };
  marketStrength: "weak" | "moderate" | "strong";
  dataQuality: number;
}

interface ScoredComparable extends Car {
  matchScore: number;
  priceAdjusted: number;
  yearDiff: number;
  kmDiff: number;
  trimMatch: boolean;
  dealershipName?: string;
  daysOnMarket: number;
}

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
  similarCars: ScoredComparable[];
  marketIntelligence: MarketIntelligence;
  aiConfidence: number;
  valuationMethod: "inventory" | "depreciation" | "hybrid";
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

function StatCard({ label, value, subvalue, icon: Icon, trend, color = "blue" }: { 
  label: string; 
  value: string; 
  subvalue?: string;
  icon: any; 
  trend?: "up" | "down" | null;
  color?: "blue" | "green" | "violet" | "amber" | "rose";
}) {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
    violet: "from-violet-500 to-purple-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500"
  };
  
  return (
    <div className="relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden group hover:border-slate-600/50 transition-all">
      <div className={cn("absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 -translate-y-6 translate-x-6 rounded-full blur-xl", colorMap[color])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
          <p className="text-white text-xl font-bold">{value}</p>
          {subvalue && <p className="text-slate-500 text-xs mt-0.5">{subvalue}</p>}
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

function MiniStatCard({ label, value, icon: Icon, color = "slate" }: { 
  label: string; 
  value: string; 
  icon: any;
  color?: "emerald" | "blue" | "amber" | "rose" | "slate";
}) {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    rose: "text-rose-400 bg-rose-500/10",
    slate: "text-slate-400 bg-slate-500/10"
  };
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30">
      <div className={cn("p-1.5 rounded-md", colorClasses[color])}>
        <Icon className="w-3 h-3" />
      </div>
      <div>
        <p className="text-slate-500 text-[10px]">{label}</p>
        <p className="text-white text-xs font-medium">{value}</p>
      </div>
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

function PricePositionBar({ position, percent }: { position: "below" | "competitive" | "above"; percent: number }) {
  const getPositionColor = () => {
    if (position === "below") return "bg-emerald-500";
    if (position === "competitive") return "bg-blue-500";
    return "bg-amber-500";
  };
  
  const getPositionLabel = () => {
    if (position === "below") return "Below Market";
    if (position === "competitive") return "Competitive";
    return "Above Market";
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Market Position</span>
        <span className={cn(
          "font-medium",
          position === "below" ? "text-emerald-400" : position === "competitive" ? "text-blue-400" : "text-amber-400"
        )}>
          {getPositionLabel()}
        </span>
      </div>
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-emerald-500/20" />
          <div className="flex-1 bg-blue-500/20" />
          <div className="flex-1 bg-amber-500/20" />
        </div>
        <div 
          className={cn("absolute h-4 w-1 -top-1 rounded-full shadow-lg", getPositionColor())}
          style={{ left: `${Math.min(Math.max(percent, 2), 98)}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Low</span>
        <span>Market Avg</span>
        <span>High</span>
      </div>
    </div>
  );
}

function ComparableCard({ car, rank }: { car: ScoredComparable; rank: number }) {
  const matchColor = car.matchScore >= 90 ? "emerald" : car.matchScore >= 70 ? "blue" : "amber";
  const domColor = car.daysOnMarket > 60 ? "rose" : car.daysOnMarket > 30 ? "amber" : "emerald";
  
  return (
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            rank === 1 ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-400"
          )}>
            {rank}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{car.year} {car.make} {car.model}</p>
            <p className="text-slate-400 text-xs">{car.trim}</p>
          </div>
        </div>
        <Badge className={cn(
          "text-[10px]",
          matchColor === "emerald" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
          matchColor === "blue" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
          "bg-amber-500/20 text-amber-400 border-amber-500/30"
        )}>
          {car.matchScore}% match
        </Badge>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <MiniStatCard label="Price" value={`$${parseInt(car.price).toLocaleString()}`} icon={DollarSign} color="emerald" />
        <MiniStatCard label="KM" value={`${parseInt(car.kilometers).toLocaleString()}`} icon={Gauge} color="blue" />
        <MiniStatCard label="Year" value={car.yearDiff === 0 ? "Same" : `${car.yearDiff > 0 ? "+" : ""}${car.yearDiff}yr`} icon={Calendar} color="slate" />
        <MiniStatCard label="DOM" value={`${car.daysOnMarket}d`} icon={Clock} color={domColor} />
      </div>
      {car.dealershipName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Store className="w-3 h-3" />
          <span>{car.dealershipName}</span>
        </div>
      )}
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
  const [appraisalNotes, setAppraisalNotes] = useState("");
  
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
  
  const [postalCode, setPostalCode] = useState("");
  const [searchRadius, setSearchRadius] = useState("100");
  const [desiredProfit, setDesiredProfit] = useState<number>(3000);

  const [appraisal, setAppraisal] = useState<AppraisalResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const dealershipMap = useMemo(() => {
    const map: Record<string, string> = {};
    dealerships.forEach(d => { map[d.id] = d.name; });
    return map;
  }, [dealerships]);
  
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

  const loadFromInventory = useCallback((car: Car) => {
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
  }, [toast]);

  const handleDecodeVin = useCallback(async () => {
    if (formData.vin.length < 11) return;
    setIsDecoding(true);
    try {
      const decoded = await decodeVIN(formData.vin);
      if (decoded && !decoded.error) {
        const normalizedBodyType = normalizeBodyType(decoded.bodyClass);
        const normalizedTransmission = normalizeTransmission(decoded.transmission);
        const normalizedDrivetrain = normalizeDrivetrain(decoded.driveType);
        const normalizedFuelType = normalizeFuelType(decoded.fuelType);
        
        setFormData(prev => ({
          ...prev,
          make: decoded.make || prev.make,
          model: decoded.model || prev.model,
          year: decoded.year?.toString() || prev.year,
          trim: decoded.trim || decoded.series || prev.trim,
          bodyType: normalizedBodyType,
          engineCylinders: decoded.engineCylinders || prev.engineCylinders,
          engineDisplacement: decoded.engineDisplacement || prev.engineDisplacement,
          fuelType: normalizedFuelType,
          drivetrain: normalizedDrivetrain,
          transmission: normalizedTransmission
        }));
        
        const details = [decoded.year, decoded.make, decoded.model].filter(Boolean).join(" ");
        toast({ 
          title: "VIN Decoded Successfully", 
          description: details ? `Found: ${details}` : "Vehicle information retrieved"
        });
      } else {
        toast({ 
          title: "Decode failed", 
          description: decoded.error || "Could not decode VIN", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "Decode failed", description: "Could not decode VIN", variant: "destructive" });
    }
    setIsDecoding(false);
  }, [formData.vin, toast]);

  const calculateDepreciation = useCallback((msrp: number, age: number, bodyType: string, make: string): number => {
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
  }, []);

  const calculateMileageAdjustment = useCallback((baseValue: number, km: number, vehicleAge: number): number => {
    const avgAnnualKm = 20000;
    const expectedKm = vehicleAge * avgAnnualKm;
    const kmVariance = km - expectedKm;
    const rawAdjustment = -kmVariance * 0.02;
    const maxAdj = baseValue * 0.20;
    return Math.max(Math.min(rawAdjustment, maxAdj), -maxAdj);
  }, []);

  const getSeasonalFactor = useCallback((bodyType: string): number => {
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
  }, []);

  const calculateMechanicalRecondition = useCallback((): number => {
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
  }, [conditionData]);

  const findAndScoreComparables = useCallback((targetYear: number, targetKm: number, targetTrim: string): ScoredComparable[] => {
    const comparables: ScoredComparable[] = [];
    const now = new Date();
    
    allCars.forEach(car => {
      if (car.make.toLowerCase() !== formData.make.toLowerCase()) return;
      if (car.model.toLowerCase() !== formData.model.toLowerCase()) return;
      
      const carYear = parseInt(car.year);
      const carKm = parseInt(car.kilometers) || 0;
      const yearDiff = carYear - targetYear;
      const kmDiff = carKm - targetKm;
      
      if (Math.abs(yearDiff) > 3) return;
      
      let matchScore = 100;
      matchScore -= Math.abs(yearDiff) * 10;
      matchScore -= Math.min(Math.abs(kmDiff) / 10000, 20);
      
      const trimMatch = targetTrim && car.trim.toLowerCase().includes(targetTrim.toLowerCase());
      if (trimMatch) matchScore += 10;
      if (car.transmission.toLowerCase() === formData.transmission) matchScore += 5;
      if (car.bodyType?.toLowerCase() === formData.bodyType) matchScore += 5;
      
      matchScore = Math.max(0, Math.min(100, matchScore));
      
      const kmAdjustmentPerKm = 0.015;
      const yearAdjustmentPerYear = 0.08;
      let priceAdjusted = parseFloat(car.price);
      
      priceAdjusted += (targetKm - carKm) * kmAdjustmentPerKm;
      priceAdjusted *= Math.pow(1 + yearAdjustmentPerYear, yearDiff);
      
      const daysOnMarket = car.createdAt 
        ? Math.floor((now.getTime() - new Date(car.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      comparables.push({
        ...car,
        matchScore: Math.round(matchScore),
        priceAdjusted: Math.max(0, priceAdjusted),
        yearDiff,
        kmDiff,
        trimMatch: !!trimMatch,
        dealershipName: dealershipMap[car.dealershipId],
        daysOnMarket
      });
    });
    
    return comparables.sort((a, b) => b.matchScore - a.matchScore);
  }, [allCars, formData.make, formData.model, formData.transmission, formData.bodyType, dealershipMap]);

  const calculateMarketIntelligence = useCallback((comparables: ScoredComparable[], targetPrice: number): MarketIntelligence => {
    if (comparables.length === 0) {
      return {
        totalComparables: 0,
        exactMatches: 0,
        avgPrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceStdDev: 0,
        avgKilometers: 0,
        medianKilometers: 0,
        minKilometers: 0,
        maxKilometers: 0,
        avgDaysOnMarket: 0,
        dealershipDistribution: [],
        pricePerKmAvg: 0,
        yearDistribution: [],
        trimDistribution: [],
        pricePosition: "competitive",
        pricePositionPercent: 50,
        recommendedPriceRange: { low: 0, high: 0 },
        marketStrength: "weak",
        dataQuality: 0
      };
    }
    
    const prices = comparables.map(c => parseFloat(c.price)).filter(p => !isNaN(p) && p > 0);
    const adjustedPrices = comparables.map(c => c.priceAdjusted).filter(p => !isNaN(p) && p > 0);
    const kilometers = comparables.map(c => parseInt(c.kilometers)).filter(k => !isNaN(k) && k >= 0);
    const exactMatches = comparables.filter(c => c.matchScore >= 90).length;
    
    if (prices.length === 0) {
      return {
        totalComparables: comparables.length,
        exactMatches,
        avgPrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceStdDev: 0,
        avgKilometers: 0,
        medianKilometers: 0,
        minKilometers: 0,
        maxKilometers: 0,
        avgDaysOnMarket: 0,
        dealershipDistribution: [],
        pricePerKmAvg: 0,
        yearDistribution: [],
        trimDistribution: [],
        pricePosition: "competitive",
        pricePositionPercent: 50,
        recommendedPriceRange: { low: 0, high: 0 },
        marketStrength: "weak",
        dataQuality: 0
      };
    }
    
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const sortedKm = [...kilometers].sort((a, b) => a - b);
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;
    const avgKm = kilometers.length > 0 ? kilometers.reduce((a, b) => a + b, 0) / kilometers.length : 0;
    const medianKm = sortedKm[Math.floor(sortedKm.length / 2)] || 0;
    
    const variance = prices.length > 0 ? prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length : 0;
    const stdDev = Math.sqrt(variance) || 0;
    
    const dealershipCounts: Record<string, { count: number; totalPrice: number; name: string }> = {};
    comparables.forEach(c => {
      const name = c.dealershipName || "Unknown";
      if (!dealershipCounts[c.dealershipId]) {
        dealershipCounts[c.dealershipId] = { count: 0, totalPrice: 0, name };
      }
      dealershipCounts[c.dealershipId].count++;
      dealershipCounts[c.dealershipId].totalPrice += parseFloat(c.price);
    });
    
    const dealershipDistribution = Object.values(dealershipCounts)
      .map(d => ({ name: d.name, count: d.count, avgPrice: d.totalPrice / d.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const yearCounts: Record<string, { count: number; totalPrice: number }> = {};
    comparables.forEach(c => {
      if (!yearCounts[c.year]) yearCounts[c.year] = { count: 0, totalPrice: 0 };
      yearCounts[c.year].count++;
      yearCounts[c.year].totalPrice += parseFloat(c.price);
    });
    const yearDistribution = Object.entries(yearCounts)
      .map(([year, data]) => ({ year, count: data.count, avgPrice: data.totalPrice / data.count }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));
    
    const trimCounts: Record<string, { count: number; totalPrice: number }> = {};
    comparables.forEach(c => {
      const trim = c.trim || "Base";
      if (!trimCounts[trim]) trimCounts[trim] = { count: 0, totalPrice: 0 };
      trimCounts[trim].count++;
      trimCounts[trim].totalPrice += parseFloat(c.price);
    });
    const trimDistribution = Object.entries(trimCounts)
      .map(([trim, data]) => ({ trim, count: data.count, avgPrice: data.totalPrice / data.count }))
      .sort((a, b) => b.count - a.count);
    
    const avgAdjustedPrice = adjustedPrices.length > 0 
      ? adjustedPrices.reduce((a, b) => a + b, 0) / adjustedPrices.length 
      : avgPrice;
    const priceRange = sortedPrices[sortedPrices.length - 1] - sortedPrices[0];
    const pricePositionPercent = priceRange > 0 
      ? ((targetPrice - sortedPrices[0]) / priceRange) * 100 
      : 50;
    
    let pricePosition: "below" | "competitive" | "above" = "competitive";
    if (targetPrice < avgAdjustedPrice * 0.95) pricePosition = "below";
    else if (targetPrice > avgAdjustedPrice * 1.05) pricePosition = "above";
    
    const recommendedLow = avgAdjustedPrice * 0.92;
    const recommendedHigh = avgAdjustedPrice * 1.08;
    
    let marketStrength: "weak" | "moderate" | "strong" = "weak";
    if (comparables.length >= 10 && exactMatches >= 3) marketStrength = "strong";
    else if (comparables.length >= 5) marketStrength = "moderate";
    
    const dataQuality = Math.min(100, (comparables.length * 5) + (exactMatches * 10));
    
    const daysOnMarketValues = comparables.map(c => c.daysOnMarket).filter(d => d > 0);
    const avgDaysOnMarket = daysOnMarketValues.length > 0 
      ? Math.round(daysOnMarketValues.reduce((a, b) => a + b, 0) / daysOnMarketValues.length)
      : 0;
    const pricePerKmAvg = avgKm > 0 ? avgPrice / avgKm : 0;
    
    return {
      totalComparables: comparables.length,
      exactMatches,
      avgPrice,
      medianPrice,
      minPrice: sortedPrices[0],
      maxPrice: sortedPrices[sortedPrices.length - 1],
      priceStdDev: stdDev,
      avgKilometers: avgKm,
      medianKilometers: medianKm,
      minKilometers: sortedKm[0],
      maxKilometers: sortedKm[sortedKm.length - 1],
      avgDaysOnMarket,
      dealershipDistribution,
      pricePerKmAvg,
      yearDistribution,
      trimDistribution,
      pricePosition,
      pricePositionPercent: Math.max(0, Math.min(100, pricePositionPercent)),
      recommendedPriceRange: { low: recommendedLow, high: recommendedHigh },
      marketStrength,
      dataQuality
    };
  }, []);

  const evaluateDecision = useCallback((): { decision: DecisionType; reasons: string[] } => {
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
  }, [formData.kilometers, formData.year, historyData, conditionData.naagGrade, conditionData.excessiveSmoke, conditionData.transmissionSlipping]);

  const handleAppraise = useCallback(async () => {
    if (!formData.make || !formData.model) return;
    setIsCalculating(true);

    const km = parseInt(formData.kilometers) || 0;
    const vehicleAge = formData.year ? currentYear - parseInt(formData.year) : 0;
    const targetYear = parseInt(formData.year) || currentYear;
    const msrp = parseFloat(formData.msrp) || 35000;
    const effectiveGrade = conditionData.naagGrade;
    
    const { decision, reasons } = evaluateDecision();
    
    const scoredComparables = findAndScoreComparables(targetYear, km, formData.trim);
    const topComparables = scoredComparables.slice(0, 20);
    
    let baseValue: number;
    let valuationMethod: "inventory" | "depreciation" | "hybrid" = "depreciation";
    
    if (topComparables.length >= 3) {
      const highQualityComps = topComparables.filter(c => c.matchScore >= 70);
      if (highQualityComps.length >= 3) {
        const weightedSum = highQualityComps.slice(0, 10).reduce((sum, c) => {
          const weight = c.matchScore / 100;
          return sum + (c.priceAdjusted * weight);
        }, 0);
        const weightSum = highQualityComps.slice(0, 10).reduce((sum, c) => sum + (c.matchScore / 100), 0);
        baseValue = weightedSum / weightSum;
        valuationMethod = "inventory";
      } else {
        const depValue = calculateDepreciation(msrp, vehicleAge, formData.bodyType, formData.make);
        const invValue = topComparables.slice(0, 5).reduce((sum, c) => sum + c.priceAdjusted, 0) / Math.min(5, topComparables.length);
        baseValue = (depValue * 0.4) + (invValue * 0.6);
        valuationMethod = "hybrid";
      }
    } else {
      baseValue = calculateDepreciation(msrp, vehicleAge, formData.bodyType, formData.make);
      valuationMethod = "depreciation";
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
      if (adj.label.startsWith("Mileage") || adj.label.startsWith("High mileage") || adj.label.startsWith("Low mileage")) continue;
      if (adj.type === "add") retailValue += adj.amount;
      else if (adj.type === "subtract") retailValue -= adj.amount;
    }
    
    const gradeRecondition = gradeInfo ? (gradeInfo.reconditionLow + gradeInfo.reconditionHigh) / 2 : 1500;
    const mechanicalCost = calculateMechanicalRecondition();
    const reconditioningCost = reconditioning !== null ? reconditioning : gradeRecondition + mechanicalCost;
    
    const profitMargin = profitOverride !== null ? profitOverride : desiredProfit;
    
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

    const marketIntelligence = calculateMarketIntelligence(topComparables, retailValue);
    
    const dataQualityBonus = Math.min(25, topComparables.length * 2.5);
    const exactMatchBonus = Math.min(15, topComparables.filter(c => c.matchScore >= 90).length * 5);
    const aiConfidence = Math.min(98, 60 + dataQualityBonus + exactMatchBonus);

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
      similarCars: topComparables.slice(0, 10),
      marketIntelligence,
      aiConfidence,
      valuationMethod
    });

    setIsCalculating(false);
  }, [formData, conditionData.naagGrade, historyData, businessSettings, reconditioning, profitOverride, desiredProfit, evaluateDecision, findAndScoreComparables, calculateDepreciation, calculateMileageAdjustment, getSeasonalFactor, calculateMechanicalRecondition, calculateMarketIntelligence]);

  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.year) errors.push("Year is required");
    if (!formData.make) errors.push("Make is required");
    if (!formData.model) errors.push("Model is required");
    if (!formData.kilometers) errors.push("Odometer reading is required");
    if (!formData.bodyType) errors.push("Body type is required");
    if (!formData.transmission) errors.push("Transmission is required");
    
    return { isValid: errors.length === 0, errors };
  }, [formData]);

  const handleAppraisalClick = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast({ 
        title: "Missing Information", 
        description: validation.errors[0],
        variant: "destructive" 
      });
      return;
    }
    await handleAppraise();
  }, [validateForm, handleAppraise, toast]);

  const handleCopyAppraisal = useCallback(() => {
    if (!appraisal) return;
    
    const text = `
CARSELLIA VEHICLE APPRAISAL
===========================
Date: ${new Date().toLocaleDateString()}

VEHICLE INFORMATION
-------------------
${formData.year} ${formData.make} ${formData.model} ${formData.trim}
VIN: ${formData.vin || "N/A"}
Kilometers: ${parseInt(formData.kilometers).toLocaleString()} km
Province: ${PROVINCES.find(p => p.code === formData.province)?.name}
Condition Grade: ${NAAA_GRADES.find(g => g.grade === conditionData.naagGrade)?.label}

VALUATION SUMMARY
-----------------
Retail Value: $${Math.round(appraisal.retailValue).toLocaleString()}
Wholesale Value: $${Math.round(appraisal.wholesaleValue).toLocaleString()}
Trade-In Range: $${Math.round(appraisal.tradeInLow).toLocaleString()} - $${Math.round(appraisal.tradeInHigh).toLocaleString()}

RECOMMENDATION: ${appraisal.decision.toUpperCase()}
${appraisal.decisionReasons.join("\n")}

MARKET INTELLIGENCE
-------------------
Comparables Found: ${appraisal.marketIntelligence.totalComparables}
Market Average: $${Math.round(appraisal.marketIntelligence.avgPrice).toLocaleString()}
Price Range: $${Math.round(appraisal.marketIntelligence.minPrice).toLocaleString()} - $${Math.round(appraisal.marketIntelligence.maxPrice).toLocaleString()}
Data Quality: ${appraisal.marketIntelligence.dataQuality}%

COST BREAKDOWN
--------------
Reconditioning: $${Math.round(appraisal.reconditioning).toLocaleString()}
Profit Margin: $${Math.round(appraisal.profitMargin).toLocaleString()}
Holding Costs: $${Math.round(appraisal.holdingCosts).toLocaleString()}

AI Confidence: ${appraisal.aiConfidence}%
Valuation Method: ${appraisal.valuationMethod}

${appraisalNotes ? `NOTES:\n${appraisalNotes}` : ""}

Generated by Carsellia AI Appraisal System
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Appraisal data copied to clipboard" });
  }, [appraisal, formData, conditionData.naagGrade, appraisalNotes, toast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const decisionColors: Record<DecisionType, { bg: string; text: string; border: string }> = {
    buy: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" },
    wholesale: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
    reject: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 print:bg-white print:text-black">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-20 print:hidden" />
      
      <div className="relative max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Appraisal</h1>
            <AIBadge />
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={inventorySearchOpen} onOpenChange={setInventorySearchOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-load-inventory"
                  className="h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                >
                  <Database className="w-3 h-3 mr-1" />
                  Inventory
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
            <Button 
              onClick={handleAppraisalClick}
              disabled={isCalculating}
              data-testid="button-appraise"
              className={`h-8 text-xs ${validateForm().isValid ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' : 'bg-slate-700 opacity-50'} text-white border-0`}
            >
              {isCalculating ? (
                <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Appraising</>
              ) : (
                <><Zap className="w-3 h-3 mr-1" />Appraise</>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <GlowCard glow>
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <CarIcon className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-white">Vehicle Information</h2>
                  {selectedInventoryCar && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-auto text-[10px]">Inventory</Badge>
                  )}
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-slate-400 text-[10px] mb-1 block">VIN</Label>
                    <div className="flex gap-1.5">
                      <Input
                        data-testid="input-vin"
                        placeholder="17-character VIN"
                        value={formData.vin}
                        onChange={e => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                        className="bg-slate-800/50 border-slate-700 text-white font-mono uppercase h-8 text-xs"
                        maxLength={17}
                      />
                      <Button 
                        onClick={handleDecodeVin} 
                        disabled={isDecoding || formData.vin.length < 11}
                        data-testid="button-decode-vin"
                        className="h-8 px-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 text-xs"
                      >
                        {isDecoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Brain className="w-3 h-3 mr-1" />Decode</>}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Year</Label>
                    <Select value={formData.year} onValueChange={val => setFormData({ ...formData, year: val })}>
                      <SelectTrigger data-testid="select-trigger-year" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-slate-700 text-xs">{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Make</Label>
                    <Select value={formData.make} onValueChange={val => setFormData({ ...formData, make: val })}>
                      <SelectTrigger data-testid="select-trigger-make" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue placeholder="Make" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px]">
                        {POPULAR_MAKES.map(make => (
                          <SelectItem key={make} value={make} className="text-white hover:bg-slate-700 text-xs">{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Model</Label>
                    <Input
                      data-testid="input-model"
                      placeholder="Model"
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Trim</Label>
                    <Input
                      data-testid="input-trim"
                      placeholder="Trim"
                      value={formData.trim}
                      onChange={e => setFormData({ ...formData, trim: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Odometer</Label>
                    <Input
                      data-testid="input-kilometers"
                      type="number"
                      placeholder="km"
                      value={formData.kilometers}
                      onChange={e => setFormData({ ...formData, kilometers: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Body</Label>
                    <Select value={formData.bodyType} onValueChange={val => setFormData({ ...formData, bodyType: val.toLowerCase() })}>
                      <SelectTrigger data-testid="select-trigger-body" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {BODY_TYPES.map(type => (
                          <SelectItem key={type} value={type.toLowerCase()} className="text-white hover:bg-slate-700 text-xs">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Trans</Label>
                    <Select value={formData.transmission} onValueChange={val => setFormData({ ...formData, transmission: val })}>
                      <SelectTrigger data-testid="select-trigger-transmission" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TRANSMISSIONS.map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700 text-xs">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Province</Label>
                    <Select value={formData.province} onValueChange={val => setFormData({ ...formData, province: val })}>
                      <SelectTrigger data-testid="select-trigger-province" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px]">
                        {PROVINCES.map(p => (
                          <SelectItem key={p.code} value={p.code} className="text-white hover:bg-slate-700 text-xs">{p.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700/50">
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Postal</Label>
                    <Input
                      data-testid="input-postal-code"
                      placeholder="M5V1J2"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value.toUpperCase())}
                      className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs uppercase"
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Radius</Label>
                    <Select value={searchRadius} onValueChange={setSearchRadius}>
                      <SelectTrigger data-testid="select-trigger-radius" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="25" className="text-white hover:bg-slate-700 text-xs">25 km</SelectItem>
                        <SelectItem value="50" className="text-white hover:bg-slate-700 text-xs">50 km</SelectItem>
                        <SelectItem value="100" className="text-white hover:bg-slate-700 text-xs">100 km</SelectItem>
                        <SelectItem value="200" className="text-white hover:bg-slate-700 text-xs">200 km</SelectItem>
                        <SelectItem value="500" className="text-white hover:bg-slate-700 text-xs">500 km</SelectItem>
                        <SelectItem value="all" className="text-white hover:bg-slate-700 text-xs">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-400 text-[10px] mb-1 block">Desired Profit ($)</Label>
                    <Input
                      data-testid="input-desired-profit"
                      type="number"
                      placeholder="3000"
                      value={desiredProfit}
                      onChange={e => setDesiredProfit(parseInt(e.target.value) || 0)}
                      className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAppraisalClick}
                  disabled={isCalculating || !validateForm().isValid}
                  data-testid="button-appraise-main"
                  className={`w-full h-10 text-sm font-semibold mt-2 ${validateForm().isValid ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' : 'bg-slate-700'} text-white border-0`}
                >
                  {isCalculating ? (
                    <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Appraising...</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-1.5" />Appraise Vehicle</>
                  )}
                </Button>
              </div>
            </GlowCard>

            <GlowCard>
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">Condition & History</h2>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <Label className="text-slate-400 text-[10px] mb-2 block">Carsellia Grade</Label>
                  <ConditionSelector value={conditionData.naagGrade} onChange={grade => setConditionData(prev => ({ ...prev, naagGrade: grade }))} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Title</Label>
                    <Select value={historyData.titleType} onValueChange={val => setHistoryData(prev => ({ ...prev, titleType: val }))}>
                      <SelectTrigger data-testid="select-trigger-title" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TITLE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700 text-xs">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Accidents</Label>
                    <Select value={historyData.accidentLevel} onValueChange={val => setHistoryData(prev => ({ ...prev, accidentLevel: val }))}>
                      <SelectTrigger data-testid="select-trigger-accident" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {ACCIDENT_LEVELS.map(a => (
                          <SelectItem key={a.value} value={a.value} className="text-white hover:bg-slate-700 text-xs">{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-[10px] mb-1 block">Owners</Label>
                    <Select value={historyData.ownerCount.toString()} onValueChange={val => setHistoryData(prev => ({ ...prev, ownerCount: parseInt(val) }))}>
                      <SelectTrigger data-testid="select-trigger-owners" className="bg-slate-800/50 border-slate-700 text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={n.toString()} className="text-white hover:bg-slate-700 text-xs">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "previousRental", label: "Rental" },
                    { key: "previousTaxi", label: "Taxi" },
                    { key: "missingServiceRecords", label: "No Records" },
                    { key: "bcAlbertaHistory", label: "BC/AB" }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setHistoryData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      data-testid={`button-${item.key}`}
                      className={cn(
                        "p-2 rounded-lg border transition-all text-center text-[10px]",
                        historyData[item.key as keyof typeof historyData]
                          ? item.key === "bcAlbertaHistory" 
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                          : "border-slate-700 bg-slate-800/30 text-slate-400"
                      )}
                    >
                      {historyData[item.key as keyof typeof historyData] ? <CheckCircle className="w-3 h-3 mx-auto mb-0.5" /> : <XCircle className="w-3 h-3 mx-auto mb-0.5 opacity-50" />}
                      {item.label}
                    </button>
                  ))}
                </div>

                <Collapsible open={mechanicalOpen} onOpenChange={setMechanicalOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full h-8 justify-between text-slate-300 hover:text-white hover:bg-slate-800 text-xs" data-testid="button-mechanical-toggle">
                      <span className="flex items-center gap-1.5"><Wrench className="w-3 h-3" />Mechanical</span>
                      {mechanicalOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-400 text-[10px] mb-1 block">Brake Pads (mm)</Label>
                        <Slider
                          value={[conditionData.brakePadThickness]}
                          onValueChange={([val]) => setConditionData(prev => ({ ...prev, brakePadThickness: val }))}
                          min={0} max={10} step={1}
                          className="w-full"
                          data-testid="slider-brake"
                        />
                        <span className={`text-[10px] ${conditionData.brakePadThickness < 2 ? "text-rose-400" : conditionData.brakePadThickness < 3 ? "text-amber-400" : "text-emerald-400"}`}>
                          {conditionData.brakePadThickness}mm
                        </span>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-[10px] mb-1 block">Tire Tread (mm)</Label>
                        <Slider
                          value={[conditionData.tireTreadDepth]}
                          onValueChange={([val]) => setConditionData(prev => ({ ...prev, tireTreadDepth: val }))}
                          min={0} max={10} step={1}
                          className="w-full"
                          data-testid="slider-tire"
                        />
                        <span className={`text-[10px] ${conditionData.tireTreadDepth < 4 ? "text-rose-400" : conditionData.tireTreadDepth < 5 ? "text-amber-400" : "text-emerald-400"}`}>
                          {conditionData.tireTreadDepth}mm
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: "checkEngineLight", label: "CEL", icon: AlertTriangle },
                        { key: "roughIdle", label: "Idle", icon: AlertTriangle },
                        { key: "excessiveSmoke", label: "Smoke", icon: FileWarning },
                        { key: "transmissionSlipping", label: "Trans", icon: FileWarning }
                      ].map(item => (
                        <button
                          key={item.key}
                          onClick={() => setConditionData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                          data-testid={`button-${item.key}`}
                          className={cn(
                            "p-1.5 rounded-lg border transition-all text-center text-[10px]",
                            conditionData[item.key as keyof typeof conditionData]
                              ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                              : "border-slate-700 bg-slate-800/30 text-slate-400"
                          )}
                        >
                          <item.icon className="w-3 h-3 mx-auto mb-0.5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </GlowCard>

            {appraisal && appraisal.adjustments.length > 0 && (
              <GlowCard>
                <div className="p-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-semibold text-white">Adjustments</h2>
                  </div>
                </div>
                <div className="p-3">
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {appraisal.adjustments.map((adj, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-xs border-b border-slate-700/30 last:border-0">
                        <span className="text-slate-300">{adj.label}</span>
                        <span className={cn("font-medium", adj.type === "add" ? "text-emerald-400" : "text-rose-400")}>
                          {adj.type === "add" ? "+" : "-"}${Math.round(adj.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            )}

            {appraisal && appraisal.marketIntelligence.totalComparables > 0 && (
              <GlowCard>
                <div className="p-3 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-400" />
                      <h2 className="text-sm font-semibold text-white">Market</h2>
                    </div>
                    <Badge className={cn(
                      "text-[10px]",
                      appraisal.marketIntelligence.marketStrength === "strong" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      appraisal.marketIntelligence.marketStrength === "moderate" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                      "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    )}>
                      {appraisal.marketIntelligence.marketStrength}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-slate-800/30">
                      <p className="text-[10px] text-slate-400">Comps</p>
                      <p className="text-sm font-bold text-blue-400">{appraisal.marketIntelligence.totalComparables}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/30">
                      <p className="text-[10px] text-slate-400">Exact</p>
                      <p className="text-sm font-bold text-emerald-400">{appraisal.marketIntelligence.exactMatches}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/30">
                      <p className="text-[10px] text-slate-400">Avg $</p>
                      <p className="text-xs font-bold text-emerald-400">{appraisal.marketIntelligence.avgPrice > 0 ? `$${Math.round(appraisal.marketIntelligence.avgPrice/1000)}k` : "N/A"}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/30">
                      <p className="text-[10px] text-slate-400">DOM</p>
                      <p className={cn("text-sm font-bold", appraisal.marketIntelligence.avgDaysOnMarket > 60 ? "text-rose-400" : appraisal.marketIntelligence.avgDaysOnMarket > 30 ? "text-amber-400" : "text-emerald-400")}>
                        {appraisal.marketIntelligence.avgDaysOnMarket}d
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-400 text-[10px]">Price Range</p>
                      <p className="text-white text-xs font-medium">
                        {appraisal.marketIntelligence.minPrice > 0 
                          ? `$${Math.round(appraisal.marketIntelligence.minPrice/1000)}k-$${Math.round(appraisal.marketIntelligence.maxPrice/1000)}k`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-400 text-[10px]">KM Range</p>
                      <p className="text-white text-xs font-medium">
                        {appraisal.marketIntelligence.minKilometers > 0 
                          ? `${Math.round(appraisal.marketIntelligence.minKilometers/1000)}k-${Math.round(appraisal.marketIntelligence.maxKilometers/1000)}k`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <PricePositionBar 
                    position={appraisal.marketIntelligence.pricePosition} 
                    percent={appraisal.marketIntelligence.pricePositionPercent} 
                  />

                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-slate-400 text-[10px]">Recommended Price</p>
                    <p className="text-blue-400 font-bold text-sm">
                      {appraisal.marketIntelligence.recommendedPriceRange.low > 0 
                        ? `$${Math.round(appraisal.marketIntelligence.recommendedPriceRange.low).toLocaleString()} - $${Math.round(appraisal.marketIntelligence.recommendedPriceRange.high).toLocaleString()}`
                        : "N/A"}
                    </p>
                  </div>

                  {appraisal.marketIntelligence.dealershipDistribution.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-[10px] mb-1">Top Dealers</p>
                      <div className="space-y-0.5">
                        {appraisal.marketIntelligence.dealershipDistribution.slice(0, 3).map((d, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                            <div className="flex items-center gap-2">
                              <Store className="w-3 h-3 text-slate-500" />
                              <span className="text-white text-sm">{d.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-xs">{d.count} units</span>
                              <span className="text-emerald-400 text-sm font-medium">${Math.round(d.avgPrice).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlowCard>
            )}

            {appraisal && appraisal.similarCars.length > 0 && (
              <GlowCard>
                <div className="p-3 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-violet-400" />
                      <h2 className="text-sm font-semibold text-white">Comparables</h2>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
                      {appraisal.similarCars.length}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {appraisal.similarCars.slice(0, 6).map((car, i) => (
                      <ComparableCard key={car.id} car={car} rank={i + 1} />
                    ))}
                  </div>
                </div>
              </GlowCard>
            )}

            <GlowCard>
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-white">Notes</h2>
                </div>
              </div>
              <div className="p-3">
                <Textarea
                  placeholder="Add notes..."
                  value={appraisalNotes}
                  onChange={e => setAppraisalNotes(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white text-xs min-h-[60px]"
                  data-testid="textarea-notes"
                />
              </div>
            </GlowCard>
          </div>

          <div className="space-y-3">
            {isCalculating ? (
              <GlowCard glow className="p-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse" />
                    <Brain className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-white font-medium text-sm">Analyzing...</p>
                </div>
              </GlowCard>
            ) : appraisal ? (
              <>
                <GlowCard glow>
                  <div className="p-3 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-violet-400" />
                        <h2 className="text-sm font-semibold text-white">AI Valuation</h2>
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px]">
                        <Sparkles className="w-2.5 h-2.5" />
                        {appraisal.aiConfidence}%
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className={cn(
                      "p-3 rounded-lg border-2 text-center",
                      decisionColors[appraisal.decision].bg,
                      decisionColors[appraisal.decision].border
                    )}>
                      <p className={cn("text-xl font-bold uppercase", decisionColors[appraisal.decision].text)}>
                        {appraisal.decision === "buy" ? "Buy" : appraisal.decision === "wholesale" ? "Wholesale" : "Reject"}
                      </p>
                      {appraisal.decisionReasons.length > 0 && (
                        <p className="text-slate-400 text-[10px] mt-1">{appraisal.decisionReasons[0]}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <Badge className={cn(
                        "text-[10px]",
                        appraisal.valuationMethod === "inventory" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        appraisal.valuationMethod === "hybrid" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      )}>
                        {appraisal.valuationMethod === "inventory" ? "Inventory" : 
                         appraisal.valuationMethod === "hybrid" ? "Hybrid" : "Model"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                        <p className="text-slate-400 text-[10px]">Retail</p>
                        <p className="text-xl font-bold text-emerald-400">${Math.round(appraisal.retailValue).toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-slate-400 text-[10px]">Wholesale</p>
                          <p className="text-sm font-bold text-white">${Math.round(appraisal.wholesaleValue).toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                          <p className="text-slate-400 text-[10px]">Trade-In</p>
                          <p className="text-sm font-bold text-blue-400">
                            ${Math.round(appraisal.tradeInLow/1000)}k-${Math.round(appraisal.tradeInHigh/1000)}k
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlowCard>

                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <Wrench className="w-3 h-3 mx-auto mb-0.5 text-amber-400" />
                    <p className="text-[10px] text-slate-400">Recon</p>
                    <p className="text-xs font-bold text-amber-400">${Math.round(appraisal.reconditioning/1000)}k</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <TrendingUp className="w-3 h-3 mx-auto mb-0.5 text-emerald-400" />
                    <p className="text-[10px] text-slate-400">Profit</p>
                    <p className="text-xs font-bold text-emerald-400">${Math.round(appraisal.profitMargin/1000)}k</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <Database className="w-3 h-3 mx-auto mb-0.5 text-blue-400" />
                    <p className="text-[10px] text-slate-400">Comps</p>
                    <p className="text-xs font-bold text-blue-400">{appraisal.marketIntelligence.totalComparables}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <Clock className="w-3 h-3 mx-auto mb-0.5 text-violet-400" />
                    <p className="text-[10px] text-slate-400">Hold</p>
                    <p className="text-xs font-bold text-violet-400">${Math.round(appraisal.holdingCosts/1000)}k</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAppraise}
                    data-testid="button-refresh"
                    className="flex-1 h-8 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCopyAppraisal}
                    data-testid="button-copy"
                    className="h-8 px-3 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handlePrint}
                    data-testid="button-print"
                    className="h-8 px-3 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Printer className="w-3 h-3" />
                  </Button>
                </div>
              </>
            ) : (
              <GlowCard className="p-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-2">
                    <CarIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">Enter Vehicle</h3>
                  <p className="text-slate-400 text-xs">Fill in details for AI valuation</p>
                </div>
              </GlowCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
