"use client";

import React from 'react'
import { Ellipsis, LogOut, ExternalLink } from "lucide-react";
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { getEduprimaMenuList } from "@/lib/eduprima-menus";
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
import { getLangDir } from 'rtl-detect';
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function EduprimaSidebar() {
    // translate
    const t = useTranslations("Menu")
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');

    const isDesktop = useMediaQuery('(min-width: 1280px)')

    const menuList = getEduprimaMenuList(pathname, t);
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
                        {menuList?.map(({ groupLabel, menus }, index) => (
                            <li className={cn("w-full", groupLabel ? "" : "")} key={index}>
                                {(!collapsed || hovered) && groupLabel || !collapsed === undefined ? (
                                    <MenuLabel label={groupLabel} />
                                ) : collapsed && !hovered && !collapsed !== undefined && groupLabel ? (
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger className="w-full">
                                                <div className="w-full flex justify-center items-center">
                                                    <Ellipsis className="h-5 w-5 text-default-700" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{groupLabel}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    null
                                )}

                                {menus.map(
                                    ({ href, label, icon, active, id, submenus, external }, index) =>
                                        submenus.length === 0 ? (
                                            <div className="w-full mb-2 last:mb-0" key={index}>
                                                <TooltipProvider disableHoverableContent>
                                                    <Tooltip delayDuration={100}>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                {external ? (
                                                                    <Button
                                                                        onClick={() => handleExternalLink(href)}
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
                                                                            icon={icon}
                                                                            className={cn("h-5 w-5 ", {
                                                                                "me-2": !collapsed || hovered,
                                                                            })}
                                                                        />
                                                                        {(!collapsed || hovered) && (
                                                                            <>
                                                                                <p className={cn("max-w-[200px] truncate")}>{label}</p>
                                                                                <ExternalLink className="w-4 h-4 ml-2" />
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                ) : (
                                                                    <MenuItem 
                                                                        label={label} 
                                                                        icon={icon} 
                                                                        href={href} 
                                                                        active={active} 
                                                                        id={id} 
                                                                        collapsed={collapsed} 
                                                                    />
                                                                )}
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
                                        ) : (
                                            <div className="w-full mb-2" key={index}>
                                                <CollapseMenuButton
                                                    icon={icon}
                                                    label={label}
                                                    active={active}
                                                    submenus={submenus}
                                                    collapsed={collapsed}
                                                    id={id}
                                                />
                                            </div>
                                        )
                                )}
                            </li>
                        ))}
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