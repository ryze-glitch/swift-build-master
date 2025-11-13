import { Card } from "@/components/ui/card";

interface StatusItem {
  id: string;
  service: string;
  status: "operational" | "degraded" | "down";
  lastUpdate: string;
  uptime: string;
  responseTime: string;
}

const mockStatus: StatusItem[] = [
  {
    id: "1",
    service: "Sistema Centrale",
    status: "operational",
    lastUpdate: "2025-11-13 14:23:15",
    uptime: "99.99%",
    responseTime: "45ms"
  },
  {
    id: "2",
    service: "Database Operativo",
    status: "operational",
    lastUpdate: "2025-11-13 14:22:50",
    uptime: "99.95%",
    responseTime: "12ms"
  },
  {
    id: "3",
    service: "Sistema Comunicazioni",
    status: "operational",
    lastUpdate: "2025-11-13 14:23:00",
    uptime: "100%",
    responseTime: "23ms"
  },
  {
    id: "4",
    service: "Rete Operativa",
    status: "operational",
    lastUpdate: "2025-11-13 14:22:45",
    uptime: "99.98%",
    responseTime: "8ms"
  },
];

const statusConfig = {
  operational: { color: "hsl(var(--success))", icon: "fa-check-circle", label: "Operativo" },
  degraded: { color: "hsl(var(--warning))", icon: "fa-exclamation-triangle", label: "Degradato" },
  down: { color: "hsl(var(--danger))", icon: "fa-times-circle", label: "Non Disponibile" },
};

const getLastUpdateTime = () => {
  const now = new Date();
  return now.toLocaleString('it-IT', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const Status = () => {
  const allOperational = mockStatus.every(s => s.status === "operational");
  const lastUpdate = getLastUpdateTime();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-primary/10 pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-3xl flex items-center justify-center ${
            allOperational 
              ? "bg-gradient-to-br from-success to-green-600" 
              : "bg-gradient-to-br from-warning to-orange-600"
          }`}>
            <i className={`fas ${allOperational ? "fa-check-circle" : "fa-exclamation-triangle"} text-4xl text-white`}></i>
          </div>
          <h2 className="text-5xl font-extrabold mb-3">
            {allOperational ? "Tutti i Sistemi Operativi" : "Sistemi in Manutenzione"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-4">
            Monitoraggio in tempo reale dello stato dei servizi U.O.P.I.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-muted/50 text-sm font-semibold">
            <i className="fas fa-sync-alt animate-spin text-primary"></i>
            Ultimo aggiornamento: {lastUpdate}
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: "Servizi Totali", 
            value: mockStatus.length, 
            icon: "fa-server",
            color: "primary"
          },
          { 
            label: "Operativi", 
            value: mockStatus.filter(s => s.status === "operational").length,
            icon: "fa-check-circle",
            color: "success"
          },
          { 
            label: "Uptime Medio", 
            value: "99.98%",
            icon: "fa-chart-line",
            color: "accent"
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</span>
              <i className={`fas ${stat.icon} text-2xl`} style={{ color: `hsl(var(--${stat.color}))` }}></i>
            </div>
            <div className="text-3xl font-extrabold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Status Cards */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">
          <i className="fas fa-wave-square mr-2 text-primary"></i>
          Stato Servizi
        </h3>
        {mockStatus.map((item) => {
          const status = statusConfig[item.status];
          return (
            <Card key={item.id} className="glass p-6 hover:shadow-xl transition-all">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Side - Service Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xl font-bold">{item.service}</h4>
                    <span 
                      className="px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"
                      style={{ 
                        backgroundColor: `${status.color}20`, 
                        color: status.color 
                      }}
                    >
                      <i className={`fas ${status.icon}`}></i>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <i className="fas fa-clock"></i>
                    Ultimo aggiornamento: {item.lastUpdate}
                  </div>
                </div>

                {/* Right Side - Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Uptime</div>
                    <div className="text-2xl font-bold text-success">{item.uptime}</div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Risposta</div>
                    <div className="text-2xl font-bold text-primary">{item.responseTime}</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
