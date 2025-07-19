import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityCardProps {
  id: string | number;
  division: string;
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'ongoing' | 'pending';
  icon: ReactNode;
  className?: string;
}

export function ActivityCard({ 
  id, 
  division, 
  title, 
  description, 
  time, 
  status, 
  icon, 
  className = "" 
}: ActivityCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'ongoing':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getDivisionColor = (division: string) => {
    switch (division) {
      case 'Matchmaking':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'CMS':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'Engagement':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className={`hover:bg-muted/50 transition-colors ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${getDivisionColor(division)}`}>
            <div className="text-lg">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {time}
            </p>
          </div>
          <Badge color={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 