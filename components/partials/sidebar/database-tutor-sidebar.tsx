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
import { useCustomSession } from '@/hooks/use-custom-session';
import { signOut } from 'next-auth/react';
import SidebarHoverToggle from './sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';

// Simplified menu - only working pages
const tutorManagerMenus = [
  {
    groupLabel: "📊 Dashboard",
    menus: [
      {
        href: "/eduprima/main/ops/em/database-tutor",
        label: "Overview",
        active: false,
        icon: "heroicons:chart-bar"
      }
    ]
  },
  {
    groupLabel: "👥 Tutor Management",
    menus: [
      {
        href: "/eduprima/main/ops/em/database-tutor/view-all",
        label: "View All Tutors",
        active: true,
        icon: "heroicons:table-cells"
      },
      {
        href: "/eduprima/main/ops/em/database-tutor/add",
        label: "Add New Tutor",
        active: false,
        icon: "heroicons:plus-circle"
      },
      {
        href: "/eduprima/main/ops/em/database-tutor/import-export",
        label: "Import/Export",
        active: false,
        icon: "heroicons:arrow-up-tray"
      }
    ]
  },
  {
    groupLabel: "🔍 Smart Search",
    menus: [
      {
        href: "/eduprima/main/ops/em/database-tutor/educator-query",
        label: "Tutor Query",
        active: false,
        icon: "ph:brain",
        badge: "NEW"
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/subject-recommendation",
        label: "Subject Recommendation",
        active: false,
        icon: "heroicons:lightbulb",
        badge: "AI"
      }
    ]
  },
  {
    groupLabel: "🔧 Tools & Test",
    menus: [
      {
        href: "/eduprima/main/ops/em/database-tutor/storage-test",
        label: "Storage Test",
        active: false,
        icon: "ph:cloud-arrow-up",
        badge: "TEST"
      }
    ]
  }
];

export function DatabaseTutorSidebar() {
    const pathname = usePathname();
    const isDesktop = useMediaQuery('(min-width: 1024px)')
    const [config] = useConfig()
    const collapsed = config.collapsed
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;
    const { user } = useCustomSession();

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
                        {(!collapsed || hovered) && (
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
                    <SidebarHoverToggle />
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:block!">
                {isDesktop && (!collapsed || hovered) && (
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
                                className="w-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                onClick={() => signOut({ callbackUrl: '/auth/login' })}
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
                                {(!collapsed || hovered) && (
                                    <p className="text-sm font-medium text-default-600 pb-2 max-w-[248px] truncate px-3 pt-5">
                                        {groupLabel}
                                    </p>
                                )}
                                {menus?.map((menu, index) => {
                                    const { href, label, icon, active, badge, comingSoon, children } = menu as any;
                                    return (
                                    <div className="w-full mb-2" key={index}>
                                        <TooltipProvider disableHoverableContent>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        {/* Main Menu Item */}
                                                        <div className="relative">
                                                            <MenuItem 
                                                                label={label} 
                                                                icon={icon} 
                                                                href={comingSoon ? "#" : href} 
                                                                active={active} 
                                                                id={label.toLowerCase().replace(/\s+/g, '-')} 
                                                                collapsed={collapsed}
                                                                comingSoon={comingSoon}
                                                            />
                                                            
                                                            {/* Badge */}
                                                            {badge && !collapsed && (
                                                                <div className="absolute -top-1 -right-1">
                                                                    <span className={cn(
                                                                        "px-1.5 py-0.5 text-xs rounded-full font-medium",
                                                                        {
                                                                            "bg-blue-100 text-blue-700": badge === "NEW",
                                                                            "bg-green-100 text-green-700": badge === "AI",
                                                                            "bg-orange-100 text-orange-700": badge === "LEGACY"
                                                                        }
                                                                    )}>
                                                                        {badge}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Coming Soon Overlay */}
                                                            {comingSoon && !collapsed && (
                                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                    <span className="text-xs text-muted-foreground/70 bg-muted/50 px-2 py-1 rounded border">
                                                                        Soon
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Children/Subcategories */}
                                                        {children && children.length > 0 && (!collapsed || hovered) && (
                                                            <div className="ml-6 mt-2 space-y-1 border-l border-muted pl-4">
                                                                {children.map((child: any, childIndex: number) => (
                                                                    <div key={childIndex} className="relative">
                                                                        <MenuItem 
                                                                            label={child.label} 
                                                                            icon={child.icon} 
                                                                            href={child.comingSoon ? "#" : child.href} 
                                                                            active={child.active} 
                                                                            id={child.label.toLowerCase().replace(/\s+/g, '-')} 
                                                                            collapsed={false}
                                                                            comingSoon={child.comingSoon}
                                                                        />
                                                                        
                                                                        {/* Coming Soon for children */}
                                                                        {child.comingSoon && (
                                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                                <span className="text-xs text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded border">
                                                                                    Soon
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                {collapsed && (
                                                    <TooltipContent side="right">
                                                        <div>
                                                            <p className="font-medium">{label}</p>
                                                            {badge && (
                                                                <span className={cn(
                                                                    "text-xs px-1.5 py-0.5 rounded-full",
                                                                    {
                                                                        "bg-blue-100 text-blue-700": badge === "NEW",
                                                                        "bg-green-100 text-green-700": badge === "AI",
                                                                        "bg-orange-100 text-orange-700": badge === "LEGACY"
                                                                    }
                                                                )}>
                                                                    {badge}
                                                                </span>
                                                            )}
                                                            {comingSoon && (
                                                                <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                );
                                })}
                            </li>
                        ))}
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
} 