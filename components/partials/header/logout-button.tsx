"use client";

import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      console.log('Client-side logout initiated...');
      
      // Try NextAuth signOut first
      await signOut({ 
        callbackUrl: '/auth/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Client-side logout error:', error);
      
      // Fallback: clear session and redirect manually
      console.log('Using fallback logout...');
      
      // Clear any local storage or cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('next-auth.session-token');
        localStorage.removeItem('next-auth.csrf-token');
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Redirect to login page
        window.location.href = '/auth/login';
      }
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="ghost" 
      className="w-full flex items-center gap-2 text-left justify-start"
    >
      <Icon icon="heroicons:power" className="w-4 h-4" />
      Log out
    </Button>
  );
} 