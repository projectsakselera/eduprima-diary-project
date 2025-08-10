'use client'
import React from 'react';
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { getDynamicMenuByPath } from "@/lib/dynamic-menu-factory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfig } from "@/hooks/use-config";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { getLangDir } from '@/lib/direction-utils';
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useMobileMenuConfig } from "@/hooks/use-mobile-menu";
import { Link } from '@/i18n/routing';

export function EduprimaMobileMenu() {
    const t = useTranslations("Menu");
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');
    
    // Get dynamic menu based on current path
    const dynamicMenu = getDynamicMenuByPath(pathname, t);
    
    const [config] = useConfig();
    const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();

    const handleMenuClick = () => {
        setMobileMenuConfig({ ...mobileMenuConfig, isOpen: false });
    };

    return (
        <ScrollArea className="h-full" dir={direction}>
            <nav className="mt-4 h-full w-full">
                <ul className="flex flex-col items-start space-y-1 px-2">
                    {/* Main Menu Items */}
                    {dynamicMenu.menus.map((menu, index) => (
                        <li className="w-full" key={index}>
                            <div className="w-full mb-2">
                                <Button
                                    variant={menu.active ? "default" : "ghost"}
                                    fullWidth
                                    className={cn(
                                        "justify-start text-sm font-medium capitalize h-auto py-3 px-3",
                                        {
                                            "bg-secondary text-default hover:bg-secondary":
                                                menu.active && config.sidebarColor !== "light",
                                        }
                                    )}
                                    asChild
                                    onClick={handleMenuClick}
                                >
                                    <Link href={menu.href}>
                                        <Icon icon={menu.icon} className="h-5 w-5 me-2" />
                                        <span className="max-w-[200px] truncate">{menu.label}</span>
                                    </Link>
                                </Button>

                                {/* Render children if they exist */}
                                {menu.children && menu.children.length > 0 && (
                                    <div className="ml-4 mt-2 space-y-1">
                                        {menu.children.map((child, childIndex) => (
                                            <div key={childIndex} className="w-full">
                                                <Button
                                                    variant={child.active ? "default" : "ghost"}
                                                    fullWidth
                                                    className={cn(
                                                        "justify-start text-sm font-medium capitalize h-auto py-2 px-3",
                                                        {
                                                            "bg-secondary text-default hover:bg-secondary":
                                                                child.active && config.sidebarColor !== "light",
                                                        }
                                                    )}
                                                    asChild
                                                    onClick={handleMenuClick}
                                                >
                                                    <Link href={child.href}>
                                                        <Icon icon={child.icon} className="h-4 w-4 me-2" />
                                                        <span className="max-w-[200px] truncate text-xs">
                                                            {child.label}
                                                        </span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}

                    {/* Static Menus (if any) */}
                    {dynamicMenu.staticMenus && dynamicMenu.staticMenus.length > 0 && (
                        <>
                            <li className="w-full">
                                <div className="px-3 py-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Quick Access
                                    </h3>
                                </div>
                            </li>
                            {dynamicMenu.staticMenus.map((staticMenu, index) => (
                                <li className="w-full" key={`static-${index}`}>
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        className="justify-start text-sm font-medium capitalize h-auto py-2 px-3"
                                        asChild
                                        onClick={handleMenuClick}
                                    >
                                        <Link href={staticMenu.href}>
                                            <Icon icon={staticMenu.icon} className="h-4 w-4 me-2" />
                                            <span className="max-w-[200px] truncate text-xs">
                                                {staticMenu.label}
                                            </span>
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            </nav>
        </ScrollArea>
    );
} 