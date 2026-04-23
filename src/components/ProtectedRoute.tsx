import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * ProtectedRoute component that redirects unauthenticated users to the landing page.
 * Allows access to protected routes when user is logged in.
 * Bypasses authentication for local development.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if running on localhost - bypass authentication for local development
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  useEffect(() => {
    if (!loading && !user && !isLocalhost) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, isLocalhost]);

  // For localhost, create a mock user if no user exists
  // Commented out to prevent dashboard flash after real signup
  // useEffect(() => {
  //   if (isLocalhost && !user && !loading) {
  //     // Create mock user for local development
  //     const mockUser = {
  //       email: 'localhost@dev.local',
  //       planName: 'Premium',
  //       isPremium: true,
  //       questionsUsed: 0,
  //       reportsUsed: 0,
  //       questionTopUpBalance: 100,
  //       reportTopUpBalance: 50,
  //       createdAt: new Date(),
  //       lastLoginAt: new Date(),
  //     };
  //     localStorage.setItem('user', JSON.stringify(mockUser));
  //     // Don't reload - let auth context handle it naturally
  //     window.location.reload();
  //   }
  // }, [isLocalhost, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user && !isLocalhost) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

