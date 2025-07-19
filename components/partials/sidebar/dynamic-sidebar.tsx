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
  
  React.useEffect(() => {
    setMounted(true);
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
  
  return (
    <SidebarContent>
      {isEduprima ? <DynamicEduprimaSidebar /> : <DashcodeSidebar />}
    </SidebarContent>
  );
};

export default DynamicSidebar; 