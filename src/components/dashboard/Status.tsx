import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface SystemStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: string;
  lastCheck: string;
}

export const Status = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString('it-IT'));
  const [systemsStatus] = useState<SystemStatus[]>([
    {
      name: "Database Operativo",
      status: "operational",
      uptime: "99.9%",
      lastCheck: "2 minuti fa"
    },
    {
      name: "Sistema Comunicazioni",
      status: "operational",
      uptime: "100%",
      lastCheck: "1 minuto fa"
    },
    {
      name: "Gestione Personale",
      status: "operational",
      uptime: "99.7%",
      lastCheck: "3 minuti fa"
    },
    {
      name: "Sistema Turni",
      status: "operational",
      uptime: "98.5%",
      lastCheck: "5 minuti fa"
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleString('it-IT'));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return 'fa-check-circle';
      case 'degraded': return 'fa-exclamation-triangle';
      case 'down': return 'fa-times-circle';
    }
  };

  const getStatusText = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return 'Operativo';
      case 'degraded': return 'Degradato';
      case 'down': return 'Non Operativo';
    }
  };

  const operationalCount = systemsStatus.filter(s => s.status === 'operational').length;
  const overallHealth = Math.round((operationalCount / systemsStatus.length) * 100);

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-extrabold mb-2">Status Sistema</h2>
              <p className="text-muted-foreground">
                Monitoraggio stato operativo in tempo reale
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Ultimo aggiornamento</div>
              <div className="text-lg font-bold text-primary">{lastUpdate}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-500 text-sm font-bold uppercase tracking-wider">
              <i className="fas fa-wave-square"></i>
              Live Monitoring
            </span>
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Salute Generale Sistema</h3>
          <div className={`text-4xl font-extrabold ${overallHealth === 100 ? 'text-green-500' : overallHealth >= 75 ? 'text-yellow-500' : 'text-red-500'}`}>
            {overallHealth}%
          </div>
        </div>
        <div className="h-4 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              overallHealth === 100 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
              overallHealth >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
              'bg-gradient-to-r from-red-400 to-red-600'
            }`}
            style={{ width: `${overallHealth}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {operationalCount} di {systemsStatus.length} sistemi operativi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemsStatus.map((system, index) => (
          <Card key={index} className="glass p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg mb-1">{system.name}</h4>
                <div className={`flex items-center gap-2 font-semibold ${getStatusColor(system.status)}`}>
                  <i className={`fas ${getStatusIcon(system.status)}`}></i>
                  <span>{getStatusText(system.status)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{system.uptime}</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <i className="fas fa-clock mr-2"></i>
              Ultimo controllo: {system.lastCheck}
            </div>
          </Card>
        ))}
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">
          <i className="fas fa-history mr-2 text-primary"></i>
          Log Attività Recenti
        </h3>
        <div className="space-y-3">
          {[
            { time: "09:15", action: "Sistema avviato con successo", type: "success" },
            { time: "09:20", action: "Backup automatico completato", type: "success" },
            { time: "09:35", action: "Aggiornamento database operativo", type: "info" },
            { time: "09:42", action: "Sincronizzazione turni completata", type: "success" },
          ].map((log, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
              <div className={`w-2 h-2 rounded-full ${
                log.type === 'success' ? 'bg-green-500' : 
                log.type === 'info' ? 'bg-blue-500' : 
                'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-mono text-muted-foreground">{log.time}</span>
              <span className="flex-1 text-sm">{log.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};