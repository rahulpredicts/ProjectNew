import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScrapingDogDebug() {
  const { toast } = useToast();
  const [testUrl, setTestUrl] = useState("https://www.signaturecars.ca/inventory/");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handleTest = async () => {
    if (!testUrl.trim()) {
      toast({ title: "URL Required", description: "Please enter a URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/test-scrapingdog-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to test");
        toast({ title: "Test Failed", description: errorData.error, variant: "destructive" });
      } else {
        const data = await res.json();
        setResult(data);
        toast({ title: "Success", description: "API test completed", variant: "default" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({ title: "Error", description: "Failed to test API", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8" data-testid="scrapingdog-debug-page">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">ScrapingDog Debug Test</h1>
        <p className="text-gray-500">Direct test of ScrapingDog API with dynamic=false parameter</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Input Section */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Test the exact curl command with dynamic=false</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">Test URL</Label>
              <Input
                placeholder="https://www.signaturecars.ca/inventory/"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="font-mono text-sm"
                data-testid="input-test-url"
              />
            </div>

            <Button
              onClick={handleTest}
              disabled={isLoading || !testUrl.trim()}
              className="w-full"
              size="lg"
              data-testid="button-test"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                "Test ScrapingDog API (dynamic=false)"
              )}
            </Button>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
              <p className="font-semibold mb-1">Equivalent cURL:</p>
              <code className="text-xs break-all font-mono">
                curl "https://api.scrapingdog.com/scrape?api_key=YOUR_KEY&url={encodeURIComponent(testUrl)}&dynamic=false"
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {!result && !error && !isLoading && (
          <Card className="border-0 shadow-sm ring-1 ring-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">Click "Test ScrapingDog API" to begin</p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="border-0 shadow-sm ring-1 ring-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Testing API...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-0 shadow-sm ring-1 ring-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Test Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm ring-1 ring-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Test Successful</p>
                    <p className="text-sm text-green-700 mt-1">
                      Received {result.htmlLength} bytes of HTML content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">API Response Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">HTTP Status</p>
                    <p className="font-bold text-lg">{result.apiStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">HTML Size</p>
                    <p className="font-bold text-lg">{(result.htmlLength / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Data Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">VINs Found ({result.analysis.vinsFound.length})</p>
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    {result.analysis.vinsFound.length > 0 ? (
                      <div className="space-y-1">
                        {result.analysis.vinsFound.map((vin: string, idx: number) => (
                          <div key={idx} className="text-xs font-mono text-gray-700">{vin}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No VINs found in HTML</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Vehicle Makes/Models ({result.analysis.makeModelsFound.length})</p>
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    {result.analysis.makeModelsFound.length > 0 ? (
                      <div className="space-y-1">
                        {result.analysis.makeModelsFound.slice(0, 20).map((model: string, idx: number) => (
                          <div key={idx} className="text-xs text-gray-700">{model}</div>
                        ))}
                        {result.analysis.makeModelsFound.length > 20 && (
                          <div className="text-xs text-gray-500">... and {result.analysis.makeModelsFound.length - 20} more</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No make/model patterns found</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Prices Found ({result.analysis.pricesFound.length})</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs space-y-1">
                      {result.analysis.pricesFound.length > 0 ? (
                        result.analysis.pricesFound.map((price: string, idx: number) => (
                          <div key={idx} className="text-gray-700">${price}</div>
                        ))
                      ) : (
                        <p className="text-gray-500">No prices found</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Years Found ({result.analysis.yearsFound.length})</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs space-x-2 flex flex-wrap gap-2">
                      {result.analysis.yearsFound.map((year: string) => (
                        <span key={year} className="bg-gray-200 px-2 py-1 rounded">{year}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw HTML Preview */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">HTML Preview (First 2000 chars)</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.preview)}
                    className="h-7 px-2"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words">{result.preview}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Full Raw HTML Download */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Full HTML Response</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const blob = new Blob([result.rawHtml], { type: "text/html" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `scrapingdog-response-${new Date().getTime()}.html`;
                    a.click();
                  }}
                >
                  Download Full HTML ({(result.htmlLength / 1024).toFixed(1)} KB)
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
