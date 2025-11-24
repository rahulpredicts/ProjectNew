import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, Link as LinkIcon, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_URLS = [
  "https://www.autotrader.ca/a/toyota/camry/2022",
  "https://www.kijiji.ca/v-cars-vehicles/",
  "https://www.cars.com/shopping/results/",
];

export default function ScrapingDogTest() {
  const { toast } = useToast();
  const [testUrl, setTestUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string>("");
  const [copiedRawJson, setCopiedRawJson] = useState(false);

  const handleTest = async () => {
    if (!testUrl.trim()) {
      toast({ title: "URL Required", description: "Please enter a URL to test", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);
    setRawJson("");

    try {
      const res = await fetch("/api/scrape-listing-scrapingdog", {
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
        setResult(data.extracted);
        setRawJson(JSON.stringify(data, null, 2));
        toast({ title: "Success", description: "Data extracted successfully", variant: "default" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({ title: "Error", description: "Failed to connect to API", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    setCopiedRawJson(true);
    setTimeout(() => setCopiedRawJson(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8" data-testid="scrapingdog-test-page">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">ScrapingDog API Test</h1>
        <p className="text-gray-500">Test the ScrapingDog integration before implementing in production.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Enter a vehicle listing URL to extract data with ScrapingDog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold">Test URL *</Label>
              <Input
                placeholder="https://www.autotrader.ca/a/toyota/camry/2020"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="font-mono text-sm"
                data-testid="input-test-url"
              />
              <p className="text-xs text-gray-500">
                Examples: AutoTrader, Kijiji, Cars.com, or any car listing website
              </p>
            </div>

            <Button
              onClick={handleTest}
              disabled={isLoading || !testUrl.trim()}
              className="w-full"
              size="lg"
              data-testid="button-test-extraction"
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
              <Label className="text-sm font-semibold mb-2 block">Sample URLs</Label>
              <div className="space-y-2">
                {SAMPLE_URLS.map((url, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs truncate"
                    onClick={() => setTestUrl(url)}
                    data-testid={`button-sample-url-${idx}`}
                  >
                    <LinkIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                    {url}
                  </Button>
                ))}
              </div>
            </div>

            {/* API Info */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-semibold mb-3 block">API Information</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">ScrapingDog</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">JavaScript Rendering</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-medium">2-5 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">High (90%+)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle>Extraction Results</CardTitle>
            <CardDescription>Extracted vehicle data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result && !error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <LinkIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Run a test to see results</p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-gray-600">Scraping website with JavaScript rendering...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="alert-error">
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="alert-success">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Extraction Successful</p>
                      <p className="text-sm text-green-700 mt-1">Successfully extracted {Object.keys(result).length} fields</p>
                    </div>
                  </div>
                </div>

                {/* Extracted Fields */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Extracted Fields</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result as Record<string, any>).map(([key, value]: [string, any]) => (
                      value && (
                        <div key={key} className="bg-gray-50 rounded p-2.5 border border-gray-200" data-testid={`card-field-${key}`}>
                          <p className="text-xs text-gray-600 uppercase font-semibold">{key}</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5 break-words">{String(value)}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Raw JSON */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Raw JSON Response</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-7 px-2"
                      data-testid="button-copy-json"
                    >
                      {copiedRawJson ? (
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
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto max-h-60 overflow-y-auto" data-testid="display-raw-json">
                    <pre className="whitespace-pre-wrap break-words">{rawJson}</pre>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
