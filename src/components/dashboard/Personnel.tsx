import { useState } from "react";
import { PersonnelCard } from "./PersonnelCard";

interface Person {
  id: string;
  name: string;
  role: "dirigenziale" | "amministrativo" | "operativo";
  qualification: string;
  matricola: string;
  status: "available" | "busy";
  avatar?: string;
}

const mockPersonnel: Person[] = [
  { id: "1", name: "Marco Rossi", role: "dirigenziale", qualification: "Comandante", matricola: "DIR-001", status: "available" },
  { id: "2", name: "Laura Bianchi", role: "dirigenziale", qualification: "Vice Comandante", matricola: "DIR-002", status: "available" },
  { id: "3", name: "Giuseppe Verdi", role: "amministrativo", qualification: "Responsabile Amministrativo", matricola: "AMM-001", status: "available" },
  { id: "4", name: "Francesca Neri", role: "amministrativo", qualification: "Segretaria", matricola: "AMM-002", status: "busy" },
  { id: "5", name: "Antonio Russo", role: "operativo", qualification: "Agente Senior", matricola: "OPE-001", status: "available" },
  { id: "6", name: "Stefania Colombo", role: "operativo", qualification: "Agente", matricola: "OPE-002", status: "available" },
  { id: "7", name: "Paolo Ferrari", role: "operativo", qualification: "Agente", matricola: "OPE-003", status: "busy" },
  { id: "8", name: "Elena Ricci", role: "operativo", qualification: "Agente Junior", matricola: "OPE-004", status: "available" },
];

export const Personnel = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPersonnel = mockPersonnel.filter((person) => {
    const matchesFilter = !activeFilter || person.role === activeFilter;
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.matricola.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: mockPersonnel.length,
    dirigenziale: mockPersonnel.filter(p => p.role === "dirigenziale").length,
    amministrativo: mockPersonnel.filter(p => p.role === "amministrativo").length,
    operativo: mockPersonnel.filter(p => p.role === "operativo").length,
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap justify-between items-start gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold">Gestione Personale</h2>
            <p className="text-muted-foreground max-w-lg">
              Sistema di gestione organico con struttura gerarchica completa
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
                <i className="fas fa-users"></i>
                Operativo
              </span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all">
              <i className="fas fa-user-plus mr-2"></i>
              Aggiungi
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Totale", value: stats.total, icon: "fa-users", color: "primary" },
          { label: "Dirigenziale", value: stats.dirigenziale, icon: "fa-crown", color: "role-dirigenziale" },
          { label: "Amministrativo", value: stats.amministrativo, icon: "fa-file-alt", color: "role-amministrativo" },
          { label: "Operativo", value: stats.operativo, icon: "fa-shield-alt", color: "role-operativo" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6 border-l-4" style={{ borderLeftColor: `hsl(var(--${stat.color}))` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</span>
              <i className={`fas ${stat.icon} text-2xl`} style={{ color: `hsl(var(--${stat.color}))` }}></i>
            </div>
            <div className="text-3xl font-extrabold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: null, label: "Tutti", icon: "fa-list" },
            { id: "dirigenziale", label: "Dirigenziale", icon: "fa-crown" },
            { id: "amministrativo", label: "Amministrativo", icon: "fa-file-alt" },
            { id: "operativo", label: "Operativo", icon: "fa-shield-alt" },
          ].map((filter) => (
            <button
              key={filter.id || "all"}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-4 py-2 rounded-full font-semibold text-sm transition-all
                ${activeFilter === filter.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }
              `}
            >
              <i className={`fas ${filter.icon} mr-2`}></i>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
            <input
              type="text"
              placeholder="Cerca per nome o matricola..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPersonnel.map((person) => (
          <PersonnelCard key={person.id} person={person} />
        ))}
      </div>

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl">
          <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground">Nessun risultato trovato</p>
        </div>
      )}
    </div>
  );
};
