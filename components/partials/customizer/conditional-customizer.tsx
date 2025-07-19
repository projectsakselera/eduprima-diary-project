"use client";

import React from 'react';
import { usePathname } from '@/components/navigation';
import ThemeCustomize from './index';

const ConditionalCustomizer = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show customizer during SSR
  if (!mounted) {
    return null;
  }
  
  // Only show customizer for Dashcode, not Eduprima
  if (pathname.includes('/eduprima')) {
    return null;
  }
  
  return <ThemeCustomize />;
};

export default ConditionalCustomizer; 