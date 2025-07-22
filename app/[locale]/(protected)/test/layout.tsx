import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Pages - Selestia',
  description: 'Test pages for development and debugging',
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Test Layout Navigation */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">🧪 Test Environment</h2>
            <div className="text-sm text-muted-foreground">
              Development & Testing Pages
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          🚀 Test Environment - Selestia Development
        </div>
      </footer>
    </div>
  );
} 