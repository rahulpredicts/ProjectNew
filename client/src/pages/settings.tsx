import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Calculator,
  Target,
  Bell,
  Palette,
  Save,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [riskSettings, setRiskSettings] = useState({
    profitMargin: 15,
    maxDaysOnLot: 90,
    depreciation: 1.5,
  });

  const [targetMarket, setTargetMarket] = useState({
    retailStates: true,
    wholesalers: true,
    transporters: false,
  });

  const [alerts, setAlerts] = useState({
    priceDrops: true,
    newListings: true,
    marketTrends: false,
    weeklyReport: true,
  });

  const [colorTheme, setColorTheme] = useState('blue');

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-slate-400">Configure your account and preferences</p>
        </div>

        <Tabs defaultValue="values" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="values" className="data-[state=active]:bg-blue-600 text-white data-[state=inactive]:text-slate-300">
              <Calculator className="w-4 h-4 mr-2" />
              Values & Risk
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-blue-600 text-white data-[state=inactive]:text-slate-300">
              <Target className="w-4 h-4 mr-2" />
              Target Market
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600 text-white data-[state=inactive]:text-slate-300">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600 text-white data-[state=inactive]:text-slate-300">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Values & Risk Formula */}
          <TabsContent value="values">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  Values & Risk Formula
                </CardTitle>
                <CardDescription>Configure pricing and risk calculation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profitMargin" className="text-white font-semibold">Target Profit Margin (%)</Label>
                  <Input 
                    id="profitMargin"
                    type="number"
                    value={riskSettings.profitMargin}
                    onChange={(e) => setRiskSettings({...riskSettings, profitMargin: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-300">Minimum profit margin for pricing recommendations</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDays" className="text-white font-semibold">Max Days on Lot</Label>
                  <Input 
                    id="maxDays"
                    type="number"
                    value={riskSettings.maxDaysOnLot}
                    onChange={(e) => setRiskSettings({...riskSettings, maxDaysOnLot: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-300">Alert threshold for slow-moving inventory</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depreciation" className="text-white font-semibold">Monthly Depreciation Rate (%)</Label>
                  <Input 
                    id="depreciation"
                    type="number"
                    step="0.1"
                    value={riskSettings.depreciation}
                    onChange={(e) => setRiskSettings({...riskSettings, depreciation: parseFloat(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-300">Average monthly depreciation for value calculations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Target Market */}
          <TabsContent value="market">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Target Market
                </CardTitle>
                <CardDescription>Define your target audience for listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">Retail States/Provinces</p>
                    <p className="text-sm text-slate-300">Show listings to retail dealers in all regions</p>
                  </div>
                  <Switch 
                    checked={targetMarket.retailStates}
                    onCheckedChange={(checked) => setTargetMarket({...targetMarket, retailStates: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">Wholesalers</p>
                    <p className="text-sm text-slate-300">Make inventory visible to wholesale buyers</p>
                  </div>
                  <Switch 
                    checked={targetMarket.wholesalers}
                    onCheckedChange={(checked) => setTargetMarket({...targetMarket, wholesalers: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">Transporters</p>
                    <p className="text-sm text-slate-300">Connect with vehicle transport services</p>
                  </div>
                  <Switch 
                    checked={targetMarket.transporters}
                    onCheckedChange={(checked) => setTargetMarket({...targetMarket, transporters: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts */}
          <TabsContent value="alerts">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Alert Preferences
                </CardTitle>
                <CardDescription>Configure notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">Price Drop Alerts</p>
                    <p className="text-sm text-slate-300">Notify when market prices drop significantly</p>
                  </div>
                  <Switch 
                    checked={alerts.priceDrops}
                    onCheckedChange={(checked) => setAlerts({...alerts, priceDrops: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">New Listing Alerts</p>
                    <p className="text-sm text-slate-300">Get notified about new matching vehicles</p>
                  </div>
                  <Switch 
                    checked={alerts.newListings}
                    onCheckedChange={(checked) => setAlerts({...alerts, newListings: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">Market Trend Updates</p>
                    <p className="text-sm text-slate-300">Weekly market analysis and insights</p>
                  </div>
                  <Switch 
                    checked={alerts.marketTrends}
                    onCheckedChange={(checked) => setAlerts({...alerts, marketTrends: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white">Weekly Report</p>
                    <p className="text-sm text-slate-300">Summary of your inventory performance</p>
                  </div>
                  <Switch 
                    checked={alerts.weeklyReport}
                    onCheckedChange={(checked) => setAlerts({...alerts, weeklyReport: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Website Color
                </CardTitle>
                <CardDescription>Customize the appearance of your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { id: 'blue', color: 'bg-blue-600', name: 'Blue' },
                    { id: 'green', color: 'bg-green-600', name: 'Green' },
                    { id: 'purple', color: 'bg-purple-600', name: 'Purple' },
                    { id: 'red', color: 'bg-red-600', name: 'Red' },
                    { id: 'orange', color: 'bg-orange-600', name: 'Orange' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setColorTheme(theme.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        colorTheme === theme.id 
                          ? 'border-white' 
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 ${theme.color} rounded-full mx-auto mb-2`} />
                      <p className="text-sm text-center">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8">
          <Button 
            size="lg" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
