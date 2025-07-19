'use client'
import React from "react";
import { Icon } from "@/components/ui/icon";
import { Link } from '@/i18n/routing';
import { useConfig } from "@/hooks/use-config";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useMediaQuery } from "@/hooks/use-media-query";



const Logo = () => {
    const [config] = useConfig()
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    if (config.sidebar === 'compact') {
        return <Link href="/dashcode/dashboard/analytics" className="flex gap-2 items-center   justify-center    ">
            <Icon icon="ph:graduation-cap" className="text-primary h-8 w-8" />

        </Link>
    }
    if (config.sidebar === 'two-column' || !isDesktop) return null

    return (
        <Link href="/dashcode/dashboard/analytics" className="flex gap-2 items-center    ">
            <Icon icon="ph:graduation-cap" className="text-primary h-8 w-8" />
            {(!config?.collapsed || hovered) && (
                <h1 className="text-xl font-semibold text-default-900 ">
                    Eduprima Space
                </h1>
            )}
        </Link>

    );
};

export default Logo;
