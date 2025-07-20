'use client'
import { Link } from '@/i18n/routing';
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetHeader,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MenuClassic } from "./menu-classic";
import { EduprimaMobileMenu } from "./eduprima-mobile-menu";
import { useMobileMenuConfig } from "@/hooks/use-mobile-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useConfig } from "@/hooks/use-config";
import { usePathname } from "@/components/navigation";
import { useParams } from "next/navigation";

export function DynamicSheetMenu() {
    const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();
    const [config, setConfig] = useConfig();
    const pathname = usePathname();
    const params = useParams();
    const locale = params?.locale as string || 'en';
    const { isOpen } = mobileMenuConfig;

    const isDesktop = useMediaQuery("(min-width: 1280px)");
    if (isDesktop) return null;

    // Detect if we're on Eduprima pages
    const isEduprima = pathname.includes('/eduprima');

    return (
        <Sheet open={isOpen} onOpenChange={() => setMobileMenuConfig({ isOpen: !isOpen })}>
            <SheetTrigger className="xl:hidden" asChild>
                <Button 
                    className="h-8" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setConfig({
                        ...config, collapsed: false,
                    })}
                >
                    <Icon icon="heroicons:bars-3-bottom-right" className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
                <SheetHeader>
                    <Link 
                        href={isEduprima ? `/${locale}/eduprima/main` : `/${locale}/dashcode/dashboard/analytics`} 
                        className="flex gap-2 items-center"
                    >
                        <Icon 
                            icon="ph:graduation-cap" 
                            className="text-primary h-8 w-8" 
                        />
                        <h1 className="text-xl font-semibold text-default-900">
                            Eduprima Diary
                        </h1>
                    </Link>
                </SheetHeader>
                
                {/* Render appropriate menu based on current page */}
                {isEduprima ? <EduprimaMobileMenu /> : <MenuClassic />}
            </SheetContent>
        </Sheet>
    );
} 