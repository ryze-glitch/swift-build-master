import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  role: string;
  status: "active" | "completed" | "scheduled";
  personnel: string[];
}

const mockShifts: Shift[] = [
  {
    id: "1",
    name: "Pattuglia Notturna A",
    start: "22:00",
    end: "06:00",
    role: "Operativo",
    status: "active",
    personnel: ["M.001", "M.005", "M.012"]
  },
  {
    id: "2",
    name: "Pattuglia Diurna B",
    start: "06:00",
    end: "14:00",
    role: "Operativo",
    status: "completed",
    personnel: ["M.002", "M.007"]
  },
  {
    id: "3",
    name: "Sorveglianza Serale",
    start: "14:00",
    end: "22:00",
    role: "Operativo",
    status: "active",
    personnel: ["M.003", "M.009", "M.015"]
  },
  {
    id: "4",
    name: "Coordinamento Centrale",
    start: "08:00",
    end: "20:00",
    role: "Amministrativo",
    status: "active",
    personnel: ["M.004", "M.010"]
  },
];

const statusConfig = {
  active: { color: "hsl(var(--success))", icon: "fa-circle", label: "In Corso" },
  completed: { color: "hsl(var(--muted-foreground))", icon: "fa-check-circle", label: "Completato" },
  scheduled: { color: "hsl(var(--warning))", icon: "fa-clock", label: "Programmato" },
};

export const Shifts = () => {
  const [shifts] = useState(mockShifts);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "scheduled">("all");

  const filteredShifts = filter === "all" ? shifts : shifts.filter(s => s.status === filter);

  const stats = {
    total: shifts.length,
    active: shifts.filter(s => s.status === "active").length,
    completed: shifts.filter(s => s.status === "completed").length,
    scheduled: shifts.filter(s => s.status === "scheduled").length,
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Turni di Servizio</h1>
          <p className="text-muted-foreground">Pianificazione e gestione operativa</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/50 transition-all">
            <i className="fas fa-plus mr-2"></i>
            Nuovo Turno
          </button>
          <button className="px-6 py-3 rounded-xl glass font-bold hover:bg-secondary transition-all">
            <i className="fas fa-crown mr-2 text-warning"></i>
            AI Planner
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Totali", value: stats.total, icon: "fa-list", color: "primary" },
          { label: "In Corso", value: stats.active, icon: "fa-circle", color: "success" },
          { label: "Completati", value: stats.completed, icon: "fa-check-circle", color: "muted-foreground" },
          { label: "Programmati", value: stats.scheduled, icon: "fa-clock", color: "warning" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <i className={`fas ${stat.icon} text-3xl`} style={{ color: `hsl(var(--${stat.color}))` }}></i>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</span>
            </div>
            <div className="text-4xl font-extrabold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Premium AI Features Banner */}
      <div className="glass-strong rounded-2xl p-6 border-2 border-warning/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warning/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center">
              <i className="fas fa-robot text-2xl text-warning-foreground"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                Ottimizzazione AI dei Turni
              </h3>
              <p className="text-sm text-muted-foreground">
                Lascia che l'AI organizzi automaticamente i turni in base a disponibilità e competenze
              </p>
            </div>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-warning to-warning/80 text-warning-foreground font-bold hover:shadow-lg hover:shadow-warning/50 transition-all whitespace-nowrap">
            <i className="fas fa-crown mr-2"></i>
            Sblocca Premium
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "Tutti", icon: "fa-list" },
          { id: "active", label: "In Corso", icon: "fa-circle" },
          { id: "completed", label: "Completati", icon: "fa-check-circle" },
          { id: "scheduled", label: "Programmati", icon: "fa-clock" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as typeof filter)}
            className={`px-5 py-3 rounded-xl font-semibold transition-all ${
              filter === btn.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "glass hover:bg-secondary"
            }`}
          >
            <i className={`fas ${btn.icon} mr-2`}></i>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShifts.map((shift) => {
          const config = statusConfig[shift.status];
          return (
            <div key={shift.id} className="glass rounded-2xl p-6 hover:scale-105 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{shift.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <i className="fas fa-clock"></i>
                    <span>{shift.start} - {shift.end}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full text-xs font-bold"
                     style={{ 
                       backgroundColor: `${config.color}20`,
                       color: config.color
                     }}>
                  <i className={`fas ${config.icon} mr-1`}></i>
                  {config.label}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-briefcase text-muted-foreground"></i>
                  <span className="font-semibold">{shift.role}</span>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-semibold">
                    Personale ({shift.personnel.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {shift.personnel.map((matricola) => (
                      <span 
                        key={matricola}
                        className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold"
                      >
                        {matricola}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <button className="flex-1 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-all">
                  <i className="fas fa-edit mr-2"></i>
                  Modifica
                </button>
                <button className="px-4 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold transition-all">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
