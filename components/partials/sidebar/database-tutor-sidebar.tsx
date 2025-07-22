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
import SidebarHoverToggle from './sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';

const tutorManagerMenus = [
  {
    groupLabel: "📊 Mission Control",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor",
        label: "Mission Overview",
        active: false,
        icon: "heroicons:chart-bar",
        children: [
          {
            href: "#",
            label: "Tutor Analytics Dashboard",
            active: false,
            icon: "heroicons:chart-pie",
            comingSoon: true
          },
          {
            href: "#",
            label: "Geographic Coverage Map",
            active: false,
            icon: "heroicons:map",
            comingSoon: true
          },
          {
            href: "#",
            label: "Subject Distribution Analysis", 
            active: false,
            icon: "heroicons:academic-cap",
            comingSoon: true
          },
          {
            href: "#",
            label: "Performance Metrics Overview",
            active: false,
            icon: "heroicons:presentation-chart-line",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "👥 Tutor Database",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/view-all",
        label: "View All Tutors",
        active: true,
        icon: "heroicons:table-cells",
        children: [
          {
            href: "#",
            label: "Active Tutors",
            active: false,
            icon: "heroicons:check-circle",
            comingSoon: true
          },
          {
            href: "#",
            label: "Pending Approval",
            active: false,
            icon: "heroicons:clock",
            comingSoon: true
          },
          {
            href: "#",
            label: "Inactive/Alumni",
            active: false,
            icon: "heroicons:archive-box",
            comingSoon: true
          },
          {
            href: "#",
            label: "Blacklist Management",
            active: false,
            icon: "heroicons:x-circle",
            comingSoon: true
          }
        ]
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/add",
        label: "Add New Tutor",
        active: false,
        icon: "heroicons:plus-circle",
        children: [
          {
            href: "#",
            label: "Quick Entry Form",
            active: false,
            icon: "heroicons:bolt",
            comingSoon: true
          },
          {
            href: "#",
            label: "Bulk Import (CSV/Excel)",
            active: false,
            icon: "heroicons:arrow-up-tray",
            comingSoon: true
          },
          {
            href: "#",
            label: "Interview Integration",
            active: false,
            icon: "heroicons:video-camera",
            comingSoon: true
          },
          {
            href: "#",
            label: "Document Upload",
            active: false,
            icon: "heroicons:paper-clip",
            comingSoon: true
          }
        ]
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/import-export",
        label: "Import/Export",
        active: false,
        icon: "heroicons:arrow-up-tray",
        children: [
          {
            href: "#",
            label: "Bulk Data Import",
            active: false,
            icon: "heroicons:arrow-down-tray",
            comingSoon: true
          },
          {
            href: "#",
            label: "Export Templates",
            active: false,
            icon: "heroicons:document",
            comingSoon: true
          },
          {
            href: "#",
            label: "Data Sync Tools",
            active: false,
            icon: "heroicons:arrow-path",
            comingSoon: true
          },
          {
            href: "#",
            label: "Backup Management",
            active: false,
            icon: "heroicons:shield-check",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "🔍 Advanced Search & Matching",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/educator-query",
        label: "Smart Tutor Query",
        active: false,
        icon: "ph:brain",
        badge: "NEW",
        children: [
          {
            href: "#",
            label: "AI-Powered Search",
            active: false,
            icon: "heroicons:magnifying-glass",
            comingSoon: true
          },
          {
            href: "#",
            label: "Advanced Filter Engine",
            active: false,
            icon: "heroicons:adjustments-horizontal",
            comingSoon: true
          },
          {
            href: "#",
            label: "Geographic Intelligence",
            active: false,
            icon: "heroicons:map-pin",
            comingSoon: true
          },
          {
            href: "#",
            label: "Compatibility Scoring",
            active: false,
            icon: "heroicons:heart",
            comingSoon: true
          }
        ]
      },
      {
        href: "#",
        label: "Matching Algorithm",
        active: false,
        icon: "heroicons:puzzle-piece",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Student-Tutor Pairing",
            active: false,
            icon: "heroicons:link",
            comingSoon: true
          },
          {
            href: "#",
            label: "Success Prediction",
            active: false,
            icon: "heroicons:chart-bar-square",
            comingSoon: true
          },
          {
            href: "#",
            label: "Optimization Rules",
            active: false,
            icon: "heroicons:cog-6-tooth",
            comingSoon: true
          },
          {
            href: "#",
            label: "Manual Override Tools",
            active: false,
            icon: "heroicons:wrench-screwdriver",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "📝 Profile Management",
    menus: [
      {
        href: "#",
        label: "Profile Enhancement",
        active: false,
        icon: "heroicons:user-circle",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Skill Assessment Tools",
            active: false,
            icon: "heroicons:star",
            comingSoon: true
          },
          {
            href: "#",
            label: "Certification Tracking",
            active: false,
            icon: "heroicons:trophy",
            comingSoon: true
          },
          {
            href: "#",
            label: "Performance History",
            active: false,
            icon: "heroicons:chart-bar",
            comingSoon: true
          },
          {
            href: "#",
            label: "Photo/Document Manager",
            active: false,
            icon: "heroicons:photo",
            comingSoon: true
          }
        ]
      },
      {
        href: "#",
        label: "Quality Assurance",
        active: false,
        icon: "heroicons:shield-check",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Profile Completeness Check",
            active: false,
            icon: "heroicons:check-circle",
            comingSoon: true
          },
          {
            href: "#",
            label: "Data Validation Rules",
            active: false,
            icon: "heroicons:clipboard-document-check",
            comingSoon: true
          },
          {
            href: "#",
            label: "Duplicate Detection",
            active: false,
            icon: "heroicons:eye",
            comingSoon: true
          },
          {
            href: "#",
            label: "Verification Status",
            active: false,
            icon: "heroicons:badge-check",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "🎓 Subject & Skills",
    menus: [
      {
        href: "#",
        label: "Subject Management",
        active: false,
        icon: "heroicons:academic-cap",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Subject Taxonomy",
            active: false,
            icon: "heroicons:squares-2x2",
            comingSoon: true
          },
          {
            href: "#",
            label: "Skill Level Matrix",
            active: false,
            icon: "heroicons:chart-bar-square",
            comingSoon: true
          },
          {
            href: "#",
            label: "Certification Mapping",
            active: false,
            icon: "heroicons:map",
            comingSoon: true
          },
          {
            href: "#",
            label: "Competency Standards",
            active: false,
            icon: "heroicons:scale",
            comingSoon: true
          }
        ]
      },
      {
        href: "#",
        label: "Teaching Methods",
        active: false,
        icon: "heroicons:light-bulb",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Method Categories",
            active: false,
            icon: "heroicons:tag",
            comingSoon: true
          },
          {
            href: "#",
            label: "Effectiveness Tracking",
            active: false,
            icon: "heroicons:chart-bar",
            comingSoon: true
          },
          {
            href: "#",
            label: "Best Practices Database",
            active: false,
            icon: "heroicons:book-open",
            comingSoon: true
          },
          {
            href: "#",
            label: "Training Resources",
            active: false,
            icon: "heroicons:play-circle",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "📊 Analytics & Insights",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/reports",
        label: "Tutor Statistics",
        active: false,
        icon: "heroicons:chart-pie",
        children: [
          {
            href: "#",
            label: "Performance Analytics",
            active: false,
            icon: "heroicons:chart-bar",
            comingSoon: true
          },
          {
            href: "#",
            label: "Success Rate Analysis",
            active: false,
            icon: "heroicons:trophy",
            comingSoon: true
          },
          {
            href: "#",
            label: "Geographic Distribution",
            active: false,
            icon: "heroicons:map",
            comingSoon: true
          },
          {
            href: "#",
            label: "Subject Coverage",
            active: false,
            icon: "heroicons:squares-plus",
            comingSoon: true
          }
        ]
      },
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/analytics",
        label: "Performance Reports",
        active: false,
        icon: "heroicons:presentation-chart-line",
        children: [
          {
            href: "#",
            label: "Individual Tutor Reports",
            active: false,
            icon: "heroicons:user",
            comingSoon: true
          },
          {
            href: "#",
            label: "Comparative Analysis",
            active: false,
            icon: "heroicons:scale",
            comingSoon: true
          },
          {
            href: "#",
            label: "Trend Monitoring",
            active: false,
            icon: "heroicons:arrow-trending-up",
            comingSoon: true
          },
          {
            href: "#",
            label: "Predictive Insights",
            active: false,
            icon: "heroicons:crystal-ball",
            comingSoon: true
          }
        ]
      },
      {
        href: "#",
        label: "Market Intelligence",
        active: false,
        icon: "heroicons:globe-alt",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Demand Forecasting",
            active: false,
            icon: "heroicons:arrow-trending-up",
            comingSoon: true
          },
          {
            href: "#",
            label: "Rate Analysis",
            active: false,
            icon: "heroicons:currency-dollar",
            comingSoon: true
          },
          {
            href: "#",
            label: "Competitor Benchmarking",
            active: false,
            icon: "heroicons:building-office-2",
            comingSoon: true
          },
          {
            href: "#",
            label: "Growth Opportunities",
            active: false,
            icon: "heroicons:arrow-up-right",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "🛠️ Tools & Utilities",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/database-tutor/migration/dashboard",
        label: "Data Migration Tools",
        active: false,
        icon: "heroicons:arrow-right-circle",
        badge: "LEGACY",
        children: [
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
        href: "#",
        label: "Maintenance Tools",
        active: false,
        icon: "heroicons:wrench-screwdriver",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Database Cleanup",
            active: false,
            icon: "heroicons:trash",
            comingSoon: true
          },
          {
            href: "#",
            label: "Duplicate Merger",
            active: false,
            icon: "heroicons:arrows-pointing-in",
            comingSoon: true
          },
          {
            href: "#",
            label: "Inactive Tutor Archival",
            active: false,
            icon: "heroicons:archive-box",
            comingSoon: true
          },
          {
            href: "#",
            label: "Performance Optimization",
            active: false,
            icon: "heroicons:rocket-launch",
            comingSoon: true
          }
        ]
      }
    ]
  },
  {
    groupLabel: "🤖 AI & Automation",
    menus: [
      {
        href: "/eduprima/main/ops/em/matchmaking/subject-recommendation",
        label: "AI Features",
        active: false,
        icon: "ph:brain",
        badge: "AI",
        children: [
          {
            href: "/eduprima/main/ops/em/matchmaking/subject-recommendation",
            label: "Subject Recommendation",
            active: false,
            icon: "heroicons:lightbulb",
          },
          {
            href: "#",
            label: "Auto-Profile Enhancement",
            active: false,
            icon: "heroicons:sparkles",
            comingSoon: true
          },
          {
            href: "#",
            label: "Smart Tagging",
            active: false,
            icon: "heroicons:hashtag",
            comingSoon: true
          },
          {
            href: "#",
            label: "Anomaly Detection",
            active: false,
            icon: "heroicons:exclamation-triangle",
            comingSoon: true
          }
        ]
      },
      {
        href: "#",
        label: "Automation Rules",
        active: false,
        icon: "heroicons:cog-8-tooth",
        badge: "NEW",
        comingSoon: true,
        children: [
          {
            href: "#",
            label: "Auto-Assignment Logic",
            active: false,
            icon: "heroicons:arrow-right-circle",
            comingSoon: true
          },
          {
            href: "#",
            label: "Notification Triggers",
            active: false,
            icon: "heroicons:bell",
            comingSoon: true
          },
          {
            href: "#",
            label: "Status Updates",
            active: false,
            icon: "heroicons:arrow-path",
            comingSoon: true
          },
          {
            href: "#",
            label: "Workflow Automation",
            active: false,
            icon: "heroicons:squares-2x2",
            comingSoon: true
          }
        ]
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
                                {(!collapsed || hovered) && (
                                    <p className="text-sm font-medium text-default-600 pb-2 max-w-[280px] truncate px-3 pt-5">
                                        {groupLabel}
                                    </p>
                                )}
                                {menus?.map(({ href, label, icon, active, badge, comingSoon, children }, index) => (
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
                                                                {children.map((child, childIndex) => (
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
                                ))}
                            </li>
                        ))}
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
} 