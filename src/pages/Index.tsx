import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            U.O.P.I. Dashboard
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Sistema di gestione operativo avanzato per il coordinamento del personale e delle risorse
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Funzionalità Principali</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {[
              { icon: "fa-users", title: "Gestione Personale", desc: "Organizza e monitora il tuo team" },
              { icon: "fa-calendar-alt", title: "Turni Intelligenti", desc: "Pianificazione ottimizzata" },
              { icon: "fa-bullhorn", title: "Comunicati", desc: "Sistema notifiche in tempo reale" },
              { icon: "fa-chart-line", title: "Analytics Premium", desc: "Report e statistiche avanzate" },
            ].map((feature, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 rounded-lg p-3">
                    <i className={`fas ${feature.icon} text-primary text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Accedi alla Dashboard
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/auth")}
          >
            <i className="fas fa-user-plus mr-2"></i>
            Registrati
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
