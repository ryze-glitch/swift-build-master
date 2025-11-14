import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code && !user) {
      handleDiscordCallback(code);
    }
  }, [searchParams, user]);

  const handleDiscordLogin = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    
    if (!clientId) {
      toast({
        title: "Configurazione mancante",
        description: "Discord Client ID non configurato. Contatta l'amministratore.",
        variant: "destructive",
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
      const { data, error } = await supabase.functions.invoke("discord-auth", {
        body: { code },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Accesso negato",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Redirect to magic link for automatic authentication
      console.log("Redirecting to magic link:", data.redirect_url);
      window.location.href = data.redirect_url;
    } catch (error) {
      // Error logged server-side
      toast({
        title: "Errore durante l'accesso",
        description: "Si è verificato un errore durante l'autenticazione con Discord",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-glow">
            <svg className="w-10 h-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            U.O.P.I.
          </h1>
          <p className="text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            Dashboard Operativa
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-strong p-8 shadow-card animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Accesso Riservato
              </h2>
              <p className="text-sm text-muted-foreground">
                Solo per personale autorizzato U.O.P.I.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-xl rounded-lg" />
              <Button
                onClick={handleDiscordLogin}
                className="w-full relative bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-300 hover:scale-105 hover:shadow-glow"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Accedi con Discord
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Informazioni</span>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1 bg-secondary/50 p-4 rounded-lg">
              <p className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Solo utenti autorizzati possono accedere
              </p>
              <p className="text-muted-foreground/80">
                Contatta la dirigenza per richiedere l'accesso
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Button 
            variant="link" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Torna alla home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
