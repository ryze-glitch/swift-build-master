import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import uopiLogo from "@/assets/uopi-logo.png";
const Auth = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    // Immediate redirect if user is logged in
    if (user) {
      window.location.replace("/dashboard");
    }
  }, [user]);
  
  useEffect(() => {
    const code = searchParams.get("code");
    if (code && !user) {
      // Clear the URL immediately to prevent reuse
      window.history.replaceState({}, document.title, "/auth");
      // Execute callback
      handleDiscordCallback(code);
    }
  }, [searchParams, user]);
  const handleDiscordLogin = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    if (!clientId) {
      toast({
        title: "Configurazione mancante",
        description: "Discord Client ID non configurato. Contatta l'amministratore.",
        variant: "destructive"
      });
      return;
    }
    const redirectUri = `${window.location.origin}/auth`;
    const scope = "identify email";
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = discordAuthUrl;
  };
  const handleDiscordCallback = async (code: string) => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("discord-auth", {
        body: {
          code
        }
      });
      if (error) throw error;
      if (data.error) {
        toast({
          title: data.error === "Accesso Negato" ? "Accesso Negato" : "Errore di autenticazione",
          description: data.message || data.error,
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Use the magic link for instant authentication
      if (data.redirect_url) {
        window.location.replace(data.redirect_url);
      }
    } catch (error) {
      toast({
        title: "Errore durante l'accesso",
        description: "Si è verificato un errore durante l'autenticazione con Discord",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-6">
          <img src={uopiLogo} alt="U.O.P.I. Logo" className="w-32 h-32 mx-auto mb-4 object-contain drop-shadow-2xl" />
          <h1 className="text-5xl font-lexend font-bold text-foreground tracking-wide">
            U.O.P.I. DASHBOARD
          </h1>
          
        </div>

        <div className="glass-strong rounded-2xl p-8 space-y-6 shadow-2xl">
          <Button onClick={handleDiscordLogin} size="lg" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-6 text-lg">
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Accedi con Discord
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>🔐 Accesso sicuro riservato ai membri autorizzati</p>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;