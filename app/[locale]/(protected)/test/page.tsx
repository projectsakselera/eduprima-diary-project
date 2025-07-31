import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';

export default function TestIndexPage() {
  const testPages = [
    {
      title: 'Upload Test - JWT Bridge',
      description: 'Test file upload dengan Custom JWT Authentication',
      href: '/test/upload-jwt-bridge',
      icon: 'ph:upload-simple',
      status: 'New',
      features: [
        'Custom JWT token generation',
        'Supabase Storage integration',
        'User folder segregation',
        'RLS policy testing',
        'File management demo'
      ]
    },
    {
      title: 'Supabase Form Test',
      description: 'Test koneksi Supabase dengan form educator (5 fields)',
      href: '/test/form-supabase',
      icon: 'ph:database',
      status: 'Ready',
      features: [
        'Multi-table insert (users_universal + user_profiles)',
        'Connection testing',
        'Form validation',
        'Error handling',
        'Real-time feedback'
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          🧪 Test Environment
        </h1>
        <p className="text-xl text-muted-foreground">
          Development testing pages untuk various features dan integrations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Icon icon="ph:test-tube" className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{testPages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Icon icon="ph:check-circle" className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ready Tests</p>
                <p className="text-2xl font-bold">{testPages.filter(test => test.status === 'Ready').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Icon icon="ph:database" className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Database Tests</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testPages.map((testPage, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon icon={testPage.icon} className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{testPage.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">{testPage.status}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {testPage.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {testPage.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Icon icon="ph:check" className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={testPage.href}>
                <Button className="w-full" variant="outline">
                  <Icon icon="ph:play" className="h-4 w-4 mr-2" />
                  Run Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="ph:info" className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Icon icon="ph:number-circle-one" className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Select a Test</p>
                <p className="text-muted-foreground">Choose from the available test pages above</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="ph:number-circle-two" className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Run Connection Test</p>
                <p className="text-muted-foreground">Test database connectivity before submitting forms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="ph:number-circle-three" className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Fill & Submit</p>
                <p className="text-muted-foreground">Complete the form and submit to test database operations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="ph:number-circle-four" className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Review Results</p>
                <p className="text-muted-foreground">Check the success/error feedback and inserted data preview</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 