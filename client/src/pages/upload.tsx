import { useState, useRef, useEffect } from "react";
import { useDealerships, useCreateCar, useCarByVin, type Car, type Dealership, useCars } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, Image as ImageIcon, Plus, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, QrCode, CheckSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { fetchCanadianTrims, getTrimsForMake, CANADIAN_TRIMS, decodeVIN } from "@/lib/nhtsa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

const COMMON_COLORS = [
  "Black", "White", "Silver", "Gray", "Red", "Blue", 
  "Brown", "Green", "Beige", "Gold", "Orange", "Yellow", 
  "Purple", "Other"
];

const FEATURES_LIST = [
    "Navigation", "Sunroof/Moonroof", "Leather Seats", "Heated Seats", "Backup Camera", 
    "Bluetooth", "Apple CarPlay", "Android Auto", "Blind Spot Monitor", "Adaptive Cruise Control",
    "Lane Departure Warning", "Third Row Seating", "Tow Package", "Remote Start"
];

export default function UploadPage() {
  const { data: dealerships = [], isLoading: dealershipsLoading } = useDealerships();
  const { data: allCars = [] } = useCars();
  const createCarMutation = useCreateCar();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  // Manual Entry State
  const [newCar, setNewCar] = useState<Partial<Car> & { engineCylinders?: string, engineDisplacement?: string, drivetrain?: string, stockNumber?: string, condition?: string }>({
    vin: "", stockNumber: "", condition: "used", make: "", model: "", trim: "", year: "", color: "",
    price: "", kilometers: "", transmission: "", fuelType: "", bodyType: "",
    listingLink: "", carfaxLink: "", notes: "", dealershipId: "", status: 'available',
    engineCylinders: "", engineDisplacement: "", drivetrain: "fwd", carfaxStatus: "unavailable"
  });
  
  const [features, setFeatures] = useState<string[]>([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableTrims, setAvailableTrims] = useState<string[]>([]);
  const [isLoadingTrims, setIsLoadingTrims] = useState(false);
  const [duplicateCar, setDuplicateCar] = useState<(Car & { dealershipName?: string }) | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  // Bulk CSV State
  const [csvData, setCsvData] = useState("");
  
  // URL Import State
  const [urlInput, setUrlInput] = useState("");

  // AI Scan State
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<Partial<Car> | null>(null);

  // Effect to update trims based on Make immediately (local fallback)
  useEffect(() => {
    if (newCar.make && newCar.make !== "Other") {
        // Immediate local update
        const localTrims = getTrimsForMake(newCar.make);
        setAvailableTrims(localTrims);
    } else {
        setAvailableTrims(CANADIAN_TRIMS);
    }
  }, [newCar.make]);

  // Effect to fetch API trims when Year/Model are available
  useEffect(() => {
    const fetchTrims = async () => {
        if (newCar.year && newCar.make && newCar.model && newCar.make !== "Other") {
             setIsLoadingTrims(true);
             const apiTrims = await fetchCanadianTrims(newCar.year, newCar.make, newCar.model);
             if (apiTrims.length > 0) {
                 setAvailableTrims(apiTrims);
             }
             setIsLoadingTrims(false);
        }
    };
    
    const timer = setTimeout(fetchTrims, 500);
    return () => clearTimeout(timer);
  }, [newCar.year, newCar.make, newCar.model]);

  const handleDecodeVin = async () => {
    if (!newCar.vin || newCar.vin.length < 11) {
        toast({ title: "Invalid VIN", description: "Please enter a valid 17-character VIN", variant: "destructive" });
        return;
    }

    setIsDecoding(true);
    
    try {
        // Use enhanced VIN decoder
        const result = await decodeVIN(newCar.vin);

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
            trim: result.trim || "",
            engineCylinders: result.engineCylinders || "",
            engineDisplacement: result.engineDisplacement || "",
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

        // Extract Extra Information for Notes
        const extras = [];
        if (result.engineDescription) extras.push(`Engine: ${result.engineDescription}`);
        if (result.doors) extras.push(`Doors: ${result.doors}`);
        if (result.plantCountry) extras.push(`Origin: ${result.plantCountry}`);
        if (result.series) extras.push(`Series: ${result.series}`);
        
        const notes = extras.length > 0 ? `Specs: ${extras.join(", ")}` : "";

        // Extract Features
        const detectedFeatures: string[] = [];
        
        if (result.fuelType?.toLowerCase().includes("hybrid")) {
            detectedFeatures.push("Hybrid");
        }

        // Check if we got valid data
        if (!decoded.make && !decoded.model) {
             throw new Error("Could not decode vehicle details");
        }

        setNewCar(prev => ({
            ...prev,
            ...decoded,
            notes: prev.notes ? prev.notes + "\n" + notes : notes
        }));
        
        if (detectedFeatures.length > 0) {
            // Add unique features
            setFeatures(prev => Array.from(new Set([...prev, ...detectedFeatures])));
        }
        
        // Auto open advanced section to show decoded details
        setShowAdvanced(true);
        
        toast({ 
            title: "VIN Decoded Successfully", 
            description: `Identified: ${decoded.year} ${decoded.make} ${decoded.model}${result.series ? ` ${result.series}` : ''}` 
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
    if (features.includes(feature)) {
        setFeatures(features.filter(f => f !== feature));
    } else {
        setFeatures([...features, feature]);
    }
  };

  const checkDuplicateVin = (vin: string): Car | null => {
      if (!vin || vin.length < 11) return null;
      
      // Check all cars for this VIN
      const found = allCars.find(car => car.vin.toUpperCase() === vin.toUpperCase());
      if (found) {
          const dealership = dealerships.find(d => d.id === found.dealershipId);
          return { ...found, dealershipName: dealership?.name } as Car & { dealershipName?: string };
      }
      return null;
  };

  const handleManualSubmit = (ignoreDuplicate = false) => {
    if (!newCar.dealershipId) {
        toast({ title: "Error", description: "Please select a dealership", variant: "destructive" });
        return;
    }
    if (!newCar.make || !newCar.model) {
        toast({ title: "Error", description: "Make and Model are required", variant: "destructive" });
        return;
    }
    
    // Check for duplicates first
    if (!ignoreDuplicate && newCar.vin) {
        const duplicate = checkDuplicateVin(newCar.vin);
        if (duplicate) {
            setDuplicateCar(duplicate);
            setShowDuplicateAlert(true);
            return;
        }
    }
    
    const carData = {
        dealershipId: newCar.dealershipId!,
        vin: newCar.vin || "",
        stockNumber: newCar.stockNumber || "",
        condition: newCar.condition || "used",
        make: newCar.make || "",
        model: newCar.model || "",
        trim: newCar.trim || "",
        year: newCar.year || "",
        color: newCar.color || "",
        price: newCar.price || "",
        kilometers: newCar.kilometers || "",
        transmission: newCar.transmission || "",
        fuelType: newCar.fuelType || "",
        bodyType: newCar.bodyType || "",
        drivetrain: newCar.drivetrain,
        engineCylinders: newCar.engineCylinders,
        engineDisplacement: newCar.engineDisplacement,
        features: features,
        listingLink: newCar.listingLink || "",
        carfaxLink: newCar.carfaxLink || "",
        carfaxStatus: newCar.carfaxStatus,
        notes: newCar.notes || "",
        status: 'available' as const,
    };
    
    createCarMutation.mutate(carData, {
        onSuccess: () => {
            setNewCar({
                vin: "", stockNumber: "", condition: "used", make: "", model: "", trim: "", year: "", color: "",
                price: "", kilometers: "", transmission: "", fuelType: "", bodyType: "",
                listingLink: "", carfaxLink: "", notes: "", dealershipId: newCar.dealershipId, status: 'available',
                engineCylinders: "", engineDisplacement: "", drivetrain: "fwd", carfaxStatus: "unavailable"
            });
            setFeatures([]);
            setShowAdvanced(false);
            setShowDuplicateAlert(false);
            setDuplicateCar(null);
        }
    });
  };

  const handleCsvUpload = () => {
    if (!csvData.trim()) {
        toast({ title: "Error", description: "Please enter CSV data", variant: "destructive" });
        return;
    }
    
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
        setLoading(false);
        toast({ title: "Success", description: "Processed 5 vehicles from CSV" });
        setCsvData("");
    }, 1500);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
        toast({ title: "Error", description: "Please enter a valid URL", variant: "destructive" });
        return;
    }

    setLoading(true);
    
    // Simulate URL scraping
    setTimeout(() => {
        setLoading(false);
        setScanResult({
            make: "Ford",
            model: "F-150",
            year: "2024",
            vin: "1FTEW1EP5MFA12345",
            price: "58900",
            trim: "XLT",
            color: "Oxford White",
            kilometers: "1200",
            listingLink: urlInput
        });
        toast({ title: "Extraction Complete", description: "Vehicle data found on page" });
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setScannedFile(e.target.files[0]);
        setLoading(true);
        
        // Simulate AI extraction
        setTimeout(() => {
            setLoading(false);
            setScanResult({
                make: "Honda",
                model: "CR-V",
                year: "2023",
                vin: "2HGCR2F58PH123456",
                price: "34900",
                trim: "Touring",
                color: "Crystal Black",
                kilometers: "15400"
            });
            toast({ title: "Analysis Complete", description: "Vehicle data extracted successfully" });
        }, 2000);
    }
  };

  const saveScannedCar = () => {
    if (!scanResult) return;
    // Pre-fill manual form with scanned data
    setNewCar({ ...newCar, ...scanResult });
    setScanResult(null);
    setScannedFile(null);
    setUrlInput("");
    setActiveTab("manual");
    toast({ title: "Data Transferred", description: "Review details and save" });
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Vehicles</h1>
        <p className="text-gray-500">Add new inventory manually, in bulk via CSV, or by scanning documents.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-gray-100 p-1 rounded-xl h-auto">
          <TabsTrigger value="manual" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bulk CSV</TabsTrigger>
          <TabsTrigger value="url" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">URL Import</TabsTrigger>
          <TabsTrigger value="scan" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Scan (PDF)</TabsTrigger>
        </TabsList>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="border-0 shadow-sm ring-1 ring-gray-200">
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>Enter all vehicle information manually.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Label className="text-blue-900 mb-2 block">Select Dealership *</Label>
                <Select 
                    value={newCar.dealershipId} 
                    onValueChange={(val) => setNewCar({ ...newCar, dealershipId: val })}
                >
                    <SelectTrigger className="bg-white border-blue-200 h-11">
                        <SelectValue placeholder="Choose a dealership" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {dealerships.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>VIN</Label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="17-digit VIN" 
                            value={newCar.vin} 
                            onChange={(e) => setNewCar({...newCar, vin: e.target.value.toUpperCase()})}
                            maxLength={17}
                        />
                         <Button variant="secondary" size="icon" onClick={handleDecodeVin} disabled={isDecoding}>
                            {isDecoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Stock Number</Label>
                    <Input 
                        placeholder="Stock #" 
                        value={newCar.stockNumber} 
                        onChange={(e) => setNewCar({...newCar, stockNumber: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={newCar.condition} onValueChange={(val) => setNewCar({...newCar, condition: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Make *</Label>
                    <Select value={newCar.make} onValueChange={(val) => setNewCar({...newCar, make: val})}>
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
                    {/* Kept as Input for now as Model list is huge, but could be mocked if Make is selected */}
                    <Input placeholder="e.g. Camry" value={newCar.model} onChange={(e) => setNewCar({...newCar, model: e.target.value})} />
                </div>
                
                <div className="space-y-2"><Label>Year</Label><Input placeholder="YYYY" type="number" value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} /></div>
                
                <div className="space-y-2">
                    <Label>
                        Trim
                        {isLoadingTrims && <span className="ml-2 text-xs text-gray-400 animate-pulse">Fetching...</span>}
                    </Label>
                    <Select value={newCar.trim} onValueChange={(val) => setNewCar({...newCar, trim: val})}>
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
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={newCar.color} onValueChange={(val) => setNewCar({...newCar, color: val})}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                      <SelectContent>
                          {COMMON_COLORS.map(color => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" placeholder="0.00" value={newCar.price} onChange={(e) => setNewCar({...newCar, price: e.target.value})} /></div>
                <div className="space-y-2"><Label>Kilometers</Label><Input type="number" placeholder="0" value={newCar.kilometers} onChange={(e) => setNewCar({...newCar, kilometers: e.target.value})} /></div>
                
                <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select value={newCar.transmission} onValueChange={(val) => setNewCar({...newCar, transmission: val})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select value={newCar.fuelType} onValueChange={(val) => setNewCar({...newCar, fuelType: val})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Body Type</Label>
                     <Select value={newCar.bodyType} onValueChange={(val) => setNewCar({...newCar, bodyType: val})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
              </div>

               <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="space-y-4 border rounded-xl p-4 bg-gray-50/50 mt-4">
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between bg-white">
                            Engine & Features (Advanced)
                            <CheckSquare className="w-4 h-4 ml-2" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cylinders</Label>
                                <Select value={newCar.engineCylinders} onValueChange={(val) => setNewCar({...newCar, engineCylinders: val})}>
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
                                <Select value={newCar.engineDisplacement} onValueChange={(val) => setNewCar({...newCar, engineDisplacement: val})}>
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

                        <div className="space-y-2">
                            <Label>Drivetrain</Label>
                            <Select value={newCar.drivetrain} onValueChange={(val) => setNewCar({...newCar, drivetrain: val})}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fwd">FWD</SelectItem>
                                    <SelectItem value="rwd">RWD</SelectItem>
                                    <SelectItem value="awd">AWD</SelectItem>
                                    <SelectItem value="4wd">4WD</SelectItem>
                                    <SelectItem value="4x4">4x4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Key Features</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {FEATURES_LIST.map(feature => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`upload-${feature}`} 
                                            checked={features.includes(feature)}
                                            onCheckedChange={() => toggleFeature(feature)}
                                        />
                                        <label htmlFor={`upload-${feature}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                            {feature}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleContent>
               </Collapsible>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2"><Label>Listing URL</Label><Input placeholder="https://..." value={newCar.listingLink} onChange={(e) => setNewCar({...newCar, listingLink: e.target.value})} /></div>
                 <div className="space-y-2">
                    <Label>Carfax URL</Label>
                    <div className="flex gap-2">
                        <Input placeholder="https://..." value={newCar.carfaxLink} onChange={(e) => setNewCar({...newCar, carfaxLink: e.target.value})} />
                        <Select value={newCar.carfaxStatus} onValueChange={(val: any) => setNewCar({...newCar, carfaxStatus: val})}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clean">Clean</SelectItem>
                                <SelectItem value="claims">Claims/Rebuilt</SelectItem>
                                <SelectItem value="unavailable">Not Available</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional vehicle details..." value={newCar.notes} onChange={(e) => setNewCar({...newCar, notes: e.target.value})} className="min-h-[100px]" />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleManualSubmit(false)} size="lg" className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Add to Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk CSV Tab */}
        <TabsContent value="csv" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <Card className="border-0 shadow-sm ring-1 ring-gray-200">
            <CardHeader>
                <CardTitle>Bulk Upload</CardTitle>
                <CardDescription>Paste your CSV data below or upload a file. Format: VIN, Make, Model, Year, Price</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Label className="text-blue-900 mb-2 block">Target Dealership *</Label>
                    <Select>
                        <SelectTrigger className="bg-white border-blue-200 h-11">
                            <SelectValue placeholder="Choose a dealership" />
                        </SelectTrigger>
                        <SelectContent>
                            {dealerships.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>CSV Data</Label>
                    <Textarea 
                        placeholder="VIN,Make,Model,Year,Price&#10;12345,Toyota,Camry,2023,30000&#10;67890,Honda,Civic,2022,25000" 
                        className="font-mono min-h-[200px] text-sm"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-4 py-4 border-t border-dashed">
                    <Button variant="outline" className="w-full h-32 border-2 border-dashed flex flex-col gap-2 hover:bg-gray-50">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-600 font-medium">Or drop CSV file here</span>
                    </Button>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleCsvUpload} disabled={loading} size="lg">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadIcon className="w-4 h-4 mr-2" />}
                        Process Data
                    </Button>
                </div>
            </CardContent>
           </Card>
        </TabsContent>

        {/* URL Import Tab */}
        <TabsContent value="url" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle>URL Import</CardTitle>
                    <CardDescription>Enter a listing URL (AutoTrader, Kijiji, etc.) to automatically extract vehicle details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    
                    {!scanResult && !loading && (
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Listing URL</Label>
                                <div className="flex gap-3">
                                    <Input 
                                        placeholder="https://www.autotrader.ca/..." 
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="h-12 text-lg"
                                    />
                                    <Button onClick={handleUrlSubmit} size="lg" className="px-8">
                                        Fetch
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 text-center text-gray-500">
                                <LinkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Supported platforms: AutoTrader, Kijiji Autos, Facebook Marketplace, Dealership Websites</p>
                            </div>
                         </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <div className="text-center">
                                <p className="font-medium text-lg">Scanning Webpage...</p>
                                <p className="text-gray-500 text-sm">Extracting vehicle specifications and pricing</p>
                            </div>
                        </div>
                    )}

                    {scanResult && !loading && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 text-green-700 p-2 rounded-full">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 text-lg">Extraction Successful</h3>
                                    <p className="text-green-700">We found the following details on the page.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">VIN</span>
                                    <div className="font-mono font-medium">{scanResult.vin || "N/A"}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">Make</span>
                                    <div className="font-medium">{scanResult.make}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">Model</span>
                                    <div className="font-medium">{scanResult.model}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">Price</span>
                                    <div className="font-medium">${Number(scanResult.price).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={() => { setScanResult(null); }}>Discard</Button>
                                <Button onClick={saveScannedCar}>Use This Data</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* AI Scan Tab */}
        <TabsContent value="scan" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle>AI Document Scan</CardTitle>
                    <CardDescription>Upload a photo or PDF of a window sticker, invoice, or spec sheet.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    
                    {!scannedFile && (
                        <div className="flex items-center justify-center w-full">
                            <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, PNG, JPG or WEBP</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} />
                            </Label>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <div className="text-center">
                                <p className="font-medium text-lg">Analyzing Document...</p>
                                <p className="text-gray-500 text-sm">Extracting vehicle details via AI</p>
                            </div>
                        </div>
                    )}

                    {scanResult && !loading && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 text-green-700 p-2 rounded-full">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 text-lg">Scan Successful</h3>
                                    <p className="text-green-700">We extracted the following details from your document.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">VIN</span>
                                    <div className="font-mono font-medium">{scanResult.vin}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">Make</span>
                                    <div className="font-medium">{scanResult.make}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">Model</span>
                                    <div className="font-medium">{scanResult.model}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-green-100">
                                    <span className="text-xs text-gray-500 uppercase">Price</span>
                                    <div className="font-medium">${Number(scanResult.price).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={() => { setScannedFile(null); setScanResult(null); }}>Discard</Button>
                                <Button onClick={saveScannedCar}>Use This Data</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Duplicate VIN Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
                A vehicle with VIN <span className="font-mono font-bold text-gray-800">{newCar.vin}</span> already exists in your inventory at <strong>{duplicateCar?.dealershipName}</strong>.
                <br /><br />
                Adding this vehicle will create a duplicate entry. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDuplicateAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleManualSubmit(true)} className="bg-amber-600 hover:bg-amber-700">
                Add Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
