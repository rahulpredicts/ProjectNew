import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BrowserActTest() {
  const { toast } = useToast();
  const [testUrl, setTestUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!testUrl.trim()) {
      toast({ title: "URL Required", description: "Please enter a URL to test", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Test the scraping endpoint
      const res = await fetch("/api/scrape-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to scrape");
        toast({ title: "Scraping Failed", description: errorData.error, variant: "destructive" });
      } else {
        const data = await res.json();
        setResult(data);
        toast({ title: "Success", description: "Data extracted successfully", variant: "default" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({ title: "Error", description: "Failed to connect to API", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">BrowserAct API Test</h1>
        <p className="text-gray-500">Test the scraping API integration before deploying to production.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Enter a vehicle listing URL to test extraction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold">API Key (Optional)</Label>
              <Input
                type="password"
                placeholder="app-xxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">Leave empty to use server-side key</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Test URL *</Label>
              <Input
                placeholder="https://www.autotrader.ca/a/toyota/camry/2020"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Examples: AutoTrader, Kijiji, dealer websites
              </p>
            </div>

            <Button
              onClick={handleTest}
              disabled={isLoading || !testUrl.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Extracting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Test Extraction
                </>
              )}
            </Button>

            {/* Quick Test URLs */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-semibold mb-2 block">Quick Test URLs</Label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setTestUrl("https://www.browseract.com/reception")}
                >
                  Test with Sample Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setTestUrl("https://www.autotrader.ca")}
                >
                  AutoTrader Homepage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle>Extraction Results</CardTitle>
            <CardDescription>API response data</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <LinkIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">No test run yet</p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-gray-600">Extracting data from URL...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Extraction Failed</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Extraction Successful</p>
                      <p className="text-sm text-green-700 mt-1">
                        Found {Object.keys(result).length} fields
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field Summary */}
                <div className="grid grid-cols-2 gap-3">
                  {result.year && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Year</span>
                      <span className="font-semibold">{result.year}</span>
                    </div>
                  )}
                  {result.make && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Make</span>
                      <span className="font-semibold">{result.make}</span>
                    </div>
                  )}
                  {result.model && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Model</span>
                      <span className="font-semibold">{result.model}</span>
                    </div>
                  )}
                  {result.price && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Price</span>
                      <span className="font-semibold">${Number(result.price).toLocaleString()}</span>
                    </div>
                  )}
                  {result.kilometers && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Kilometers</span>
                      <span className="font-semibold">{Number(result.kilometers).toLocaleString()} km</span>
                    </div>
                  )}
                  {result.vin && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">VIN</span>
                      <span className="font-mono text-xs">{result.vin}</span>
                    </div>
                  )}
                  {result.stockNumber && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Stock #</span>
                      <span className="font-semibold">{result.stockNumber}</span>
                    </div>
                  )}
                  {result.color && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Color</span>
                      <span className="font-semibold">{result.color}</span>
                    </div>
                  )}
                </div>

                {/* Raw JSON Response */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Raw JSON Response</Label>
                  <Textarea
                    value={formatJson(result)}
                    readOnly
                    className="font-mono text-xs min-h-[200px] bg-gray-50"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Documentation */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>Current extraction method details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Current Method</h4>
              <p className="text-sm text-blue-700">Regex-based HTML parsing</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-green-900">Cost</h4>
              <p className="text-sm text-green-700">Free (no external API)</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-purple-900">Speed</h4>
              <p className="text-sm text-purple-700">~1-2 seconds</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-sm mb-2">Extracted Fields</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
              <span>✓ Year</span>
              <span>✓ Make</span>
              <span>✓ Model</span>
              <span>✓ VIN</span>
              <span>✓ Price</span>
              <span>✓ Kilometers</span>
              <span>✓ Stock Number</span>
              <span>✓ Color</span>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-sm mb-2 text-amber-900">Limitations</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Works best on simple HTML pages</li>
              <li>May fail on JavaScript-heavy sites</li>
              <li>Cannot bypass CAPTCHAs</li>
              <li>Limited to visible HTML content</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
