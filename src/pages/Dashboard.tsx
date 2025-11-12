import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Personnel } from "@/components/dashboard/Personnel";
import { Announcements } from "@/components/dashboard/Announcements";
import { Status } from "@/components/dashboard/Status";
import { Shifts } from "@/components/dashboard/Shifts";
import { Credits } from "@/components/dashboard/Credits";
import { NotificationSystem } from "@/components/dashboard/NotificationSystem";

type Page = "dashboard" | "personnel" | "shifts" | "announcements" | "status" | "credits";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

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
      default:
        return (
          <div className="space-y-6">
            {/* Hero Dashboard */}
            <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center">
                  <i className="fas fa-chart-line text-4xl text-white"></i>
                </div>
                <h2 className="text-5xl font-extrabold mb-3">Panoramica U.O.P.I.</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Sistema di gestione operativa integrato. Benvenuto nella dashboard centrale.
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-500 text-sm font-bold uppercase tracking-wider">
                    <i className="fas fa-circle animate-pulse"></i>
                    Sistema Operativo
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: "fa-users", label: "Personale", value: "24", color: "blue-500", page: "personnel" },
                { icon: "fa-calendar-alt", label: "Turni Attivi", value: "8", color: "green-500", page: "shifts" },
                { icon: "fa-bullhorn", label: "Comunicazioni", value: "12", color: "purple-500", page: "announcements" },
                { icon: "fa-wave-square", label: "Status", value: "100%", color: "cyan-500", page: "status" },
              ].map((stat, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(stat.page as Page)}
                  className="glass rounded-2xl p-6 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <i className={`fas ${stat.icon} text-3xl text-${stat.color} group-hover:scale-110 transition-transform`}></i>
                    <i className="fas fa-arrow-right text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4">
                <i className="fas fa-bolt mr-2 text-primary"></i>
                Azioni Rapide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentPage("announcements")}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 transition-all text-left group"
                >
                  <i className="fas fa-bullhorn text-2xl text-primary mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="font-bold mb-1">Nuova Comunicazione</div>
                  <div className="text-sm text-muted-foreground">Pubblica un annuncio</div>
                </button>
                <button
                  onClick={() => setCurrentPage("shifts")}
                  className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 hover:from-green-500/30 hover:to-green-500/10 transition-all text-left group"
                >
                  <i className="fas fa-calendar-plus text-2xl text-green-500 mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="font-bold mb-1">Nuovo Turno</div>
                  <div className="text-sm text-muted-foreground">Pianifica un turno</div>
                </button>
                <button
                  onClick={() => setCurrentPage("personnel")}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 hover:from-blue-500/30 hover:to-blue-500/10 transition-all text-left group"
                >
                  <i className="fas fa-user-plus text-2xl text-blue-500 mb-2 block group-hover:scale-110 transition-transform"></i>
                  <div className="font-bold mb-1">Aggiungi Personale</div>
                  <div className="text-sm text-muted-foreground">Nuovo membro</div>
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-3">
                  <i className="fas fa-info-circle mr-2 text-primary"></i>
                  Informazioni Sistema
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versione</span>
                    <span className="font-semibold">v2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ultimo Aggiornamento</span>
                    <span className="font-semibold">12/11/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sviluppatore</span>
                    <span className="font-semibold">Ryze</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-3">
                  <i className="fas fa-check-circle mr-2 text-green-500"></i>
                  Stato Servizi
                </h4>
                <div className="space-y-2">
                  {[
                    { name: "Database", status: "operativo" },
                    { name: "API", status: "operativo" },
                    { name: "Notifiche", status: "operativo" },
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className="flex items-center gap-2 text-green-500 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {service.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
    </div>
  );
};

export default Dashboard;
