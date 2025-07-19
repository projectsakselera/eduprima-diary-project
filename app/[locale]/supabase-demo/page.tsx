import { SupabaseDashboard } from '@/components/supabase-dashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SupabaseDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Supabase Integration</h1>
          <div className="flex space-x-2">
            <Link href="/en/supabase-data-explorer">
              <Button variant="outline" size="sm">
                Data Explorer
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <SupabaseDashboard />
    </div>
  )
} 