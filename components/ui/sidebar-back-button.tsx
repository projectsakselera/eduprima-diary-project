"use client";

import React from 'react';
import { usePathname, useRouter } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface SidebarBackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  collapsed?: boolean;
}

export function SidebarBackButton({
  className,
  variant = 'ghost',
  size = 'sm',
  showIcon = true,
  collapsed = false
}: SidebarBackButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getBackNavigation = () => {
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
                  label: 'Back to Matchmaking',
                  icon: 'heroicons:user-plus'
                };
              }
              // If we're in matchmaking root
              return {
                path: '/eduprima/main/ops/em',
                label: 'Back to EM',
                icon: 'heroicons:user-group'
              };
            }
            // If we're in a specific em page (like engagement, cms, etc.)
            if (segments.length > 4) {
              return {
                path: '/eduprima/main/ops/em',
                label: 'Back to EM',
                icon: 'heroicons:user-group'
              };
            }
            // If we're in em root
            return {
              path: '/eduprima/main/ops',
              label: 'Back to Ops',
              icon: 'heroicons:cog-6-tooth'
            };
          }
          // If we're in ec section
          if (segments[3] === 'ec') {
            if (segments.length > 4) {
              return {
                path: '/eduprima/main/ops/ec',
                label: 'Back to EC',
                icon: 'heroicons:academic-cap'
              };
            }
            return {
              path: '/eduprima/main/ops',
              label: 'Back to Ops',
              icon: 'heroicons:cog-6-tooth'
            };
          }
          // If we're in adm section
          if (segments[3] === 'adm') {
            if (segments.length > 4) {
              return {
                path: '/eduprima/main/ops/adm',
                label: 'Back to Admin',
                icon: 'heroicons:shield-check'
              };
            }
            return {
              path: '/eduprima/main/ops',
              label: 'Back to Admin',
              icon: 'heroicons:cog-6-tooth'
            };
          }
          // If we're in ops root
          return {
            path: '/eduprima/main',
            label: 'Back to Main',
            icon: 'heroicons:home'
          };
        }
        // If we're in program section
        if (segments[2] === 'program') {
          if (segments.length > 3) {
            return {
              path: '/eduprima/main/program',
              label: 'Back to Program',
              icon: 'heroicons:academic-cap'
            };
          }
          return {
            path: '/eduprima/main',
            label: 'Back to Main',
            icon: 'heroicons:home'
          };
        }
        // If we're in ba section
        if (segments[2] === 'ba') {
          if (segments.length > 3) {
            return {
              path: '/eduprima/main/ba',
              label: 'Back to BA',
              icon: 'heroicons:building-office'
            };
          }
          return {
            path: '/eduprima/main',
            label: 'Back to Main',
            icon: 'heroicons:home'
          };
        }
        // If we're in main root
        return {
          path: '/eduprima',
          label: 'Back to Eduprima',
          icon: 'heroicons:home'
        };
      }
      // If we're in other eduprima sections (dashboard, students, etc.)
      if (segments.length > 2) {
        return {
          path: `/${segments[0]}/${segments[1]}`,
          label: 'Back',
          icon: 'heroicons:arrow-left'
        };
      }
      // If we're in eduprima root
      return {
        path: '/',
        label: 'Back to Home',
        icon: 'heroicons:home'
      };
    }

    // Handle dashcode navigation
    if (segments[0] === 'dashcode') {
      if (segments.length > 2) {
        return {
          path: `/${segments[0]}/${segments[1]}`,
          label: 'Back',
          icon: 'heroicons:arrow-left'
        };
      }
      return {
        path: '/',
        label: 'Back to Home',
        icon: 'heroicons:home'
      };
    }

    // Default fallback
    return {
      path: '/',
      label: 'Back to Home',
      icon: 'heroicons:home'
    };
  };

  const backNav = getBackNavigation();

  // Don't show back button if we're at the root level
  if (backNav.path === '/' || backNav.path === '/eduprima') {
    return null;
  }

  const handleBack = () => {
    router.push(backNav.path);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn(
        "w-full justify-start transition-all duration-200 hover:shadow-sm",
        collapsed ? "px-2" : "px-3",
        className
      )}
    >
      {showIcon && (
        <Icon 
          icon={backNav.icon} 
          className={cn(
            "h-4 w-4",
            collapsed ? "mr-0" : "mr-2"
          )} 
        />
      )}
      {!collapsed && backNav.label}
    </Button>
  );
} 