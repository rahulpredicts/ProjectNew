import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart3, Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadStats {
  totalUploads: number;
  successfulCars: number;
  failedCars: number;
  averageUploadSize: number;
}

export default function DataAnalystDashboard() {
  const { user, isDataAnalyst } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<BulkUploadStats>({
    totalUploads: 0,
    successfulCars: 0,
    failedCars: 0,
    averageUploadSize: 0,
  });
  const [loading, setLoading] = useState(false);

  if (!isDataAnalyst && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Database className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">Data Analyst access required</p>
        </div>
      </div>
    );
  }

  const handleNavigateToUpload = () => {
    window.location.href = '/upload';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Data Analyst Hub</h1>
          <p className="text-slate-400">Manage bulk vehicle uploads and track import operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Uploads</p>
                  <p className="text-3xl font-bold">{stats.totalUploads}</p>
                </div>
                <Upload className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Successful</p>
                  <p className="text-3xl font-bold text-green-400">{stats.successfulCars}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Failed</p>
                  <p className="text-3xl font-bold text-red-400">{stats.failedCars}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Upload Size</p>
                  <p className="text-3xl font-bold">{stats.averageUploadSize}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Bulk Upload
              </CardTitle>
              <CardDescription>Import vehicles via CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">Upload vehicles in bulk using CSV format with support for multiple sources.</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleNavigateToUpload}
                data-testid="button-go-to-upload"
              >
                Go to Upload
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                URL Scraping
              </CardTitle>
              <CardDescription>Extract data from listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">Automatically extract vehicle data from multiple URLs for batch import.</p>
              <Button 
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={handleNavigateToUpload}
                data-testid="button-go-to-scrape"
              >
                Scrape URLs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                AI Parser
              </CardTitle>
              <CardDescription>Parse text files with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">Use AI to intelligently parse vehicle data from text files and documents.</p>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleNavigateToUpload}
                data-testid="button-go-to-parser"
              >
                Parse Files
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Upload Operations</CardTitle>
            <CardDescription>Track recent bulk import operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent uploads yet</p>
              <p className="text-sm">Start by uploading your first batch of vehicles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
