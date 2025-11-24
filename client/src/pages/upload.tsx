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
import { Upload as UploadIcon, FileText, Image as ImageIcon, Plus, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, QrCode, CheckSquare, AlertTriangle, X } from "lucide-react";
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

const CAR_MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", "Cadillac",
  "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC",
  "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MINI", "Mitsubishi",
  "Nissan", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

const COMMON_COLORS = [
  "Black", "White", "Silver", "Gray", "Red", "Blue", 
  "Brown", "Green", "Beige", "Gold", "Orange", "Yellow", 
  "Purple", "Other"
];

const FEATURES_LIST = [
  "Navigation System", "Sunroof/Moonroof", "Panoramic Sunroof", "Leather Seats", "Heated Front Seats", 
  "Heated Rear Seats", "Ventilated Seats", "Memory Seats", "Power Seats", "Backup Camera", 
  "360° Camera", "Parking Sensors", "Bluetooth", "Apple CarPlay", "Android Auto", 
  "Wireless Charging", "Premium Sound System", "Blind Spot Monitor", "Adaptive Cruise Control",
  "Lane Departure Warning", "Lane Keep Assist", "Collision Warning", "Automatic Emergency Braking",
  "Third Row Seating", "Tow Package", "Trailer Hitch", "Remote Start", "Keyless Entry", 
  "Push Button Start", "Power Liftgate", "Hands-Free Liftgate", "Roof Rack", "Running Boards",
  "LED Headlights", "Fog Lights", "Daytime Running Lights", "HID Headlights", "Automatic Headlights",
  "Rain Sensing Wipers", "Heated Mirrors", "Power Folding Mirrors", "Heads-Up Display",
  "Dual Zone Climate", "Tri-Zone Climate", "Rear Climate Control", "Air Suspension",
  "Sport Package", "Off-Road Package", "Winter Package", "Technology Package"
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
  const [dealershipSearch, setDealershipSearch] = useState("");
  const [searchVin, setSearchVin] = useState("");
  const [searchStock, setSearchStock] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Bulk CSV State
  const [csvData, setCsvData] = useState("");
  const [csvRows, setCsvRows] = useState<Array<Record<string, string>>>([]);
  const [selectedDealershipCsv, setSelectedDealershipCsv] = useState("");
  const [isSavingCsv, setIsSavingCsv] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  
  // URL Import State
  const [urlInput, setUrlInput] = useState("");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);

  // Bulk URLs State
  const [bulkUrls, setBulkUrls] = useState("");
  const [isBulkExtracting, setIsBulkExtracting] = useState(false);
  const [bulkResults, setBulkResults] = useState<Array<{url: string, status: 'pending' | 'loading' | 'success' | 'error', data?: Partial<Car>, error?: string}>>([]);
  const [selectedDealershipBulk, setSelectedDealershipBulk] = useState("");
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [rawHtmlContent, setRawHtmlContent] = useState("");
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // AI Scan State
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<Partial<Car> | null>(null);

  // AI Parser State (Claude)
  const [textFiles, setTextFiles] = useState<File[]>([]);
  const [isParsingWithClaude, setIsParsingWithClaude] = useState(false);
  const [parsedCsvData, setParsedCsvData] = useState<Array<Record<string, string>>>([]);
  const [parsedCsvRaw, setParsedCsvRaw] = useState("");
  const [selectedDealershipParser, setSelectedDealershipParser] = useState("");
  const [isSavingParsed, setIsSavingParsed] = useState(false);

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

  const handleScrapeUrl = async () => {
    if (!urlInput.trim()) {
      toast({ title: "URL Required", description: "Please enter a listing URL", variant: "destructive" });
      return;
    }

    setIsScrapingUrl(true);
    try {
      const res = await fetch("/api/scrape-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput })
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ title: "Scraping Failed", description: error.error, variant: "destructive" });
        setIsScrapingUrl(false);
        return;
      }

      const extracted = await res.json();
      
      // Auto-fill form fields
      setNewCar((prev) => ({
        ...prev,
        year: extracted.year || prev.year,
        make: extracted.make || prev.make,
        model: extracted.model || prev.model,
        trim: extracted.trim || prev.trim,
        kilometers: extracted.kilometers || prev.kilometers,
        color: extracted.color || prev.color,
        price: extracted.price || prev.price,
        vin: extracted.vin || prev.vin,
        stockNumber: extracted.stockNumber || prev.stockNumber,
        listingLink: urlInput // Store the URL as listing link
      }));

      toast({ title: "Success", description: `Extracted ${Object.keys(extracted).length} vehicle details from URL`, variant: "default" });
      setUrlInput("");
    } catch (error) {
      console.error("Error scraping URL:", error);
      toast({ title: "Error", description: "Failed to scrape URL. Please check the link and try again.", variant: "destructive" });
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleBulkUrlsExtract = async () => {
    if (!bulkUrls.trim()) {
      toast({ title: "URLs Required", description: "Please paste one or more listing URLs", variant: "destructive" });
      return;
    }

    if (!selectedDealershipBulk) {
      toast({ title: "Dealership Required", description: "Please select a dealership", variant: "destructive" });
      return;
    }

    const urls = bulkUrls.split('\n').map(url => url.trim()).filter(url => url && url.startsWith('http'));
    
    if (urls.length === 0) {
      toast({ title: "No Valid URLs", description: "Please paste valid URLs starting with http/https", variant: "destructive" });
      return;
    }

    setIsBulkExtracting(true);
    const results: typeof bulkResults = urls.map(url => ({ url, status: 'pending' as const }));
    setBulkResults(results);

    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        results[i].status = 'loading';
        setBulkResults([...results]);

        try {
          const res = await fetch("/api/scrape-listing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
          });

          if (res.ok) {
            const extracted = await res.json();
            results[i].status = 'success';
            results[i].data = {
              ...extracted,
              dealershipId: selectedDealershipBulk,
              listingLink: url,
              status: 'available' as const,
              condition: 'used'
            };
          } else {
            results[i].status = 'error';
            results[i].error = 'Failed to extract data';
          }
        } catch (error) {
          results[i].status = 'error';
          results[i].error = 'Network error';
        }

        setBulkResults([...results]);
      }

      const successCount = results.filter(r => r.status === 'success').length;
      toast({ title: "Extraction Complete", description: `Successfully extracted ${successCount}/${urls.length} vehicles`, variant: "default" });
    } finally {
      setIsBulkExtracting(false);
    }
  };

  const parseCsvData = (csv: string): Array<Record<string, string>> => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return [];

    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Parse data rows
    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      
      if (Object.values(row).some(v => v)) { // Only add if row has data
        rows.push(row);
      }
    }
    
    return rows;
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      setCsvData(csv);
      const rows = parseCsvData(csv);
      setCsvRows(rows);
      
      if (rows.length > 0) {
        toast({ title: "CSV Loaded", description: `Found ${rows.length} vehicles in the file`, variant: "default" });
      }
    };
    reader.readAsText(file);
  };

  const handleCsvDataChange = (data: string) => {
    setCsvData(data);
    const rows = parseCsvData(data);
    setCsvRows(rows);
  };

  const handleSaveCsvToDatabase = async () => {
    if (csvRows.length === 0) {
      toast({ title: "No Data", description: "Please upload or paste CSV data first", variant: "destructive" });
      return;
    }

    if (!selectedDealershipCsv) {
      toast({ title: "Dealership Required", description: "Please select a dealership", variant: "destructive" });
      return;
    }

    setIsSavingCsv(true);

    try {
      // Map CSV rows to car data with flexible column name handling
      const carsToImport = csvRows.map(row => ({
        vin: (row.vin || row['17-digit vin'] || row['vin (17 digits)'] || "").trim(),
        stockNumber: (row['stock number'] || row.stock || row['stock #'] || row.stocknumber || "").trim(),
        condition: (row.condition || "used").trim(),
        make: (row.make || "").trim(),
        model: (row.model || "").trim(),
        trim: (row.trim || row.edition || "").trim(),
        year: (row.year || "").trim(),
        color: (row.color || row.exterior || "").trim(),
        price: (row.price || row['selling price'] || row['list price'] || "0").toString().trim(),
        kilometers: (row.kilometers || row.mileage || row.km || row.odometer || "0").toString().trim(),
        transmission: (row.transmission || row.trans || "").trim(),
        fuelType: (row['fuel type'] || row.fuel || row.fueltype || "").trim(),
        bodyType: (row['body type'] || row.body || row.bodytype || "").trim(),
        features: [],
        listingLink: (row['listing url'] || row.url || row.link || "").trim(),
        carfaxLink: (row['carfax link'] || row.carfax || "").trim(),
        notes: (row.notes || row.description || "").trim(),
      }));

      console.log("Sending to bulk import:", {
        dealershipId: selectedDealershipCsv,
        carCount: carsToImport.length
      });

      const response = await fetch('/api/cars/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId: selectedDealershipCsv,
          cars: carsToImport
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log("Bulk import result:", result);
        toast({ 
          title: `✓ Upload Complete!`, 
          description: `Successfully added ${result.successCount}/${result.totalProcessed} vehicles to database`, 
          variant: result.failureCount === 0 ? "default" : "destructive" 
        });

        // Show details if there were failures
        if (result.failureCount > 0) {
          console.log("Failed vehicles:", result.results.filter((r: any) => !r.success));
        }
      } else {
        toast({ 
          title: "Upload Failed", 
          description: result.error || "Failed to upload vehicles", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({ 
        title: "Upload Error", 
        description: error instanceof Error ? error.message : "Failed to upload CSV", 
        variant: "destructive" 
      });
    } finally {
      setCsvData("");
      setCsvRows([]);
      setSelectedDealershipCsv("");
      if (csvFileInputRef.current) csvFileInputRef.current.value = "";
      setIsSavingCsv(false);
    }
  };

  const generateCsvFromBulkResults = () => {
    const successResults = bulkResults.filter(r => r.status === 'success' && r.data);
    if (successResults.length === 0) return "";

    const headers = ["year", "make", "model", "trim", "price", "kilometers", "vin", "stock_number", "condition", "url"];
    const rows = successResults.map(r => [
      r.data?.year || "",
      r.data?.make || "",
      r.data?.model || "",
      r.data?.trim || "",
      r.data?.price || "",
      r.data?.kilometers || "",
      r.data?.vin || "",
      r.data?.stockNumber || "",
      r.data?.condition || "used",
      r.url
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    return csv;
  };

  const downloadBulkCsv = () => {
    const csv = generateCsvFromBulkResults();
    if (!csv) {
      toast({ title: "No Data", description: "No vehicles to export", variant: "destructive" });
      return;
    }

    const dealershipName = dealerships.find(d => d.id === selectedDealershipBulk)?.name || "dealership";
    const date = new Date().toISOString().split('T')[0];
    const filename = `${dealershipName.replace(/\s+/g, '_')}_vehicles_${date}.csv`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "✓ Downloaded", description: `CSV file: ${filename}`, variant: "default" });
  };

  const handleBulkSaveAll = async () => {
    const successResults = bulkResults.filter(r => r.status === 'success' && r.data);
    
    if (successResults.length === 0) {
      toast({ title: "No Data", description: "No successful extractions to save", variant: "destructive" });
      return;
    }

    setIsSavingBulk(true);
    
    try {
      const carsToImport = successResults.map(result => ({
        vin: result.data?.vin || "",
        stockNumber: result.data?.stockNumber || "",
        condition: result.data?.condition || "used",
        make: result.data?.make || "Unknown",
        model: result.data?.model || "Unknown",
        trim: result.data?.trim || "",
        year: result.data?.year || "",
        color: result.data?.color || "",
        price: result.data?.price || "0",
        kilometers: result.data?.kilometers || "0",
        transmission: result.data?.transmission || "",
        fuelType: result.data?.fuelType || "",
        bodyType: result.data?.bodyType || "",
        drivetrain: result.data?.drivetrain || "fwd",
        engineCylinders: result.data?.engineCylinders || "",
        engineDisplacement: result.data?.engineDisplacement || "",
        features: [],
        listingLink: result.data?.listingLink || result.url || "",
        carfaxLink: result.data?.carfaxLink || "",
        notes: `Imported from: ${result.url}`,
      }));

      const response = await fetch('/api/cars/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId: selectedDealershipBulk,
          cars: carsToImport
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: `✓ Import Complete!`, 
          description: `Successfully added ${result.successCount}/${result.totalProcessed} vehicles to database`, 
          variant: result.failureCount === 0 ? "default" : "destructive" 
        });

        setBulkUrls("");
        setBulkResults([]);
        setSelectedDealershipBulk("");
        setShowRawHtml(false);
      } else {
        toast({ 
          title: "Import Failed", 
          description: result.error || "Failed to import vehicles", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error importing vehicles:", error);
      toast({ 
        title: "Import Error", 
        description: error instanceof Error ? error.message : "Failed to import vehicles", 
        variant: "destructive" 
      });
    } finally {
      setIsSavingBulk(false);
    }
  };

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
            
        // Normalize Make to match CAR_MAKES (case-insensitive)
        let normalizedMake = result.make || "";
        if (normalizedMake) {
            const matchedMake = CAR_MAKES.find(m => m.toLowerCase() === normalizedMake.toLowerCase());
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

  const handleClearForm = () => {
    // Preserve current dealership selection
    const currentDealershipId = newCar.dealershipId;
    
    // Reset all form fields to initial state
    setNewCar({
      vin: "",
      stockNumber: "",
      condition: "used",
      make: "",
      model: "",
      trim: "",
      year: "",
      color: "",
      price: "",
      kilometers: "",
      transmission: "",
      fuelType: "",
      bodyType: "",
      listingLink: "",
      carfaxLink: "",
      carfaxStatus: "unavailable",
      notes: "",
      dealershipId: currentDealershipId, // Preserve dealership selection
      status: "available",
      engineCylinders: "",
      engineDisplacement: "",
      drivetrain: "fwd",
    });
    
    // Reset features
    setFeatures([]);
    
    // Reset advanced section
    setShowAdvanced(false);
    
    // Reset search fields
    setSearchVin("");
    setSearchStock("");
    
    // Reset duplicate state
    setDuplicateCar(null);
    setShowDuplicateAlert(false);
    
    toast({ title: "Form Cleared", description: "Vehicle fields have been reset" });
  };

  const checkDuplicateVin = (vin: string): Car | null => {
      if (!vin || vin.length < 11) return null;
      
      // Check all cars for this VIN
      const found = allCars.find(car => car.vin && car.vin.toUpperCase() === vin.toUpperCase());
      if (found) {
          const dealership = dealerships.find(d => d.id === found.dealershipId);
          return { ...found, dealershipName: dealership?.name } as Car & { dealershipName?: string };
      }
      return null;
  };

  const handleSearchVehicle = async () => {
    // Normalize and trim inputs
    const normalizedVin = searchVin.trim().toUpperCase();
    const normalizedStock = searchStock.trim();
    
    if (!normalizedVin && !normalizedStock) {
      toast({ title: "No Search Criteria", description: "Please enter a VIN or Stock Number to search", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    
    try {
      let foundCar: Car | null = null;
      
      // Try to find by VIN first using backend endpoint
      if (normalizedVin) {
        const response = await fetch(`/api/cars/vin/${normalizedVin}`);
        if (response.ok) {
          foundCar = await response.json();
        }
      }
      
      // If not found by VIN, try Stock Number using backend endpoint
      if (!foundCar && normalizedStock) {
        const response = await fetch(`/api/cars/stock/${normalizedStock}`);
        if (response.ok) {
          foundCar = await response.json();
        }
      }
      
      if (foundCar) {
        // Auto-fill the form with found car data, explicitly resetting all fields
        setNewCar({
          vin: foundCar.vin || "",
          stockNumber: foundCar.stockNumber || "",
          condition: foundCar.condition || "used",
          make: foundCar.make || "",
          model: foundCar.model || "",
          trim: foundCar.trim || "",
          year: foundCar.year || "",
          color: foundCar.color || "",
          price: foundCar.price || "",
          kilometers: foundCar.kilometers || "",
          transmission: foundCar.transmission || "",
          fuelType: foundCar.fuelType || "",
          bodyType: foundCar.bodyType || "",
          listingLink: foundCar.listingLink || "",
          carfaxLink: foundCar.carfaxLink || "",
          carfaxStatus: foundCar.carfaxStatus || "unavailable",
          notes: foundCar.notes || "",
          dealershipId: foundCar.dealershipId || "",
          status: foundCar.status || "available",
          engineCylinders: foundCar.engineCylinders || "",
          engineDisplacement: foundCar.engineDisplacement || "",
          drivetrain: foundCar.drivetrain || "fwd",
        });
        
        // Reset features to match found car exactly
        setFeatures(foundCar.features || []);
        
        toast({ 
          title: "Vehicle Found", 
          description: `Form filled with: ${foundCar.year} ${foundCar.make} ${foundCar.model}` 
        });
      } else {
        toast({ 
          title: "Not Found", 
          description: "No vehicle found with that VIN or Stock Number", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Search Error:", error);
      toast({ 
        title: "Search Failed", 
        description: "Could not search for vehicle. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const checkDuplicateStockNumber = (stockNumber: string): Car | null => {
      if (!stockNumber || stockNumber.trim().length === 0) return null;
      
      // Check all cars for this stock number
      const found = allCars.find(car => car.stockNumber && car.stockNumber.toLowerCase() === stockNumber.toLowerCase());
      if (found) {
          const dealership = dealerships.find(d => d.id === found.dealershipId);
          return { ...found, dealershipName: dealership?.name } as Car & { dealershipName?: string };
      }
      return null;
  };

  const handleManualSubmit = (ignoreDuplicate = false) => {
    // Validate dealership
    if (!newCar.dealershipId) {
        toast({ title: "Error", description: "Please select a dealership", variant: "destructive" });
        return;
    }
    
    // Validate VIN or Stock Number (at least one required)
    if (!newCar.vin && !newCar.stockNumber) {
        toast({ title: "Error", description: "Either VIN or Stock Number is required", variant: "destructive" });
        return;
    }
    
    // Validate required fields
    if (!newCar.make || !newCar.model) {
        toast({ title: "Error", description: "Make and Model are required", variant: "destructive" });
        return;
    }
    
    if (!newCar.year) {
        toast({ title: "Error", description: "Year is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.trim) {
        toast({ title: "Error", description: "Trim is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.color) {
        toast({ title: "Error", description: "Color is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.price) {
        toast({ title: "Error", description: "Price is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.kilometers) {
        toast({ title: "Error", description: "Kilometers is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.transmission) {
        toast({ title: "Error", description: "Transmission is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.fuelType) {
        toast({ title: "Error", description: "Fuel Type is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.bodyType) {
        toast({ title: "Error", description: "Body Type is required", variant: "destructive" });
        return;
    }
    
    if (!newCar.condition) {
        toast({ title: "Error", description: "Condition is required", variant: "destructive" });
        return;
    }
    
    // Check for duplicate VIN first
    if (!ignoreDuplicate && newCar.vin) {
        const duplicate = checkDuplicateVin(newCar.vin);
        if (duplicate) {
            setDuplicateCar(duplicate);
            setShowDuplicateAlert(true);
            return;
        }
    }
    
    // Check for duplicate Stock Number
    if (!ignoreDuplicate && newCar.stockNumber) {
        const duplicate = checkDuplicateStockNumber(newCar.stockNumber);
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

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setTextFiles(Array.from(files));
      toast({ title: "Files Loaded", description: `${files.length} text file(s) uploaded`, variant: "default" });
    }
  };

  const handleParseWithClaude = async () => {
    if (textFiles.length === 0) {
      toast({ title: "No Files", description: "Please upload text files first", variant: "destructive" });
      return;
    }

    if (!selectedDealershipParser) {
      toast({ title: "Dealership Required", description: "Please select a dealership", variant: "destructive" });
      return;
    }

    setIsParsingWithClaude(true);

    try {
      // Read all text files
      const fileContents = await Promise.all(
        textFiles.map(file => file.text())
      );

      const combinedText = fileContents.join("\n\n===FILE_SEPARATOR===\n\n");

      // Send to backend for Claude processing
      const response = await fetch('/api/parse-with-claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: combinedText })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse with Claude');
      }

      const result = await response.json();
      
      if (result.csv) {
        setParsedCsvRaw(result.csv);
        const rows = parseCsvData(result.csv);
        setParsedCsvData(rows);
        toast({ 
          title: "✓ Parsing Complete!", 
          description: `Claude extracted ${rows.length} vehicles from your text files`, 
          variant: "default" 
        });
      } else {
        throw new Error('No CSV data returned');
      }
    } catch (error) {
      console.error("Error parsing with Claude:", error);
      toast({ 
        title: "Parsing Error", 
        description: error instanceof Error ? error.message : "Failed to parse text files", 
        variant: "destructive" 
      });
    } finally {
      setIsParsingWithClaude(false);
    }
  };

  const downloadParsedCsv = () => {
    if (!parsedCsvRaw) {
      toast({ title: "No Data", description: "No CSV data to download", variant: "destructive" });
      return;
    }

    const dealershipName = dealerships.find(d => d.id === selectedDealershipParser)?.name || "dealership";
    const date = new Date().toISOString().split('T')[0];
    const filename = `${dealershipName.replace(/\s+/g, '_')}_parsed_${date}.csv`;

    const blob = new Blob([parsedCsvRaw], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "✓ Downloaded", description: `CSV file: ${filename}`, variant: "default" });
  };

  const handleImportParsedCsv = async () => {
    if (parsedCsvData.length === 0) {
      toast({ title: "No Data", description: "No data to import", variant: "destructive" });
      return;
    }

    if (!selectedDealershipParser) {
      toast({ title: "Dealership Required", description: "Please select a dealership", variant: "destructive" });
      return;
    }

    setIsSavingParsed(true);

    try {
      const carsToImport = parsedCsvData.map(row => ({
        vin: (row.vin || "").trim(),
        stockNumber: (row.stock_number || row.stock || row.stocknumber || "").trim(),
        condition: (row.condition || "used").trim(),
        make: (row.make || "Unknown").trim(),
        model: (row.model || "Unknown").trim(),
        trim: (row.trim || "").trim(),
        year: (row.year || "").trim(),
        color: (row.color || "").trim(),
        price: (row.price || "0").toString().trim(),
        kilometers: (row.kilometers || row.km || row.kilometer || "0").toString().trim(),
        transmission: (row.transmission || "").trim(),
        fuelType: (row.fuel_type || row.fueltype || "").trim(),
        bodyType: (row.body_type || row.bodytype || "").trim(),
        drivetrain: (row.drivetrain || "fwd").trim(),
        engineCylinders: (row.engine_cy || row.cylinders || "").trim(),
        engineDisplacement: (row.engine_di || row.displacement || "").trim(),
        features: [],
        listingLink: (row.listing_link || row.url || "").trim(),
        carfaxLink: (row.carfax_link || "").trim(),
        notes: (row.notes || "Imported via Claude AI Parser").trim(),
      }));

      const response = await fetch('/api/cars/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId: selectedDealershipParser,
          cars: carsToImport
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: `✓ Import Complete!`, 
          description: `Successfully added ${result.successCount}/${result.totalProcessed} vehicles to database`, 
          variant: result.failureCount === 0 ? "default" : "destructive" 
        });

        setTextFiles([]);
        setParsedCsvData([]);
        setParsedCsvRaw("");
        setSelectedDealershipParser("");
      } else {
        toast({ 
          title: "Import Failed", 
          description: result.error || "Failed to import vehicles", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error importing:", error);
      toast({ 
        title: "Import Error", 
        description: error instanceof Error ? error.message : "Failed to import vehicles", 
        variant: "destructive" 
        });
    } finally {
      setIsSavingParsed(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Vehicles</h1>
        <p className="text-gray-500">Add new inventory manually, in bulk via CSV, or by scanning documents.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-6 w-full max-w-5xl bg-gray-100 p-1 rounded-xl h-auto">
          <TabsTrigger value="manual" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bulk CSV</TabsTrigger>
          <TabsTrigger value="url" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">URL Import</TabsTrigger>
          <TabsTrigger value="bulk" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bulk URLs</TabsTrigger>
          <TabsTrigger value="parser" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Parser</TabsTrigger>
          <TabsTrigger value="scan" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Scan (PDF)</TabsTrigger>
        </TabsList>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="border-0 shadow-sm ring-1 ring-gray-200">
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>Enter all vehicle information manually.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <Label className="text-gray-900 mb-3 block font-semibold">Search Existing Vehicle</Label>
                <p className="text-sm text-gray-600 mb-4">Search by VIN or Stock Number to auto-fill the form</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-700">Search by VIN</Label>
                    <Input 
                      placeholder="Enter VIN" 
                      value={searchVin} 
                      onChange={(e) => setSearchVin(e.target.value.toUpperCase())}
                      data-testid="input-search-vin"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-700">Search by Stock Number</Label>
                    <Input 
                      placeholder="Enter Stock #" 
                      value={searchStock} 
                      onChange={(e) => setSearchStock(e.target.value)}
                      data-testid="input-search-stock"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearchVehicle} 
                      disabled={isSearching || (!searchVin && !searchStock)}
                      className="w-full"
                      data-testid="button-search-vehicle"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <Label className="text-green-900 mb-3 block font-semibold">Extract from Listing URL</Label>
                <p className="text-sm text-green-700 mb-3">Paste a vehicle listing URL to automatically extract details</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Paste vehicle listing URL (e.g., https://example.com/listing/12345)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    data-testid="input-listing-url"
                  />
                  <Button 
                    onClick={handleScrapeUrl}
                    disabled={isScrapingUrl || !urlInput.trim()}
                    className="whitespace-nowrap"
                    data-testid="button-scrape-url"
                  >
                    {isScrapingUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>
              </div>

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
                        <div className="p-2 sticky top-0 bg-white border-b">
                            <Input 
                                placeholder="Search dealerships..." 
                                value={dealershipSearch}
                                onChange={(e) => setDealershipSearch(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        {dealerships
                            .filter(d => d.name.toLowerCase().includes(dealershipSearch.toLowerCase()))
                            .map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        {dealerships.filter(d => d.name.toLowerCase().includes(dealershipSearch.toLowerCase())).length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500">No dealerships found</div>
                        )}
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
                            {CAR_MAKES.map(make => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                            ))}
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
                    <Label>Trim</Label>
                    <Input 
                        placeholder="e.g. LX, EX, Touring" 
                        value={newCar.trim} 
                        onChange={(e) => setNewCar({...newCar, trim: e.target.value})} 
                    />
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
                            <SelectItem value="convertible">Convertible</SelectItem>
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

              <div className="flex flex-col md:flex-row gap-3 justify-end pt-4">
                <Button 
                  onClick={handleClearForm} 
                  variant="outline" 
                  size="lg" 
                  className="w-full md:w-auto"
                  data-testid="button-clear-form"
                >
                    <X className="w-4 h-4 mr-2" /> Clear Form
                </Button>
                <Button 
                  onClick={() => handleManualSubmit(false)} 
                  size="lg" 
                  className="w-full md:w-auto"
                  data-testid="button-add-inventory"
                >
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
                <CardTitle>Bulk CSV Upload</CardTitle>
                <CardDescription>Upload a CSV file or paste CSV data. Supports: VIN, Make, Model, Year, Price, Stock Number, Color, Fuel Type, Transmission, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Label className="text-blue-900 mb-2 block font-semibold">Target Dealership *</Label>
                    <Select value={selectedDealershipCsv} onValueChange={setSelectedDealershipCsv}>
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

                {/* File Input Section */}
                <div className="space-y-3">
                    <Label className="font-semibold">Upload CSV File or Paste Data Below</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="csv-file-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileText className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload CSV</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">CSV files only (.csv)</p>
                            </div>
                            <Input 
                                id="csv-file-input"
                                type="file" 
                                accept=".csv"
                                className="hidden" 
                                onChange={handleCsvFileUpload}
                                ref={csvFileInputRef}
                                data-testid="input-csv-file"
                            />
                        </label>
                    </div>
                </div>

                {/* CSV Textarea */}
                <div className="grid gap-2">
                    <Label className="font-semibold">Or Paste CSV Data</Label>
                    <Textarea 
                        placeholder="VIN,Make,Model,Year,Price,Stock Number&#10;1HGBH41JXMN109186,Toyota,Camry,2023,30000,12345&#10;2T1BURHE0JC106186,Honda,Civic,2022,25000,67890" 
                        className="font-mono min-h-[200px] text-sm"
                        value={csvData}
                        onChange={(e) => handleCsvDataChange(e.target.value)}
                        data-testid="textarea-csv-data"
                    />
                </div>

                {/* CSV Data Preview Table */}
                {csvRows.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Preview: {csvRows.length} Vehicles Found</h3>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                    setCsvData("");
                                    setCsvRows([]);
                                    if (csvFileInputRef.current) csvFileInputRef.current.value = "";
                                }}
                                className="text-red-600 hover:text-red-700"
                            >
                                Clear
                            </Button>
                        </div>
                        
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Make</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Model</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">VIN</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Stock #</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Color</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {csvRows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">{row.make || '-'}</td>
                                            <td className="px-4 py-3">{row.model || '-'}</td>
                                            <td className="px-4 py-3">{row.year || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.vin ? row.vin.substring(0, 8) + '...' : '-'}</td>
                                            <td className="px-4 py-3 font-medium text-green-600">${row.price || '0'}</td>
                                            <td className="px-4 py-3">{row['stock number'] || row.stock || row['stock #'] || '-'}</td>
                                            <td className="px-4 py-3">{row.color || row.exterior || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setCsvData("");
                                    setCsvRows([]);
                                    if (csvFileInputRef.current) csvFileInputRef.current.value = "";
                                }}
                                size="lg"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveCsvToDatabase} 
                                disabled={isSavingCsv || csvRows.length === 0 || !selectedDealershipCsv}
                                size="lg"
                                data-testid="button-save-csv"
                            >
                                {isSavingCsv ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving {csvRows.length} vehicles...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="w-4 h-4 mr-2" />
                                        Upload {csvRows.length} Vehicles to Database
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {csvData === "" && csvRows.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Upload a CSV file or paste data to get started</p>
                    </div>
                )}
            </CardContent>
           </Card>
        </TabsContent>

        {/* Bulk URLs Tab */}
        <TabsContent value="bulk" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle>Bulk URL Import</CardTitle>
                    <CardDescription>Paste multiple vehicle listing URLs, extract data, and import to database in bulk.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {bulkResults.length === 0 && (
                        <>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <Label className="text-purple-900 mb-2 block font-semibold">Select Dealership *</Label>
                                <Select value={selectedDealershipBulk} onValueChange={setSelectedDealershipBulk}>
                                    <SelectTrigger className="bg-white border-purple-200 h-11">
                                        <SelectValue placeholder="Choose a dealership" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {dealerships.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Listing URLs</Label>
                                <p className="text-sm text-gray-600 mb-2">One URL per line (AutoTrader, Kijiji, Dealer websites, etc.)</p>
                                <Textarea 
                                    placeholder={"https://www.autotrader.ca/a/toyota/camry/2020\nhttps://www.kijiji.ca/v/...\nhttps://dealer.com/listing/..."} 
                                    className="font-mono min-h-[250px] text-sm"
                                    value={bulkUrls}
                                    onChange={(e) => setBulkUrls(e.target.value)}
                                    disabled={isBulkExtracting}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setBulkUrls("")}
                                    disabled={isBulkExtracting || !bulkUrls.trim()}
                                >
                                    Clear
                                </Button>
                                <Button 
                                    onClick={handleBulkUrlsExtract} 
                                    disabled={isBulkExtracting || !bulkUrls.trim() || !selectedDealershipBulk}
                                    size="lg"
                                >
                                    {isBulkExtracting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            Extract All
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                    {bulkResults.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">Extraction Results</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {bulkResults.filter(r => r.status === 'success').length} successful out of {bulkResults.length} URLs
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">{bulkResults.filter(r => r.status === 'success').length}</div>
                                    <div className="text-xs text-gray-500">Vehicles Extracted</div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="border rounded-lg overflow-hidden bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Make</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Model</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Trim</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kilometers</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">VIN</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {bulkResults.filter(r => r.status === 'success' && r.data).map((result, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-900">{result.data?.year || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900">{result.data?.make || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900">{result.data?.model || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900 text-xs">{result.data?.trim || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900 font-medium">${Number(result.data?.price || 0).toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-gray-600">{Number(result.data?.kilometers || 0).toLocaleString()} km</td>
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{result.data?.vin ? result.data.vin.substring(0, 8) + "..." : "—"}</td>
                                                    <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">✓</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Failed Items Summary */}
                            {bulkResults.some(r => r.status === 'error') && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-red-900 mb-2">
                                        {bulkResults.filter(r => r.status === 'error').length} Failed Extractions
                                    </p>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                        {bulkResults.filter(r => r.status === 'error').map((result, idx) => (
                                            <div key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div className="truncate">{result.url}: {result.error}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end flex-wrap">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setBulkResults([]);
                                        setBulkUrls("");
                                        setSelectedDealershipBulk("");
                                    }}
                                >
                                    Start Over
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={downloadBulkCsv}
                                    disabled={!bulkResults.some(r => r.status === 'success')}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download CSV
                                </Button>
                                <Button 
                                    onClick={handleBulkSaveAll}
                                    disabled={!bulkResults.some(r => r.status === 'success') || isSavingBulk}
                                    size="lg"
                                >
                                    {isSavingBulk ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="w-4 h-4 mr-2" />
                                            Import {bulkResults.filter(r => r.status === 'success').length} to Database
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
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

        {/* AI Parser Tab */}
        <TabsContent value="parser" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle>AI Text Parser</CardTitle>
                    <CardDescription>Upload text files containing vehicle listings. Claude AI will extract and structure the data into CSV format.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    {textFiles.length === 0 && parsedCsvData.length === 0 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Dealership *</Label>
                                <Select value={selectedDealershipParser} onValueChange={setSelectedDealershipParser}>
                                    <SelectTrigger data-testid="select-dealership-parser">
                                        <SelectValue placeholder="Choose a dealership" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dealerships.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-center w-full">
                                <Label htmlFor="text-file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">TXT, CSV, or any text file with vehicle listings</p>
                                    </div>
                                    <Input 
                                        id="text-file-upload" 
                                        type="file" 
                                        className="hidden" 
                                        accept=".txt,.csv,.text"
                                        multiple
                                        onChange={handleTextFileUpload}
                                        data-testid="input-text-file"
                                    />
                                </Label>
                            </div>
                        </div>
                    )}

                    {textFiles.length > 0 && parsedCsvData.length === 0 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-blue-900">Files Selected</p>
                                        <ul className="mt-2 space-y-1">
                                            {textFiles.map((file, idx) => (
                                                <li key={idx} className="text-sm text-blue-700">
                                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setTextFiles([])}
                                    data-testid="button-cancel-parse"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleParseWithClaude}
                                    disabled={isParsingWithClaude || !selectedDealershipParser}
                                    size="lg"
                                    data-testid="button-parse-claude"
                                >
                                    {isParsingWithClaude ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Parsing with Claude AI...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4 mr-2" />
                                            Parse with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {parsedCsvData.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">Parsed Results</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {parsedCsvData.length} vehicles extracted by Claude AI
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-600">{parsedCsvData.length}</div>
                                    <div className="text-xs text-gray-500">Vehicles Found</div>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Make</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Model</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Trim</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kilometers</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">VIN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {parsedCsvData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50" data-testid={`row-parsed-${idx}`}>
                                                    <td className="px-4 py-3 text-gray-900">{row.year || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900">{row.make || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900">{row.model || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900 text-xs">{row.trim || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900 font-medium">${Number(row.price || 0).toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-gray-600">{Number(row.kilometers || row.km || 0).toLocaleString()} km</td>
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.vin ? row.vin.substring(0, 8) + "..." : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end flex-wrap">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setParsedCsvData([]);
                                        setParsedCsvRaw("");
                                        setTextFiles([]);
                                    }}
                                    data-testid="button-start-over-parser"
                                >
                                    Start Over
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={downloadParsedCsv}
                                    data-testid="button-download-csv-parser"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download CSV
                                </Button>
                                <Button 
                                    onClick={handleImportParsedCsv}
                                    disabled={isSavingParsed || !selectedDealershipParser}
                                    size="lg"
                                    data-testid="button-import-database-parser"
                                >
                                    {isSavingParsed ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="w-4 h-4 mr-2" />
                                            Import {parsedCsvData.length} to Database
                                        </>
                                    )}
                                </Button>
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
