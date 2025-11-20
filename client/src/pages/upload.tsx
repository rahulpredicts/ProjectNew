import { useState, useRef } from "react";
import { useInventory } from "@/lib/inventory-context";
import { Car, Dealership } from "@/lib/mock-data";
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
import { Upload as UploadIcon, FileText, Image as ImageIcon, Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const { dealerships, addCar } = useInventory();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  // Manual Entry State
  const [newCar, setNewCar] = useState<Partial<Car>>({
    vin: "", make: "", model: "", trim: "", year: "", color: "",
    price: "", kilometers: "", transmission: "", fuelType: "", bodyType: "",
    listingLink: "", carfaxLink: "", notes: "", dealershipId: "", status: 'available'
  });

  // Bulk CSV State
  const [csvData, setCsvData] = useState("");
  
  // AI Scan State
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<Partial<Car> | null>(null);

  const handleManualSubmit = () => {
    if (!newCar.dealershipId) {
        toast({ title: "Error", description: "Please select a dealership", variant: "destructive" });
        return;
    }
    if (!newCar.make || !newCar.model) {
        toast({ title: "Error", description: "Make and Model are required", variant: "destructive" });
        return;
    }
    
    const car: Car = {
        ...newCar as Car,
        id: Math.random().toString(36).substr(2, 9),
        status: 'available'
    };
    
    addCar(car);
    setNewCar({
        vin: "", make: "", model: "", trim: "", year: "", color: "",
        price: "", kilometers: "", transmission: "", fuelType: "", bodyType: "",
        listingLink: "", carfaxLink: "", notes: "", dealershipId: newCar.dealershipId, status: 'available'
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
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100 p-1 rounded-xl h-auto">
          <TabsTrigger value="manual" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bulk CSV</TabsTrigger>
          <TabsTrigger value="scan" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Scan (PDF/Img)</TabsTrigger>
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
                    <SelectContent>
                        {dealerships.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2"><Label>VIN</Label><Input placeholder="Vehicle Identification Number" value={newCar.vin} onChange={(e) => setNewCar({...newCar, vin: e.target.value})} /></div>
                <div className="space-y-2"><Label>Make *</Label><Input placeholder="e.g. Toyota" value={newCar.make} onChange={(e) => setNewCar({...newCar, make: e.target.value})} /></div>
                <div className="space-y-2"><Label>Model *</Label><Input placeholder="e.g. Camry" value={newCar.model} onChange={(e) => setNewCar({...newCar, model: e.target.value})} /></div>
                <div className="space-y-2"><Label>Year</Label><Input placeholder="YYYY" value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} /></div>
                <div className="space-y-2"><Label>Trim</Label><Input placeholder="e.g. XLE" value={newCar.trim} onChange={(e) => setNewCar({...newCar, trim: e.target.value})} /></div>
                <div className="space-y-2"><Label>Color</Label><Input placeholder="Exterior Color" value={newCar.color} onChange={(e) => setNewCar({...newCar, color: e.target.value})} /></div>
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" placeholder="0.00" value={newCar.price} onChange={(e) => setNewCar({...newCar, price: e.target.value})} /></div>
                <div className="space-y-2"><Label>Kilometers</Label><Input type="number" placeholder="0" value={newCar.kilometers} onChange={(e) => setNewCar({...newCar, kilometers: e.target.value})} /></div>
                <div className="space-y-2"><Label>Transmission</Label><Input placeholder="e.g. Automatic" value={newCar.transmission} onChange={(e) => setNewCar({...newCar, transmission: e.target.value})} /></div>
                <div className="space-y-2"><Label>Fuel Type</Label><Input placeholder="e.g. Gasoline" value={newCar.fuelType} onChange={(e) => setNewCar({...newCar, fuelType: e.target.value})} /></div>
                <div className="space-y-2"><Label>Body Type</Label><Input placeholder="e.g. Sedan" value={newCar.bodyType} onChange={(e) => setNewCar({...newCar, bodyType: e.target.value})} /></div>
              </div>
               
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2"><Label>Listing URL</Label><Input placeholder="https://..." value={newCar.listingLink} onChange={(e) => setNewCar({...newCar, listingLink: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Carfax URL</Label><Input placeholder="https://..." value={newCar.carfaxLink} onChange={(e) => setNewCar({...newCar, carfaxLink: e.target.value})} /></div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional vehicle details..." value={newCar.notes} onChange={(e) => setNewCar({...newCar, notes: e.target.value})} className="min-h-[100px]" />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleManualSubmit} size="lg" className="w-full md:w-auto">
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
    </div>
  );
}
