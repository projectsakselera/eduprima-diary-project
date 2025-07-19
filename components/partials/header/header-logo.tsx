'use client'
import React from 'react'
import { Link } from '@/components/navigation'
import { Icon } from "@/components/ui/icon"
import { useConfig } from '@/hooks/use-config'
import { useMediaQuery } from '@/hooks/use-media-query'

const HeaderLogo = () => {
    const [config] = useConfig();

    const isDesktop = useMediaQuery('(min-width: 1280px)');

    return (
        config.layout === 'horizontal' ? (
            <Link href="/dashcode/dashboard/analytics" className="flex gap-2 items-center    ">
                <Icon icon="ph:graduation-cap" className="text-primary h-8 w-8" />
                <h1 className="text-xl font-semibold text-default-900 lg:block hidden ">
                    Eduprima Space
                </h1>
            </Link>
        ) :
            !isDesktop && (
                <Link href="/dashcode/dashboard/analytics" className="flex gap-2 items-center    ">
                    <Icon icon="ph:graduation-cap" className="text-primary h-8 w-8" />
                    <h1 className="text-xl font-semibold text-default-900 lg:block hidden ">
                        Eduprima Space
                    </h1>
                </Link>
            )
    )
}

export default HeaderLogo