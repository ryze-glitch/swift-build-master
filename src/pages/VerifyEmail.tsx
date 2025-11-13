import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // If user is verified, redirect to dashboard
    if (user?.email_confirmed_at) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.error("Error resending verification email:", error);
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 3000);
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            U.O.P.I. Dashboard
          </h1>
        </div>

        <Card className="glass-strong p-8">
          <div className="text-center space-y-6">
            {resent ? (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-success" />
                </div>
                <h2 className="text-2xl font-bold">Email inviata!</h2>
                <p className="text-muted-foreground">
                  Controlla la tua casella di posta.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <Mail className="h-16 w-16 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Verifica la tua email</h2>
                <p className="text-muted-foreground">
                  Ti abbiamo inviato un'email di verifica a{" "}
                  <span className="font-semibold text-foreground">{user?.email}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Clicca sul link nell'email per verificare il tuo account e accedere alla dashboard.
                </p>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={resending}
                    variant="outline"
                    className="w-full"
                  >
                    {resending ? "Invio in corso..." : "Invia nuovamente l'email"}
                  </Button>
                  
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="ghost"
                    className="w-full"
                  >
                    Torna al login
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
