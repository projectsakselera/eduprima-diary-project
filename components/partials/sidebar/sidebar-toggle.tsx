'use client'
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@/components/ui/icon";
// Removed framer-motion dependency


export function SidebarToggle() {
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const isDesktop = useMediaQuery('(min-width: 1024px)')
    if (!isDesktop) return null
    if (config.sidebar === 'two-column' && !config.hasSubMenu || config.menuHidden || config.layout === "horizontal" || config.sidebar === 'classic') {
        return null
    }
    if (config.sidebar === 'two-column') {
        return (
            <Button
                onClick={() => setConfig((prevConfig) => ({ ...prevConfig, subMenu: !prevConfig.subMenu }))}
                className="rounded-md h-auto p-0 hover:bg-transparent hover:text-default-800 text-default-500 "
                variant="ghost"
                size="icon" >
                {config.subMenu ? (
                    <div className="transition-all duration-200 ease-out animate-in slide-in-from-left-4 fade-in">
                        <Icon icon="heroicons:arrow-small-right-solid" className="h-6 w-6" />
                    </div>
                ) : (
                    <div className="transition-all duration-200 ease-out animate-in zoom-in-75 fade-in">
                        <Icon icon="heroicons:bars-3-bottom-left-solid" className="h-6 w-6" />
                    </div>
                )}
            </Button>

        )
    }
    return (

        <Button
            onClick={() => setConfig({ ...config, collapsed: !collapsed })}
            className="rounded-md h-auto p-0 hover:bg-transparent hover:text-default-800 text-default-500 "
            variant="ghost"
            size="icon"
        >
            {collapsed ? (
                <div className="transition-all duration-200 ease-out animate-in slide-in-from-left-4 fade-in">
                    <Icon icon="heroicons:arrow-small-right-solid" className="h-6 w-6" />
                </div>
            ) : (
                <div className="transition-all duration-200 ease-out animate-in zoom-in-75 fade-in">
                    <Icon icon="heroicons:bars-3-bottom-left-solid" className="h-6 w-6" />
                </div>
            )}
        </Button>

    );
}