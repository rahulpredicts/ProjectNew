import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  MapPin,
  Eye,
  RefreshCw,
  Users,
  ArrowRight,
  Calendar,
} from "lucide-react";

interface TransportOrder {
  id: string;
  orderNumber: string;
  pickupCity: string;
  pickupProvince: string;
  deliveryCity: string;
  deliveryProvince: string;
  vehicleInfo: string;
  driverName: string | null;
  truckUnit: string | null;
  status: "booked" | "assigned" | "in_transit" | "delivered";
  eta: string;
  price: number;
}

interface FleetTruck {
  id: string;
  unitNumber: string;
  currentLocation: string;
  status: "available" | "en_route" | "maintenance";
  assignedDriver: string | null;
}

interface Quote {
  id: string;
  quoteNumber: string;
  route: string;
  price: number;
  status: "quoted" | "expired" | "converted";
  createdAt: string;
}

const sampleOrders: TransportOrder[] = [
  {
    id: "1",
    orderNumber: "TO-2024-001",
    pickupCity: "Toronto",
    pickupProvince: "ON",
    deliveryCity: "Vancouver",
    deliveryProvince: "BC",
    vehicleInfo: "2023 BMW X5",
    driverName: "Mike Johnson",
    truckUnit: "TRK-101",
    status: "in_transit",
    eta: "Dec 5, 2024",
    price: 4850,
  },
  {
    id: "2",
    orderNumber: "TO-2024-002",
    pickupCity: "Montreal",
    pickupProvince: "QC",
    deliveryCity: "Calgary",
    deliveryProvince: "AB",
    vehicleInfo: "2022 Mercedes GLE",
    driverName: "David Lee",
    truckUnit: "TRK-102",
    status: "assigned",
    eta: "Dec 7, 2024",
    price: 3950,
  },
  {
    id: "3",
    orderNumber: "TO-2024-003",
    pickupCity: "Ottawa",
    pickupProvince: "ON",
    deliveryCity: "Halifax",
    deliveryProvince: "NS",
    vehicleInfo: "2024 Tesla Model Y",
    driverName: null,
    truckUnit: null,
    status: "booked",
    eta: "Dec 8, 2024",
    price: 2100,
  },
  {
    id: "4",
    orderNumber: "TO-2024-004",
    pickupCity: "Edmonton",
    pickupProvince: "AB",
    deliveryCity: "Winnipeg",
    deliveryProvince: "MB",
    vehicleInfo: "2023 Ford F-150",
    driverName: "Sarah Wilson",
    truckUnit: "TRK-103",
    status: "in_transit",
    eta: "Dec 4, 2024",
    price: 1650,
  },
  {
    id: "5",
    orderNumber: "TO-2024-005",
    pickupCity: "Vancouver",
    pickupProvince: "BC",
    deliveryCity: "Toronto",
    deliveryProvince: "ON",
    vehicleInfo: "2022 Audi Q7",
    driverName: "James Brown",
    truckUnit: "TRK-104",
    status: "delivered",
    eta: "Dec 2, 2024",
    price: 4950,
  },
];

const sampleFleet: FleetTruck[] = [
  {
    id: "1",
    unitNumber: "TRK-101",
    currentLocation: "Saskatoon, SK",
    status: "en_route",
    assignedDriver: "Mike Johnson",
  },
  {
    id: "2",
    unitNumber: "TRK-102",
    currentLocation: "Montreal, QC",
    status: "en_route",
    assignedDriver: "David Lee",
  },
  {
    id: "3",
    unitNumber: "TRK-103",
    currentLocation: "Regina, SK",
    status: "en_route",
    assignedDriver: "Sarah Wilson",
  },
  {
    id: "4",
    unitNumber: "TRK-104",
    currentLocation: "Toronto, ON",
    status: "available",
    assignedDriver: null,
  },
  {
    id: "5",
    unitNumber: "TRK-105",
    currentLocation: "Calgary, AB",
    status: "maintenance",
    assignedDriver: null,
  },
];

const sampleQuotes: Quote[] = [
  {
    id: "1",
    quoteNumber: "TQ-2024-089",
    route: "Toronto, ON → Vancouver, BC",
    price: 4850,
    status: "converted",
    createdAt: "Nov 28, 2024",
  },
  {
    id: "2",
    quoteNumber: "TQ-2024-090",
    route: "Montreal, QC → Calgary, AB",
    price: 3950,
    status: "converted",
    createdAt: "Nov 29, 2024",
  },
  {
    id: "3",
    quoteNumber: "TQ-2024-091",
    route: "Ottawa, ON → Halifax, NS",
    price: 2100,
    status: "quoted",
    createdAt: "Nov 30, 2024",
  },
  {
    id: "4",
    quoteNumber: "TQ-2024-092",
    route: "Vancouver, BC → Edmonton, AB",
    price: 1350,
    status: "expired",
    createdAt: "Nov 25, 2024",
  },
  {
    id: "5",
    quoteNumber: "TQ-2024-093",
    route: "Winnipeg, MB → Toronto, ON",
    price: 2450,
    status: "quoted",
    createdAt: "Dec 1, 2024",
  },
  {
    id: "6",
    quoteNumber: "TQ-2024-094",
    route: "Calgary, AB → Montreal, QC",
    price: 3800,
    status: "quoted",
    createdAt: "Dec 1, 2024",
  },
];

const getStatusBadge = (status: TransportOrder["status"]) => {
  switch (status) {
    case "booked":
      return <Badge className="bg-slate-600 hover:bg-slate-700">Booked</Badge>;
    case "assigned":
      return <Badge className="bg-blue-600 hover:bg-blue-700">Assigned</Badge>;
    case "in_transit":
      return <Badge className="bg-green-600 hover:bg-green-700">In Transit</Badge>;
    case "delivered":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700">Delivered</Badge>;
    default:
      return <Badge className="bg-slate-600 hover:bg-slate-700">{status}</Badge>;
  }
};

const getTruckStatusBadge = (status: FleetTruck["status"]) => {
  switch (status) {
    case "available":
      return <Badge className="bg-green-600 hover:bg-green-700">Available</Badge>;
    case "en_route":
      return <Badge className="bg-blue-600 hover:bg-blue-700">En Route</Badge>;
    case "maintenance":
      return <Badge className="bg-red-600 hover:bg-red-700">Maintenance</Badge>;
    default:
      return <Badge className="bg-slate-600 hover:bg-slate-700">{status}</Badge>;
  }
};

const getQuoteStatusBadge = (status: Quote["status"]) => {
  switch (status) {
    case "quoted":
      return <Badge className="bg-blue-600 hover:bg-blue-700">Quoted</Badge>;
    case "expired":
      return <Badge className="bg-amber-600 hover:bg-amber-700">Expired</Badge>;
    case "converted":
      return <Badge className="bg-green-600 hover:bg-green-700">Converted</Badge>;
    default:
      return <Badge className="bg-slate-600 hover:bg-slate-700">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};

export default function TransportDashboard() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const activeOrdersCount = sampleOrders.filter(
    (o) => o.status !== "delivered"
  ).length;
  const pendingPickupsCount = sampleOrders.filter(
    (o) => o.status === "booked" || o.status === "assigned"
  ).length;
  const inTransitCount = sampleOrders.filter(
    (o) => o.status === "in_transit"
  ).length;
  const completedTodayCount = sampleOrders.filter(
    (o) => o.status === "delivered"
  ).length;
  const revenueThisMonth = sampleOrders.reduce((sum, o) => sum + o.price, 0);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const handleUpdateStatus = (orderId: string) => {
    console.log("Update status for order:", orderId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Truck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" data-testid="text-dashboard-title">Transportation Dashboard</h1>
              <p className="text-slate-400">Manage fleet, orders, and logistics operations</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700" data-testid="card-active-orders">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Orders</p>
                  <p className="text-3xl font-bold" data-testid="text-active-orders-count">{activeOrdersCount}</p>
                </div>
                <Package className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700" data-testid="card-pending-pickups">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Pickups</p>
                  <p className="text-3xl font-bold" data-testid="text-pending-pickups-count">{pendingPickupsCount}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700" data-testid="card-in-transit">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">In Transit</p>
                  <p className="text-3xl font-bold" data-testid="text-in-transit-count">{inTransitCount}</p>
                </div>
                <Truck className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700" data-testid="card-completed-today">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completed Today</p>
                  <p className="text-3xl font-bold" data-testid="text-completed-today-count">{completedTodayCount}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700" data-testid="card-revenue">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Revenue This Month</p>
                  <p className="text-2xl font-bold" data-testid="text-revenue-amount">{formatCurrency(revenueThisMonth)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 mb-8" data-testid="card-active-orders-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Active Orders
            </CardTitle>
            <CardDescription>Current transport orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/30">
                    <TableHead className="text-slate-300">Order #</TableHead>
                    <TableHead className="text-slate-300">Route</TableHead>
                    <TableHead className="text-slate-300">Vehicle</TableHead>
                    <TableHead className="text-slate-300">Driver/Truck</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">ETA</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-slate-700 hover:bg-slate-700/30"
                      data-testid={`row-order-${order.id}`}
                    >
                      <TableCell>
                        <button
                          className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                          onClick={() => handleViewDetails(order.id)}
                          data-testid={`link-order-${order.id}`}
                        >
                          {order.orderNumber}
                        </button>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-400" />
                          <span>{order.pickupCity}, {order.pickupProvince}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 mx-1" />
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{order.deliveryCity}, {order.deliveryProvince}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300" data-testid={`text-vehicle-${order.id}`}>
                        {order.vehicleInfo}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {order.driverName ? (
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              {order.driverName}
                            </span>
                            <span className="text-xs text-slate-500">{order.truckUnit}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`badge-status-${order.id}`}>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {order.eta}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                            onClick={() => handleViewDetails(order.id)}
                            data-testid={`button-view-details-${order.id}`}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-400 hover:bg-green-600/10"
                            onClick={() => handleUpdateStatus(order.id)}
                            data-testid={`button-update-status-${order.id}`}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700" data-testid="card-fleet-status">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                Fleet Status
              </CardTitle>
              <CardDescription>Current status of owned trucks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleFleet.map((truck) => (
                  <div
                    key={truck.id}
                    className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700"
                    data-testid={`card-truck-${truck.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-white" data-testid={`text-truck-unit-${truck.id}`}>
                          {truck.unitNumber}
                        </span>
                        {getTruckStatusBadge(truck.status)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span data-testid={`text-truck-location-${truck.id}`}>{truck.currentLocation}</span>
                      </div>
                      {truck.assignedDriver && (
                        <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                          <Users className="w-3 h-3" />
                          <span data-testid={`text-truck-driver-${truck.id}`}>{truck.assignedDriver}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700" data-testid="card-recent-quotes">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Recent Quotes
              </CardTitle>
              <CardDescription>Last 6 transport quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700"
                    data-testid={`card-quote-${quote.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-400" data-testid={`text-quote-number-${quote.id}`}>
                          {quote.quoteNumber}
                        </span>
                        {getQuoteStatusBadge(quote.status)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span data-testid={`text-quote-route-${quote.id}`}>{quote.route}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white" data-testid={`text-quote-price-${quote.id}`}>
                        {formatCurrency(quote.price)}
                      </div>
                      <div className="text-xs text-slate-500" data-testid={`text-quote-date-${quote.id}`}>
                        {quote.createdAt}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
