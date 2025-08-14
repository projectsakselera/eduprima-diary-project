'use client'

import React from 'react'
import { useConfig } from '@/hooks/use-config'
import { cn } from "@/lib/utils"
import { useMediaQuery } from '@/hooks/use-media-query'

const FooterContent = ({ children }: { children: React.ReactNode }) => {
    const [config] = useConfig()
    const isDesktop = useMediaQuery("(min-width: 768px)")
    if (!isDesktop) {
        return <footer className='bg-card dark:bg-default-300 bg-no-repeat  shadow-md  backdrop-filter backdrop-blur-[40px] fixed left-0 w-full z-50 bottom-0 py-[12px] px-4'>
            {children}
        </footer>
    }

    if (config.sidebar === 'two-column') {
        return (
            <footer className={cn('flex-none bg-card fixed py-4 px-6 xl:ms-[300px] bottom-0 z-50 w-full', config.footer, {
                'xl:ms-[72px]': config.subMenu || !config.hasSubMenu,
                'xl:ms-0': config.layout === "horizontal",
                'border-b': config.skin === 'bordered',
                'border': config.skin === 'bordered',
                'shadow-base': config.skin === 'default',


            })}>{children}</footer>
        )
    }

    return (
        <footer className={cn('flex-none bg-card fixed py-4 px-6 xl:ms-[248px] bottom-0 z-50 w-full', config.footer, {
            'xl:ms-[72px]': config.collapsed && config.sidebar !== 'compact',
            'xl:ms-0': config.menuHidden || config.layout === "horizontal",
            'border-b': config.skin === 'bordered' && config.layout !== 'semi-box',
            'border': config.skin === 'bordered' && config.layout === 'semi-box',
            'shadow-base': config.skin === 'default',
            'rounded-md mb-6': config.layout === 'semi-box',
            'xl:ms-28': config.sidebar === 'compact' && config.layout !== 'horizontal',
            'xl:ms-24': config.sidebar === 'compact' && config.layout === 'semi-box',


        })}>{children}</footer>
    )
}

export default FooterContent