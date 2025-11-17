import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("Index - loading:", loading, "user:", !!user);
    if (!loading) {
      if (user) {
        console.log("User found, redirecting to dashboard");
        // Use replace to avoid back button issues
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 0);
      } else {
        console.log("No user, redirecting to auth");
        navigate("/auth", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};

export default Index;
