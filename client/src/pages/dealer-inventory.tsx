import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Search, 
  Car,
  DollarSign,
  Tag,
  TrendingUp,
  ShoppingCart
} from "lucide-react";
import { Link } from "wouter";

interface CarCounts {
  total: number;
  available: number;
  sold: number;
  pending: number;
}

export default function DealerInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: counts, isLoading: countsLoading } = useQuery<CarCounts>({
    queryKey: ['/api/cars/counts'],
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Package className="w-10 h-10 text-blue-400" />
            Your Inventory
          </h1>
          <p className="text-slate-400">Manage your vehicles for buying and selling</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Vehicles</p>
                  <p className="text-3xl font-bold text-white">{countsLoading ? '...' : counts?.total || 0}</p>
                </div>
                <Car className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">For Sale</p>
                  <p className="text-3xl font-bold text-green-400">{countsLoading ? '...' : counts?.available || 0}</p>
                </div>
                <Tag className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sold</p>
                  <p className="text-3xl font-bold text-purple-400">{countsLoading ? '...' : counts?.sold || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">{countsLoading ? '...' : counts?.pending || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/40 to-slate-800 border-green-700/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Tag className="w-6 h-6" />
                Sell Your Vehicles
              </CardTitle>
              <CardDescription className="text-slate-300">
                List vehicles from your inventory for retail or wholesale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Make your inventory visible to buyers across Canada. Set your prices and connect with interested dealers.
              </p>
              <Link href="/upload">
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-sell-vehicles">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicles to Sell
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-slate-800 border-blue-700/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <ShoppingCart className="w-6 h-6" />
                Buy Vehicles
              </CardTitle>
              <CardDescription className="text-slate-300">
                Browse available inventory and find vehicles to purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Search the Canadian Retail market to find vehicles matching your needs. Connect with sellers directly.
              </p>
              <Link href="/canadian-retail">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-buy-vehicles">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Market
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Search Your Inventory</CardTitle>
            <CardDescription>Find vehicles in your current listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by VIN, Make, Model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  data-testid="input-search-inventory"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-search">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Listings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Your Recent Listings</span>
              <Link href="/upload">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-new">
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>Vehicles you've listed for sale or recently acquired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No vehicles listed yet</p>
              <p className="text-sm mb-4">Start by adding vehicles to your inventory</p>
              <Link href="/upload">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
