import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "user";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // First get the user's discord_id from their profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("discord_id")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.discord_id) {
          console.error("Error fetching profile:", profileError);
          setRole(null);
          setLoading(false);
          return;
        }

        // Then fetch the role using discord_id
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("discord_id", profileData.discord_id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else {
          setRole(data?.role as AppRole);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading, isAdmin: role === "admin" };
};
