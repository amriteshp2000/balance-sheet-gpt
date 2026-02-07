// src/hooks/useAutoLogin.js
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * useAutoLogin Hook
 * Handles automatic authentication check and redirection
 * - Redirects to dashboard if already logged in
 * - Redirects to login if not authenticated
 */
export const useAutoLogin = (options = {}) => {
  const {
    redirectIfAuthenticated = '/dashboard',
    redirectIfUnauthenticated = '/login',
    checkOnMount = true,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!checkOnMount) {
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      
      try {
        const isValid = await checkAuth();
        
        // Get the intended destination from location state
        const from = location.state?.from?.pathname;
        
        if (isValid) {
          // User is authenticated
          if (location.pathname === '/login' || location.pathname === '/') {
            // Redirect to dashboard or intended destination
            navigate(from || redirectIfAuthenticated, { replace: true });
          }
        } else {
          // User is not authenticated
          const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
          if (!publicPaths.includes(location.pathname)) {
            // Save the intended destination
            navigate(redirectIfUnauthenticated, {
              replace: true,
              state: { from: location },
            });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [checkAuth, checkOnMount, location, navigate, redirectIfAuthenticated, redirectIfUnauthenticated]);

  return {
    isChecking,
    isAuthenticated,
    isLoading,
  };
};

export default useAutoLogin;