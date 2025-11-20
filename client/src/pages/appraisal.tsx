import { useState, useMemo, useEffect } from "react";
import { useCars, useDealerships, type Car, type Dealership } from "@/lib/api-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Car as CarIcon, 
  AlertCircle, 
  Search,
  ArrowRight,
  MapPin,
  QrCode,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Filter,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { fetchCanadianTrims, getTrimsForMake, CANADIAN_TRIMS, decodeVIN } from "@/lib/nhtsa";

const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

const PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
];

const FEATURES_LIST = [
    "Navigation", "Sunroof/Moonroof", "Leather Seats", "Heated Seats", "Backup Camera", 
    "Bluetooth", "Apple CarPlay", "Android Auto", "Blind Spot Monitor", "Adaptive Cruise Control",
    "Lane Departure Warning", "Third Row Seating", "Tow Package", "Remote Start"
];

export default function AppraisalPage() {
  const { data: dealerships = [] } = useDealerships();
  const { data: allCars = [] } = useCars();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    kilometers: "",
    trim: "",
    transmission: "automatic", // Default or decoded
    fuelType: "gasoline",
    drivetrain: "fwd",
    bodyType: "sedan",
    engineCylinders: "",
    engineDisplacement: "",
    features: [] as string[],
    postalCode: "",
    province: "",
    radius: "50"
  });
  
  const [filterOptions, setFilterOptions] = useState({
      matchTransmission: false,
      matchDrivetrain: false,
      matchFuelType: false
  });

  const [showComparables, setShowComparables] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [appraisal, setAppraisal] = useState<{
    retailLow: number;
    retailHigh: number;
    tradeInLow: number;
    tradeInHigh: number;
    similarCars: any[];
  } | null>(null);

  const [isDecoding, setIsDecoding] = useState(false);
  const [availableTrims, setAvailableTrims] = useState<string[]>([]);
  const [isLoadingTrims, setIsLoadingTrims] = useState(false);

  useEffect(() => {
    const loadTrims = async () => {
        if (formData.make && formData.make !== "Other") {
             setIsLoadingTrims(true);
             
             // 1. Try to get Model specific trims from API if we have year/model
             let trims: string[] = [];
             if (formData.year && formData.model) {
                 trims = await fetchCanadianTrims(formData.year, formData.make, formData.model);
             }
             
             // 2. If no API results, fall back to Make specific trims
             if (trims.length === 0) {
                 trims = getTrimsForMake(formData.make);
             }
             
             setAvailableTrims(trims);
             setIsLoadingTrims(false);
        } else {
            setAvailableTrims(CANADIAN_TRIMS); // Fallback to everything if no make selected
        }
    };
    
    // Debounce slightly to avoid spamming while typing year
    const timer = setTimeout(loadTrims, 500);
    return () => clearTimeout(timer);
  }, [formData.year, formData.make, formData.model]);

  const handleDecodeVin = async () => {
    if (!formData.vin || formData.vin.length < 11) {
        toast({ title: "Invalid VIN", description: "Please enter a valid 17-character VIN", variant: "destructive" });
        return;
    }

    setIsDecoding(true);
    
    try {
        const result = await decodeVIN(formData.vin);

        if (result.error) {
            throw new Error(result.error);
        }
            
        // Normalize Make to match POPULAR_MAKES (case-insensitive)
        let normalizedMake = result.make || "";
        if (normalizedMake) {
            const matchedMake = POPULAR_MAKES.find(m => m.toLowerCase() === normalizedMake.toLowerCase());
            if (matchedMake) {
                normalizedMake = matchedMake;
            }
        }
        
        // Map API response to our form fields
        const decoded: any = {
            make: normalizedMake,
            model: result.model || "",
            year: result.year || "",
            engineCylinders: result.engineCylinders || "",
            engineDisplacement: result.engineDisplacement || "",
            trim: result.trim || "",
        };

        // Try to decode transmission if available
        if (result.transmission) {
            const trans = result.transmission.toLowerCase();
            if (trans.includes("auto") || trans.includes("cvt")) {
                decoded.transmission = "automatic";
            } else if (trans.includes("manual") || trans.includes("stick")) {
                decoded.transmission = "manual";
            }
        }

        // Decode Fuel Type
        if (result.fuelType) {
            const fuel = result.fuelType.toLowerCase();
            if (fuel.includes("gas")) decoded.fuelType = "gasoline";
            else if (fuel.includes("diesel")) decoded.fuelType = "diesel";
            else if (fuel.includes("electric")) decoded.fuelType = "electric";
            else if (fuel.includes("hybrid")) decoded.fuelType = "hybrid";
        }

        // Decode Drivetrain
        if (result.driveType) {
            const drive = result.driveType.toLowerCase();
            if (drive.includes("awd") || drive.includes("all")) decoded.drivetrain = "awd";
            else if (drive.includes("4wd") || drive.includes("4-wheel")) decoded.drivetrain = "4wd";
            else if (drive.includes("rwd") || drive.includes("rear")) decoded.drivetrain = "rwd";
            else if (drive.includes("fwd") || drive.includes("front")) decoded.drivetrain = "fwd";
        }

        // Decode Body Type
        if (result.bodyClass) {
            const body = result.bodyClass.toLowerCase();
            if (body.includes("sedan")) decoded.bodyType = "sedan";
            else if (body.includes("suv") || body.includes("sport utility")) decoded.bodyType = "suv";
            else if (body.includes("truck") || body.includes("pickup")) decoded.bodyType = "truck";
            else if (body.includes("van") || body.includes("minivan")) decoded.bodyType = "van";
            else if (body.includes("coupe")) decoded.bodyType = "coupe";
            else if (body.includes("hatch")) decoded.bodyType = "hatchback";
        }

        // Check if we got valid data
        if (!decoded.make && !decoded.model) {
             throw new Error("Could not decode vehicle details");
        }

        setFormData(prev => ({
            ...prev,
            ...decoded
        }));
        
        toast({ 
            title: "VIN Decoded Successfully", 
            description: `Identified: ${decoded.year} ${decoded.make} ${decoded.model}${result.series ? ` ${result.series}` : ''}${decoded.trim ? ` ${decoded.trim}` : ''}` 
        });
    } catch (error) {
        console.error("VIN Decode Error:", error);
        toast({ 
            title: "Decoding Failed", 
            description: error instanceof Error ? error.message : "Could not fetch vehicle details. Please enter manually.", 
            variant: "destructive" 
        });
    } finally {
        setIsDecoding(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => {
        const features = prev.features.includes(feature)
            ? prev.features.filter(f => f !== feature)
            : [...prev.features, feature];
        return { ...prev, features };
    });
  };

  const handleAppraise = () => {
    if (!formData.make || !formData.model) return;

    // Find similar cars
    let similar = allCars.filter(car => 
      car.make.toLowerCase() === formData.make.toLowerCase() &&
      car.model.toLowerCase() === formData.model.toLowerCase() &&
      // Match year within +/- 2 years if provided
      (!formData.year || Math.abs(parseInt(car.year) - parseInt(formData.year)) <= 2)
    );

    // Filter by trim if provided and not "Other"
    if (formData.trim && formData.trim !== "Other") {
        const trimMatches = similar.filter(car => car.trim.toLowerCase().includes(formData.trim.toLowerCase()));
        // If we have matches with trim, use them, otherwise fall back to just make/model
        if (trimMatches.length > 0) {
            similar = trimMatches;
        }
    }

    // Apply optional strict filters
    if (filterOptions.matchTransmission) {
        similar = similar.filter(car => car.transmission?.toLowerCase() === formData.transmission);
    }
    if (filterOptions.matchFuelType) {
        similar = similar.filter(car => car.fuelType?.toLowerCase() === formData.fuelType);
    }
    // Note: Drivetrain isn't always in mock data, so we skip strict filter for now to avoid empty results in demo

    let basePrice = 25000;
    let estimatedRetail = 0;

    if (similar.length === 0) {
        // Fallback mock logic if no inventory matches
        
        // Adjust base price based on trim (mock)
        if (formData.trim.toLowerCase().includes('limited') || formData.trim.toLowerCase().includes('touring') || formData.trim.toLowerCase().includes('premium')) {
            basePrice += 5000;
        } else if (formData.trim.toLowerCase().includes('sport') || formData.trim.toLowerCase().includes('gt')) {
            basePrice += 3000;
        }

        const yearFactor = formData.year ? (parseInt(formData.year) - 2010) * 1000 : 5000;
        const kmFactor = formData.kilometers ? Math.max(0, (150000 - parseInt(formData.kilometers)) * 0.05) : 2000;
        
        // Mock regional adjustment
        const regionFactor = formData.postalCode ? (formData.postalCode.length * 100) : 0;
        const provinceFactor = formData.province === 'ON' || formData.province === 'BC' ? 1000 : 0;
        
        // Adjustments for new fields
        const transmissionFactor = formData.transmission === 'manual' ? -500 : 0;
        const drivetrainFactor = (formData.drivetrain === 'awd' || formData.drivetrain === '4wd' || formData.drivetrain === '4x4') ? 2000 : 0;
        const fuelFactor = (formData.fuelType === 'hybrid' || formData.fuelType === 'electric') ? 3000 : 0;
        
        // Engine factor (mock logic)
        let engineFactor = 0;
        if (formData.engineCylinders === '8') engineFactor += 2000;
        if (formData.engineCylinders === '6') engineFactor += 1000;
        if (formData.fuelType === 'diesel') engineFactor += 3000; // Diesel trucks often worth more

        const featureFactor = formData.features.length * 200; // $200 per feature

        estimatedRetail = basePrice + yearFactor + kmFactor + regionFactor + provinceFactor + transmissionFactor + drivetrainFactor + fuelFactor + featureFactor + engineFactor;
    } else {
        // Calculate based on real data
        const prices = similar.map(c => parseFloat(c.price));
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        // Adjust for kms if provided
        let adjustedPrice = avgPrice;
        if (formData.kilometers) {
            const avgKms = similar.reduce((a, b) => a + parseFloat(b.kilometers), 0) / similar.length;
            const kmDiff = avgKms - parseFloat(formData.kilometers);
            // Add/subtract value based on km difference ($0.05 per km)
            adjustedPrice += kmDiff * 0.05;
        }
        
        // Apply mock regional/radius adjustment
        if (formData.radius === "100") adjustedPrice *= 0.98;
        if (formData.radius === "250") adjustedPrice *= 0.96;
        if (formData.radius === "500") adjustedPrice *= 0.95;

        // Adjust for features/specs on top of average if we didn't filter strictly
        if (!filterOptions.matchDrivetrain && (formData.drivetrain === 'awd' || formData.drivetrain === '4wd' || formData.drivetrain === '4x4')) adjustedPrice += 1500;
        if (!filterOptions.matchFuelType && (formData.fuelType === 'hybrid' || formData.fuelType === 'electric')) adjustedPrice += 2000;
        if (formData.engineCylinders === '8') adjustedPrice += 1000; // V8 premium if not already accounted for in comps
        
        adjustedPrice += formData.features.length * 150;

        estimatedRetail = adjustedPrice;
    }

    setAppraisal({
        retailLow: estimatedRetail * 0.9,
        retailHigh: estimatedRetail * 1.1,
        tradeInLow: estimatedRetail * 0.7,
        tradeInHigh: estimatedRetail * 0.8,
        similarCars: similar.slice(0, 3)
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Vehicle Appraisal Tool
        </h1>
        <p className="text-gray-500">Get instant market value estimates based on your current inventory data and market trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-0 shadow-lg ring-1 ring-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                    <CardTitle>Vehicle Details</CardTitle>
                    <CardDescription>Enter vehicle specs or VIN to appraise</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    
                    {/* VIN Decoder Section */}
                    <div className="space-y-2">
                        <Label>VIN</Label>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="17-digit VIN" 
                                value={formData.vin} 
                                onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase()})} 
                                maxLength={17}
                                className="font-mono uppercase"
                            />
                            <Button variant="secondary" onClick={handleDecodeVin} disabled={isDecoding}>
                                {isDecoding ? (
                                    <span className="animate-spin mr-2">⟳</span>
                                ) : (
                                    <QrCode className="w-4 h-4 mr-2" />
                                )}
                                Decode
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-2">
                        <Label>Make *</Label>
                        <Select value={formData.make} onValueChange={(val) => setFormData({...formData, make: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Make" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {POPULAR_MAKES.map(make => (
                                    <SelectItem key={make} value={make}>{make}</SelectItem>
                                ))}
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Model *</Label>
                        <Input 
                            placeholder="e.g. Camry" 
                            value={formData.model} 
                            onChange={e => setFormData({...formData, model: e.target.value})} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input 
                                placeholder="YYYY" 
                                type="number"
                                value={formData.year} 
                                onChange={e => setFormData({...formData, year: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Trim 
                                {isLoadingTrims && <span className="ml-2 text-xs text-gray-400 animate-pulse">Fetching...</span>}
                            </Label>
                            <Select value={formData.trim} onValueChange={(val) => setFormData({...formData, trim: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Trim" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {availableTrims.map(trim => (
                                        <SelectItem key={trim} value={trim}>{trim}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Kilometers</Label>
                        <Input 
                            placeholder="0" 
                            type="number"
                            value={formData.kilometers} 
                            onChange={e => setFormData({...formData, kilometers: e.target.value})} 
                        />
                    </div>

                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="space-y-4">
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full flex items-center justify-between">
                                Advanced Specs & Features
                                <CheckSquare className="w-4 h-4 ml-2" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 pt-2">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Body Type</Label>
                                    <Select value={formData.bodyType} onValueChange={(val) => setFormData({...formData, bodyType: val})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sedan">Sedan</SelectItem>
                                            <SelectItem value="suv">SUV</SelectItem>
                                            <SelectItem value="truck">Truck</SelectItem>
                                            <SelectItem value="coupe">Coupe</SelectItem>
                                            <SelectItem value="hatchback">Hatchback</SelectItem>
                                            <SelectItem value="van">Van</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Drivetrain</Label>
                                    <Select value={formData.drivetrain} onValueChange={(val) => setFormData({...formData, drivetrain: val})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fwd">FWD</SelectItem>
                                            <SelectItem value="rwd">RWD</SelectItem>
                                            <SelectItem value="awd">AWD</SelectItem>
                                            <SelectItem value="4wd">4WD</SelectItem>
                                            <SelectItem value="4x4">4x4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cylinders</Label>
                                    <Select value={formData.engineCylinders} onValueChange={(val) => setFormData({...formData, engineCylinders: val})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Cyl</SelectItem>
                                            <SelectItem value="4">4 Cyl</SelectItem>
                                            <SelectItem value="5">5 Cyl</SelectItem>
                                            <SelectItem value="6">6 Cyl (V6/I6)</SelectItem>
                                            <SelectItem value="8">8 Cyl (V8)</SelectItem>
                                            <SelectItem value="10">10 Cyl (V10)</SelectItem>
                                            <SelectItem value="12">12 Cyl (V12)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Displacement (L)</Label>
                                    <Select value={formData.engineDisplacement} onValueChange={(val) => setFormData({...formData, engineDisplacement: val})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            <SelectItem value="1.5">1.5L</SelectItem>
                                            <SelectItem value="1.8">1.8L</SelectItem>
                                            <SelectItem value="2.0">2.0L</SelectItem>
                                            <SelectItem value="2.4">2.4L</SelectItem>
                                            <SelectItem value="2.5">2.5L</SelectItem>
                                            <SelectItem value="2.7">2.7L</SelectItem>
                                            <SelectItem value="3.0">3.0L</SelectItem>
                                            <SelectItem value="3.5">3.5L</SelectItem>
                                            <SelectItem value="3.6">3.6L</SelectItem>
                                            <SelectItem value="5.0">5.0L</SelectItem>
                                            <SelectItem value="5.3">5.3L</SelectItem>
                                            <SelectItem value="5.7">5.7L (Hemi)</SelectItem>
                                            <SelectItem value="6.2">6.2L</SelectItem>
                                            <SelectItem value="6.7">6.7L (Diesel)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Transmission</Label>
                                    <Select value={formData.transmission} onValueChange={(val) => setFormData({...formData, transmission: val})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="automatic">Automatic</SelectItem>
                                            <SelectItem value="manual">Manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Fuel Type</Label>
                                    <Select value={formData.fuelType} onValueChange={(val) => setFormData({...formData, fuelType: val})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gasoline">Gasoline</SelectItem>
                                            <SelectItem value="diesel">Diesel</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                            <SelectItem value="electric">Electric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Key Features</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FEATURES_LIST.map(feature => (
                                        <div key={feature} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={feature} 
                                                checked={formData.features.includes(feature)}
                                                onCheckedChange={() => toggleFeature(feature)}
                                            />
                                            <label htmlFor={feature} className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                {feature}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />
                            
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Filter className="w-3 h-3" /> Strict Matching</Label>
                                <p className="text-xs text-gray-500 mb-2">Only show comparables that match these specs:</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="match-trans" checked={filterOptions.matchTransmission} onCheckedChange={(c) => setFilterOptions({...filterOptions, matchTransmission: !!c})} />
                                        <label htmlFor="match-trans" className="text-xs">Match Transmission</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="match-fuel" checked={filterOptions.matchFuelType} onCheckedChange={(c) => setFilterOptions({...filterOptions, matchFuelType: !!c})} />
                                        <label htmlFor="match-fuel" className="text-xs">Match Fuel Type</label>
                                    </div>
                                </div>
                            </div>

                        </CollapsibleContent>
                    </Collapsible>

                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                        <Label>Region & Market</Label>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Select value={formData.province} onValueChange={(val) => setFormData({...formData, province: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Prov" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROVINCES.map(prov => (
                                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Input 
                                    placeholder="Postal Code" 
                                    value={formData.postalCode} 
                                    onChange={e => setFormData({...formData, postalCode: e.target.value})} 
                                />
                            </div>
                        </div>
                         <div className="space-y-2 mt-2">
                            <Select value={formData.radius} onValueChange={(val) => setFormData({...formData, radius: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Radius" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="25">25 km</SelectItem>
                                    <SelectItem value="50">50 km</SelectItem>
                                    <SelectItem value="100">100 km</SelectItem>
                                    <SelectItem value="250">250 km</SelectItem>
                                    <SelectItem value="500">500 km</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-2">
                        <Label htmlFor="show-comparables" className="flex items-center gap-2 cursor-pointer">
                            {showComparables ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                            Show Comparables
                        </Label>
                        <Switch 
                            id="show-comparables" 
                            checked={showComparables}
                            onCheckedChange={setShowComparables}
                        />
                    </div>

                    <Button 
                        className="w-full mt-4 h-12 text-lg" 
                        onClick={handleAppraise}
                        disabled={!formData.make || !formData.model}
                    >
                        Calculate Value
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8 space-y-6">
            {appraisal ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Value Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-blue-100 bg-blue-50/50">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">Estimated Retail</div>
                                <div className="text-3xl font-bold text-gray-900">
                                    ${Math.round(appraisal.retailLow).toLocaleString()} - ${Math.round(appraisal.retailHigh).toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Market listing price</p>
                            </CardContent>
                        </Card>

                        <Card className="border-green-100 bg-green-50/50">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div className="text-sm font-medium text-green-600 uppercase tracking-wider mb-1">Estimated Trade-In</div>
                                <div className="text-3xl font-bold text-gray-900">
                                    ${Math.round(appraisal.tradeInLow).toLocaleString()} - ${Math.round(appraisal.tradeInHigh).toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Acquisition cost</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comparable Vehicles */}
                    {showComparables && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CarIcon className="w-5 h-5 text-gray-500" />
                                    Comparable Vehicles
                                </CardTitle>
                                <CardDescription>
                                    Based on {formData.radius}km radius around {formData.postalCode || 'your location'} {formData.province && `in ${formData.province}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {appraisal.similarCars.length > 0 ? (
                                    <div className="space-y-4">
                                        {appraisal.similarCars.map(car => (
                                            <div key={car.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <div className="font-bold text-gray-900">{car.year} {car.make} {car.model}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <span>{parseFloat(car.kilometers).toLocaleString()} km</span>
                                                        <span>•</span>
                                                        <span>{car.trim}</span>
                                                    </div>
                                                    {(car.transmission || car.fuelType) && (
                                                        <div className="text-xs text-gray-400 flex gap-2 mt-1">
                                                            {car.transmission && <span className="capitalize">{car.transmission}</span>}
                                                            {car.fuelType && <span>• {car.fuelType}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">${parseFloat(car.price).toLocaleString()}</div>
                                                        <Badge variant="outline" className="text-xs font-normal">Match</Badge>
                                                    </div>
                                                    
                                                    <div className="flex gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                                                                        onClick={() => car.listingLink && window.open(car.listingLink, '_blank')}
                                                                        disabled={!car.listingLink}
                                                                    >
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{car.listingLink ? "View Listing" : "No Listing Link"}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 rounded-full hover:bg-yellow-50 hover:text-yellow-600"
                                                                        onClick={() => car.carfaxLink && window.open(car.carfaxLink, '_blank')}
                                                                        disabled={!car.carfaxLink}
                                                                    >
                                                                        <FileText className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{car.carfaxLink ? "View Carfax" : "No Carfax Report"}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>No direct matches found in inventory.</p>
                                        <p className="text-sm opacity-60">Estimate is based on general market data.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl bg-gray-50/50 text-gray-400">
                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                        <Calculator className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Appraise</h3>
                    <p className="max-w-md">Enter vehicle details or decode VIN to generate a value estimate.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
