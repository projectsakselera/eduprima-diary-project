'use client'

import { usePathname } from '@/components/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    
    return (
        <div
            key={pathname}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
        >
            {children}
        </div>
    )
}