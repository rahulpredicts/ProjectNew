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
  SlidersHorizontal
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

export default function Inventory() {
  const { toast } = useToast();
  const [dealerships, setDealerships] = useState<Dealership[]>(INITIAL_DEALERSHIPS);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [showAddDealership, setShowAddDealership] = useState(false);
  const [showAddCar, setShowAddCar] = useState(false);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false); // No real loading needed for mock

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
    dealershipId: "", // Added to support dealership selection
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
      dealershipId: targetDealershipId
    };

    const updatedDealerships = dealerships.map(d => {
      if (d.id === targetDealershipId) {
        return { ...d, inventory: [...d.inventory, car] };
      }
      return d;
    });

    setDealerships(updatedDealerships);
    
    // If we are currently viewing the dealership we added to, update the view
    if (selectedDealership?.id === targetDealershipId) {
        setSelectedDealership(updatedDealerships.find(d => d.id === targetDealershipId) || null);
    }

    setNewCar({
      vin: "", make: "", model: "", trim: "", year: "", color: "",
      price: "", kilometers: "", transmission: "", fuelType: "", bodyType: "",
      listingLink: "", carfaxLink: "", notes: "", dealershipId: ""
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
        // @ts-ignore - dynamic sort key access
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
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl shadow-sm border border-border/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-foreground">
              <CarIcon className="w-8 h-8 text-primary" />
              Dealership Inventory
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {dealerships.length} dealerships • <span className="font-semibold text-foreground">{totalInventory}</span> total cars • <span className="font-semibold text-foreground">{filteredCars.length}</span> filtered
            </p>
          </div>
          <Button onClick={() => setShowAddDealership(true)} size="lg" className="gap-2 shadow-md transition-all hover:scale-105">
            <Plus className="w-5 h-5" />
            Add Dealership
          </Button>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by VIN, Make, Model, Transmission, Color, Dealership..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg bg-muted/30"
                />
              </div>
               <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                   <CollapsibleTrigger asChild>
                        <Button variant="outline" className="h-12 px-4 gap-2 border-input bg-background hover:bg-accent hover:text-accent-foreground">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </Button>
                   </CollapsibleTrigger>
               </Collapsible>
            </div>

            <Collapsible open={showAdvancedFilters}>
                <CollapsibleContent className="space-y-6 animate-in slide-in-from-top-5 fade-in duration-200">
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                        {/* Filter Inputs */}
                        {['Make', 'Model', 'Year', 'Color', 'Trim', 'VIN'].map((placeholder, i) => {
                            const stateMap = [filterMake, filterModel, filterYear, filterColor, filterTrim, filterVin];
                            const setterMap = [setFilterMake, setFilterModel, setFilterYear, setFilterColor, setFilterTrim, setFilterVin];
                            return (
                                <Input 
                                    key={placeholder}
                                    placeholder={placeholder}
                                    value={stateMap[i]}
                                    onChange={(e) => setterMap[i](e.target.value)}
                                    className="h-9"
                                />
                            )
                        })}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Min Price', 'Max Price', 'Min KMs', 'Max KMs'].map((placeholder, i) => {
                            const stateMap = [filterPriceMin, filterPriceMax, filterKmsMin, filterKmsMax];
                            const setterMap = [setFilterPriceMin, setFilterPriceMax, setFilterKmsMin, setFilterKmsMax];
                            return (
                                <Input 
                                    key={placeholder}
                                    type="number"
                                    placeholder={placeholder}
                                    value={stateMap[i]}
                                    onChange={(e) => setterMap[i](e.target.value)}
                                    className="h-9"
                                />
                            )
                        })}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="addedDate">Date Added</SelectItem>
                                    <SelectItem value="price">Price</SelectItem>
                                    <SelectItem value="kilometers">Kilometers</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                    <SelectItem value="make">Make</SelectItem>
                                    <SelectItem value="model">Model</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="gap-2">
                                <ArrowUpDown className="w-4 h-4" />
                                {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
                            </Button>
                        </div>
                        
                        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                            Clear All Filters
                        </Button>
                    </div>
                </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-350px)]">
          {/* Dealerships Sidebar */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="pb-3 bg-muted/30 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                Dealerships
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => setSelectedDealership(null)}
                    className={`w-full p-4 text-left transition-all rounded-lg border-2 group ${
                      !selectedDealership
                        ? "border-primary/20 bg-primary/5"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">All Dealerships</div>
                    <div className="text-sm text-muted-foreground">{totalInventory} cars total</div>
                  </button>
                  
                  {dealerships.map(dealership => (
                    <div
                      key={dealership.id}
                      className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedDealership?.id === dealership.id
                          ? "border-primary/20 bg-primary/5"
                          : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => setSelectedDealership(dealership)}
                    >
                      <div className="pr-16">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{dealership.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {dealership.location}
                        </div>
                        <Badge variant="secondary" className="mt-2 text-xs font-normal">
                            {dealership.inventory.length} cars
                        </Badge>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingDealership(dealership); }}>
                            <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => deleteDealership(dealership.id, e)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Cars Grid */}
          <Card className="lg:col-span-3 flex flex-col overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="pb-3 bg-muted/30 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CarIcon className="w-5 h-5 text-primary" />
                        {selectedDealership ? selectedDealership.name : "All Inventory"}
                    </CardTitle>
                    
                    <Button onClick={() => setShowAddCar(true)} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Add Car
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredCars.map(car => (
                            <div key={`${car.dealershipId}-${car.id}`} className="group bg-card border border-border/60 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                                            {car.year} {car.make} {car.model}
                                        </h3>
                                        {car.trim && <Badge variant="outline" className="mt-1 font-medium text-muted-foreground">{car.trim}</Badge>}
                                        {!selectedDealership && (
                                            <div className="flex items-center gap-1 text-xs text-primary mt-2 font-medium">
                                                <Building2 className="w-3 h-3" /> {car.dealershipName} • {car.dealershipLocation}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCar({ ...car, dealershipId: car.dealershipId }); }}>
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCar(car.dealershipId!, car.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4">
                                    <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Price</span>
                                        <span className="font-bold text-green-600 text-base">${parseFloat(car.price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Kilometers</span>
                                        <span className="font-medium">{parseFloat(car.kilometers).toLocaleString()} km</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">VIN</span>
                                        <span className="font-mono text-xs">{car.vin}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Color</span>
                                        <span>{car.color}</span>
                                    </div>
                                     <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Fuel</span>
                                        <span>{car.fuelType}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Trans</span>
                                        <span>{car.transmission}</span>
                                    </div>
                                </div>

                                {car.notes && (
                                    <div className="text-sm text-amber-800 bg-amber-50 p-3 rounded-md border border-amber-100 mb-4">
                                        <span className="font-semibold">Notes:</span> {car.notes}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-auto pt-2">
                                    {car.listingLink && (
                                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
                                            <a href={car.listingLink} target="_blank" rel="noopener noreferrer">View Listing</a>
                                        </Button>
                                    )}
                                    {car.carfaxLink && (
                                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
                                            <a href={car.carfaxLink} target="_blank" rel="noopener noreferrer">Carfax</a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredCars.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <CarIcon className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No cars found</p>
                                <p className="text-sm opacity-60">
                                    {selectedDealership ? "Add a car to this dealership" : "Select a dealership or add a car"}
                                </p>
                                <Button variant="link" onClick={() => setShowAddCar(true)}>
                                    Add New Car
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Add Dealership Modal */}
        <Dialog open={showAddDealership} onOpenChange={setShowAddDealership}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Dealership</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Dealership Name *" value={newDealership.name} onChange={(e) => setNewDealership({ ...newDealership, name: e.target.value })} />
                <Input placeholder="Location (e.g., Montreal)" value={newDealership.location} onChange={(e) => setNewDealership({ ...newDealership, location: e.target.value })} />
                <Input placeholder="Address *" value={newDealership.address} onChange={(e) => setNewDealership({ ...newDealership, address: e.target.value })} />
                <Input placeholder="Postal Code" value={newDealership.postalCode} onChange={(e) => setNewDealership({ ...newDealership, postalCode: e.target.value })} />
                <Input placeholder="Phone Number" value={newDealership.phone} onChange={(e) => setNewDealership({ ...newDealership, phone: e.target.value })} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDealership(false)}>Cancel</Button>
                <Button onClick={addDealership}>Add Dealership</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

       {/* Edit Dealership Modal */}
       <Dialog open={!!editingDealership} onOpenChange={(open) => !open && setEditingDealership(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dealership</DialogTitle>
          </DialogHeader>
          {editingDealership && (
             <div className="space-y-4 py-4">
                <Input placeholder="Dealership Name" value={editingDealership.name} onChange={(e) => setEditingDealership({ ...editingDealership, name: e.target.value })} />
                <Input placeholder="Location" value={editingDealership.location} onChange={(e) => setEditingDealership({ ...editingDealership, location: e.target.value })} />
                <Input placeholder="Address" value={editingDealership.address} onChange={(e) => setEditingDealership({ ...editingDealership, address: e.target.value })} />
                <Input placeholder="Postal Code" value={editingDealership.postalCode} onChange={(e) => setEditingDealership({ ...editingDealership, postalCode: e.target.value })} />
                <Input placeholder="Phone" value={editingDealership.phone} onChange={(e) => setEditingDealership({ ...editingDealership, phone: e.target.value })} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDealership(null)}>Cancel</Button>
            <Button onClick={updateDealership}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Car Modal */}
      <Dialog open={showAddCar || !!editingCar} onOpenChange={(open) => { if(!open) { setShowAddCar(false); setEditingCar(null); }}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCar ? 'Edit Car' : 'Add Car'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Dealership Selection if not editing and no dealership selected */}
            {!editingCar && !selectedDealership && (
                <div className="col-span-2 space-y-2">
                    <Label>Select Dealership *</Label>
                    <Select 
                        value={newCar.dealershipId} 
                        onValueChange={(val) => setNewCar({ ...newCar, dealershipId: val })}
                    >
                        <SelectTrigger>
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
                        <div className="space-y-2"><Input placeholder="VIN *" value={target.vin} onChange={(e) => update('vin', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Make *" value={target.make} onChange={(e) => update('make', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Model *" value={target.model} onChange={(e) => update('model', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Year" value={target.year} onChange={(e) => update('year', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Trim" value={target.trim} onChange={(e) => update('trim', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Color" value={target.color} onChange={(e) => update('color', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Price" type="number" value={target.price} onChange={(e) => update('price', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Kilometers" type="number" value={target.kilometers} onChange={(e) => update('kilometers', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Transmission" value={target.transmission} onChange={(e) => update('transmission', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Fuel Type" value={target.fuelType} onChange={(e) => update('fuelType', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Body Type" value={target.bodyType} onChange={(e) => update('bodyType', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Listing URL" value={target.listingLink} onChange={(e) => update('listingLink', e.target.value)} /></div>
                        <div className="space-y-2"><Input placeholder="Carfax URL" value={target.carfaxLink} onChange={(e) => update('carfaxLink', e.target.value)} /></div>
                        <div className="col-span-2 space-y-2"><Input placeholder="Notes" value={target.notes} onChange={(e) => update('notes', e.target.value)} /></div>
                    </>
                )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddCar(false); setEditingCar(null); }}>Cancel</Button>
            <Button onClick={editingCar ? updateCar : addCar}>{editingCar ? 'Save Changes' : 'Add Car'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
