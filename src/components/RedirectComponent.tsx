import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RedirectComponentProps {
  to: string;
}

const RedirectComponent = ({ to }: RedirectComponentProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform 301 redirect
    window.location.replace(to);
  }, [to]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
    </div>
  );
};

export default RedirectComponent;
