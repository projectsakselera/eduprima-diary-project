"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from '@/components/navigation';
import SidebarContent from './sidebar-content';

// Dynamically import sidebars to avoid hydration issues
const EduprimaSidebar = dynamic(() => import('./eduprima-sidebar').then(mod => ({ default: mod.EduprimaSidebar })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const DynamicEduprimaSidebar = dynamic(() => import('./dynamic-eduprima-sidebar').then(mod => ({ default: mod.DynamicEduprimaSidebar })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const DatabaseTutorSidebar = dynamic(() => import('./database-tutor-sidebar').then(mod => ({ default: mod.DatabaseTutorSidebar })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const DashcodeSidebar = dynamic(() => import('./dashcode-sidebar').then(mod => ({ default: mod.DashcodeSidebar })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const DynamicSidebar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setMounted(true);
    // Get user role from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  // Show default state during SSR
  if (!mounted) {
    return (
      <SidebarContent>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SidebarContent>
    );
  }
  
  const isEduprima = pathname.includes('/eduprima');
  const isDatabaseTutorPath = pathname.includes('/database-tutor');
  
  // Role-based sidebar selection
  const getSidebarComponent = () => {
    if (userRole === 'database_tutor_manager' && isDatabaseTutorPath) {
      return <DatabaseTutorSidebar />;
    }
    
    if (isEduprima) {
      return <DynamicEduprimaSidebar />;
    }
    
    return <DashcodeSidebar />;
  };
  
  return (
    <SidebarContent>
      {getSidebarComponent()}
    </SidebarContent>
  );
};

export default DynamicSidebar; 