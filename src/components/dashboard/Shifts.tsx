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
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold">Gestione Turni</h2>
            <p className="text-muted-foreground">
              Pianificazione e monitoraggio dei turni operativi
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/20 text-success text-sm font-bold uppercase tracking-wider">
                <i className="fas fa-calendar-check"></i>
                Turni Attivi: {stats.active}
              </span>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="text-sm font-semibold text-muted-foreground">Copertura Operativa</div>
            <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                style={{ width: `${(stats.active / stats.total) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.active} turni attivi su {stats.total} totali
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Totali", value: stats.total, icon: "fa-list", color: "primary" },
          { label: "In Corso", value: stats.active, icon: "fa-circle", color: "success" },
          { label: "Completati", value: stats.completed, icon: "fa-check-circle", color: "muted-foreground" },
          { label: "Programmati", value: stats.scheduled, icon: "fa-clock", color: "warning" },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: "all", label: "Tutti", icon: "fa-list" },
          { id: "active", label: "In Corso", icon: "fa-circle" },
          { id: "completed", label: "Completati", icon: "fa-check-circle" },
          { id: "scheduled", label: "Programmati", icon: "fa-clock" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              filter === f.id
                ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
                : "glass hover:shadow-md"
            }`}
          >
            <i className={`fas ${f.icon} mr-2`}></i>
            {f.label}
          </button>
        ))}
      </div>

      {/* Shifts Grid */}
      <div className="grid gap-6">
        {filteredShifts.map((shift) => {
          const status = statusConfig[shift.status];
          return (
            <Card key={shift.id} className="glass p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{shift.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <i className="fas fa-clock"></i>
                      {shift.start} - {shift.end}
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="fas fa-user-shield"></i>
                      {shift.role}
                    </span>
                  </div>
                </div>
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

              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Personale Assegnato</span>
                  <span className="text-sm font-bold text-primary">{shift.personnel.length} unità</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shift.personnel.map((p) => (
                    <span key={p} className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-sm font-semibold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
