import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/dashboard/Header";
import { Personnel } from "@/components/dashboard/Personnel";
import { Announcements } from "@/components/dashboard/Announcements";
import { Status } from "@/components/dashboard/Status";
import { Shifts } from "@/components/dashboard/Shifts";
import { Credits } from "@/components/dashboard/Credits";
import { NotificationSystem } from "@/components/dashboard/NotificationSystem";
import { PremiumModal } from "@/components/dashboard/PremiumModal";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Dirigenza from "./Dirigenza";

type Page = "dashboard" | "personnel" | "shifts" | "announcements" | "status" | "credits" | "dirigenza";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, subscribed } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    } else if (user && !user.email_confirmed_at && !loading) {
      navigate("/verify-email");
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

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (currentPage) {
      case "personnel":
        return <Personnel />;
      case "shifts":
        return <Shifts />;
      case "announcements":
        return <Announcements />;
      case "status":
        return <Status />;
      case "credits":
        return <Credits />;
      case "dirigenza":
        return <Dirigenza />;
      default:
        return (
          <div className="space-y-8 px-4 py-6">
            {/* Hero with Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Hero Card */}
              <div className="lg:col-span-2 glass-strong rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Dashboard U.O.P.I.
                      </h1>
                      <p className="text-muted-foreground text-lg">
                        Sistema di gestione operativa integrato
                      </p>
                    </div>
                    <div className="glass rounded-2xl px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <span className="font-bold text-success">Sistema Attivo</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Access Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {[
                      { icon: "fa-users", label: "Personale", value: "24", page: "personnel", color: "primary" },
                      { icon: "fa-calendar-alt", label: "Turni", value: "8", page: "shifts", color: "success" },
                      { icon: "fa-bullhorn", label: "Comunicati", value: "12", page: "announcements", color: "accent" },
                      { icon: "fa-wave-square", label: "Status", value: "100%", page: "status", color: "warning" },
                    ].map((stat) => (
                      <button
                        key={stat.page}
                        onClick={() => setCurrentPage(stat.page as Page)}
                        className="glass rounded-2xl p-5 hover:scale-105 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity"
                             style={{ background: `linear-gradient(135deg, hsl(var(--${stat.color})) 0%, transparent 100%)` }}></div>
                        <div className="relative z-10">
                          <i className={`fas ${stat.icon} text-3xl mb-3 transition-transform group-hover:scale-110`}
                             style={{ color: `hsl(var(--${stat.color}))` }}></i>
                          <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Premium Features Sidebar */}
              <div className="space-y-4">
                {/* Premium Badge */}
                <div className={`glass-strong rounded-3xl p-6 relative overflow-hidden border-2 ${
                  subscribed ? 'border-success/50' : 'border-warning/50'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
                    subscribed ? 'from-success/20 via-transparent to-success/10' : 'from-warning/20 via-transparent to-warning/10'
                  }`}></div>
                  <div className="relative z-10 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      subscribed ? 'bg-gradient-to-br from-success to-success/50' : 'bg-gradient-to-br from-warning to-warning/50'
                    }`}>
                      <i className={`fas ${subscribed ? 'fa-check-circle' : 'fa-crown'} text-3xl ${
                        subscribed ? 'text-success-foreground' : 'text-warning-foreground'
                      }`}></i>
                    </div>
                    <h3 className="text-2xl font-extrabold mb-2">
                      {subscribed ? 'Piano Premium Attivo' : 'Premium'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {subscribed ? 'Accesso completo alle funzionalità' : 'Sblocca funzionalità avanzate'}
                    </p>
                    <Button 
                      onClick={() => setPremiumModalOpen(true)}
                      className={`w-full ${
                        subscribed 
                          ? 'bg-gradient-to-r from-success to-success/80 hover:shadow-lg hover:shadow-success/50' 
                          : 'bg-gradient-to-r from-warning to-warning/80 hover:shadow-lg hover:shadow-warning/50'
                      }`}
                      size="lg"
                    >
                      {subscribed ? (
                        <>
                          <i className="fas fa-cog mr-2"></i>
                          Gestisci
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Passa a Premium
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* System Status */}
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-server text-primary"></i>
                    Sistema
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <span className="font-bold text-success">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Versione</span>
                      <span className="font-mono text-sm font-bold">v2.1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features Grid */}
            <div className="glass-strong rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-extrabold">
                  <i className="fas fa-sparkles mr-3 text-warning"></i>
                  Funzionalità Premium
                </h3>
                <span className="px-4 py-2 rounded-full bg-warning/20 text-warning text-sm font-bold">
                  Richiede Premium
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: "fa-chart-line",
                    title: "Analytics Avanzati",
                    description: "Grafici dettagliati e report personalizzati",
                    color: "primary"
                  },
                  {
                    icon: "fa-robot",
                    title: "AI Assistant",
                    description: "Assistente intelligente per ottimizzazione turni",
                    color: "accent"
                  },
                  {
                    icon: "fa-clock-rotate-left",
                    title: "Storico Completo",
                    description: "Accesso illimitato a tutti i dati storici",
                    color: "success"
                  },
                  {
                    icon: "fa-file-export",
                    title: "Export Avanzato",
                    description: "Esporta in Excel, PDF e formati personalizzati",
                    color: "warning"
                  },
                  {
                    icon: "fa-bell",
                    title: "Notifiche Push",
                    description: "Notifiche real-time via email e mobile",
                    color: "danger"
                  },
                  {
                    icon: "fa-shield-halved",
                    title: "Sicurezza Avanzata",
                    description: "Autenticazione a due fattori e audit log",
                    color: "primary"
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="glass rounded-2xl p-6 hover:scale-105 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity"
                         style={{ background: `linear-gradient(135deg, hsl(var(--${feature.color})) 0%, transparent 100%)` }}></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 mb-4 bg-gradient-to-br rounded-2xl flex items-center justify-center"
                           style={{ background: `linear-gradient(135deg, hsl(var(--${feature.color})) 0%, hsl(var(--${feature.color})) 100%)` }}>
                        <i className={`fas ${feature.icon} text-2xl text-white`}></i>
                      </div>
                      <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-warning text-sm font-semibold">
                        <i className="fas fa-lock"></i>
                        <span>Premium</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setCurrentPage("announcements")}
                className="glass rounded-2xl p-6 hover:scale-105 transition-all text-left group"
              >
                <i className="fas fa-plus-circle text-3xl text-primary mb-3 group-hover:scale-110 transition-transform"></i>
                <h4 className="font-bold text-lg mb-1">Nuovo Comunicato</h4>
                <p className="text-sm text-muted-foreground">Pubblica un annuncio importante</p>
              </button>

              <button
                onClick={() => setCurrentPage("shifts")}
                className="glass rounded-2xl p-6 hover:scale-105 transition-all text-left group"
              >
                <i className="fas fa-calendar-plus text-3xl text-success mb-3 group-hover:scale-110 transition-transform"></i>
                <h4 className="font-bold text-lg mb-1">Crea Turno</h4>
                <p className="text-sm text-muted-foreground">Pianifica nuovo turno operativo</p>
              </button>

              <button
                onClick={() => setCurrentPage("personnel")}
                className="glass rounded-2xl p-6 hover:scale-105 transition-all text-left group"
              >
                <i className="fas fa-user-plus text-3xl text-accent mb-3 group-hover:scale-110 transition-transform"></i>
                <h4 className="font-bold text-lg mb-1">Aggiungi Personale</h4>
                <p className="text-sm text-muted-foreground">Registra nuovo membro</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </main>

      <NotificationSystem />
      <PremiumModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} />
    </div>
  );
};

export default Dashboard;
