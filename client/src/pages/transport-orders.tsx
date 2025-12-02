import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Plus,
  Search,
  X,
  Eye,
  UserPlus,
  RefreshCw,
  MapPin,
  ArrowRight,
  Calendar,
  Truck,
  Users,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransportOrder {
  id: string;
  orderNumber: string;
  quoteNumber: string;
  customerName: string;
  pickupCity: string;
  pickupProvince: string;
  deliveryCity: string;
  deliveryProvince: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  pickupDate: string;
  estimatedDelivery: string;
  driverName: string | null;
  truckUnit: string | null;
  status: "booked" | "assigned" | "in_transit" | "delivered" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentAmount: number;
}

const sampleOrders: TransportOrder[] = [
  {
    id: "1",
    orderNumber: "TO-2024-001",
    quoteNumber: "TQ-2024-089",
    customerName: "John Smith",
    pickupCity: "Toronto",
    pickupProvince: "ON",
    deliveryCity: "Vancouver",
    deliveryProvince: "BC",
    vehicleYear: 2023,
    vehicleMake: "BMW",
    vehicleModel: "X5",
    pickupDate: "2024-12-03",
    estimatedDelivery: "2024-12-08",
    driverName: "Mike Johnson",
    truckUnit: "TRK-101",
    status: "in_transit",
    paymentStatus: "paid",
    paymentAmount: 4850,
  },
  {
    id: "2",
    orderNumber: "TO-2024-002",
    quoteNumber: "TQ-2024-090",
    customerName: "Sarah Williams",
    pickupCity: "Montreal",
    pickupProvince: "QC",
    deliveryCity: "Calgary",
    deliveryProvince: "AB",
    vehicleYear: 2022,
    vehicleMake: "Mercedes-Benz",
    vehicleModel: "GLE 450",
    pickupDate: "2024-12-04",
    estimatedDelivery: "2024-12-09",
    driverName: "David Lee",
    truckUnit: "TRK-102",
    status: "assigned",
    paymentStatus: "paid",
    paymentAmount: 3950,
  },
  {
    id: "3",
    orderNumber: "TO-2024-003",
    quoteNumber: "TQ-2024-091",
    customerName: "Robert Chen",
    pickupCity: "Ottawa",
    pickupProvince: "ON",
    deliveryCity: "Halifax",
    deliveryProvince: "NS",
    vehicleYear: 2024,
    vehicleMake: "Tesla",
    vehicleModel: "Model Y",
    pickupDate: "2024-12-05",
    estimatedDelivery: "2024-12-08",
    driverName: null,
    truckUnit: null,
    status: "booked",
    paymentStatus: "pending",
    paymentAmount: 2100,
  },
  {
    id: "4",
    orderNumber: "TO-2024-004",
    quoteNumber: "TQ-2024-092",
    customerName: "Emily Davis",
    pickupCity: "Edmonton",
    pickupProvince: "AB",
    deliveryCity: "Winnipeg",
    deliveryProvince: "MB",
    vehicleYear: 2023,
    vehicleMake: "Ford",
    vehicleModel: "F-150",
    pickupDate: "2024-12-01",
    estimatedDelivery: "2024-12-04",
    driverName: "Sarah Wilson",
    truckUnit: "TRK-103",
    status: "delivered",
    paymentStatus: "paid",
    paymentAmount: 1650,
  },
  {
    id: "5",
    orderNumber: "TO-2024-005",
    quoteNumber: "TQ-2024-093",
    customerName: "Michael Brown",
    pickupCity: "Vancouver",
    pickupProvince: "BC",
    deliveryCity: "Toronto",
    deliveryProvince: "ON",
    vehicleYear: 2022,
    vehicleMake: "Audi",
    vehicleModel: "Q7",
    pickupDate: "2024-11-28",
    estimatedDelivery: "2024-12-02",
    driverName: "James Brown",
    truckUnit: "TRK-104",
    status: "completed",
    paymentStatus: "paid",
    paymentAmount: 4950,
  },
  {
    id: "6",
    orderNumber: "TO-2024-006",
    quoteNumber: "TQ-2024-094",
    customerName: "Lisa Anderson",
    pickupCity: "Calgary",
    pickupProvince: "AB",
    deliveryCity: "Montreal",
    deliveryProvince: "QC",
    vehicleYear: 2023,
    vehicleMake: "Lexus",
    vehicleModel: "RX 350",
    pickupDate: "2024-12-06",
    estimatedDelivery: "2024-12-12",
    driverName: null,
    truckUnit: null,
    status: "booked",
    paymentStatus: "pending",
    paymentAmount: 3800,
  },
  {
    id: "7",
    orderNumber: "TO-2024-007",
    quoteNumber: "TQ-2024-095",
    customerName: "David Kim",
    pickupCity: "Regina",
    pickupProvince: "SK",
    deliveryCity: "Ottawa",
    deliveryProvince: "ON",
    vehicleYear: 2021,
    vehicleMake: "Honda",
    vehicleModel: "CR-V",
    pickupDate: "2024-11-25",
    estimatedDelivery: "2024-11-30",
    driverName: "Tom Parker",
    truckUnit: "TRK-105",
    status: "cancelled",
    paymentStatus: "refunded",
    paymentAmount: 2450,
  },
  {
    id: "8",
    orderNumber: "TO-2024-008",
    quoteNumber: "TQ-2024-096",
    customerName: "Jennifer Taylor",
    pickupCity: "Winnipeg",
    pickupProvince: "MB",
    deliveryCity: "Vancouver",
    deliveryProvince: "BC",
    vehicleYear: 2024,
    vehicleMake: "Porsche",
    vehicleModel: "Cayenne",
    pickupDate: "2024-12-02",
    estimatedDelivery: "2024-12-07",
    driverName: "Mike Johnson",
    truckUnit: "TRK-101",
    status: "in_transit",
    paymentStatus: "paid",
    paymentAmount: 3200,
  },
  {
    id: "9",
    orderNumber: "TO-2024-009",
    quoteNumber: "TQ-2024-097",
    customerName: "Chris Martinez",
    pickupCity: "Halifax",
    pickupProvince: "NS",
    deliveryCity: "Toronto",
    deliveryProvince: "ON",
    vehicleYear: 2023,
    vehicleMake: "Toyota",
    vehicleModel: "RAV4",
    pickupDate: "2024-12-07",
    estimatedDelivery: "2024-12-11",
    driverName: "David Lee",
    truckUnit: "TRK-102",
    status: "assigned",
    paymentStatus: "paid",
    paymentAmount: 1850,
  },
  {
    id: "10",
    orderNumber: "TO-2024-010",
    quoteNumber: "TQ-2024-098",
    customerName: "Amanda White",
    pickupCity: "Saskatoon",
    pickupProvince: "SK",
    deliveryCity: "Edmonton",
    deliveryProvince: "AB",
    vehicleYear: 2022,
    vehicleMake: "Chevrolet",
    vehicleModel: "Tahoe",
    pickupDate: "2024-12-01",
    estimatedDelivery: "2024-12-02",
    driverName: "Sarah Wilson",
    truckUnit: "TRK-103",
    status: "delivered",
    paymentStatus: "paid",
    paymentAmount: 950,
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "booked", label: "Booked" },
  { value: "assigned", label: "Assigned" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadge = (status: TransportOrder["status"]) => {
  switch (status) {
    case "booked":
      return <Badge className="bg-slate-600 hover:bg-slate-700">Booked</Badge>;
    case "assigned":
      return <Badge className="bg-blue-600 hover:bg-blue-700">Assigned</Badge>;
    case "in_transit":
      return <Badge className="bg-cyan-600 hover:bg-cyan-700">In Transit</Badge>;
    case "delivered":
      return <Badge className="bg-green-600 hover:bg-green-700">Delivered</Badge>;
    case "completed":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-600 hover:bg-red-700">Cancelled</Badge>;
    default:
      return <Badge className="bg-slate-600 hover:bg-slate-700">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: TransportOrder["paymentStatus"]) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-amber-600 hover:bg-amber-700">Pending</Badge>;
    case "paid":
      return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>;
    case "refunded":
      return <Badge className="bg-red-600 hover:bg-red-700">Refunded</Badge>;
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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function TransportOrdersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredOrders = useMemo(() => {
    return sampleOrders.filter((order) => {
      const matchesSearch =
        searchTerm === "" ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesDateFrom =
        dateFrom === "" || new Date(order.pickupDate) >= new Date(dateFrom);

      const matchesDateTo =
        dateTo === "" || new Date(order.pickupDate) <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const handleViewOrder = (orderId: string) => {
    toast({
      title: "View Order",
      description: `Viewing order details for ${orderId}`,
    });
  };

  const handleAssignDriver = (orderId: string) => {
    toast({
      title: "Assign Driver",
      description: `Opening driver assignment for ${orderId}`,
    });
  };

  const handleUpdateStatus = (orderId: string) => {
    toast({
      title: "Update Status",
      description: `Opening status update for ${orderId}`,
    });
  };

  const handleNewOrder = () => {
    toast({
      title: "New Order",
      description: "Opening new order form...",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">
                Transport Orders
              </h1>
              <p className="text-slate-400">
                Manage and track all transport orders
              </p>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleNewOrder}
            data-testid="button-new-order"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-slate-400 mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by order # or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-600 text-white"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="w-[180px]">
                <label className="text-sm text-slate-400 mb-1 block">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  data-testid="select-status"
                >
                  <SelectTrigger
                    className="bg-slate-900 border-slate-600 text-white"
                    data-testid="trigger-status"
                  >
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[160px]">
                <label className="text-sm text-slate-400 mb-1 block">
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  data-testid="input-date-from"
                />
              </div>

              <div className="w-[160px]">
                <label className="text-sm text-slate-400 mb-1 block">
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  data-testid="input-date-to"
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700" data-testid="card-orders-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Orders ({filteredOrders.length})
            </CardTitle>
            <CardDescription>
              All transport orders and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div
                className="text-center py-12"
                data-testid="empty-state"
              >
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No Orders Found
                </h3>
                <p className="text-slate-500 mb-4">
                  {hasActiveFilters
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "There are no transport orders yet. Create your first order to get started."}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-clear-filters-empty"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/30">
                      <TableHead className="text-slate-300">Order #</TableHead>
                      <TableHead className="text-slate-300">Quote #</TableHead>
                      <TableHead className="text-slate-300">Pickup Location</TableHead>
                      <TableHead className="text-slate-300">Delivery Location</TableHead>
                      <TableHead className="text-slate-300">Vehicle</TableHead>
                      <TableHead className="text-slate-300">Pickup Date</TableHead>
                      <TableHead className="text-slate-300">Est. Delivery</TableHead>
                      <TableHead className="text-slate-300">Driver</TableHead>
                      <TableHead className="text-slate-300">Truck</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Payment</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-slate-700 hover:bg-slate-700/30"
                        data-testid={`row-order-${order.id}`}
                      >
                        <TableCell>
                          <button
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                            onClick={() => handleViewOrder(order.id)}
                            data-testid={`link-order-${order.id}`}
                          >
                            {order.orderNumber}
                          </button>
                        </TableCell>
                        <TableCell
                          className="text-slate-400"
                          data-testid={`text-quote-${order.id}`}
                        >
                          {order.quoteNumber}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-green-400" />
                            <span data-testid={`text-pickup-${order.id}`}>
                              {order.pickupCity}, {order.pickupProvince}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            <span data-testid={`text-delivery-${order.id}`}>
                              {order.deliveryCity}, {order.deliveryProvince}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-slate-300"
                          data-testid={`text-vehicle-${order.id}`}
                        >
                          {order.vehicleYear} {order.vehicleMake} {order.vehicleModel}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div
                            className="flex items-center gap-1"
                            data-testid={`text-pickup-date-${order.id}`}
                          >
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(order.pickupDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div
                            className="flex items-center gap-1"
                            data-testid={`text-est-delivery-${order.id}`}
                          >
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(order.estimatedDelivery)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {order.driverName ? (
                            <div
                              className="flex items-center gap-1"
                              data-testid={`text-driver-${order.id}`}
                            >
                              <Users className="w-3 h-3 text-slate-400" />
                              {order.driverName}
                            </div>
                          ) : (
                            <span
                              className="text-slate-500 italic"
                              data-testid={`text-driver-unassigned-${order.id}`}
                            >
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {order.truckUnit ? (
                            <div
                              className="flex items-center gap-1"
                              data-testid={`text-truck-${order.id}`}
                            >
                              <Truck className="w-3 h-3 text-slate-400" />
                              {order.truckUnit}
                            </div>
                          ) : (
                            <span
                              className="text-slate-500 italic"
                              data-testid={`text-truck-unassigned-${order.id}`}
                            >
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell data-testid={`badge-status-${order.id}`}>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell data-testid={`badge-payment-${order.id}`}>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                data-testid={`button-actions-${order.id}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                onClick={() => handleViewOrder(order.id)}
                                className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                                data-testid={`menu-view-${order.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAssignDriver(order.id)}
                                className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                                data-testid={`menu-assign-driver-${order.id}`}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Assign Driver
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id)}
                                className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                                data-testid={`menu-update-status-${order.id}`}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
