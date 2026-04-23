import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const IndexRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // User is not logged in, show landing page
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
    </div>
  );
};

export default IndexRedirect;
