import { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DivisionCardProps {
  id: string | number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  icon: ReactNode;
  href: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
}

export function DivisionCard({ 
  id, 
  name, 
  description, 
  status, 
  icon, 
  href, 
  stats, 
  className = "" 
}: DivisionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Link href={href} className="block">
      <Card className={`hover:bg-muted/50 transition-colors cursor-pointer ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <div className="text-primary text-lg">
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {name}
              </h3>
              <Badge color={getStatusColor(status)} className="mt-1">
                {status}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {description}
          </p>
          {stats && (
            <div className="space-y-2">
              {stats.map((stat, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{stat.label}:</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
} 