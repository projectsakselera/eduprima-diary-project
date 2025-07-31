'use client'
import React from 'react'
import { SessionProvider } from "next-auth/react"

// Updated AuthProvider using NextAuth SessionProvider
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

export default AuthProvider