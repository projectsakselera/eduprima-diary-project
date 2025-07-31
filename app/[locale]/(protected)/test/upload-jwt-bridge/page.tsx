import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { TestUploadComponent } from '@/components/test-upload';

export default function UploadJWTBridgeTestPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/test">
            <Button variant="outline" size="sm">
              <Icon icon="ph:arrow-left" className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Icon icon="ph:upload-simple" className="h-6 w-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Upload Test - JWT Bridge</h1>
          </div>
        </div>
        <p className="text-xl text-muted-foreground">
          Test file upload functionality menggunakan Custom JWT Authentication dengan Supabase Storage
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Icon icon="ph:key" className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">JWT Bridge API</p>
                <p className="text-2xl font-bold text-green-600">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Icon icon="ph:shield-check" className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">RLS Policies</p>
                <p className="text-2xl font-bold text-blue-600">Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Icon icon="ph:database" className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Storage Bucket</p>
                <p className="text-2xl font-bold text-purple-600">eduprimadiary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Test Component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Test Component */}
        <div>
          <TestUploadComponent />
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="ph:gear" className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">Custom Auth Session</p>
                  <p className="text-sm text-muted-foreground">Gets user session from custom auth system</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">JWT Bridge</p>
                  <p className="text-sm text-muted-foreground">Calls /api/supabase-session untuk generate Supabase JWT</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium">Authenticated Client</p>
                  <p className="text-sm text-muted-foreground">Creates Supabase client dengan custom JWT token</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p className="font-medium">Secure Upload</p>
                  <p className="text-sm text-muted-foreground">Upload file ke user's own folder dengan RLS protection</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="ph:folder" className="h-5 w-5" />
                File Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                <div className="text-gray-600">eduprimadiary/</div>
                <div className="ml-4 text-blue-600">├── {'{user-id-1}'}/<div className="ml-4 text-green-600">├── avatar.jpg<br />└── document.pdf</div></div>
                <div className="ml-4 text-blue-600">├── {'{user-id-2}'}/<div className="ml-4 text-green-600">├── presentation.pptx<br />└── photo.png</div></div>
                <div className="ml-4 text-gray-400">└── ...</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Each user can only access files in their own folder
              </p>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="ph:shield-check" className="h-5 w-5" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icon icon="ph:check" className="h-4 w-4 text-green-500" />
                  Row Level Security (RLS) enforcement
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="ph:check" className="h-4 w-4 text-green-500" />
                  User folder isolation
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="ph:check" className="h-4 w-4 text-green-500" />
                  Short-lived JWT tokens (1 hour)
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="ph:check" className="h-4 w-4 text-green-500" />
                  Custom authentication integration
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="ph:bug" className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">API Endpoints:</p>
              <ul className="space-y-1 text-muted-foreground font-mono">
                <li>• /api/supabase-session (JWT Bridge)</li>
                <li>• /api/auth/[...nextauth] (NextAuth)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Storage Configuration:</p>
              <ul className="space-y-1 text-muted-foreground font-mono">
                <li>• Bucket: eduprimadiary</li>
                <li>• Path: {'{user_id}/{filename}'}</li>
                <li>• RLS: Custom JWT policies</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Check browser console untuk detailed logs dari upload process.
              Login dengan custom auth system untuk test upload functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}