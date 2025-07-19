'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X
} from "lucide-react";
import { useRouter } from "@/components/navigation";

interface ImportTutor {
  name: string;
  email: string;
  phone: string;
  subjects: string;
  hourlyRate: string;
  status: string;
  isValid: boolean;
  errors: string[];
}

export default function ImportExportPage() {
  const router = useRouter();
  const [importData, setImportData] = useState<ImportTutor[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock data for preview
  const mockImportData: ImportTutor[] = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+62 812-3456-7890',
      subjects: 'Mathematics, Physics',
      hourlyRate: '150000',
      status: 'active',
      isValid: true,
      errors: []
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+62 813-4567-8901',
      subjects: 'English, Literature',
      hourlyRate: '120000',
      status: 'pending',
      isValid: true,
      errors: []
    },
    {
      name: 'Bob Wilson',
      email: 'invalid-email',
      phone: '+62 814-5678-9012',
      subjects: 'Chemistry',
      hourlyRate: '180000',
      status: 'active',
      isValid: false,
      errors: ['Invalid email format']
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate file processing
      setTimeout(() => {
        setImportData(mockImportData);
      }, 1000);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      // Navigate back to database tutor page
      router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
    }, 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // Create and download file
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Phone,Subjects,Hourly Rate,Status\n" +
        "Sarah Johnson,sarah.johnson@example.com,+62 812-3456-7890,Mathematics;Physics,150000,active\n" +
        "Ahmad Rahman,ahmad.rahman@example.com,+62 813-4567-8901,English;Indonesian,120000,active";
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "tutors_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  const handleBack = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  const validTutors = importData.filter(tutor => tutor.isValid);
  const invalidTutors = importData.filter(tutor => !tutor.isValid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import/Export Tutors</h1>
          <p className="text-muted-foreground">
            Bulk import and export tutor data
          </p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <X className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Tutors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Supported format: CSV with columns: Name, Email, Phone, Subjects, Hourly Rate, Status
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge className="bg-green-100 text-green-800">
                  {importData.length} records found
                </Badge>
              </div>
            )}

            {importData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Preview</h4>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {validTutors.length} valid
                    </Badge>
                    {invalidTutors.length > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        {invalidTutors.length} invalid
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {importData.map((tutor, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        tutor.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{tutor.name}</p>
                          <p className="text-sm text-muted-foreground">{tutor.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {tutor.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      {tutor.errors.length > 0 && (
                        <div className="mt-2">
                          {tutor.errors.map((error, errorIndex) => (
                            <p key={errorIndex} className="text-xs text-red-600">
                              • {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleImport} 
                  disabled={isImporting || invalidTutors.length > 0}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {validTutors.length} Tutors
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Tutors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Export Options</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Export all tutors to CSV format</p>
                  <p>• Include all tutor information</p>
                  <p>• Compatible with import function</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">CSV</Badge>
                  <Badge className="bg-gray-100 text-gray-800">Excel (Coming Soon)</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include Fields</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Basic Information
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Contact Details
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Subjects & Skills
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Availability
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pricing
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Status
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export All Tutors
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle>Import Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Download the CSV template to ensure proper formatting for import
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Required columns: Name, Email, Phone, Subjects, Hourly Rate, Status</p>
                <p>Optional columns: Address, Education, Experience, Bio, Skills, Availability</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Name,Email,Phone,Subjects,Hourly Rate,Status,Address,Education,Experience,Bio,Skills,Availability\n" +
                "John Doe,john.doe@example.com,+62 812-3456-7890,Mathematics;Physics,150000,active,Address here,Education here,Experience here,Bio here,Skills here,Availability here";
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "tutor_import_template.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 