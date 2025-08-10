"use client";

import React from 'react'
import { Ellipsis, LogOut, ExternalLink } from "lucide-react";
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { getDynamicMenuByPath } from "@/lib/dynamic-menu-factory";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "./common/menu-label";
import MenuItem from "./common/menu-item";
import { CollapseMenuButton } from "./common/collapse-menu-button";
import MenuWidget from "./common/menu-widget";
import SearchBar from './common/search-bar'
import TeamSwitcher from './common/team-switcher'
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'
import { getLangDir } from '@/lib/direction-utils';
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SidebarBackButton } from "@/components/ui/sidebar-back-button";

export function DynamicEduprimaSidebar() {
    // translate
    const t = useTranslations("Menu")
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');

    const isDesktop = useMediaQuery('(min-width: 1024px)')

    // Get dynamic menu based on current path
    const dynamicMenu = getDynamicMenuByPath(pathname, t);
    
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;

    const scrollableNodeRef = React.useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current?.addEventListener("scroll", handleScroll);
    }, [scrollableNodeRef]);

    const handleExternalLink = (href: string) => {
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            {isDesktop && (
                <div className="flex items-center justify-between px-4 py-4">
                    <Logo />
                    <SidebarHoverToggle />
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:block!" dir={direction}>
                {isDesktop && (
                    <div className={cn(' space-y-3 mt-6 ', {
                        'px-4': !collapsed || hovered,
                        'text-center': collapsed || !hovered
                    })}>
                        <TeamSwitcher />
                        <SearchBar />
                    </div>
                )}

                <nav className="mt-8 h-full w-full">
                    <ul className=" h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                        
                        {/* Back Button - Show only when not at root level */}
                        <li className="w-full mb-4">
                            <SidebarBackButton 
                                collapsed={collapsed}
                                className="w-full"
                            />
                        </li>

                        <li className="w-full">


                            {/* Main Menu Items */}
                            {dynamicMenu.menus.map((menu, index) => (
                                <div className="w-full mb-2" key={index}>
                                    <TooltipProvider disableHoverableContent>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <MenuItem 
                                                        label={menu.label} 
                                                        icon={menu.icon} 
                                                        href={menu.href} 
                                                        active={menu.active} 
                                                        id={menu.label.toLowerCase().replace(/\s+/g, '-')} 
                                                        collapsed={collapsed} 
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            {collapsed && (
                                                <TooltipContent side="right">
                                                    {menu.label}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Render children if they exist */}
                                    {menu.children && menu.children.length > 0 && (
                                        <div className="ml-4 mt-2 space-y-1">
                                            {menu.children.map((child, childIndex) => (
                                                <div key={childIndex} className="w-full">
                                                    <TooltipProvider disableHoverableContent>
                                                        <Tooltip delayDuration={100}>
                                                            <TooltipTrigger asChild>
                                                                <div>
                                                                    <MenuItem 
                                                                        label={child.label} 
                                                                        icon={child.icon} 
                                                                        href={child.href} 
                                                                        active={child.active} 
                                                                        id={child.label.toLowerCase().replace(/\s+/g, '-')} 
                                                                        collapsed={collapsed} 
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            {collapsed && (
                                                                <TooltipContent side="right">
                                                                    {child.label}
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {/* Render grandchildren if they exist */}
                                                    {child.children && child.children.length > 0 && (
                                                        <div className="ml-4 mt-2 space-y-1">
                                                            {child.children.map((grandchild, grandchildIndex) => (
                                                                <div key={grandchildIndex} className="w-full">
                                                                    <TooltipProvider disableHoverableContent>
                                                                        <Tooltip delayDuration={100}>
                                                                            <TooltipTrigger asChild>
                                                                                <div>
                                                                                    <MenuItem 
                                                                                        label={grandchild.label} 
                                                                                        icon={grandchild.icon} 
                                                                                        href={grandchild.href} 
                                                                                        active={grandchild.active} 
                                                                                        id={grandchild.label.toLowerCase().replace(/\s+/g, '-')} 
                                                                                        collapsed={collapsed} 
                                                                                    />
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            {collapsed && (
                                                                                <TooltipContent side="right">
                                                                                    {grandchild.label}
                                                                                </TooltipContent>
                                                                            )}
                                                                        </Tooltip>
                                                                    </TooltipProvider>

                                                                    {/* Render great-grandchildren if they exist */}
                                                                    {grandchild.children && grandchild.children.length > 0 && (
                                                                        <div className="ml-4 mt-2 space-y-1">
                                                                            {grandchild.children.map((greatGrandchild, greatGrandchildIndex) => (
                                                                                <div key={greatGrandchildIndex} className="w-full">
                                                                                    <TooltipProvider disableHoverableContent>
                                                                                        <Tooltip delayDuration={100}>
                                                                                            <TooltipTrigger asChild>
                                                                                                <div>
                                                                                                    <MenuItem 
                                                                                                        label={greatGrandchild.label} 
                                                                                                        icon={greatGrandchild.icon} 
                                                                                                        href={greatGrandchild.href} 
                                                                                                        active={greatGrandchild.active} 
                                                                                                        id={greatGrandchild.label.toLowerCase().replace(/\s+/g, '-')} 
                                                                                                        collapsed={collapsed} 
                                                                                                    />
                                                                                                </div>
                                                                                            </TooltipTrigger>
                                                                                            {collapsed && (
                                                                                                <TooltipContent side="right">
                                                                                                    {greatGrandchild.label}
                                                                                                </TooltipContent>
                                                                            )}
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </li>

                        {/* Static Menus (Communication & Settings) */}
                        {dynamicMenu.staticMenus && dynamicMenu.staticMenus.length > 0 && (
                            <li className="w-full mt-8">
                                {(!collapsed || hovered) && (
                                    <MenuLabel label="Tools & Settings" />
                                )}
                                
                                {dynamicMenu.staticMenus.map((menu, index) => (
                                    <div className="w-full mb-2" key={`static-${index}`}>
                                        <TooltipProvider disableHoverableContent>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        {menu.external ? (
                                                            <Button
                                                                onClick={() => handleExternalLink(menu.href)}
                                                                variant="ghost"
                                                                fullWidth
                                                                color="secondary"
                                                                className={cn(
                                                                    "hover:ring-transparent hover:ring-offset-0",
                                                                    {
                                                                        "justify-start text-sm font-medium capitalize h-auto py-3 md:px-3 px-3":
                                                                            !collapsed || hovered,
                                                                    }
                                                                )}
                                                                size={collapsed && !hovered ? "icon" : "default"}
                                                            >
                                                                <Icon
                                                                    icon={menu.icon}
                                                                    className={cn("h-5 w-5 ", {
                                                                        "me-2": !collapsed || hovered,
                                                                    })}
                                                                />
                                                                {(!collapsed || hovered) && (
                                                                    <>
                                                                        <p className={cn("max-w-[200px] truncate")}>{menu.label}</p>
                                                                        <ExternalLink className="w-4 h-4 ml-2" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <MenuItem 
                                                                label={menu.label} 
                                                                icon={menu.icon} 
                                                                href={menu.href} 
                                                                active={menu.active} 
                                                                id={menu.label.toLowerCase().replace(/\s+/g, '-')} 
                                                                collapsed={collapsed} 
                                                            />
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                {collapsed && (
                                                    <TooltipContent side="right">
                                                        {menu.label}
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                ))}
                            </li>
                        )}

                        {!collapsed && (
                            <li className="w-full grow flex items-end">
                                <MenuWidget />
                            </li>
                        )}
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
} 