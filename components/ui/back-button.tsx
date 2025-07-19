"use client";

import React from 'react';
import { usePathname, useRouter } from '@/components/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  customBackPath?: string;
  customLabel?: string;
}

export function BackButton({
  className,
  variant = 'outline',
  size = 'md',
  showIcon = true,
  customBackPath,
  customLabel
}: BackButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getBackNavigation = () => {
    // If custom path is provided, use it
    if (customBackPath) {
      return {
        path: customBackPath,
        label: customLabel || 'Back'
      };
    }

    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    
    // Remove locale from path segments for processing
    const segments = pathSegments.filter(segment => !['en', 'id', 'ar'].includes(segment));
    
    // Handle eduprima navigation hierarchy
    if (segments[0] === 'eduprima') {
      // If we're in main section
      if (segments[1] === 'main') {
        // If we're in ops section
        if (segments[2] === 'ops') {
          // If we're in em section
          if (segments[3] === 'em') {
            // If we're in matchmaking section
            if (segments[4] === 'matchmaking') {
              // If we're in a specific matchmaking page (like database-tutor, etc.)
              if (segments.length > 5) {
                return {
                  path: '/eduprima/main/ops/em/matchmaking',
                  label: 'Back to Matchmaking'
                };
              }
              // If we're in matchmaking root
              return {
                path: '/eduprima/main/ops/em',
                label: 'Back to EM'
              };
            }
            // If we're in a specific em page (like engagement, cms, etc.)
            if (segments.length > 4) {
              return {
                path: '/eduprima/main/ops/em',
                label: 'Back to EM'
              };
            }
            // If we're in em root
            return {
              path: '/eduprima/main/ops',
              label: 'Back to Ops'
            };
          }
          // If we're in ec section
          if (segments[3] === 'ec') {
            if (segments.length > 4) {
              return {
                path: '/eduprima/main/ops/ec',
                label: 'Back to EC'
              };
            }
            return {
              path: '/eduprima/main/ops',
              label: 'Back to Ops'
            };
          }
          // If we're in adm section
          if (segments[3] === 'adm') {
            if (segments.length > 4) {
              return {
                path: '/eduprima/main/ops/adm',
                label: 'Back to Admin'
              };
            }
            return {
              path: '/eduprima/main/ops',
              label: 'Back to Admin'
            };
          }
          // If we're in ops root
          return {
            path: '/eduprima/main',
            label: 'Back to Main'
          };
        }
        // If we're in program section
        if (segments[2] === 'program') {
          if (segments.length > 3) {
            return {
              path: '/eduprima/main/program',
              label: 'Back to Program'
            };
          }
          return {
            path: '/eduprima/main',
            label: 'Back to Main'
          };
        }
        // If we're in ba section
        if (segments[2] === 'ba') {
          if (segments.length > 3) {
            return {
              path: '/eduprima/main/ba',
              label: 'Back to BA'
            };
          }
          return {
            path: '/eduprima/main',
            label: 'Back to Main'
          };
        }
        // If we're in main root
        return {
          path: '/eduprima',
          label: 'Back to Eduprima'
        };
      }
      // If we're in other eduprima sections (dashboard, students, etc.)
      if (segments.length > 2) {
        return {
          path: `/${segments[0]}/${segments[1]}`,
          label: 'Back'
        };
      }
      // If we're in eduprima root
      return {
        path: '/',
        label: 'Back to Home'
      };
    }

    // Handle dashcode navigation
    if (segments[0] === 'dashcode') {
      if (segments.length > 2) {
        return {
          path: `/${segments[0]}/${segments[1]}`,
          label: 'Back'
        };
      }
      return {
        path: '/',
        label: 'Back to Home'
      };
    }

    // Default fallback
    return {
      path: '/',
      label: 'Back to Home'
    };
  };

  const backNav = getBackNavigation();

  const handleBack = () => {
    router.push(backNav.path);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn(
        "flex items-center gap-2 transition-all duration-200 hover:shadow-sm",
        className
      )}
    >
      {showIcon && <ChevronLeft className="h-4 w-4" />}
      {backNav.label}
    </Button>
  );
}

// Breadcrumb-style back button for more context
export function BreadcrumbBackButton({
  className,
  variant = 'ghost',
  size = 'sm'
}: Omit<BackButtonProps, 'showIcon' | 'customBackPath' | 'customLabel'>) {
  const pathname = usePathname();
  const router = useRouter();

  const getBreadcrumbNavigation = () => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const segments = pathSegments.filter(segment => !['en', 'id', 'ar'].includes(segment));
    
    if (segments[0] === 'eduprima' && segments[1] === 'main') {
      if (segments[2] === 'ops' && segments[3] === 'em') {
        return {
          path: '/eduprima/main/ops',
          label: 'Ops',
          current: 'EM'
        };
      }
      if (segments[2] === 'ops') {
        return {
          path: '/eduprima/main',
          label: 'Main',
          current: 'Ops'
        };
      }
      if (segments[2] === 'program') {
        return {
          path: '/eduprima/main',
          label: 'Main',
          current: 'Program'
        };
      }
      if (segments[2] === 'ba') {
        return {
          path: '/eduprima/main',
          label: 'Main',
          current: 'BA'
        };
      }
    }
    
    return null;
  };

  const breadcrumb = getBreadcrumbNavigation();

  if (!breadcrumb) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={() => router.push(breadcrumb.path)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-3 w-3" />
        {breadcrumb.label}
      </Button>
      <span className="text-gray-400 dark:text-gray-500">/</span>
      <span className="text-gray-900 dark:text-gray-100 font-medium">{breadcrumb.current}</span>
    </div>
  );
} 