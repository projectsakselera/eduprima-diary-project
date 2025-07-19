import React from 'react'
type IconProps = React.HTMLAttributes<SVGElement>
const DashCodeLogo = (props: IconProps) => {
    return (
        <>
            <svg
                {...props}
                width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Graduation Cap Base */}
                <path d="M16 8L4 14L16 20L28 14L16 8Z" fill="#274D5E" stroke="currentColor" strokeWidth="1"/>
                {/* Cap Top */}
                <path d="M6 16V22C6 24 10 26 16 26C22 26 26 24 26 22V16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Tassel */}
                <circle cx="28" cy="14" r="1" fill="#274D5E"/>
                <line x1="28" y1="15" x2="28" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="28" cy="18" r="0.5" fill="currentColor"/>
            </svg>

        </>
    )
}

export default DashCodeLogo