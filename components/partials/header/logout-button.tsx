"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('🚪 NextAuth logout initiated...');
      
      // Use NextAuth signOut
      const result = await signOut({
        redirect: false, // Handle redirect manually
      });

      console.log('✅ NextAuth logout successful');
      
      // Clear any local storage (backward compatibility)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
      
      toast.success('Logged out successfully');
      
      // Redirect to login page
      router.push('/en/auth/login');
      
    } catch (error) {
      console.error('❌ NextAuth logout error:', error);
      toast.error('Logout failed');
      
      // Fallback: redirect to login anyway
      router.push('/en/auth/login');
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