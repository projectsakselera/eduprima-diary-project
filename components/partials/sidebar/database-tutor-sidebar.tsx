"use client";

import React from 'react'
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuItem from "./common/menu-item";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from '@/lib/auth-context';

const tutorManagerMenus = [
  {
    groupLabel: "Mission Control",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor",
        label: "Mission Overview",
        active: false,
        icon: "heroicons:chart-bar",
      }
    ]
  },
  {
    groupLabel: "Tutor Database",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/view-all",
        label: "View All Tutors",
        active: true,
        icon: "heroicons:table-cells",
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/add",
        label: "Add New Tutor",
        active: false,
        icon: "heroicons:plus-circle",
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/import-export",
        label: "Import/Export",
        active: false,
        icon: "heroicons:arrow-up-tray",
      }
    ]
  },
  {
    groupLabel: "Migration Tools",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/migration/dashboard",
        label: "Migration Dashboard",
        active: false,
        icon: "heroicons:cog-6-tooth",
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/migration/column-mapping",
        label: "Column Mapping",
        active: false,
        icon: "heroicons:link",
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/migration/schema-validation",
        label: "Schema Validation",
        active: false,
        icon: "heroicons:shield-check",
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/migration/progress-tracking",
        label: "Progress Tracking",
        active: false,
        icon: "heroicons:chart-bar",
      }
    ]
  },
  {
    groupLabel: "AI & Machine Learning",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/subject-recommendation",
        label: "Subject Recommendation",
        active: false,
        icon: "ph:brain",
        badge: "AI"
      }
    ]
  },
  {
    groupLabel: "Reports & Analytics",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/reports",
        label: "Tutor Statistics",
        active: false,
        icon: "heroicons:chart-pie",
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/analytics",
        label: "Performance Reports",
        active: false,
        icon: "heroicons:presentation-chart-line",
      }
    ]
  }
];

export function DatabaseTutorSidebar() {
    const pathname = usePathname();
    const isDesktop = useMediaQuery('(min-width: 1280px)')
    const [config] = useConfig()
    const collapsed = config.collapsed
    const { user, logout } = useAuth();

    // Update active states based on current pathname
    const menuList = tutorManagerMenus.map(group => ({
      ...group,
      menus: group.menus.map(menu => ({
        ...menu,
        active: pathname === menu.href || pathname.startsWith(menu.href + '/')
      }))
    }));

    return (
        <>
            {isDesktop && (
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="heroicons:academic-cap" className="text-primary h-8 w-8" />
                        {!collapsed && (
                            <div>
                                <h1 className="text-lg font-bold text-default-900">
                                    Eduprima Diary
                                </h1>
                                <p className="text-xs text-default-500">
                                    Tutor Database Management
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:block!">
                {isDesktop && !collapsed && (
                    <div className="px-4 py-2">
                        <div className="bg-primary/10 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user?.email}</p>
                                    <p className="text-xs text-default-500">Database Tutor Manager</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={logout}
                            >
                                <Icon icon="heroicons:arrow-right-on-rectangle" className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                )}

                <nav className="mt-4 h-full w-full">
                    <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                        {menuList?.map(({ groupLabel, menus }, index) => (
                            <li className="w-full" key={`${groupLabel}-${index}`}>
                                {!collapsed && (
                                    <p className="text-sm font-medium text-default-600 pb-2 max-w-[248px] truncate px-3 pt-5">
                                        {groupLabel}
                                    </p>
                                )}
                                {menus?.map(({ href, label, icon, active }, index) => (
                                    <div className="w-full mb-2" key={index}>
                                        <TooltipProvider disableHoverableContent>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <MenuItem 
                                                            label={label} 
                                                            icon={icon} 
                                                            href={href} 
                                                            active={active} 
                                                            id={label.toLowerCase().replace(/\s+/g, '-')} 
                                                            collapsed={collapsed} 
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                {collapsed && (
                                                    <TooltipContent side="right">
                                                        {label}
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
} 