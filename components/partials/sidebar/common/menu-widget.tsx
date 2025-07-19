'use client'
import { Button } from '@/components/ui/button'
import { useConfig } from '@/hooks/use-config'
import Image from 'next/image'
import React from 'react'
import { useTranslations } from 'next-intl'

const MenuWidget = () => {
    const [config] = useConfig();
    const t = useTranslations("Menu");
    
    if (config.sidebar === 'compact') return null
    return (
        <div className="dark">
            <div className="bg-default-50 mb-16 mt-24 p-4 relative text-center rounded-2xl  text-white">

                <Image className="mx-auto relative -mt-[73px]" alt="" src="/images/svg/rabit.svg" priority width={99} height={114} />
                <div className="max-w-[160px] mx-auto mt-6">
                    <div className="">{t("sendFeedback")}</div>
                    <div className="text-xs font-light">
                        {t("feedbackDescription")}
                    </div>
                </div>
                <div className="mt-6">
                    <Button 
                        size="sm" 
                        fullWidth 
                        className=' bg-white text-default-50 hover:bg-background/90 dark:hover:text-default cursor-pointer'
                        onClick={() => window.open('https://wa.me/62818488448?text=Hi%20Gigih!%20I%20have%20feedback%20for%20Eduprima%20project', '_blank')}
                    >
                        {t("contactUs")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MenuWidget