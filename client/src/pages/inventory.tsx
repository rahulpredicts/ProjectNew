import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Car as CarIcon,
  Building2,
  Filter,
  ArrowUpDown,
  MapPin,
  Phone,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Fuel,
  Gauge,
  Settings2,
  Calendar,
  Palette,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { INITIAL_DEALERSHIPS, Dealership, Car } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const { toast } = useToast();
  const [dealerships, setDealerships] = useState<Dealership[]>(INITIAL_DEALERSHIPS);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [showAddDealership, setShowAddDealership] = useState(false);
  const [showAddCar, setShowAddCar] = useState(false);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced Filters
  const [filterMake, setFilterMake] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterVin, setFilterVin] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterTrim, setFilterTrim] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterKmsMin, setFilterKmsMin] = useState("");
  const [filterKmsMax, setFilterKmsMax] = useState("");
  const [sortBy, setSortBy] = useState("addedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form states
  const [newDealership, setNewDealership] = useState<Partial<Dealership>>({
    name: "",
    location: "",
    address: "",
    postalCode: "",
    phone: "",
  });

  const [newCar, setNewCar] = useState<Partial<Car>>({
    vin: "",
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
    notes: "",
    dealershipId: "",
    status: 'available'
  });

  // Mock CRUD Operations
  const addDealership = () => {
    if (!newDealership.name || !newDealership.address) {
      toast({ title: "Error", description: "Please fill in required fields: name and address", variant: "destructive" });
      return;
    }
    const dealership: Dealership = {
      ...newDealership as Dealership,
      id: Math.random().toString(36).substr(2, 9),
      inventory: []
    };
    setDealerships([...dealerships, dealership]);
    setNewDealership({ name: "", location: "", address: "", postalCode: "", phone: "" });
    setShowAddDealership(false);
    toast({ title: "Success", description: "Dealership added successfully" });
  };

  const updateDealership = () => {
    if (!editingDealership) return;
    setDealerships(dealerships.map(d => d.id === editingDealership.id ? editingDealership : d));
    if (selectedDealership?.id === editingDealership.id) {
      setSelectedDealership(editingDealership);
    }
    setEditingDealership(null);
    toast({ title: "Success", description: "Dealership updated" });
  };

  const deleteDealership = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure? This will delete all cars in this dealership.")) return;
    setDealerships(dealerships.filter(d => d.id !== id));
    if (selectedDealership?.id === id) setSelectedDealership(null);
    toast({ title: "Deleted", description: "Dealership removed" });
  };

  const addCar = () => {
    const targetDealershipId = selectedDealership?.id || newCar.dealershipId;

    if (!targetDealershipId) {
        toast({ title: "Error", description: "Please select a dealership first", variant: "destructive" });
        return;
    }

    if (!newCar.vin || !newCar.make || !newCar.model) {
      toast({ title: "Error", description: "Please fill in VIN, Make, and Model", variant: "destructive" });
      return;
    }
    
    const car: Car = {
      ...newCar as Car,
      id: Math.random().toString(36).substr(2, 9),
      dealershipId: targetDealershipId,
      status: 'available'
    };

    const updatedDealerships = dealerships.map(d => {
      if (d.id === targetDealershipId) {
        return { ...d, inventory: [...d.inventory, car] };
      }
      return d;
    });

    setDealerships(updatedDealerships);
    
    if (selectedDealership?.id === targetDealershipId) {
        setSelectedDealership(updatedDealerships.find(d => d.id === targetDealershipId) || null);
    }

    setNewCar({
      vin: "", make: "", model: "", trim: "", year: "", color: "",
      price: "", kilometers: "", transmission: "", fuelType: "", bodyType: "",
      listingLink: "", carfaxLink: "", notes: "", dealershipId: "", status: 'available'
    });
    setShowAddCar(false);
    toast({ title: "Success", description: "Car added to inventory" });
  };

  const updateCar = () => {
    if (!editingCar || !editingCar.dealershipId) return;
    
    const updatedDealerships = dealerships.map(d => {
      if (d.id === editingCar.dealershipId) {
        return {
          ...d,
          inventory: d.inventory.map(c => c.id === editingCar.id ? editingCar : c)
        };
      }
      return d;
    });

    setDealerships(updatedDealerships);
    if (selectedDealership?.id === editingCar.dealershipId) {
      setSelectedDealership(updatedDealerships.find(d => d.id === editingCar.dealershipId) || null);
    }
    setEditingCar(null);
    toast({ title: "Success", description: "Car updated" });
  };

  const deleteCar = (dealershipId: string, carId: string) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    
    const updatedDealerships = dealerships.map(d => {
      if (d.id === dealershipId) {
        return { ...d, inventory: d.inventory.filter(c => c.id !== carId) };
      }
      return d;
    });

    setDealerships(updatedDealerships);
    if (selectedDealership?.id === dealershipId) {
      setSelectedDealership(updatedDealerships.find(d => d.id === dealershipId) || null);
    }
    toast({ title: "Deleted", description: "Car removed from inventory" });
  };

  const toggleSoldStatus = (car: Car) => {
    const newStatus = car.status === 'sold' ? 'available' : 'sold';
    const updatedCar = { ...car, status: newStatus };
    
    const updatedDealerships = dealerships.map(d => {
        if (d.id === car.dealershipId) {
            return {
                ...d,
                inventory: d.inventory.map(c => c.id === car.id ? updatedCar : c)
            };
        }
        return d;
    });

    setDealerships(updatedDealerships);
    if (selectedDealership?.id === car.dealershipId) {
        setSelectedDealership(updatedDealerships.find(d => d.id === car.dealershipId) || null);
    }
    toast({ 
        title: newStatus === 'sold' ? "Marked as Sold" : "Marked as Available", 
        description: `${car.year} ${car.make} ${car.model} is now ${newStatus}.` 
    });
  };

  const getAllCars = () => {
    return dealerships.flatMap(d =>
      d.inventory.map(car => ({
        ...car,
        dealershipName: d.name,
        dealershipId: d.id,
        dealershipLocation: d.location
      }))
    );
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
        car.transmission?.toLowerCase().includes(term) || 
        car.year?.toString().includes(term) ||
        car.trim?.toLowerCase().includes(term)
      );
    }

    if (filterMake) cars = cars.filter(c => c.make?.toLowerCase().includes(filterMake.toLowerCase()));
    if (filterModel) cars = cars.filter(c => c.model?.toLowerCase().includes(filterModel.toLowerCase()));
    if (filterVin) cars = cars.filter(c => c.vin?.toLowerCase().includes(filterVin.toLowerCase()));
    if (filterColor) cars = cars.filter(c => c.color?.toLowerCase().includes(filterColor.toLowerCase()));
    if (filterTrim) cars = cars.filter(c => c.trim?.toLowerCase().includes(filterTrim.toLowerCase()));
    if (filterYear) cars = cars.filter(c => c.year?.toString().includes(filterYear));
    if (filterPriceMin) cars = cars.filter(c => parseFloat(c.price || "0") >= parseFloat(filterPriceMin));
    if (filterPriceMax) cars = cars.filter(c => parseFloat(c.price || "0") <= parseFloat(filterPriceMax));
    if (filterKmsMin) cars = cars.filter(c => parseFloat(c.kilometers || "0") >= parseFloat(filterKmsMin));
    if (filterKmsMax) cars = cars.filter(c => parseFloat(c.kilometers || "0") <= parseFloat(filterKmsMax));

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
    setFilterColor("");
    setFilterTrim("");
    setFilterYear("");
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterKmsMin("");
    setFilterKmsMax("");
  };

  const totalInventory = dealerships.reduce((sum, d) => sum + d.inventory.length, 0);
  const filteredCars = getFilteredCars();

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
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
            <Button onClick={() => setShowAddDealership(true)} variant="outline" size="lg" className="rounded-full h-12 px-6 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all">
              <Building2 className="w-4 h-4 mr-2" />
              New Dealership
            </Button>
            <Button onClick={() => setShowAddCar(true)} size="lg" className="rounded-full h-12 px-6 shadow-lg hover:shadow-xl transition-all bg-black hover:bg-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="relative max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search by VIN, make, model, or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg bg-white border-0 shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:shadow-md"
            />
             <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters} className="absolute right-2 top-1/2 -translate-y-1/2">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 px-3 rounded-xl hover:bg-gray-100 text-gray-500">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Expanded Filters */}
        <Collapsible open={showAdvancedFilters}>
            <CollapsibleContent className="animate-in slide-in-from-top-5 fade-in duration-200 pt-4">
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                         {['Make', 'Model', 'Year', 'Color', 'Trim', 'VIN'].map((placeholder, i) => {
                            const stateMap = [filterMake, filterModel, filterYear, filterColor, filterTrim, filterVin];
                            const setterMap = [setFilterMake, setFilterModel, setFilterYear, setFilterColor, setFilterTrim, setFilterVin];
                            return (
                                <Input 
                                    key={placeholder}
                                    placeholder={placeholder}
                                    value={stateMap[i]}
                                    onChange={(e) => setterMap[i](e.target.value)}
                                    className="h-10 bg-white border-gray-200 rounded-lg"
                                />
                            )
                        })}
                         <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-gray-900">
                            Reset All
                        </Button>
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
                        "group relative p-4 rounded-2xl border transition-all cursor-pointer",
                        selectedDealership?.id === dealership.id
                          ? "bg-white border-gray-200 shadow-md ring-2 ring-black ring-offset-2"
                          : "bg-white/50 border-transparent hover:bg-white hover:shadow-sm"
                      )}
                      onClick={() => setSelectedDealership(dealership)}
                    >
                      <div className="pr-8">
                        <div className="font-bold text-gray-900 mb-1">{dealership.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{dealership.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                                {dealership.inventory.length} Cars
                            </Badge>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setEditingDealership(dealership); }}>
                            <Edit2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50" onClick={(e) => deleteDealership(dealership.id, e)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Modern Grid */}
          <div className="lg:col-span-9">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map(car => (
                    <Card key={`${car.dealershipId}-${car.id}`} className={cn(
                        "group border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl relative",
                        car.status === 'sold' && "opacity-80 hover:opacity-100"
                    )}>
                        {car.status === 'sold' && (
                            <div className="absolute top-0 right-0 z-20 p-4">
                                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-0 uppercase tracking-wider">
                                    Sold
                                </div>
                            </div>
                        )}
                        
                        <CardHeader className="p-0">
                            <div className={cn(
                                "h-3 transition-all duration-500",
                                car.status === 'sold' 
                                    ? "bg-gray-200" 
                                    : "bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-blue-500 group-hover:to-purple-500"
                            )} />
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">{car.year}</div>
                                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                                        {car.make} {car.model}
                                    </h3>
                                    <div className="text-sm text-gray-500 font-medium mt-1">{car.trim}</div>
                                </div>
                                <Badge variant="outline" className="font-mono text-xs tracking-wide border-gray-200 text-gray-500">
                                    {car.vin.slice(-6)}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge variant="secondary" className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-0">
                                    <Palette className="w-3 h-3 mr-1" /> {car.color}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-0">
                                    <Settings2 className="w-3 h-3 mr-1" /> {car.transmission}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-0">
                                    <Fuel className="w-3 h-3 mr-1" /> {car.fuelType}
                                </Badge>
                            </div>

                            <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                                <div>
                                    <div className="text-sm text-gray-400 font-medium mb-0.5">Price</div>
                                    <div className={cn(
                                        "text-2xl font-bold tracking-tight",
                                        car.status === 'sold' ? "text-gray-400 line-through decoration-2" : "text-gray-900"
                                    )}>
                                        ${parseFloat(car.price).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400 font-medium mb-0.5">Mileage</div>
                                    <div className="text-lg font-semibold text-gray-700 flex items-center justify-end gap-1">
                                        <Gauge className="w-4 h-4 text-gray-400" />
                                        {parseFloat(car.kilometers).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                             {/* Hover Actions */}
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 z-30">
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className={cn(
                                        "h-8 px-3 rounded-full backdrop-blur shadow-sm text-xs font-medium",
                                        car.status === 'sold' 
                                            ? "bg-green-50 text-green-700 hover:bg-green-100" 
                                            : "bg-gray-900 text-white hover:bg-black"
                                    )}
                                    onClick={() => toggleSoldStatus(car)}
                                >
                                    {car.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                                </Button>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-blue-50" onClick={() => { setEditingCar({ ...car, dealershipId: car.dealershipId }); }}>
                                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                </Button>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-red-50" onClick={() => deleteCar(car.dealershipId!, car.id)}>
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </Button>
                            </div>

                            {!selectedDealership && (
                                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                                    <Building2 className="w-3 h-3" />
                                    {car.dealershipName}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {filteredCars.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <CarIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            We couldn't find any cars matching your search criteria. Try adjusting your filters or add a new vehicle.
                        </p>
                        <Button onClick={() => setShowAddCar(true)} size="lg" className="rounded-full px-8">
                            Add New Vehicle
                        </Button>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Add Dealership Modal */}
        <Dialog open={showAddDealership} onOpenChange={setShowAddDealership}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-gray-50/50 border-b">
                    <DialogTitle className="text-xl">Add New Dealership</DialogTitle>
                </DialogHeader>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Dealership Name</Label>
                        <Input placeholder="e.g. Downtown Toyota" value={newDealership.name} onChange={(e) => setNewDealership({ ...newDealership, name: e.target.value })} className="h-11 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input placeholder="City" value={newDealership.location} onChange={(e) => setNewDealership({ ...newDealership, location: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                         <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input placeholder="ZIP/Postal" value={newDealership.postalCode} onChange={(e) => setNewDealership({ ...newDealership, postalCode: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input placeholder="Street Address" value={newDealership.address} onChange={(e) => setNewDealership({ ...newDealership, address: e.target.value })} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="(555) 000-0000" value={newDealership.phone} onChange={(e) => setNewDealership({ ...newDealership, phone: e.target.value })} className="h-11 rounded-xl" />
                    </div>
                </div>
                <DialogFooter className="p-6 bg-gray-50/50 border-t">
                    <Button variant="outline" onClick={() => setShowAddDealership(false)} className="rounded-xl h-11">Cancel</Button>
                    <Button onClick={addDealership} className="rounded-xl h-11 px-8">Create Dealership</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

       {/* Edit Dealership Modal - reusing styled content */}
       <Dialog open={!!editingDealership} onOpenChange={(open) => !open && setEditingDealership(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-gray-50/50 border-b">
            <DialogTitle className="text-xl">Edit Dealership</DialogTitle>
          </DialogHeader>
          {editingDealership && (
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editingDealership.name} onChange={(e) => setEditingDealership({ ...editingDealership, name: e.target.value })} className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={editingDealership.location} onChange={(e) => setEditingDealership({ ...editingDealership, location: e.target.value })} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input value={editingDealership.postalCode} onChange={(e) => setEditingDealership({ ...editingDealership, postalCode: e.target.value })} className="h-11 rounded-xl" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={editingDealership.address} onChange={(e) => setEditingDealership({ ...editingDealership, address: e.target.value })} className="h-11 rounded-xl" />
                </div>
                 <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={editingDealership.phone} onChange={(e) => setEditingDealership({ ...editingDealership, phone: e.target.value })} className="h-11 rounded-xl" />
                </div>
            </div>
          )}
          <DialogFooter className="p-6 bg-gray-50/50 border-t">
            <Button variant="outline" onClick={() => setEditingDealership(null)} className="rounded-xl h-11">Cancel</Button>
            <Button onClick={updateDealership} className="rounded-xl h-11 px-8">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Car Modal */}
      <Dialog open={showAddCar || !!editingCar} onOpenChange={(open) => { if(!open) { setShowAddCar(false); setEditingCar(null); }}}>
        <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-gray-50/50 border-b">
            <DialogTitle className="text-xl">{editingCar ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dealership Selection if not editing and no dealership selected */}
                {!editingCar && !selectedDealership && (
                    <div className="col-span-2 space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <Label className="text-blue-900">Select Dealership *</Label>
                        <Select 
                            value={newCar.dealershipId} 
                            onValueChange={(val) => setNewCar({ ...newCar, dealershipId: val })}
                        >
                            <SelectTrigger className="bg-white border-blue-200 h-11 rounded-lg">
                                <SelectValue placeholder="Choose a dealership" />
                            </SelectTrigger>
                            <SelectContent>
                                {dealerships.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {(() => {
                    const target = editingCar || newCar;
                    const setTarget = editingCar ? setEditingCar : setNewCar;
                    // Helper to update field
                    const update = (field: string, val: string) => {
                        // @ts-ignore
                        setTarget({ ...target, [field]: val });
                    }

                    return (
                        <>
                            <div className="space-y-2"><Label>VIN *</Label><Input placeholder="Vehicle Identification Number" value={target.vin} onChange={(e) => update('vin', e.target.value)} className="h-11 rounded-xl" /></div>
                            
                            <div className="col-span-2 grid grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Make *</Label><Input placeholder="e.g. Toyota" value={target.make} onChange={(e) => update('make', e.target.value)} className="h-11 rounded-xl" /></div>
                                <div className="space-y-2"><Label>Model *</Label><Input placeholder="e.g. Camry" value={target.model} onChange={(e) => update('model', e.target.value)} className="h-11 rounded-xl" /></div>
                                <div className="space-y-2"><Label>Year</Label><Input placeholder="YYYY" value={target.year} onChange={(e) => update('year', e.target.value)} className="h-11 rounded-xl" /></div>
                            </div>

                            <div className="space-y-2"><Label>Trim</Label><Input placeholder="e.g. XLE" value={target.trim} onChange={(e) => update('trim', e.target.value)} className="h-11 rounded-xl" /></div>
                            <div className="space-y-2"><Label>Color</Label><Input placeholder="Exterior Color" value={target.color} onChange={(e) => update('color', e.target.value)} className="h-11 rounded-xl" /></div>
                            
                            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" placeholder="0.00" value={target.price} onChange={(e) => update('price', e.target.value)} className="h-11 rounded-xl font-mono" /></div>
                            <div className="space-y-2"><Label>Mileage (km)</Label><Input type="number" placeholder="0" value={target.kilometers} onChange={(e) => update('kilometers', e.target.value)} className="h-11 rounded-xl font-mono" /></div>
                            
                            <div className="space-y-2"><Label>Transmission</Label><Input placeholder="e.g. Automatic" value={target.transmission} onChange={(e) => update('transmission', e.target.value)} className="h-11 rounded-xl" /></div>
                            <div className="space-y-2"><Label>Fuel Type</Label><Input placeholder="e.g. Gasoline" value={target.fuelType} onChange={(e) => update('fuelType', e.target.value)} className="h-11 rounded-xl" /></div>
                            
                            <div className="space-y-2"><Label>Body Type</Label><Input placeholder="e.g. Sedan" value={target.bodyType} onChange={(e) => update('bodyType', e.target.value)} className="h-11 rounded-xl" /></div>
                            <div className="space-y-2"><Label>Listing URL</Label><Input placeholder="https://..." value={target.listingLink} onChange={(e) => update('listingLink', e.target.value)} className="h-11 rounded-xl" /></div>
                            <div className="space-y-2"><Label>Carfax URL</Label><Input placeholder="https://..." value={target.carfaxLink} onChange={(e) => update('carfaxLink', e.target.value)} className="h-11 rounded-xl" /></div>
                            
                            <div className="col-span-2 space-y-2">
                                <Label>Notes</Label>
                                <Input placeholder="Additional details..." value={target.notes} onChange={(e) => update('notes', e.target.value)} className="h-11 rounded-xl" />
                            </div>
                        </>
                    )
                })()}
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 bg-gray-50/50 border-t">
            <Button variant="outline" onClick={() => { setShowAddCar(false); setEditingCar(null); }} className="rounded-xl h-11">Cancel</Button>
            <Button onClick={editingCar ? updateCar : addCar} className="rounded-xl h-11 px-8">{editingCar ? 'Save Changes' : 'Add Vehicle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
