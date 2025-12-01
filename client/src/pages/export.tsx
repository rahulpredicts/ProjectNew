import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Edit2,
  FileText,
  Download,
  TrendingUp,
  Copy,
  ExternalLink,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportData {
  vin: string;
  vehicleInfo: string;
  odometer: string;
  trim: string;
  roofTop: string;
  wholesaleValue: string;
  additionalCosts: string;
  appraisedValue: string;
  exportValue: string;
  notes: string;
}

export default function ExportPage() {
  const { toast } = useToast();
  const [exportData, setExportData] = useState<ExportData>({
    vin: '5N1DL1FS5PC330227',
    vehicleInfo: '2023 Infiniti QX60',
    odometer: '45000',
    trim: 'Luxe',
    roofTop: 'Carrefour 40-640 VW',
    wholesaleValue: '34200',
    additionalCosts: '',
    appraisedValue: '42000',
    exportValue: '42,349',
    notes: ''
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button className="text-slate-600 hover:text-slate-900 transition-colors" data-testid="button-back-export">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Export calculator</h1>
            <p className="text-slate-600 text-sm">{exportData.vin} - {exportData.vehicleInfo}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">Duty rate 0%</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">TPMS included</span>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Trim</Label>
              <select className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" data-testid="select-trim">
                <option>{exportData.trim}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Odometer</Label>
              <Input
                value={exportData.odometer}
                onChange={(e) => setExportData({...exportData, odometer: e.target.value})}
                className="border-slate-300 text-slate-900"
                data-testid="input-odometer-calc"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">km</Label>
              <div className="p-2 bg-slate-100 rounded text-slate-700">km</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Rooftop</Label>
              <select className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" data-testid="select-rooftop">
                <option>{exportData.roofTop}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Market Guide Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Left: Market Data */}
          <div>
            <Card className="bg-white border-slate-200 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Market guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">$34.2k USD</p>
                    <p className="text-xs text-red-600 font-semibold">⬇ $300</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Recalls & Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Canada recalls</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" data-testid="button-copy-vin">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy VIN
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" data-testid="button-visit-canada">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit Canada CA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Export Calculator */}
          <div>
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Export calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-900">
                  Fill out required (*) fields for the export calculator record to be saved with your appraisal.
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-2 block">
                    * US wholesale value
                  </Label>
                  <div className="flex gap-2">
                    <span className="p-2 bg-slate-100 text-slate-600 rounded">$</span>
                    <Input
                      value={exportData.wholesaleValue}
                      onChange={(e) => setExportData({...exportData, wholesaleValue: e.target.value})}
                      className="border-slate-300 text-slate-900"
                      data-testid="input-wholesale-value"
                    />
                    <span className="p-2 bg-slate-100 text-slate-600 rounded">USD</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-2 block">Additional costs</Label>
                  <Input
                    placeholder="e.g., shipping, fees"
                    value={exportData.additionalCosts}
                    onChange={(e) => setExportData({...exportData, additionalCosts: e.target.value})}
                    className="border-slate-300 text-slate-900"
                    data-testid="input-additional-costs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-2 block">
                    * Appraised value
                  </Label>
                  <div className="flex gap-2">
                    <span className="p-2 bg-slate-100 text-slate-600 rounded">$</span>
                    <Input
                      value={exportData.appraisedValue}
                      onChange={(e) => setExportData({...exportData, appraisedValue: e.target.value})}
                      className="border-slate-300 text-slate-900"
                      data-testid="input-appraised-value"
                    />
                    <span className="p-2 bg-slate-100 text-slate-600 rounded">CAD</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-2 block">Notes</Label>
                  <textarea
                    placeholder="Add any additional notes..."
                    value={exportData.notes}
                    onChange={(e) => setExportData({...exportData, notes: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 text-sm"
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs" data-testid="button-edit-rates">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit rates
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" data-testid="button-mmr">
                    MMR transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Export Value Results */}
        <Card className="bg-green-50 border-green-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Estimated advance</p>
                <p className="text-lg font-bold text-slate-900">$40,613 CAD</p>
                <p className="text-xs text-slate-500">$29,070 USD</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Adjusted GPU FX rate</p>
                <p className="text-lg font-bold text-slate-900">$1,736 CAD</p>
                <p className="text-xs text-slate-500">1.387063</p>
              </div>
              <div className="bg-green-200 p-4 rounded-lg border border-green-400">
                <p className="text-xs text-slate-600 mb-1">Export value</p>
                <p className="text-2xl font-bold text-slate-900">${exportData.exportValue} CAD</p>
                <Info className="w-4 h-4 text-slate-600 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6" data-testid="button-save-export">
            <FileText className="w-5 h-5 mr-2" />
            Save Export Record
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6" data-testid="button-download-export">
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}
