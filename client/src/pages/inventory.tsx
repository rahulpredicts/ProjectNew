import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Car as CarIcon,
  Building2,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Fuel,
  Gauge,
  Settings2,
  Palette,
  CheckCircle2,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
  FileText,
  AlertOctagon,
  FileQuestion,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { 
  useDealerships, 
  useCars, 
  useCreateDealership,
  useUpdateDealership,
  useDeleteDealership,
  useCreateCar,
  useUpdateCar,
  useDeleteCar,
  useToggleSoldStatus,
  type Car,
  type Dealership
} from "@/lib/api-hooks";
import { decodeVIN, getTrimsForMake } from "@/lib/nhtsa";
import { Loader2, QrCode, ExternalLink } from "lucide-react";

const COMMON_COLORS = [
  "Black", "White", "Silver", "Gray", "Red", "Blue", 
  "Brown", "Green", "Beige", "Gold", "Orange", "Yellow", 
  "Purple", "Other"
];

const CAR_MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", "Cadillac",
  "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC",
  "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MINI", "Mitsubishi",
  "Nissan", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
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

export default function Inventory() {
  const { data: dealerships = [], isLoading: dealershipsLoading } = useDealerships();
  const { data: allCars = [], isLoading: carsLoading } = useCars();
  const createDealershipMutation = useCreateDealership();
  const updateDealershipMutation = useUpdateDealership();
  const deleteDealershipMutation = useDeleteDealership();
  const createCarMutation = useCreateCar();
  const updateCarMutation = useUpdateCar();
  const deleteCarMutation = useDeleteCar();
  const toggleSoldStatusMutation = useToggleSoldStatus();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [showAddDealership, setShowAddDealership] = useState(false);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced Filters
  const [filterMake, setFilterMake] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterVin, setFilterVin] = useState("");
  const [filterVinStart, setFilterVinStart] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterTrim, setFilterTrim] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterKmsMin, setFilterKmsMin] = useState("");
  const [filterKmsMax, setFilterKmsMax] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  
  // New Filters
  const [filterTransmission, setFilterTransmission] = useState("");
  const [filterDrivetrain, setFilterDrivetrain] = useState("");
  const [filterFuelType, setFilterFuelType] = useState("");
  const [filterBodyType, setFilterBodyType] = useState("");
  const [filterEngineCylinders, setFilterEngineCylinders] = useState("");

  const [sortBy, setSortBy] = useState("addedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Generate dynamic filter options from inventory
  const availableModels = useMemo(() => {
    const models = new Set<string>();
    allCars.forEach(car => {
      if (car.model && (!filterMake || car.make === filterMake)) {
        models.add(car.model);
      }
    });
    return Array.from(models).sort();
  }, [allCars, filterMake]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allCars.forEach(car => {
      if (car.year) {
        years.add(car.year.toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Descending
  }, [allCars]);

  const availableFilterTrims = useMemo(() => {
    if (!filterMake) return [];
    return getTrimsForMake(filterMake);
  }, [filterMake]);

  // Reset dependent filters when upstream filter changes
  useEffect(() => {
    if (filterMake) {
      // Reset model and trim when make changes
      const validModel = availableModels.includes(filterModel);
      if (!validModel && filterModel) {
        setFilterModel("");
      }
    } else {
      // Clear model and trim when no make selected
      if (filterModel) setFilterModel("");
      if (filterTrim) setFilterTrim("");
    }
  }, [filterMake, availableModels]);

  useEffect(() => {
    // Reset trim if it's not in available trims
    if (filterTrim && !availableFilterTrims.includes(filterTrim)) {
      setFilterTrim("");
    }
  }, [availableFilterTrims]);
  
  // VIN Decoder state for edit dialog
  const [isDecodingEditCar, setIsDecodingEditCar] = useState(false);
  const [availableEditTrims, setAvailableEditTrims] = useState<string[]>([]);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editFeaturesChanged, setEditFeaturesChanged] = useState(false);
  const [showEditAdvanced, setShowEditAdvanced] = useState(false);

  // Form states
  const [newDealership, setNewDealership] = useState<Partial<Dealership>>({
    name: "",
    location: "",
    province: "",
    address: "",
    postalCode: "",
    phone: "",
  });

  const handleAddDealership = () => {
    if (!newDealership.name || !newDealership.address) {
        toast({ title: "Error", description: "Required fields missing", variant: "destructive" });
        return;
    }
    createDealershipMutation.mutate({
        name: newDealership.name!,
        location: newDealership.location!,
        province: newDealership.province!,
        address: newDealership.address!,
        postalCode: newDealership.postalCode!,
        phone: newDealership.phone!,
    }, {
        onSuccess: () => {
            setNewDealership({ name: "", location: "", province: "", address: "", postalCode: "", phone: "" });
            setShowAddDealership(false);
        }
    });
  };

  const handleUpdateDealership = () => {
    if (!editingDealership) return;
    updateDealershipMutation.mutate({
        id: editingDealership.id,
        data: editingDealership
    }, {
        onSuccess: () => {
            if (selectedDealership?.id === editingDealership.id) {
                setSelectedDealership(editingDealership);
            }
            setEditingDealership(null);
        }
    });
  };

  const handleDeleteDealership = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Delete this dealership and all its cars?")) return;
      deleteDealershipMutation.mutate(id, {
          onSuccess: () => {
              if (selectedDealership?.id === id) setSelectedDealership(null);
          }
      });
  };

  const handleUpdateCar = () => {
      if (!editingCar) return;
      
      // Validate VIN or Stock Number (at least one required)
      const hasVin = editingCar.vin && editingCar.vin.trim() !== '';
      const hasStockNumber = editingCar.stockNumber && editingCar.stockNumber.trim() !== '';
      if (!hasVin && !hasStockNumber) {
        toast({
          title: "Missing Identifier",
          description: "Please provide either a VIN or Stock Number",
          variant: "destructive"
        });
        return;
      }
      
      // Validate required fields (matching add form validation)
      const requiredFields = [
        { field: editingCar.dealershipId, name: 'Dealership' },
        { field: editingCar.make, name: 'Make' },
        { field: editingCar.model, name: 'Model' },
        { field: editingCar.year, name: 'Year' },
        { field: editingCar.trim, name: 'Trim' },
        { field: editingCar.price, name: 'Price' },
        { field: editingCar.kilometers, name: 'Kilometers' },
        { field: editingCar.color, name: 'Color' },
        { field: editingCar.transmission, name: 'Transmission' },
        { field: editingCar.fuelType, name: 'Fuel Type' },
        { field: editingCar.bodyType, name: 'Body Type' },
        { field: editingCar.condition, name: 'Condition' }
      ];
      // Optional fields: listing URL, Carfax link, notes, drivetrain, engine specs, features
      
      const missingFields = requiredFields.filter(({ field }) => !field || field.trim() === '');
      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.map(f => f.name).join(', ')}`,
          variant: "destructive"
        });
        return;
      }
      
      // Only include features if they were actually changed
      const updateData = editFeaturesChanged 
        ? { ...editingCar, features: editFeatures }
        : { ...editingCar };
      
      updateCarMutation.mutate({
          id: editingCar.id,
          data: updateData
      }, {
          onSuccess: () => {
              setEditingCar(null);
              setAvailableEditTrims([]);
              setEditFeatures([]);
              setEditFeaturesChanged(false);
              setShowEditAdvanced(false);
          }
      });
  };

  const toggleEditFeature = (feature: string) => {
    setEditFeaturesChanged(true);
    if (editFeatures.includes(feature)) {
      setEditFeatures(editFeatures.filter(f => f !== feature));
    } else {
      setEditFeatures([...editFeatures, feature]);
    }
  };
  
  // Auto-populate trims when make changes in edit dialog
  useEffect(() => {
    if (editingCar && editingCar.make) {
      const trims = getTrimsForMake(editingCar.make);
      setAvailableEditTrims(trims);
    } else {
      setAvailableEditTrims([]);
    }
  }, [editingCar?.make]);

  // Initialize editFeatures when editingCar changes
  useEffect(() => {
    if (editingCar) {
      setEditFeatures(editingCar.features || []);
      setEditFeaturesChanged(false);
    }
  }, [editingCar?.id]);
  
  const handleDecodeEditCarVin = async () => {
    if (!editingCar || !editingCar.vin || editingCar.vin.length < 11) {
        toast({ title: "Invalid VIN", description: "Please enter a valid 17-character VIN", variant: "destructive" });
        return;
    }

    setIsDecodingEditCar(true);
    
    try {
        const result = await decodeVIN(editingCar.vin);

        if (result.error) {
            throw new Error(result.error);
        }
            
        // Map API response to car fields
        const decoded: any = {
            make: result.make || "",
            model: result.model || "",
            year: result.year || "",
            trim: result.trim || "",
        };

        setEditingCar(prev => prev ? ({
            ...prev,
            ...decoded
        }) : null);
        
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
        setIsDecodingEditCar(false);
    }
  };

  const handleDeleteCar = (carId: string) => {
      if (!window.confirm("Delete this car?")) return;
      deleteCarMutation.mutate(carId);
  };

  const handleExportData = () => {
    const exportData = {
      dealerships,
      cars: allCars,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ 
      title: "Export Successful", 
      description: `Exported ${dealerships.length} dealerships and ${allCars.length} vehicles` 
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.dealerships || !importData.cars) {
        throw new Error("Invalid backup file format");
      }

      // Import dealerships first
      const dealershipIdMap = new Map<string, string>();
      
      for (const dealership of importData.dealerships) {
        const { id, createdAt, ...dealershipData } = dealership;
        const newDealership = await createDealershipMutation.mutateAsync(dealershipData);
        dealershipIdMap.set(id, newDealership.id);
      }

      // Import cars with updated dealership IDs
      for (const car of importData.cars) {
        const { id, createdAt, dealershipId, ...carData } = car;
        const newDealershipId = dealershipIdMap.get(dealershipId);
        if (newDealershipId) {
          await createCarMutation.mutateAsync({
            ...carData,
            dealershipId: newDealershipId
          });
        }
      }

      toast({ 
        title: "Import Successful", 
        description: `Imported ${importData.dealerships.length} dealerships and ${importData.cars.length} vehicles` 
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({ 
        title: "Import Failed", 
        description: "Failed to import data. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const getAllCars = () => {
    return allCars.map(car => {
      const dealership = dealerships.find(d => d.id === car.dealershipId);
      return {
        ...car,
        dealershipName: dealership?.name,
        dealershipLocation: dealership?.location,
        dealershipProvince: dealership?.province
      };
    });
  };

  const getFilteredCars = () => {
    let cars = getAllCars();

    if (selectedDealership) {
      cars = cars.filter(c => c.dealershipId === selectedDealership.id);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      cars = cars.filter(car =>
        car.vin?.toLowerCase().includes(term) ||
        car.make?.toLowerCase().includes(term) ||
        car.model?.toLowerCase().includes(term) ||
        car.color?.toLowerCase().includes(term) ||
        car.dealershipName?.toLowerCase().includes(term) ||
        // @ts-ignore
        car.dealershipProvince?.toLowerCase().includes(term) ||
        car.transmission?.toLowerCase().includes(term) || 
        car.year?.toString().includes(term) ||
        car.trim?.toLowerCase().includes(term) ||
        car.carfaxStatus?.toLowerCase().includes(term) ||
        car.bodyType?.toLowerCase().includes(term) ||
        car.fuelType?.toLowerCase().includes(term) ||
        car.drivetrain?.toLowerCase().includes(term) ||
        car.engineCylinders?.toLowerCase().includes(term) ||
        car.features?.some(f => f.toLowerCase().includes(term)) ||
        car.notes?.toLowerCase().includes(term)
      );
    }

    if (filterMake) cars = cars.filter(c => c.make?.toLowerCase().includes(filterMake.toLowerCase()));
    if (filterModel) cars = cars.filter(c => c.model?.toLowerCase().includes(filterModel.toLowerCase()));
    if (filterVin) cars = cars.filter(c => c.vin?.toLowerCase().includes(filterVin.toLowerCase()));
    if (filterVinStart) cars = cars.filter(c => c.vin?.toUpperCase().startsWith(filterVinStart.toUpperCase()));
    if (filterColor) cars = cars.filter(c => c.color?.toLowerCase().includes(filterColor.toLowerCase()));
    if (filterTrim) cars = cars.filter(c => c.trim?.toLowerCase().includes(filterTrim.toLowerCase()));
    if (filterYear) cars = cars.filter(c => c.year?.toString().includes(filterYear));
    if (filterPriceMin) cars = cars.filter(c => parseFloat(c.price || "0") >= parseFloat(filterPriceMin));
    if (filterPriceMax) cars = cars.filter(c => parseFloat(c.price || "0") <= parseFloat(filterPriceMax));
    if (filterKmsMin) cars = cars.filter(c => parseFloat(c.kilometers || "0") >= parseFloat(filterKmsMin));
    if (filterKmsMax) cars = cars.filter(c => parseFloat(c.kilometers || "0") <= parseFloat(filterKmsMax));
    // @ts-ignore
    if (filterProvince) cars = cars.filter(c => c.dealershipProvince?.toLowerCase().includes(filterProvince.toLowerCase()));

    // New Filters
    if (filterTransmission && filterTransmission !== 'all') cars = cars.filter(c => c.transmission?.toLowerCase() === filterTransmission.toLowerCase());
    if (filterDrivetrain && filterDrivetrain !== 'all') cars = cars.filter(c => c.drivetrain?.toLowerCase() === filterDrivetrain.toLowerCase());
    if (filterFuelType && filterFuelType !== 'all') cars = cars.filter(c => c.fuelType?.toLowerCase() === filterFuelType.toLowerCase());
    if (filterBodyType && filterBodyType !== 'all') cars = cars.filter(c => c.bodyType?.toLowerCase() === filterBodyType.toLowerCase());
    if (filterEngineCylinders && filterEngineCylinders !== 'all') cars = cars.filter(c => c.engineCylinders === filterEngineCylinders);


    cars.sort((a, b) => {
        // @ts-ignore
      let aVal = a[sortBy];
       // @ts-ignore
      let bVal = b[sortBy];

      if (sortBy === "price" || sortBy === "kilometers") {
        aVal = parseFloat(aVal || "0");
        bVal = parseFloat(bVal || "0");
      } else if (sortBy === "year") {
        aVal = parseInt(aVal || "0");
        bVal = parseInt(bVal || "0");
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return cars;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterMake("");
    setFilterModel("");
    setFilterVin("");
    setFilterVinStart("");
    setFilterColor("");
    setFilterTrim("");
    setFilterYear("");
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterKmsMin("");
    setFilterKmsMax("");
    setFilterProvince("");
    setFilterTransmission("");
    setFilterDrivetrain("");
    setFilterFuelType("");
    setFilterBodyType("");
    setFilterEngineCylinders("");
  };

  const totalInventory = allCars.length;
  const filteredCars = getFilteredCars();

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in duration-500">
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              Inventory
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-normal bg-gray-200 text-gray-700">
                {filteredCars.length} Vehicles
              </Badge>
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">
              Manage {dealerships.length} dealerships and {totalInventory} total cars across your network.
            </p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="rounded-full h-12 px-6 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                  <Download className="w-4 h-4 mr-2" />
                  Backup
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <Button onClick={() => setShowAddDealership(true)} variant="outline" size="lg" className="rounded-full h-12 px-6 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all">
              <Building2 className="w-4 h-4 mr-2" />
              New Dealership
            </Button>
            <Button onClick={() => setLocation("/upload")} size="lg" className="rounded-full h-12 px-6 shadow-lg hover:shadow-xl transition-all bg-black hover:bg-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="relative max-w-2xl">
          <div className="relative group flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-primary" />
                <Input
                placeholder="Search by VIN, make, model, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-white border-0 shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:shadow-md"
                />
            </div>
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-14 px-4 rounded-2xl border-0 shadow-sm bg-white hover:bg-gray-50">
                            {sortBy === 'price' ? (
                                sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-5 h-5 mr-2" /> : <ArrowDownWideNarrow className="w-5 h-5 mr-2" />
                            ) : (
                                <ChevronDown className="w-5 h-5 mr-2" />
                            )}
                            Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('desc'); }}>
                            Price: High to Low
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('asc'); }}>
                            Price: Low to High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('year'); setSortOrder('desc'); }}>
                            Year: Newest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('year'); setSortOrder('asc'); }}>
                            Year: Oldest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('kilometers'); setSortOrder('asc'); }}>
                            Mileage: Low to High
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="h-14 px-4 rounded-2xl border-0 shadow-sm bg-white hover:bg-gray-50">
                            <SlidersHorizontal className="w-5 h-5 mr-2" />
                            Filters
                        </Button>
                    </CollapsibleTrigger>
                </Collapsible>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <Collapsible open={showAdvancedFilters}>
            <CollapsibleContent className="animate-in slide-in-from-top-5 fade-in duration-200 pt-4">
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            {/* Standard Dropdown Filters */}
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Make</Label>
                                <Select value={filterMake || "all"} onValueChange={(val) => setFilterMake(val === "all" ? "" : val)}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Any Make" /></SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="all">All Makes</SelectItem>
                                        {CAR_MAKES.map(make => (
                                            <SelectItem key={make} value={make}>{make}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Model</Label>
                                <Select value={filterModel || "all"} onValueChange={(val) => setFilterModel(val === "all" ? "" : val)}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Any Model" /></SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="all">All Models</SelectItem>
                                        {availableModels.map(model => (
                                            <SelectItem key={model} value={model}>{model}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Year</Label>
                                <Select value={filterYear || "all"} onValueChange={(val) => setFilterYear(val === "all" ? "" : val)}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Any Year" /></SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="all">All Years</SelectItem>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">VIN Contains</Label>
                                <Input placeholder="Search VIN" value={filterVin} onChange={(e) => setFilterVin(e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">VIN Starts With</Label>
                                <Input placeholder="e.g. 1, 2, J" value={filterVinStart} onChange={(e) => setFilterVinStart(e.target.value)} className="h-9" maxLength={3} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Trim</Label>
                                <Select value={filterTrim || "all"} onValueChange={(val) => setFilterTrim(val === "all" ? "" : val)} disabled={!filterMake}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder={filterMake ? "Any Trim" : "Select Make First"} /></SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="all">All Trims</SelectItem>
                                        {availableFilterTrims.map(trim => (
                                            <SelectItem key={trim} value={trim}>{trim}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Province</Label>
                                <Input placeholder="Any Prov" value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Color</Label>
                                <Select value={filterColor} onValueChange={setFilterColor}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Any Color" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Colors</SelectItem>
                                        {COMMON_COLORS.map(color => (
                                            <SelectItem key={color} value={color}>{color}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 pt-4 border-t border-gray-100">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Transmission</Label>
                                <Select value={filterTransmission} onValueChange={setFilterTransmission}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Transmissions</SelectItem>
                                        <SelectItem value="automatic">Automatic</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Drivetrain</Label>
                                <Select value={filterDrivetrain} onValueChange={setFilterDrivetrain}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Drivetrains</SelectItem>
                                        <SelectItem value="fwd">FWD</SelectItem>
                                        <SelectItem value="rwd">RWD</SelectItem>
                                        <SelectItem value="awd">AWD</SelectItem>
                                        <SelectItem value="4wd">4WD</SelectItem>
                                        <SelectItem value="4x4">4x4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Fuel Type</Label>
                                <Select value={filterFuelType} onValueChange={setFilterFuelType}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Fuel Types</SelectItem>
                                        <SelectItem value="gasoline">Gasoline</SelectItem>
                                        <SelectItem value="diesel">Diesel</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                        <SelectItem value="electric">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Body Type</Label>
                                <Select value={filterBodyType} onValueChange={setFilterBodyType}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Body Types</SelectItem>
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
                                <Label className="text-xs text-gray-500">Cylinders</Label>
                                <Select value={filterEngineCylinders} onValueChange={setFilterEngineCylinders}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cylinders</SelectItem>
                                        <SelectItem value="3">3 Cyl</SelectItem>
                                        <SelectItem value="4">4 Cyl</SelectItem>
                                        <SelectItem value="5">5 Cyl</SelectItem>
                                        <SelectItem value="6">6 Cyl</SelectItem>
                                        <SelectItem value="8">8 Cyl</SelectItem>
                                        <SelectItem value="10">10 Cyl</SelectItem>
                                        <SelectItem value="12">12 Cyl</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                                <X className="w-4 h-4 mr-2" />
                                Clear All Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </CollapsibleContent>
        </Collapsible>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Clean Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dealerships</h3>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">{dealerships.length}</Badge>
            </div>
            
            <div className="space-y-3">
                 <button
                    onClick={() => setSelectedDealership(null)}
                    className={cn(
                        "w-full p-4 text-left transition-all rounded-2xl border group relative overflow-hidden",
                        !selectedDealership
                        ? "bg-white border-gray-200 shadow-md ring-2 ring-black ring-offset-2"
                        : "bg-white/50 border-transparent hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="relative z-10">
                        <div className="font-bold text-gray-900">All Inventory</div>
                        <div className="text-sm text-gray-500 mt-1">View all {totalInventory} vehicles</div>
                    </div>
                  </button>

              {dealerships.map(dealership => (
                <div 
                    key={dealership.id} 
                    className={cn(
                        "group relative w-full p-4 text-left transition-all rounded-2xl border hover:shadow-md",
                        selectedDealership?.id === dealership.id
                        ? "bg-white border-gray-200 shadow-md ring-2 ring-blue-600 ring-offset-2"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    )}
                    onClick={() => setSelectedDealership(dealership)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900 line-clamp-1">{dealership.name}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-gray-100 rounded-full" onClick={(e) => { e.stopPropagation(); setEditingDealership(dealership); }}>
                            <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-full" onClick={(e) => handleDeleteDealership(dealership.id, e)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3 mr-1" />
                    {dealership.location}, {dealership.province}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-normal">
                        {allCars.filter(c => c.dealershipId === dealership.id).length} Cars
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-2">
                {filteredCars.map(car => (
                    <Card key={car.id} className="hover:shadow-md transition-shadow bg-white border border-gray-200">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                {/* Status Badges */}
                                <div className="flex flex-col gap-1">
                                    {car.status === 'sold' && (
                                        <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">SOLD</Badge>
                                    )}
                                    {car.status === 'pending' && (
                                        <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0">PENDING</Badge>
                                    )}
                                    {car.status === 'available' && (
                                        <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">AVAILABLE</Badge>
                                    )}
                                    {car.carfaxStatus === 'clean' && (
                                        <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                                            <CheckCircle2 className="w-2 h-2" /> Clean
                                        </Badge>
                                    )}
                                </div>

                                {/* Vehicle Info */}
                                <div className="flex-1 grid grid-cols-12 gap-2 items-center text-sm">
                                    <div className="col-span-3">
                                        <div className="font-bold text-gray-900">{car.year} {car.make} {car.model}</div>
                                        <div className="text-xs text-gray-500">{car.trim}</div>
                                    </div>
                                    <div className="col-span-2 text-blue-600 font-bold">${parseInt(car.price).toLocaleString()}</div>
                                    <div className="col-span-2 text-gray-600 text-xs">{parseInt(car.kilometers).toLocaleString()} km</div>
                                    <div className="col-span-1 text-gray-600 text-xs capitalize">{car.color}</div>
                                    <div className="col-span-2 text-gray-600 text-xs">
                                        <span className="capitalize">{car.transmission}</span> • <span className="capitalize">{car.fuelType}</span>
                                    </div>
                                    {!selectedDealership && (
                                        <div className="col-span-2 flex items-center gap-1 text-xs text-gray-400">
                                            <Building2 className="w-3 h-3" />
                                            <span className="truncate">{car.dealershipName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1">
                                    <Button 
                                        size="sm"
                                        variant={car.status === 'sold' ? "outline" : "default"} 
                                        className={cn(
                                            "h-7 px-2 text-[10px]",
                                            car.status === 'sold' 
                                                ? "border-green-600 text-green-600 hover:bg-green-50" 
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                        )}
                                        onClick={() => toggleSoldStatusMutation.mutate(car)}
                                    >
                                        {car.status === 'sold' ? 'Available' : 'Sold'}
                                    </Button>
                                    {car.listingLink && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600" 
                                            onClick={() => window.open(car.listingLink, '_blank')}
                                            title="View Listing"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditingCar({ ...car, dealershipId: car.dealershipId }); }}>
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteCar(car.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
          </div>
        </div>
      </div>

      {/* Add Dealership Dialog */}
      <Dialog open={showAddDealership} onOpenChange={setShowAddDealership}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Dealership</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={newDealership.name}
                onChange={(e) => setNewDealership({ ...newDealership, name: e.target.value })}
                placeholder="Dealership Name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Location/City</Label>
              <Input
                value={newDealership.location}
                onChange={(e) => setNewDealership({ ...newDealership, location: e.target.value })}
                placeholder="City"
              />
            </div>
             <div className="grid gap-2">
              <Label>Province</Label>
              <Input
                value={newDealership.province}
                onChange={(e) => setNewDealership({ ...newDealership, province: e.target.value })}
                placeholder="Province (e.g. ON, BC)"
                maxLength={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                value={newDealership.address}
                onChange={(e) => setNewDealership({ ...newDealership, address: e.target.value })}
                placeholder="Full Address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Postal Code</Label>
              <Input
                value={newDealership.postalCode}
                onChange={(e) => setNewDealership({ ...newDealership, postalCode: e.target.value })}
                placeholder="A1A 1A1"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={newDealership.phone}
                onChange={(e) => setNewDealership({ ...newDealership, phone: e.target.value })}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDealership(false)}>Cancel</Button>
            <Button onClick={handleAddDealership}>Create Dealership</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dealership Dialog */}
      <Dialog open={!!editingDealership} onOpenChange={(open) => !open && setEditingDealership(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dealership</DialogTitle>
          </DialogHeader>
          {editingDealership && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editingDealership.name}
                  onChange={(e) => setEditingDealership({ ...editingDealership, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Input
                  value={editingDealership.location}
                  onChange={(e) => setEditingDealership({ ...editingDealership, location: e.target.value })}
                />
              </div>
               <div className="grid gap-2">
                <Label>Province</Label>
                <Input
                  value={editingDealership.province}
                  onChange={(e) => setEditingDealership({ ...editingDealership, province: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  value={editingDealership.address}
                  onChange={(e) => setEditingDealership({ ...editingDealership, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  value={editingDealership.phone}
                  onChange={(e) => setEditingDealership({ ...editingDealership, phone: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDealership(null)}>Cancel</Button>
            <Button onClick={handleUpdateDealership}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Car Dialog */}
      <Dialog open={!!editingCar} onOpenChange={(open) => {
        if (!open) {
          setEditingCar(null);
          setEditFeatures([]);
          setEditFeaturesChanged(false);
          setShowEditAdvanced(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingCar && (
            <ScrollArea className="max-h-[600px] pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>VIN</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="17-digit VIN" 
                    value={editingCar.vin || ""} 
                    onChange={(e) => setEditingCar({ ...editingCar, vin: e.target.value.toUpperCase() })} 
                    maxLength={17}
                  />
                  <Button variant="secondary" size="icon" onClick={handleDecodeEditCarVin} disabled={isDecodingEditCar}>
                    {isDecodingEditCar ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Stock Number</Label>
                  <Input
                    placeholder="Stock #"
                    value={editingCar.stockNumber || ""}
                    onChange={(e) => setEditingCar({ ...editingCar, stockNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Condition</Label>
                  <Select value={editingCar.condition || "used"} onValueChange={(val: any) => setEditingCar({ ...editingCar, condition: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Make</Label>
                  <Select value={editingCar.make} onValueChange={(val) => setEditingCar({ ...editingCar, make: val })}>
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
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Input
                    value={editingCar.model}
                    onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Year</Label>
                  <Input
                    value={editingCar.year}
                    onChange={(e) => setEditingCar({ ...editingCar, year: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Trim</Label>
                  <Select value={editingCar.trim} onValueChange={(val) => setEditingCar({ ...editingCar, trim: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Trim" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableEditTrims.length > 0 ? (
                        availableEditTrims.map(trim => (
                          <SelectItem key={trim} value={trim}>{trim}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="Base">Base</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid gap-2">
                  <Label>Price</Label>
                  <Input
                    value={editingCar.price}
                    onChange={(e) => setEditingCar({ ...editingCar, price: e.target.value })}
                  />
                </div>
                 <div className="grid gap-2">
                  <Label>Kilometers</Label>
                  <Input
                    value={editingCar.kilometers}
                    onChange={(e) => setEditingCar({ ...editingCar, kilometers: e.target.value })}
                  />
                </div>
                 <div className="grid gap-2">
                  <Label>Color</Label>
                  <Select value={editingCar.color} onValueChange={(val) => setEditingCar({ ...editingCar, color: val })}>
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
                <div className="grid gap-2">
                  <Label>Transmission</Label>
                  <Select value={editingCar.transmission || ""} onValueChange={(val) => setEditingCar({ ...editingCar, transmission: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="cvt">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Fuel Type</Label>
                  <Select value={editingCar.fuelType || ""} onValueChange={(val) => setEditingCar({ ...editingCar, fuelType: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Body Type</Label>
                  <Select value={editingCar.bodyType || ""} onValueChange={(val) => setEditingCar({ ...editingCar, bodyType: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Body Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="convertible">Convertible</SelectItem>
                      <SelectItem value="wagon">Wagon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={editingCar.status} onValueChange={(val: any) => setEditingCar({ ...editingCar, status: val })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Carfax Status</Label>
                  <Select value={editingCar.carfaxStatus || "unavailable"} onValueChange={(val: any) => setEditingCar({ ...editingCar, carfaxStatus: val })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="clean">Clean</SelectItem>
                        <SelectItem value="claims">Claims/Rebuilt</SelectItem>
                        <SelectItem value="unavailable">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Collapsible open={showEditAdvanced} onOpenChange={setShowEditAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {showEditAdvanced ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    Advanced Specs & Features
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Drivetrain</Label>
                      <Select value={editingCar.drivetrain || "fwd"} onValueChange={(val) => setEditingCar({ ...editingCar, drivetrain: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Drivetrain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fwd">FWD</SelectItem>
                          <SelectItem value="rwd">RWD</SelectItem>
                          <SelectItem value="awd">AWD</SelectItem>
                          <SelectItem value="4wd">4WD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Engine Cylinders</Label>
                      <Input
                        placeholder="e.g. 4, 6, 8"
                        value={editingCar.engineCylinders || ""}
                        onChange={(e) => setEditingCar({ ...editingCar, engineCylinders: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Engine Displacement (L)</Label>
                      <Input
                        placeholder="e.g. 2.0, 3.5"
                        value={editingCar.engineDisplacement || ""}
                        onChange={(e) => setEditingCar({ ...editingCar, engineDisplacement: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Key Features</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {FEATURES_LIST.map(feature => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-${feature}`} 
                            checked={editFeatures.includes(feature)}
                            onCheckedChange={() => toggleEditFeature(feature)}
                          />
                          <label htmlFor={`edit-${feature}`} className="text-sm font-medium leading-none cursor-pointer">
                            {feature}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <div className="grid gap-2">
                <Label>Listing URL</Label>
                <Input
                  placeholder="https://..."
                  value={editingCar.listingLink}
                  onChange={(e) => setEditingCar({ ...editingCar, listingLink: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Carfax URL</Label>
                <Input
                  placeholder="https://..."
                  value={editingCar.carfaxLink}
                  onChange={(e) => setEditingCar({ ...editingCar, carfaxLink: e.target.value })}
                />
              </div>
               <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional vehicle details..."
                  value={editingCar.notes}
                  onChange={(e) => setEditingCar({ ...editingCar, notes: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCar(null)}>Cancel</Button>
            <Button onClick={handleUpdateCar}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
