import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, go to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // No user, go to auth page
        navigate("/auth", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};

export default Index;
