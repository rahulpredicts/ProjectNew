import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Car,
  Calculator,
  Clock,
  DollarSign,
  Printer,
  Send,
  ChevronRight,
  Package,
  Shield,
  Zap,
  Loader2,
  CheckCircle2,
  Info,
  Calendar,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { decodeVIN } from "@/lib/nhtsa";

const CANADIAN_PROVINCES = [
  { code: "ON", name: "Ontario" },
  { code: "QC", name: "Quebec" },
  { code: "BC", name: "British Columbia" },
  { code: "AB", name: "Alberta" },
  { code: "MB", name: "Manitoba" },
  { code: "SK", name: "Saskatchewan" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NL", name: "Newfoundland & Labrador" },
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  ON: ["Toronto", "Ottawa", "Hamilton", "London"],
  QC: ["Montreal", "Quebec City"],
  BC: ["Vancouver", "Victoria"],
  AB: ["Calgary", "Edmonton"],
  MB: ["Winnipeg"],
  SK: ["Regina", "Saskatoon"],
  NS: ["Halifax"],
  NL: ["St. John's"],
};

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  "Toronto, ON": {
    "Toronto, ON": 0,
    "Ottawa, ON": 450,
    "Hamilton, ON": 70,
    "London, ON": 190,
    "Montreal, QC": 540,
    "Quebec City, QC": 800,
    "Vancouver, BC": 4400,
    "Victoria, BC": 4550,
    "Calgary, AB": 3400,
    "Edmonton, AB": 3500,
    "Winnipeg, MB": 2200,
    "Regina, SK": 2700,
    "Saskatoon, SK": 2900,
    "Halifax, NS": 1800,
    "St. John's, NL": 2600,
  },
  "Ottawa, ON": {
    "Toronto, ON": 450,
    "Ottawa, ON": 0,
    "Hamilton, ON": 520,
    "London, ON": 640,
    "Montreal, QC": 200,
    "Quebec City, QC": 450,
    "Vancouver, BC": 4600,
    "Victoria, BC": 4750,
    "Calgary, AB": 3600,
    "Edmonton, AB": 3700,
    "Winnipeg, MB": 2400,
    "Regina, SK": 2900,
    "Saskatoon, SK": 3100,
    "Halifax, NS": 1350,
    "St. John's, NL": 2150,
  },
  "Hamilton, ON": {
    "Toronto, ON": 70,
    "Ottawa, ON": 520,
    "Hamilton, ON": 0,
    "London, ON": 130,
    "Montreal, QC": 610,
    "Quebec City, QC": 870,
    "Vancouver, BC": 4350,
    "Victoria, BC": 4500,
    "Calgary, AB": 3350,
    "Edmonton, AB": 3450,
    "Winnipeg, MB": 2150,
    "Regina, SK": 2650,
    "Saskatoon, SK": 2850,
    "Halifax, NS": 1870,
    "St. John's, NL": 2670,
  },
  "London, ON": {
    "Toronto, ON": 190,
    "Ottawa, ON": 640,
    "Hamilton, ON": 130,
    "London, ON": 0,
    "Montreal, QC": 730,
    "Quebec City, QC": 990,
    "Vancouver, BC": 4200,
    "Victoria, BC": 4350,
    "Calgary, AB": 3200,
    "Edmonton, AB": 3300,
    "Winnipeg, MB": 2000,
    "Regina, SK": 2500,
    "Saskatoon, SK": 2700,
    "Halifax, NS": 1990,
    "St. John's, NL": 2790,
  },
  "Montreal, QC": {
    "Toronto, ON": 540,
    "Ottawa, ON": 200,
    "Hamilton, ON": 610,
    "London, ON": 730,
    "Montreal, QC": 0,
    "Quebec City, QC": 260,
    "Vancouver, BC": 4850,
    "Victoria, BC": 5000,
    "Calgary, AB": 3700,
    "Edmonton, AB": 3800,
    "Winnipeg, MB": 2300,
    "Regina, SK": 2800,
    "Saskatoon, SK": 3000,
    "Halifax, NS": 1250,
    "St. John's, NL": 2050,
  },
  "Quebec City, QC": {
    "Toronto, ON": 800,
    "Ottawa, ON": 450,
    "Hamilton, ON": 870,
    "London, ON": 990,
    "Montreal, QC": 260,
    "Quebec City, QC": 0,
    "Vancouver, BC": 5100,
    "Victoria, BC": 5250,
    "Calgary, AB": 3950,
    "Edmonton, AB": 4050,
    "Winnipeg, MB": 2550,
    "Regina, SK": 3050,
    "Saskatoon, SK": 3250,
    "Halifax, NS": 1000,
    "St. John's, NL": 1800,
  },
  "Vancouver, BC": {
    "Toronto, ON": 4400,
    "Ottawa, ON": 4600,
    "Hamilton, ON": 4350,
    "London, ON": 4200,
    "Montreal, QC": 4850,
    "Quebec City, QC": 5100,
    "Vancouver, BC": 0,
    "Victoria, BC": 115,
    "Calgary, AB": 1050,
    "Edmonton, AB": 1150,
    "Winnipeg, MB": 2300,
    "Regina, SK": 1800,
    "Saskatoon, SK": 1650,
    "Halifax, NS": 6100,
    "St. John's, NL": 6900,
  },
  "Victoria, BC": {
    "Toronto, ON": 4550,
    "Ottawa, ON": 4750,
    "Hamilton, ON": 4500,
    "London, ON": 4350,
    "Montreal, QC": 5000,
    "Quebec City, QC": 5250,
    "Vancouver, BC": 115,
    "Victoria, BC": 0,
    "Calgary, AB": 1165,
    "Edmonton, AB": 1265,
    "Winnipeg, MB": 2415,
    "Regina, SK": 1915,
    "Saskatoon, SK": 1765,
    "Halifax, NS": 6215,
    "St. John's, NL": 7015,
  },
  "Calgary, AB": {
    "Toronto, ON": 3400,
    "Ottawa, ON": 3600,
    "Hamilton, ON": 3350,
    "London, ON": 3200,
    "Montreal, QC": 3700,
    "Quebec City, QC": 3950,
    "Vancouver, BC": 1050,
    "Victoria, BC": 1165,
    "Calgary, AB": 0,
    "Edmonton, AB": 300,
    "Winnipeg, MB": 1350,
    "Regina, SK": 750,
    "Saskatoon, SK": 600,
    "Halifax, NS": 5100,
    "St. John's, NL": 5900,
  },
  "Edmonton, AB": {
    "Toronto, ON": 3500,
    "Ottawa, ON": 3700,
    "Hamilton, ON": 3450,
    "London, ON": 3300,
    "Montreal, QC": 3800,
    "Quebec City, QC": 4050,
    "Vancouver, BC": 1150,
    "Victoria, BC": 1265,
    "Calgary, AB": 300,
    "Edmonton, AB": 0,
    "Winnipeg, MB": 1350,
    "Regina, SK": 800,
    "Saskatoon, SK": 525,
    "Halifax, NS": 5200,
    "St. John's, NL": 6000,
  },
  "Winnipeg, MB": {
    "Toronto, ON": 2200,
    "Ottawa, ON": 2400,
    "Hamilton, ON": 2150,
    "London, ON": 2000,
    "Montreal, QC": 2300,
    "Quebec City, QC": 2550,
    "Vancouver, BC": 2300,
    "Victoria, BC": 2415,
    "Calgary, AB": 1350,
    "Edmonton, AB": 1350,
    "Winnipeg, MB": 0,
    "Regina, SK": 575,
    "Saskatoon, SK": 800,
    "Halifax, NS": 3700,
    "St. John's, NL": 4500,
  },
  "Regina, SK": {
    "Toronto, ON": 2700,
    "Ottawa, ON": 2900,
    "Hamilton, ON": 2650,
    "London, ON": 2500,
    "Montreal, QC": 2800,
    "Quebec City, QC": 3050,
    "Vancouver, BC": 1800,
    "Victoria, BC": 1915,
    "Calgary, AB": 750,
    "Edmonton, AB": 800,
    "Winnipeg, MB": 575,
    "Regina, SK": 0,
    "Saskatoon, SK": 260,
    "Halifax, NS": 4200,
    "St. John's, NL": 5000,
  },
  "Saskatoon, SK": {
    "Toronto, ON": 2900,
    "Ottawa, ON": 3100,
    "Hamilton, ON": 2850,
    "London, ON": 2700,
    "Montreal, QC": 3000,
    "Quebec City, QC": 3250,
    "Vancouver, BC": 1650,
    "Victoria, BC": 1765,
    "Calgary, AB": 600,
    "Edmonton, AB": 525,
    "Winnipeg, MB": 800,
    "Regina, SK": 260,
    "Saskatoon, SK": 0,
    "Halifax, NS": 4400,
    "St. John's, NL": 5200,
  },
  "Halifax, NS": {
    "Toronto, ON": 1800,
    "Ottawa, ON": 1350,
    "Hamilton, ON": 1870,
    "London, ON": 1990,
    "Montreal, QC": 1250,
    "Quebec City, QC": 1000,
    "Vancouver, BC": 6100,
    "Victoria, BC": 6215,
    "Calgary, AB": 5100,
    "Edmonton, AB": 5200,
    "Winnipeg, MB": 3700,
    "Regina, SK": 4200,
    "Saskatoon, SK": 4400,
    "Halifax, NS": 0,
    "St. John's, NL": 1100,
  },
  "St. John's, NL": {
    "Toronto, ON": 2600,
    "Ottawa, ON": 2150,
    "Hamilton, ON": 2670,
    "London, ON": 2790,
    "Montreal, QC": 2050,
    "Quebec City, QC": 1800,
    "Vancouver, BC": 6900,
    "Victoria, BC": 7015,
    "Calgary, AB": 5900,
    "Edmonton, AB": 6000,
    "Winnipeg, MB": 4500,
    "Regina, SK": 5000,
    "Saskatoon, SK": 5200,
    "Halifax, NS": 1100,
    "St. John's, NL": 0,
  },
};

const VEHICLE_TYPES = [
  { value: "sedan", label: "Sedan", surcharge: 0 },
  { value: "suv", label: "SUV", surcharge: 75 },
  { value: "pickup", label: "Pickup Truck", surcharge: 100 },
  { value: "fullsize", label: "Full-Size SUV/Truck", surcharge: 150 },
  { value: "luxury", label: "Luxury Vehicle", surcharge: 200 },
  { value: "motorcycle", label: "Motorcycle", surcharge: -100 },
];

const SERVICE_LEVELS = [
  { value: "standard", label: "Standard (5-7 days)", multiplier: 1.0, daysMin: 5, daysMax: 7 },
  { value: "expedited_2day", label: "2-Day Expedited", multiplier: 1.5, daysMin: 2, daysMax: 2 },
  { value: "expedited_1day", label: "1-Day Expedited", multiplier: 2.0, daysMin: 1, daysMax: 1 },
];

const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
  "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia",
  "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini",
  "Mitsubishi", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", "Toyota",
  "Volkswagen", "Volvo"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 26 }, (_, i) => currentYear - i);

interface QuoteBreakdown {
  distance: number;
  basePrice: number;
  vehicleSurcharge: number;
  nonRunningFee: number;
  enclosedFee: number;
  liftGateFee: number;
  multiVehicleDiscount: number;
  serviceLevelMultiplier: number;
  fuelSurcharge: number;
  subtotal: number;
  total: number;
  estimatedDeliveryMin: Date;
  estimatedDeliveryMax: Date;
}

function calculateRate(distance: number): number {
  if (distance <= 500) return 1.75;
  if (distance <= 1000) return 1.50;
  if (distance <= 2000) return 1.25;
  return 1.10;
}

export default function TransportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecodingVin, setIsDecodingVin] = useState(false);

  const [pickupProvince, setPickupProvince] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleType, setVehicleType] = useState("sedan");

  const [isRunning, setIsRunning] = useState(true);
  const [isEnclosed, setIsEnclosed] = useState(false);
  const [liftGateRequired, setLiftGateRequired] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(1);
  const [serviceLevel, setServiceLevel] = useState("standard");

  const pickupCities = pickupProvince ? CITIES_BY_PROVINCE[pickupProvince] || [] : [];
  const deliveryCities = deliveryProvince ? CITIES_BY_PROVINCE[deliveryProvince] || [] : [];

  const handleDecodeVin = async () => {
    if (!vehicleVin || vehicleVin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN",
        variant: "destructive",
      });
      return;
    }

    setIsDecodingVin(true);
    try {
      const result = await decodeVIN(vehicleVin);
      if (result) {
        if (result.year) setVehicleYear(result.year.toString());
        if (result.make) setVehicleMake(result.make);
        if (result.model) setVehicleModel(result.model);
        
        const bodyClass = result.bodyClass?.toLowerCase() || "";
        const vehicleTypeFromVin = result.vehicleType?.toLowerCase() || "";
        if (bodyClass.includes("motorcycle") || vehicleTypeFromVin.includes("motorcycle")) {
          setVehicleType("motorcycle");
        } else if (bodyClass.includes("suv") || bodyClass.includes("crossover") || bodyClass.includes("sport utility")) {
          setVehicleType("suv");
        } else if (bodyClass.includes("truck") || bodyClass.includes("pickup")) {
          setVehicleType("pickup");
        } else if (bodyClass.includes("sedan") || bodyClass.includes("coupe") || bodyClass.includes("hatchback")) {
          setVehicleType("sedan");
        }

        toast({
          title: "VIN Decoded",
          description: `${result.year} ${result.make} ${result.model}`,
        });
      }
    } catch (error) {
      toast({
        title: "Decode Failed",
        description: "Unable to decode VIN. Please enter vehicle details manually.",
        variant: "destructive",
      });
    } finally {
      setIsDecodingVin(false);
    }
  };

  const quote = useMemo<QuoteBreakdown | null>(() => {
    if (!pickupCity || !pickupProvince || !deliveryCity || !deliveryProvince) {
      return null;
    }

    const pickupKey = `${pickupCity}, ${pickupProvince}`;
    const deliveryKey = `${deliveryCity}, ${deliveryProvince}`;

    const distance = DISTANCE_MATRIX[pickupKey]?.[deliveryKey];
    if (distance === undefined) {
      return null;
    }

    const rate = calculateRate(distance);
    let basePrice = Math.max(distance * rate, 350);

    const vehicleTypeData = VEHICLE_TYPES.find((v) => v.value === vehicleType);
    const vehicleSurcharge = (vehicleTypeData?.surcharge || 0) * vehicleCount;

    const nonRunningFee = !isRunning ? 150 * vehicleCount : 0;
    const enclosedFee = isEnclosed ? 300 * vehicleCount : 0;
    const liftGateFee = liftGateRequired ? 75 * vehicleCount : 0;

    let multiVehicleDiscount = 0;
    if (vehicleCount >= 4) {
      multiVehicleDiscount = (basePrice + vehicleSurcharge) * 0.10;
    } else if (vehicleCount >= 2) {
      multiVehicleDiscount = (basePrice + vehicleSurcharge) * 0.05;
    }

    const serviceLevelData = SERVICE_LEVELS.find((s) => s.value === serviceLevel);
    const serviceLevelMultiplier = serviceLevelData?.multiplier || 1.0;

    const subtotalBeforeMultiplier = basePrice + vehicleSurcharge + nonRunningFee + enclosedFee + liftGateFee - multiVehicleDiscount;
    const subtotal = subtotalBeforeMultiplier * serviceLevelMultiplier;

    const fuelSurcharge = subtotal * 0.08;
    const total = subtotal + fuelSurcharge;

    const today = new Date();
    const daysMin = serviceLevelData?.daysMin || 5;
    const daysMax = serviceLevelData?.daysMax || 7;
    
    const estimatedDeliveryMin = new Date(today);
    estimatedDeliveryMin.setDate(today.getDate() + daysMin);
    
    const estimatedDeliveryMax = new Date(today);
    estimatedDeliveryMax.setDate(today.getDate() + daysMax);

    return {
      distance,
      basePrice,
      vehicleSurcharge,
      nonRunningFee,
      enclosedFee,
      liftGateFee,
      multiVehicleDiscount,
      serviceLevelMultiplier,
      fuelSurcharge,
      subtotal,
      total,
      estimatedDeliveryMin,
      estimatedDeliveryMax,
    };
  }, [
    pickupCity, pickupProvince, deliveryCity, deliveryProvince,
    vehicleType, isRunning, isEnclosed, liftGateRequired,
    vehicleCount, serviceLevel
  ]);

  const handleRequestQuote = async () => {
    if (!quote) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in pickup and delivery locations",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const quoteData = {
        pickupCity,
        pickupProvince,
        deliveryCity,
        deliveryProvince,
        distanceKm: quote.distance.toString(),
        vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
        vehicleMake: vehicleMake || null,
        vehicleModel: vehicleModel || null,
        vehicleType,
        vehicleVin: vehicleVin || null,
        isRunning,
        isEnclosed,
        liftGateRequired,
        vehicleCount,
        serviceLevel,
        basePrice: quote.basePrice.toFixed(2),
        surcharges: (quote.vehicleSurcharge + quote.nonRunningFee + quote.enclosedFee + quote.liftGateFee + quote.fuelSurcharge).toFixed(2),
        discount: quote.multiVehicleDiscount.toFixed(2),
        totalPrice: quote.total.toFixed(2),
      };

      const response = await fetch("/api/transport/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error("Failed to save quote");
      }

      const savedQuote = await response.json();

      toast({
        title: "Quote Saved!",
        description: `Quote #${savedQuote.quoteNumber} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintQuote = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <Truck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Transportation Estimate</h1>
            <p className="text-slate-400">Calculate vehicle transport costs across Canada</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Pickup Location
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-slate-400">Province</Label>
                        <Select
                          value={pickupProvince}
                          onValueChange={(value) => {
                            setPickupProvince(value);
                            setPickupCity("");
                          }}
                          data-testid="select-pickup-province"
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-pickup-province">
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {CANADIAN_PROVINCES.map((prov) => (
                              <SelectItem key={prov.code} value={prov.code}>
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-400">City</Label>
                        <Select
                          value={pickupCity}
                          onValueChange={setPickupCity}
                          disabled={!pickupProvince}
                          data-testid="select-pickup-city"
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-pickup-city">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {pickupCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Delivery Location
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-slate-400">Province</Label>
                        <Select
                          value={deliveryProvince}
                          onValueChange={(value) => {
                            setDeliveryProvince(value);
                            setDeliveryCity("");
                          }}
                          data-testid="select-delivery-province"
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-delivery-province">
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {CANADIAN_PROVINCES.map((prov) => (
                              <SelectItem key={prov.code} value={prov.code}>
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-400">City</Label>
                        <Select
                          value={deliveryCity}
                          onValueChange={setDeliveryCity}
                          disabled={!deliveryProvince}
                          data-testid="select-delivery-city"
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-delivery-city">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {quote && (
                  <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                          {quote.distance.toLocaleString()} km
                        </Badge>
                        <span className="text-slate-400 text-sm">
                          {pickupCity}, {pickupProvince}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400 text-sm">
                          {deliveryCity}, {deliveryProvince}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        Rate: {formatCurrency(calculateRate(quote.distance))}/km
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-400" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-400">Year</Label>
                    <Select value={vehicleYear} onValueChange={setVehicleYear} data-testid="select-vehicle-year">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-vehicle-year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Make</Label>
                    <Select value={vehicleMake} onValueChange={setVehicleMake} data-testid="select-vehicle-make">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-vehicle-make">
                        <SelectValue placeholder="Make" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_MAKES.map((make) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-400">Model</Label>
                    <Input
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Enter model"
                      className="bg-slate-800 border-slate-600 text-white"
                      data-testid="input-vehicle-model"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">VIN (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={vehicleVin}
                        onChange={(e) => setVehicleVin(e.target.value.toUpperCase())}
                        placeholder="17-character VIN"
                        maxLength={17}
                        className="bg-slate-800 border-slate-600 text-white font-mono"
                        data-testid="input-vehicle-vin"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleDecodeVin}
                        disabled={isDecodingVin || vehicleVin.length !== 17}
                        className="shrink-0"
                        data-testid="button-decode-vin"
                      >
                        {isDecodingVin ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Decode"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Vehicle Type</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType} data-testid="select-vehicle-type">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-vehicle-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                            {type.surcharge !== 0 && (
                              <span className={cn(
                                "ml-2",
                                type.surcharge > 0 ? "text-amber-500" : "text-green-500"
                              )}>
                                ({type.surcharge > 0 ? "+" : ""}{formatCurrency(type.surcharge)})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  Transport Options
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Vehicle Running</div>
                        <div className="text-xs text-slate-400">
                          {isRunning ? "Runs & drives" : "+$150 non-running"}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={isRunning}
                      onCheckedChange={setIsRunning}
                      data-testid="switch-running"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Enclosed Transport</div>
                        <div className="text-xs text-slate-400">
                          {isEnclosed ? "+$300 enclosed carrier" : "Open carrier"}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={isEnclosed}
                      onCheckedChange={setIsEnclosed}
                      data-testid="switch-enclosed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Lift Gate Required</div>
                        <div className="text-xs text-slate-400">
                          {liftGateRequired ? "+$75 lift gate" : "Not required"}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={liftGateRequired}
                      onCheckedChange={setLiftGateRequired}
                      data-testid="switch-liftgate"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-400 mb-2 block">Number of Vehicles</Label>
                    <Select
                      value={vehicleCount.toString()}
                      onValueChange={(v) => setVehicleCount(parseInt(v))}
                      data-testid="select-vehicle-count"
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-vehicle-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} vehicle{num > 1 ? "s" : ""}
                            {num >= 4 && " (10% discount)"}
                            {num >= 2 && num < 4 && " (5% discount)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-400 mb-2 block">Service Level</Label>
                    <Select value={serviceLevel} onValueChange={setServiceLevel} data-testid="select-service-level">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="trigger-service-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                            {level.multiplier > 1 && (
                              <span className="ml-2 text-amber-500">
                                ({level.multiplier}x)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-700 sticky top-6">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {quote ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Route Distance</span>
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                          {quote.distance.toLocaleString()} km
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        {pickupCity}, {pickupProvince} → {deliveryCity}, {deliveryProvince}
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div className="space-y-3" data-testid="quote-breakdown">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Base Price</span>
                        <span className="text-white" data-testid="text-base-price">
                          {formatCurrency(quote.basePrice)}
                        </span>
                      </div>

                      {quote.vehicleSurcharge !== 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Vehicle Type Surcharge</span>
                          <span className={cn(
                            quote.vehicleSurcharge > 0 ? "text-amber-400" : "text-green-400"
                          )} data-testid="text-vehicle-surcharge">
                            {quote.vehicleSurcharge > 0 ? "+" : ""}
                            {formatCurrency(quote.vehicleSurcharge)}
                          </span>
                        </div>
                      )}

                      {quote.nonRunningFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Non-Running Fee</span>
                          <span className="text-amber-400" data-testid="text-nonrunning-fee">
                            +{formatCurrency(quote.nonRunningFee)}
                          </span>
                        </div>
                      )}

                      {quote.enclosedFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Enclosed Transport</span>
                          <span className="text-amber-400" data-testid="text-enclosed-fee">
                            +{formatCurrency(quote.enclosedFee)}
                          </span>
                        </div>
                      )}

                      {quote.liftGateFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Lift Gate</span>
                          <span className="text-amber-400" data-testid="text-liftgate-fee">
                            +{formatCurrency(quote.liftGateFee)}
                          </span>
                        </div>
                      )}

                      {quote.multiVehicleDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Multi-Vehicle Discount</span>
                          <span className="text-green-400" data-testid="text-multivehicle-discount">
                            -{formatCurrency(quote.multiVehicleDiscount)}
                          </span>
                        </div>
                      )}

                      {quote.serviceLevelMultiplier > 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Expedited Service</span>
                          <span className="text-amber-400" data-testid="text-service-multiplier">
                            {quote.serviceLevelMultiplier}x
                          </span>
                        </div>
                      )}

                      <Separator className="bg-slate-700" />

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-white" data-testid="text-subtotal">
                          {formatCurrency(quote.subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Fuel Surcharge (8%)</span>
                        <span className="text-amber-400" data-testid="text-fuel-surcharge">
                          +{formatCurrency(quote.fuelSurcharge)}
                        </span>
                      </div>

                      <Separator className="bg-slate-700" />

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-2xl font-bold text-blue-400" data-testid="text-total-price">
                          {formatCurrency(quote.total)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-white">Estimated Delivery</span>
                      </div>
                      <div className="text-sm text-slate-400" data-testid="text-delivery-date">
                        {formatDate(quote.estimatedDeliveryMin)}
                        {quote.estimatedDeliveryMin.getTime() !== quote.estimatedDeliveryMax.getTime() && (
                          <> - {formatDate(quote.estimatedDeliveryMax)}</>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleRequestQuote}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-testid="button-request-quote"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Request Quote
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handlePrintQuote}
                        className="w-full"
                        data-testid="button-print-quote"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Quote
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm" data-testid="text-no-quote">
                      Select pickup and delivery locations to calculate quote
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400">
                    <p className="mb-2">
                      <strong className="text-slate-300">Pricing Notes:</strong>
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Minimum charge: $350</li>
                      <li>Rates decrease for longer distances</li>
                      <li>Multi-vehicle discounts available</li>
                      <li>8% fuel surcharge applies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
