'use client';

import { useSession } from 'next-auth/react';
import type { User } from '@/lib/auth';
import { useState, useEffect } from 'react';

interface SessionData {
  user: User | null;
  loading: boolean;
}

// Updated hook to use NextAuth with backward compatibility
export function useCustomSession(): SessionData {
  const { data: nextAuthSession, status } = useSession();
  const [legacySessionData, setLegacySessionData] = useState<SessionData>({
    user: null,
    loading: true
  });

  useEffect(() => {
    // Try legacy storage method for backward compatibility
    const getUserFromStorage = () => {
      try {
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser) as User;
          return user;
        }
        return null;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    };

    const legacyUser = getUserFromStorage();
    setLegacySessionData({
      user: legacyUser,
      loading: false
    });
  }, []);

  // Priority: NextAuth session first, then legacy storage
  if (status === 'loading') {
    return { user: null, loading: true };
  }

  // If NextAuth session exists, use it
  if (nextAuthSession?.user) {
    console.log('🔄 useCustomSession: Using NextAuth session for user:', nextAuthSession.user.email);
    return {
      user: nextAuthSession.user as User,
      loading: false
    };
  }

  // Fallback to legacy session (for backward compatibility during transition)
  if (legacySessionData.user) {
    console.log('🔄 useCustomSession: Using legacy session for user:', legacySessionData.user.email);
    return legacySessionData;
  }

  // No session found
  return { user: null, loading: false };
}