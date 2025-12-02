import { useState, useMemo } from "react";
import { useCars, type Car } from "@/lib/api-hooks";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  Car as CarIcon, 
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Wrench,
  Info,
  Minus,
  Plus,
  Loader2,
  MapPin,
  Gauge,
  Shield,
  Users,
  FileText,
  Sparkles,
  Settings2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { decodeVIN } from "@/lib/nhtsa";

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

const NAAA_GRADES = [
  { grade: 5, label: "Excellent", description: "Only minor chips; original finish; no tears, burns, or odors; all systems functional", reconditionLow: 500, reconditionHigh: 1000, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
  { grade: 4, label: "Good", description: "Minor scratches/chips; may need PDR or minor touch-up; minimal interior wear", reconditionLow: 1000, reconditionHigh: 1500, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { grade: 3, label: "Fair", description: "Normal wear including parking dings, small scratches, minor interior wear", reconditionLow: 1500, reconditionHigh: 2500, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  { grade: 2, label: "Poor", description: "Multiple dents, scratches; panels may need replacement; interior burns/tears", reconditionLow: 2500, reconditionHigh: 4000, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { grade: 1, label: "Very Poor", description: "Severe abuse or major collision damage; cost-prohibitive reconditioning", reconditionLow: 4000, reconditionHigh: 6000, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  { grade: 0, label: "Inoperative", description: "Non-running; parts missing; suitable only for salvage", reconditionLow: 0, reconditionHigh: 0, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-950/30" }
];

const SIMPLE_CONDITIONS = [
  { value: "excellent", label: "Excellent", grade: 5, icon: Sparkles, description: "Like new, minimal wear" },
  { value: "good", label: "Good", grade: 4, icon: CheckCircle, description: "Normal wear, well maintained" },
  { value: "fair", label: "Fair", grade: 3, icon: Info, description: "Some scratches or dings" },
  { value: "poor", label: "Poor", grade: 2, icon: AlertTriangle, description: "Noticeable damage or wear" }
];

const REGIONAL_MULTIPLIERS: Record<string, number> = {
  "BC": 1.12,
  "AB": 1.09,
  "SK": 1.05,
  "MB": 1.05,
  "ON": 0.99,
  "QC": 0.92,
  "NB": 0.91,
  "NS": 0.91,
  "NL": 0.91,
  "PE": 0.91,
  "NT": 1.00,
  "NU": 1.00,
  "YT": 1.00
};

const SEASONAL_FACTORS: Record<number, number> = {
  1: 0.965, 2: 0.965,
  3: 1.025, 4: 1.025,
  5: 1.005, 6: 1.005,
  7: 0.99, 8: 0.99,
  9: 0.975, 10: 0.975,
  11: 0.97, 12: 0.97
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

const RECONDITIONING_COSTS = {
  brakes: {
    padsOnly: { low: 100, high: 300, label: "Brake Pads Only (per axle)" },
    padsRotors: { low: 250, high: 600, label: "Pads + Rotors (per axle)" },
    completeJob: { low: 400, high: 800, label: "Complete Brake Job" }
  },
  tires: {
    economy: { low: 400, high: 600, label: "Economy Set (4)" },
    midRange: { low: 600, high: 1000, label: "Mid-Range Set (4)" },
    suvTruck: { low: 750, high: 1300, label: "SUV/Truck Set (4)" }
  },
  glass: {
    chipRepair: { low: 50, high: 150, label: "Chip Repair" },
    windshield: { low: 200, high: 500, label: "Windshield Replacement" },
    adasWindshield: { low: 500, high: 1000, label: "Windshield with ADAS" }
  },
  paintBody: {
    touchUp: { low: 200, high: 500, label: "Touch-up/Scratch Repair" },
    bumper: { low: 1000, high: 2000, label: "Bumper Respray" },
    fullPanel: { low: 500, high: 1200, label: "Full Panel Repaint" },
    pdr: { low: 100, high: 300, label: "PDR (per dent)" }
  },
  interior: {
    basicDetail: { low: 100, high: 150, label: "Basic Detail" },
    fullDetail: { low: 200, high: 400, label: "Full Detail with Extraction" },
    smokeOdor: { low: 50, high: 100, label: "Smoke/Odor Treatment" },
    seatRepair: { low: 100, high: 500, label: "Seat Tear Repair" }
  },
  mechanical: {
    oilChange: { low: 40, high: 120, label: "Oil Change + Fluids" },
    battery: { low: 100, high: 400, label: "Battery Replacement" },
    alternator: { low: 400, high: 1000, label: "Alternator" },
    safetyInspection: { low: 50, high: 150, label: "Safety Inspection" }
  }
};

const TITLE_TYPES = [
  { value: "clean", label: "Clean Title", deduction: 0 },
  { value: "rebuilt", label: "Rebuilt Title", deduction: 0.30 },
  { value: "salvage", label: "Salvage Title", deduction: 1.0 },
  { value: "flood", label: "Flood Title", deduction: 1.0 },
  { value: "irreparable", label: "Irreparable Title", deduction: 1.0 }
];

const ACCIDENT_LEVELS = [
  { value: "none", label: "No Accidents", deduction: 0 },
  { value: "cosmetic", label: "Cosmetic Only (<$3,000)", deduction: 0.075 },
  { value: "minor", label: "Minor Panel Damage", deduction: 0.10 },
  { value: "moderate", label: "Moderate ($3,000-$10,000)", deduction: 0.125 },
  { value: "major", label: "Major Structural (>$10,000)", deduction: 0.20 },
  { value: "severe", label: "Severe (Rebuilt/Rollover)", deduction: 0.35 }
];

const RUST_LEVELS = [
  { value: "none", label: "No Rust", costLow: 0, costHigh: 0 },
  { value: "surface", label: "Surface Rust (paint-level)", costLow: 100, costHigh: 500 },
  { value: "scale", label: "Scale Rust (bubbling paint)", costLow: 300, costHigh: 1000 },
  { value: "penetrating", label: "Penetrating Rust (through-body)", costLow: 1000, costHigh: 5000 }
];

type DecisionType = "buy" | "wholesale" | "reject";

interface AppraisalResult {
  decision: DecisionType;
  decisionReasons: string[];
  retailValue: number;
  wholesaleValue: number;
  tradeInOffer: number;
  tradeInLow: number;
  tradeInHigh: number;
  adjustments: {
    label: string;
    amount: number;
    type: "add" | "subtract" | "multiply";
  }[];
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
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 16 }, (_, i) => currentYear - i);

export default function AppraisalPage() {
  const { data: allCars = [] } = useCars();
  const { toast } = useToast();
  const { isAdmin, isDataAnalyst } = useAuth();
  const canSeeValuations = isAdmin || isDataAnalyst;
  
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
    province: "ON"
  });

  const [simpleCondition, setSimpleCondition] = useState<string>("good");
  const [hasAccidents, setHasAccidents] = useState(false);
  const [hasCleanTitle, setHasCleanTitle] = useState(true);
  const [isOriginalOwner, setIsOriginalOwner] = useState(true);
  
  const [conditionData, setConditionData] = useState({
    naagGrade: 4,
    brakePadThickness: 4,
    tireTreadDepth: 5,
    checkEngineLight: false,
    roughIdle: false,
    excessiveSmoke: false,
    transmissionSlipping: false,
    rustLevel: "none"
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

  const [reconditioningItems, setReconditioningItems] = useState<{
    category: string;
    item: string;
    cost: number;
    quantity: number;
  }[]>([]);

  const [businessSettings, setBusinessSettings] = useState({
    profitMarginPercent: 15,
    holdingCostPerDay: 50,
    estimatedHoldingDays: 10,
    safetyBufferPercent: 12
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [showComparables, setShowComparables] = useState(false);
  
  const [appraisal, setAppraisal] = useState<AppraisalResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const mapSimpleCondition = (condition: string): number => {
    const mapping: Record<string, number> = {
      excellent: 5,
      good: 4,
      fair: 3,
      poor: 2
    };
    return mapping[condition] || 4;
  };

  const syncSimpleToAdvanced = () => {
    const grade = mapSimpleCondition(simpleCondition);
    setConditionData(prev => ({ ...prev, naagGrade: grade }));
    
    setHistoryData(prev => ({
      ...prev,
      titleType: hasCleanTitle ? "clean" : "rebuilt",
      accidentLevel: hasAccidents ? "minor" : "none",
      accidentCount: hasAccidents ? 1 : 0,
      ownerCount: isOriginalOwner ? 1 : 2
    }));
  };

  const handleDecodeVin = async () => {
    if (!formData.vin || formData.vin.length < 11) {
      toast({ title: "Invalid VIN", description: "Please enter a valid 17-character VIN", variant: "destructive" });
      return;
    }
    setIsDecoding(true);
    try {
      const result = await decodeVIN(formData.vin);
      if (result.error) throw new Error(result.error);
      
      let normalizedMake = result.make || "";
      if (normalizedMake) {
        const matchedMake = POPULAR_MAKES.find(m => m.toLowerCase() === normalizedMake.toLowerCase());
        if (matchedMake) normalizedMake = matchedMake;
      }
      
      const decoded: any = {
        make: normalizedMake,
        model: result.model || "",
        year: result.year || "",
        engineCylinders: result.engineCylinders || "",
        engineDisplacement: result.engineDisplacement || "",
        trim: result.trim || "",
      };

      if (result.transmission) {
        const trans = result.transmission.toLowerCase();
        if (trans.includes("auto") || trans.includes("cvt")) decoded.transmission = "automatic";
        else if (trans.includes("manual") || trans.includes("stick")) decoded.transmission = "manual";
      }

      if (result.fuelType) {
        const fuel = result.fuelType.toLowerCase();
        if (fuel.includes("gas")) decoded.fuelType = "gasoline";
        else if (fuel.includes("diesel")) decoded.fuelType = "diesel";
        else if (fuel.includes("electric")) decoded.fuelType = "electric";
        else if (fuel.includes("hybrid")) decoded.fuelType = "hybrid";
      }

      if (result.driveType) {
        const drive = result.driveType.toLowerCase();
        if (drive.includes("awd") || drive.includes("all")) decoded.drivetrain = "awd";
        else if (drive.includes("4wd") || drive.includes("4-wheel")) decoded.drivetrain = "4wd";
        else if (drive.includes("rwd") || drive.includes("rear")) decoded.drivetrain = "rwd";
        else if (drive.includes("fwd") || drive.includes("front")) decoded.drivetrain = "fwd";
      }

      if (result.bodyClass) {
        const body = result.bodyClass.toLowerCase();
        if (body.includes("sedan")) decoded.bodyType = "sedan";
        else if (body.includes("suv") || body.includes("sport utility")) decoded.bodyType = "suv";
        else if (body.includes("truck") || body.includes("pickup")) decoded.bodyType = "truck";
        else if (body.includes("van") || body.includes("minivan")) decoded.bodyType = "van";
        else if (body.includes("coupe")) decoded.bodyType = "coupe";
        else if (body.includes("hatch")) decoded.bodyType = "hatchback";
        else if (body.includes("convert")) decoded.bodyType = "convertible";
      }

      if (!decoded.make && !decoded.model) throw new Error("Could not decode vehicle details");

      setFormData(prev => ({ ...prev, ...decoded }));
      toast({ 
        title: "VIN Decoded", 
        description: `${decoded.year} ${decoded.make} ${decoded.model}${decoded.trim ? ` ${decoded.trim}` : ''}` 
      });
    } catch (error) {
      toast({ 
        title: "Decoding Failed", 
        description: error instanceof Error ? error.message : "Could not fetch vehicle details.", 
        variant: "destructive" 
      });
    } finally {
      setIsDecoding(false);
    }
  };

  const addReconditioningItem = (category: string, item: string, avgCost: number) => {
    setReconditioningItems(prev => [...prev, { category, item, cost: avgCost, quantity: 1 }]);
  };

  const removeReconditioningItem = (index: number) => {
    setReconditioningItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateReconditioningCost = (index: number, cost: number) => {
    setReconditioningItems(prev => prev.map((item, i) => i === index ? { ...item, cost } : item));
  };

  const updateReconditioningQuantity = (index: number, quantity: number) => {
    setReconditioningItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const totalReconditioningCost = useMemo(() => {
    const baseCost = reconditioningItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    const rustCost = RUST_LEVELS.find(r => r.value === conditionData.rustLevel);
    const rustAvg = rustCost ? (rustCost.costLow + rustCost.costHigh) / 2 : 0;
    return baseCost + rustAvg;
  }, [reconditioningItems, conditionData.rustLevel]);

  const calculateMileageAdjustment = (baseValue: number, kilometers: number, vehicleAge: number): number => {
    const expectedMileage = vehicleAge * 20000;
    const variance = kilometers - expectedMileage;
    const adjustmentPerKm = 0.02;
    let adjustment = variance * adjustmentPerKm * -1;
    
    const maxPenalty = baseValue * 0.15;
    const maxCredit = baseValue * 0.10;
    
    if (adjustment < -maxPenalty) adjustment = -maxPenalty;
    if (adjustment > maxCredit) adjustment = maxCredit;
    
    return adjustment;
  };

  const calculateDepreciation = (msrp: number, vehicleAge: number, bodyType: string, make: string): number => {
    const depRates = BODY_TYPE_DEPRECIATION[bodyType] || BODY_TYPE_DEPRECIATION["sedan"];
    let value = msrp;
    
    if (vehicleAge >= 1) {
      value = value * (1 - depRates.year1);
    }
    
    for (let year = 2; year <= Math.min(vehicleAge, 5); year++) {
      value = value * (1 - depRates.annual);
    }
    
    for (let year = 6; year <= vehicleAge; year++) {
      value = value * 0.90;
    }
    
    const brandMultiplier = BRAND_MULTIPLIERS[make] || 1.0;
    value = value * brandMultiplier;
    
    return Math.max(value, 0);
  };

  const getSeasonalFactor = (bodyType: string): number => {
    const currentMonth = new Date().getMonth() + 1;
    let baseFactor = SEASONAL_FACTORS[currentMonth] || 1.0;
    
    const isWinterMonth = currentMonth >= 10 || currentMonth <= 3;
    const isSummerMonth = currentMonth >= 5 && currentMonth <= 8;
    
    if (bodyType === "suv" || bodyType === "truck") {
      if (isWinterMonth) baseFactor *= 1.05;
      else baseFactor *= 0.95;
    }
    
    if (bodyType === "convertible") {
      if (isSummerMonth) baseFactor *= 1.10;
      else if (currentMonth >= 11 || currentMonth <= 2) baseFactor *= 0.88;
    }
    
    if (bodyType === "truck" && isWinterMonth) {
      baseFactor *= 1.03;
    }
    
    return baseFactor;
  };

  const evaluateDecision = (): { decision: DecisionType; reasons: string[] } => {
    const reasons: string[] = [];
    const km = parseInt(formData.kilometers) || 0;
    const vehicleAge = formData.year ? new Date().getFullYear() - parseInt(formData.year) : 0;
    
    const effectiveTitleType = showAdvanced ? historyData.titleType : (hasCleanTitle ? "clean" : "rebuilt");
    const effectiveGrade = showAdvanced ? conditionData.naagGrade : mapSimpleCondition(simpleCondition);
    const effectiveAccidentLevel = showAdvanced ? historyData.accidentLevel : (hasAccidents ? "minor" : "none");
    
    if (["salvage", "flood", "irreparable"].includes(effectiveTitleType)) {
      reasons.push(`${TITLE_TYPES.find(t => t.value === effectiveTitleType)?.label} - automatic rejection`);
      return { decision: "reject", reasons };
    }
    if (historyData.odometerTampering) {
      reasons.push("Odometer tampering detected");
      return { decision: "reject", reasons };
    }
    if (historyData.activeRecalls) {
      reasons.push("Active unrepaired safety recalls");
      return { decision: "reject", reasons };
    }
    if (historyData.frameDamage && !historyData.frameDamageRepaired) {
      reasons.push("Unrepaired structural/frame damage");
      return { decision: "reject", reasons };
    }
    if (km > 300000) {
      reasons.push("Mileage exceeds 300,000 km");
      return { decision: "reject", reasons };
    }
    if (vehicleAge > 15 && !historyData.isSpecialtyVehicle) {
      reasons.push("Vehicle age exceeds 15 years (non-specialty)");
      return { decision: "reject", reasons };
    }
    if (historyData.stolenFlag) {
      reasons.push("Stolen vehicle flag on history");
      return { decision: "reject", reasons };
    }
    if (effectiveGrade === 0) {
      reasons.push("Vehicle is inoperative (Grade 0)");
      return { decision: "reject", reasons };
    }
    
    if (km >= 200000 && km <= 300000) {
      reasons.push("High mileage (200,000-300,000 km) - wholesale only");
    }
    if (vehicleAge >= 10 && vehicleAge <= 15) {
      reasons.push("Vehicle age 10-15 years - wholesale consideration");
    }
    if (effectiveTitleType === "rebuilt") {
      reasons.push("Rebuilt title - 20-40% value reduction");
    }
    if ((showAdvanced ? historyData.accidentCount : (hasAccidents ? 1 : 0)) >= 3) {
      reasons.push("Multiple accidents (3+) - wholesale only");
    }
    if (effectiveAccidentLevel === "major" || effectiveAccidentLevel === "severe") {
      reasons.push("Major/severe accident history - wholesale only");
    }
    if (historyData.frameDamageRepaired) {
      reasons.push("Structural damage (repaired) - wholesale only");
    }
    if (conditionData.roughIdle || conditionData.excessiveSmoke || conditionData.transmissionSlipping) {
      reasons.push("Mechanical issues detected - wholesale only");
    }
    if (conditionData.checkEngineLight) {
      reasons.push("Check engine light active - requires diagnosis");
    }
    
    if (reasons.length > 0) {
      return { decision: "wholesale", reasons };
    }
    
    return { decision: "buy", reasons: ["Vehicle passes all retail criteria"] };
  };

  const handleAppraise = async () => {
    if (!formData.make || !formData.model) {
      toast({ title: "Missing Information", description: "Please enter make and model", variant: "destructive" });
      return;
    }

    setIsCalculating(true);
    syncSimpleToAdvanced();

    await new Promise(resolve => setTimeout(resolve, 500));

    const km = parseInt(formData.kilometers) || 0;
    const vehicleAge = formData.year ? new Date().getFullYear() - parseInt(formData.year) : 0;
    const msrp = parseFloat(formData.msrp) || 35000;
    const effectiveGrade = showAdvanced ? conditionData.naagGrade : mapSimpleCondition(simpleCondition);
    
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
    if (mileageAdj !== 0) {
      adjustments.push({
        label: `Mileage adjustment (${km.toLocaleString()} km)`,
        amount: mileageAdj,
        type: mileageAdj > 0 ? "add" : "subtract"
      });
    }
    
    const regionalMult = REGIONAL_MULTIPLIERS[formData.province] || 1.0;
    if (regionalMult !== 1.0) {
      const regionalAdj = baseValue * (regionalMult - 1);
      adjustments.push({
        label: `Regional market (${PROVINCES.find(p => p.code === formData.province)?.name || formData.province})`,
        amount: Math.abs(regionalAdj),
        type: regionalMult > 1 ? "add" : "subtract"
      });
    }
    
    if (historyData.bcAlbertaHistory && ["ON", "QC", "NB", "NS", "NL", "PE"].includes(formData.province)) {
      const bcAbPremium = baseValue * 0.075;
      adjustments.push({
        label: "BC/Alberta history (rust-free)",
        amount: bcAbPremium,
        type: "add"
      });
    }
    
    const seasonalFactor = getSeasonalFactor(formData.bodyType);
    if (seasonalFactor !== 1.0) {
      const seasonalAdj = baseValue * (seasonalFactor - 1);
      adjustments.push({
        label: "Seasonal adjustment",
        amount: Math.abs(seasonalAdj),
        type: seasonalFactor > 1 ? "add" : "subtract"
      });
    }
    
    const effectiveTitle = showAdvanced ? historyData.titleType : (hasCleanTitle ? "clean" : "rebuilt");
    const titleInfo = TITLE_TYPES.find(t => t.value === effectiveTitle);
    if (titleInfo && titleInfo.deduction > 0 && titleInfo.deduction < 1) {
      const titleDeduction = baseValue * titleInfo.deduction;
      adjustments.push({
        label: `Title status (${titleInfo.label})`,
        amount: titleDeduction,
        type: "subtract"
      });
    }
    
    const effectiveAccident = showAdvanced ? historyData.accidentLevel : (hasAccidents ? "minor" : "none");
    const accidentInfo = ACCIDENT_LEVELS.find(a => a.value === effectiveAccident);
    if (accidentInfo && accidentInfo.deduction > 0) {
      const accidentDeduction = baseValue * accidentInfo.deduction;
      adjustments.push({
        label: `Accident history (${accidentInfo.label})`,
        amount: accidentDeduction,
        type: "subtract"
      });
    }
    
    const gradeInfo = NAAA_GRADES.find(g => g.grade === effectiveGrade);
    if (gradeInfo && effectiveGrade < 5) {
      const conditionDeduction = baseValue * ((5 - effectiveGrade) * 0.03);
      adjustments.push({
        label: `Condition (${gradeInfo.label})`,
        amount: conditionDeduction,
        type: "subtract"
      });
    }

    const effectiveOwnerCount = showAdvanced ? historyData.ownerCount : (isOriginalOwner ? 1 : 2);
    if (effectiveOwnerCount > 2) {
      const ownerDeduction = baseValue * ((effectiveOwnerCount - 2) * 0.025);
      adjustments.push({
        label: `Multiple owners (${effectiveOwnerCount})`,
        amount: ownerDeduction,
        type: "subtract"
      });
    }
    
    if (historyData.previousRental) {
      adjustments.push({
        label: "Previous rental",
        amount: baseValue * 0.075,
        type: "subtract"
      });
    }
    if (historyData.previousTaxi) {
      adjustments.push({
        label: "Previous taxi/rideshare",
        amount: baseValue * 0.20,
        type: "subtract"
      });
    }
    if (historyData.missingServiceRecords) {
      adjustments.push({
        label: "Missing service records",
        amount: baseValue * 0.075,
        type: "subtract"
      });
    }
    
    let retailValue = baseValue;
    for (const adj of adjustments) {
      if (adj.type === "add") retailValue += adj.amount;
      else if (adj.type === "subtract") retailValue -= adj.amount;
    }
    
    const gradeRecondition = gradeInfo ? (gradeInfo.reconditionLow + gradeInfo.reconditionHigh) / 2 : 1500;
    let reconditioning = showAdvanced && totalReconditioningCost > 0 ? totalReconditioningCost : gradeRecondition;
    
    // Add mechanical inspection costs if in advanced mode with issues detected
    if (showAdvanced) {
      if (conditionData.brakePadThickness < 2) {
        reconditioning += 850; // Brake replacement: $425 per axle x 2
      }
      if (conditionData.tireTreadDepth < 4) {
        const tireBodyType = formData.bodyType || 'sedan';
        reconditioning += (tireBodyType === 'truck' || tireBodyType === 'suv') ? 1000 : 800;
      }
      if (conditionData.checkEngineLight) {
        reconditioning += 300; // Diagnostic + potential repairs
      }
      if (conditionData.roughIdle || conditionData.excessiveSmoke) {
        reconditioning += 500; // Engine repair estimate
      }
      if (conditionData.transmissionSlipping) {
        reconditioning += 1500; // Transmission repair estimate
      }
    }
    
    const profitMargin = retailValue * (businessSettings.profitMarginPercent / 100);
    const holdingCosts = businessSettings.holdingCostPerDay * businessSettings.estimatedHoldingDays;
    const safetyBuffer = retailValue * (businessSettings.safetyBufferPercent / 100);
    
    const wholesaleValue = retailValue * 0.82;
    const tradeInOffer = wholesaleValue - reconditioning - profitMargin - holdingCosts - safetyBuffer;
    
    const tradeInLow = Math.max(tradeInOffer * 0.92, 0);
    const tradeInHigh = tradeInOffer * 1.08;
    
    const conditionDeduction = baseValue * ((5 - effectiveGrade) * 0.03);
    const accidentDeduction = accidentInfo ? baseValue * accidentInfo.deduction : 0;
    let historyDeductions = 0;
    if (historyData.previousRental) historyDeductions += baseValue * 0.075;
    if (historyData.previousTaxi) historyDeductions += baseValue * 0.20;
    if (historyData.missingServiceRecords) historyDeductions += baseValue * 0.075;
    if (effectiveOwnerCount > 2) historyDeductions += baseValue * ((effectiveOwnerCount - 2) * 0.025);

    setAppraisal({
      decision,
      decisionReasons: reasons,
      retailValue: Math.max(retailValue, 0),
      wholesaleValue: Math.max(wholesaleValue, 0),
      tradeInOffer: Math.max(tradeInOffer, 0),
      tradeInLow: Math.max(tradeInLow, 0),
      tradeInHigh: Math.max(tradeInHigh, 0),
      adjustments,
      reconditioning,
      profitMargin,
      holdingCosts,
      mileageAdjustment: mileageAdj,
      regionalMultiplier: regionalMult,
      seasonalFactor,
      conditionDeduction,
      accidentDeduction,
      historyDeductions,
      similarCars: similar.slice(0, 5)
    });

    setIsCalculating(false);
  };

  const getDecisionBadge = (decision: DecisionType) => {
    switch (decision) {
      case "buy":
        return (
          <Badge className="bg-green-600 text-white text-lg px-4 py-1" data-testid="badge-decision-buy">
            <CheckCircle className="w-4 h-4 mr-2" />
            Buy for Retail
          </Badge>
        );
      case "wholesale":
        return (
          <Badge className="bg-yellow-600 text-white text-lg px-4 py-1" data-testid="badge-decision-wholesale">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Wholesale Only
          </Badge>
        );
      case "reject":
        return (
          <Badge className="bg-red-600 text-white text-lg px-4 py-1" data-testid="badge-decision-reject">
            <XCircle className="w-4 h-4 mr-2" />
            Pass
          </Badge>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
              <Calculator className="w-8 h-8 text-primary" />
              Quick Appraisal
            </h1>
            <p className="text-muted-foreground">Get a trade-in value in 30 seconds</p>
          </div>

          <Card className="shadow-lg" data-testid="card-vehicle-info">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CarIcon className="w-5 h-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="vin" className="text-sm font-medium">VIN (Optional - auto-fills details)</Label>
                <div className="flex gap-2">
                  <Input
                    id="vin"
                    data-testid="input-vin"
                    placeholder="Enter 17-character VIN"
                    value={formData.vin}
                    onChange={e => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    className="font-mono uppercase"
                    maxLength={17}
                  />
                  <Button 
                    onClick={handleDecodeVin} 
                    disabled={isDecoding || formData.vin.length < 11}
                    data-testid="button-decode-vin"
                    variant="secondary"
                  >
                    {isDecoding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Decode</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Select value={formData.make} onValueChange={val => setFormData({ ...formData, make: val })}>
                    <SelectTrigger id="make" data-testid="select-trigger-make">
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_MAKES.map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    data-testid="input-model"
                    placeholder="e.g. Camry, Civic"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={formData.year} onValueChange={val => setFormData({ ...formData, year: val })}>
                    <SelectTrigger id="year" data-testid="select-trigger-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kilometers">Kilometers</Label>
                  <Input
                    id="kilometers"
                    data-testid="input-kilometers"
                    type="number"
                    placeholder="e.g. 85000"
                    value={formData.kilometers}
                    onChange={e => setFormData({ ...formData, kilometers: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Province
                </Label>
                <Select value={formData.province} onValueChange={val => setFormData({ ...formData, province: val })}>
                  <SelectTrigger id="province" data-testid="select-trigger-province">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map(prov => (
                      <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Vehicle Condition
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SIMPLE_CONDITIONS.map(condition => {
                    const Icon = condition.icon;
                    return (
                      <button
                        key={condition.value}
                        type="button"
                        data-testid={`button-condition-${condition.value}`}
                        onClick={() => setSimpleCondition(condition.value)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                          simpleCondition === condition.value
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/50"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5 mb-1",
                          condition.value === "excellent" && "text-green-500",
                          condition.value === "good" && "text-blue-500",
                          condition.value === "fair" && "text-yellow-500",
                          condition.value === "poor" && "text-orange-500"
                        )} />
                        <span className="font-medium text-sm">{condition.label}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{condition.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quick History Check
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Any accidents?</span>
                    </div>
                    <Switch
                      data-testid="switch-accidents"
                      checked={hasAccidents}
                      onCheckedChange={setHasAccidents}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Clean title?</span>
                    </div>
                    <Switch
                      data-testid="switch-clean-title"
                      checked={hasCleanTitle}
                      onCheckedChange={setHasCleanTitle}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Original owner?</span>
                    </div>
                    <Switch
                      data-testid="switch-original-owner"
                      checked={isOriginalOwner}
                      onCheckedChange={setIsOriginalOwner}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAppraise} 
                className="w-full h-12 text-lg font-semibold"
                disabled={isCalculating || !formData.make || !formData.model}
                data-testid="button-appraise"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2" />
                    Appraise Vehicle
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {appraisal && (
            <Card className="shadow-lg border-2 border-primary/20" data-testid="card-appraisal-result">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 mb-6">
                  <div className="flex justify-center mb-4">
                    {getDecisionBadge(appraisal.decision)}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Suggested Trade-In Value</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-trade-in-value">
                        ${Math.round(appraisal.tradeInLow).toLocaleString()} - ${Math.round(appraisal.tradeInHigh).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Best offer: <span className="font-semibold">${Math.round(appraisal.tradeInOffer).toLocaleString()}</span>
                    </p>
                  </div>

                  {appraisal.decisionReasons.length > 0 && appraisal.decision !== "buy" && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      appraisal.decision === "wholesale" ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200" : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200"
                    )}>
                      <p className="font-medium mb-1">Reason:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {appraisal.decisionReasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <Collapsible open={showCalculationDetails} onOpenChange={setShowCalculationDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between" data-testid="button-calculation-details">
                      <span className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        How we calculated this
                      </span>
                      {showCalculationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Estimated Retail Value</span>
                        <span className="font-medium">${Math.round(appraisal.retailValue).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Wholesale Value (82%)</span>
                        <span className="font-medium">${Math.round(appraisal.wholesaleValue).toLocaleString()}</span>
                      </div>
                      
                      {appraisal.adjustments.map((adj, i) => (
                        <div key={i} className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">{adj.label}</span>
                          <span className={cn(
                            "font-medium",
                            adj.type === "add" ? "text-green-600" : "text-red-600"
                          )}>
                            {adj.type === "add" ? "+" : "-"}${Math.round(adj.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Est. Reconditioning</span>
                        <span className="font-medium text-red-600">-${Math.round(appraisal.reconditioning).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Profit Margin ({businessSettings.profitMarginPercent}%)</span>
                        <span className="font-medium text-red-600">-${Math.round(appraisal.profitMargin).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Holding Costs ({businessSettings.estimatedHoldingDays} days)</span>
                        <span className="font-medium text-red-600">-${Math.round(appraisal.holdingCosts).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between py-3 bg-muted/50 rounded-lg px-3 mt-4">
                        <span className="font-semibold">Trade-In Offer</span>
                        <span className="font-bold text-primary">${Math.round(appraisal.tradeInOffer).toLocaleString()}</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {appraisal.similarCars.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <Collapsible open={showComparables} onOpenChange={setShowComparables}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between" data-testid="button-comparables">
                          <span className="flex items-center gap-2">
                            <CarIcon className="w-4 h-4" />
                            Comparable Vehicles ({appraisal.similarCars.length})
                          </span>
                          {showComparables ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <div className="space-y-2">
                          {appraisal.similarCars.map((car, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 text-sm">
                              <div>
                                <span className="font-medium">{car.year} {car.make} {car.model}</span>
                                {car.trim && <span className="text-muted-foreground ml-1">{car.trim}</span>}
                              </div>
                              <span className="font-semibold">${parseFloat(car.price).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <Card className="shadow-md" data-testid="card-advanced-options">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Settings2 className="w-5 h-5" />
                      Advanced Options
                    </span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CardTitle>
                  <CardDescription>Detailed grading, inspection, history, and business settings</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      NAAA Condition Grade (0-5)
                    </Label>
                    <div className="space-y-2">
                      {NAAA_GRADES.map(grade => (
                        <div 
                          key={grade.grade}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            conditionData.naagGrade === grade.grade ? `${grade.bg} border-current ${grade.color}` : "hover:bg-muted/50"
                          )}
                          onClick={() => setConditionData({...conditionData, naagGrade: grade.grade})}
                          data-testid={`button-grade-${grade.grade}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", grade.bg, grade.color)}>
                                {grade.grade}
                              </div>
                              <div>
                                <div className="font-medium">{grade.label}</div>
                                <div className="text-xs text-muted-foreground">{grade.description}</div>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              {grade.grade > 0 && (
                                <div className="text-muted-foreground">
                                  ${grade.reconditionLow.toLocaleString()} - ${grade.reconditionHigh.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Mechanical Inspection
                    </Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="brake-thickness">Brake Pad Thickness (mm)</Label>
                        <span className={cn("text-sm font-medium", conditionData.brakePadThickness >= 2 ? "text-green-600" : "text-red-600")}>
                          {conditionData.brakePadThickness}mm {conditionData.brakePadThickness >= 2 ? "✓ Pass" : "✗ Fail"}
                        </span>
                      </div>
                      <Slider
                        id="brake-thickness"
                        data-testid="slider-brake-thickness"
                        value={[conditionData.brakePadThickness]}
                        onValueChange={([val]) => setConditionData({...conditionData, brakePadThickness: val})}
                        min={0}
                        max={12}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tire-tread">Tire Tread Depth (mm)</Label>
                        <span className={cn("text-sm font-medium", conditionData.tireTreadDepth >= 4 ? "text-green-600" : conditionData.tireTreadDepth >= 2 ? "text-yellow-600" : "text-red-600")}>
                          {conditionData.tireTreadDepth}mm {conditionData.tireTreadDepth >= 4 ? "✓ Good" : conditionData.tireTreadDepth >= 2 ? "⚠ Low" : "✗ Fail"}
                        </span>
                      </div>
                      <Slider
                        id="tire-tread"
                        data-testid="slider-tire-tread"
                        value={[conditionData.tireTreadDepth]}
                        onValueChange={([val]) => setConditionData({...conditionData, tireTreadDepth: val})}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Engine/Transmission Issues</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="check-engine"
                            data-testid="checkbox-check-engine"
                            checked={conditionData.checkEngineLight}
                            onCheckedChange={(checked) => setConditionData({...conditionData, checkEngineLight: !!checked})}
                          />
                          <label htmlFor="check-engine" className="text-sm cursor-pointer">Check Engine Light</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="rough-idle"
                            data-testid="checkbox-rough-idle"
                            checked={conditionData.roughIdle}
                            onCheckedChange={(checked) => setConditionData({...conditionData, roughIdle: !!checked})}
                          />
                          <label htmlFor="rough-idle" className="text-sm cursor-pointer">Rough Idle</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="excessive-smoke"
                            data-testid="checkbox-excessive-smoke"
                            checked={conditionData.excessiveSmoke}
                            onCheckedChange={(checked) => setConditionData({...conditionData, excessiveSmoke: !!checked})}
                          />
                          <label htmlFor="excessive-smoke" className="text-sm cursor-pointer">Excessive Smoke</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="trans-slipping"
                            data-testid="checkbox-trans-slipping"
                            checked={conditionData.transmissionSlipping}
                            onCheckedChange={(checked) => setConditionData({...conditionData, transmissionSlipping: !!checked})}
                          />
                          <label htmlFor="trans-slipping" className="text-sm cursor-pointer">Trans. Slipping</label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Rust Assessment</Label>
                      <Select value={conditionData.rustLevel} onValueChange={val => setConditionData({...conditionData, rustLevel: val})}>
                        <SelectTrigger data-testid="select-trigger-rust">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RUST_LEVELS.map(rust => (
                            <SelectItem key={rust.value} value={rust.value}>
                              {rust.label} {rust.costHigh > 0 && `($${rust.costLow}-$${rust.costHigh})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Full Vehicle History
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title Status</Label>
                        <Select value={historyData.titleType} onValueChange={val => setHistoryData({...historyData, titleType: val})}>
                          <SelectTrigger data-testid="select-trigger-title">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TITLE_TYPES.map(title => (
                              <SelectItem key={title.value} value={title.value}>
                                {title.label} {title.deduction > 0 && title.deduction < 1 && `(-${title.deduction * 100}%)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Accident History</Label>
                        <Select value={historyData.accidentLevel} onValueChange={val => setHistoryData({...historyData, accidentLevel: val})}>
                          <SelectTrigger data-testid="select-trigger-accident">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCIDENT_LEVELS.map(acc => (
                              <SelectItem key={acc.value} value={acc.value}>
                                {acc.label} {acc.deduction > 0 && `(-${(acc.deduction * 100).toFixed(1)}%)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Number of Accidents</Label>
                        <Input 
                          data-testid="input-accident-count"
                          type="number"
                          min={0}
                          value={historyData.accidentCount}
                          onChange={e => setHistoryData({...historyData, accidentCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Owners</Label>
                        <Input 
                          data-testid="input-owner-count"
                          type="number"
                          min={1}
                          value={historyData.ownerCount}
                          onChange={e => setHistoryData({...historyData, ownerCount: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Red Flags</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="odometer-tampering"
                            data-testid="checkbox-odometer-tampering"
                            checked={historyData.odometerTampering}
                            onCheckedChange={(checked) => setHistoryData({...historyData, odometerTampering: !!checked})}
                          />
                          <label htmlFor="odometer-tampering" className="text-sm cursor-pointer text-red-600">Odometer Tampering</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="active-recalls"
                            data-testid="checkbox-active-recalls"
                            checked={historyData.activeRecalls}
                            onCheckedChange={(checked) => setHistoryData({...historyData, activeRecalls: !!checked})}
                          />
                          <label htmlFor="active-recalls" className="text-sm cursor-pointer text-red-600">Active Safety Recalls</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="frame-damage"
                            data-testid="checkbox-frame-damage"
                            checked={historyData.frameDamage}
                            onCheckedChange={(checked) => setHistoryData({...historyData, frameDamage: !!checked})}
                          />
                          <label htmlFor="frame-damage" className="text-sm cursor-pointer text-red-600">Frame/Structural Damage</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="stolen-flag"
                            data-testid="checkbox-stolen-flag"
                            checked={historyData.stolenFlag}
                            onCheckedChange={(checked) => setHistoryData({...historyData, stolenFlag: !!checked})}
                          />
                          <label htmlFor="stolen-flag" className="text-sm cursor-pointer text-red-600">Stolen Vehicle Flag</label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Usage History</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="prev-rental"
                            data-testid="checkbox-prev-rental"
                            checked={historyData.previousRental}
                            onCheckedChange={(checked) => setHistoryData({...historyData, previousRental: !!checked})}
                          />
                          <label htmlFor="prev-rental" className="text-sm cursor-pointer">Previous Rental</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="prev-taxi"
                            data-testid="checkbox-prev-taxi"
                            checked={historyData.previousTaxi}
                            onCheckedChange={(checked) => setHistoryData({...historyData, previousTaxi: !!checked})}
                          />
                          <label htmlFor="prev-taxi" className="text-sm cursor-pointer">Previous Taxi/Rideshare</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="missing-records"
                            data-testid="checkbox-missing-records"
                            checked={historyData.missingServiceRecords}
                            onCheckedChange={(checked) => setHistoryData({...historyData, missingServiceRecords: !!checked})}
                          />
                          <label htmlFor="missing-records" className="text-sm cursor-pointer">Missing Service Records</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="bc-ab-history"
                            data-testid="checkbox-bc-ab-history"
                            checked={historyData.bcAlbertaHistory}
                            onCheckedChange={(checked) => setHistoryData({...historyData, bcAlbertaHistory: !!checked})}
                          />
                          <label htmlFor="bc-ab-history" className="text-sm cursor-pointer text-green-600">BC/Alberta History</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Reconditioning Cost Builder
                    </Label>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Total Reconditioning</span>
                      <Badge variant="outline" className="font-mono text-lg" data-testid="badge-reconditioning-total">
                        ${totalReconditioningCost.toLocaleString()}
                      </Badge>
                    </div>
                    
                    {Object.entries(RECONDITIONING_COSTS).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <Label className="capitalize text-sm">{category.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(items).map(([key, item]) => (
                            <Button
                              key={key}
                              variant="outline"
                              size="sm"
                              className="justify-start text-xs h-auto py-2"
                              onClick={() => addReconditioningItem(category, item.label, (item.low + item.high) / 2)}
                              data-testid={`button-add-recon-${category}-${key}`}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {item.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {reconditioningItems.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Added Items</Label>
                        {reconditioningItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                            <span className="text-sm flex-1">{item.item}</span>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => updateReconditioningQuantity(index, item.quantity - 1)}
                                data-testid={`button-recon-qty-minus-${index}`}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => updateReconditioningQuantity(index, item.quantity + 1)}
                                data-testid={`button-recon-qty-plus-${index}`}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <Input
                              type="number"
                              className="w-20 h-7 text-sm"
                              value={item.cost}
                              onChange={e => updateReconditioningCost(index, parseInt(e.target.value) || 0)}
                              data-testid={`input-recon-cost-${index}`}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500"
                              onClick={() => removeReconditioningItem(index)}
                              data-testid={`button-recon-remove-${index}`}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      Business Settings
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Profit Margin (%)</Label>
                        <Input 
                          data-testid="input-profit-margin"
                          type="number"
                          value={businessSettings.profitMarginPercent}
                          onChange={e => setBusinessSettings({...businessSettings, profitMarginPercent: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Holding Cost ($/day)</Label>
                        <Input 
                          data-testid="input-holding-cost"
                          type="number"
                          value={businessSettings.holdingCostPerDay}
                          onChange={e => setBusinessSettings({...businessSettings, holdingCostPerDay: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Est. Holding Days</Label>
                        <Input 
                          data-testid="input-holding-days"
                          type="number"
                          value={businessSettings.estimatedHoldingDays}
                          onChange={e => setBusinessSettings({...businessSettings, estimatedHoldingDays: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Safety Buffer (%)</Label>
                        <Input 
                          data-testid="input-safety-buffer"
                          type="number"
                          value={businessSettings.safetyBufferPercent}
                          onChange={e => setBusinessSettings({...businessSettings, safetyBufferPercent: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <CarIcon className="w-4 h-4" />
                      Vehicle Details Override
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trim</Label>
                        <Input 
                          data-testid="input-trim"
                          value={formData.trim}
                          onChange={e => setFormData({...formData, trim: e.target.value})}
                          placeholder="e.g. XLE, Sport"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <Select value={formData.bodyType} onValueChange={val => setFormData({...formData, bodyType: val})}>
                          <SelectTrigger data-testid="select-trigger-body-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="coupe">Coupe</SelectItem>
                            <SelectItem value="hatchback">Hatchback</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="convertible">Convertible</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>MSRP Override ($)</Label>
                        <Input 
                          data-testid="input-msrp"
                          type="number"
                          value={formData.msrp}
                          onChange={e => setFormData({...formData, msrp: e.target.value})}
                          placeholder="e.g. 35000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Drivetrain</Label>
                        <Select value={formData.drivetrain} onValueChange={val => setFormData({...formData, drivetrain: val})}>
                          <SelectTrigger data-testid="select-trigger-drivetrain">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fwd">FWD</SelectItem>
                            <SelectItem value="rwd">RWD</SelectItem>
                            <SelectItem value="awd">AWD</SelectItem>
                            <SelectItem value="4wd">4WD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </TooltipProvider>
  );
}
