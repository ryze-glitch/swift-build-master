import { useState } from "react";
import { PersonnelCard } from "./PersonnelCard";
import operatoriData from "@/data/operatori_reparto.json";

interface Person {
  id: number;
  name: string;
  role: "dirigenziale" | "amministrativo" | "operativo";
  qualification: string;
  matricola: string;
  status: string;
  avatarUrl?: string;
  discordTag: string;
  roleName: string;
  addedDate: string;
}

const mockPersonnel: Person[] = operatoriData.operators.map(op => ({
  ...op,
  role: op.role as "dirigenziale" | "amministrativo" | "operativo"
}));

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

  const roleGroups = {
    dirigenziale: mockPersonnel.filter(p => p.role === "dirigenziale"),
    amministrativo: mockPersonnel.filter(p => p.role === "amministrativo"),
    operativo: mockPersonnel.filter(p => p.role === "operativo"),
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Personale</h1>
          <p className="text-muted-foreground">Gestione organico e gerarchia</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/50 transition-all">
          <i className="fas fa-user-plus mr-2"></i>
          Aggiungi
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Totale", value: stats.total, icon: "fa-users", color: "primary" },
          { label: "Dirigenziale", value: stats.dirigenziale, icon: "fa-crown", color: "role-dirigenziale" },
          { label: "Amministrativo", value: stats.amministrativo, icon: "fa-file-alt", color: "role-amministrativo" },
          { label: "Operativo", value: stats.operativo, icon: "fa-shield-alt", color: "role-operativo" },
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

      {/* Filters & Search */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
              <input
                type="text"
                placeholder="Cerca per nome o matricola..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { id: null, label: "Tutti", icon: "fa-users" },
              { id: "dirigenziale", label: "Dirigenziale", icon: "fa-crown" },
              { id: "amministrativo", label: "Amministrativo", icon: "fa-file-alt" },
              { id: "operativo", label: "Operativo", icon: "fa-shield-alt" },
            ].map((filter) => (
              <button
                key={filter.id || "all"}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                    : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                }`}
              >
                <i className={`fas ${filter.icon} mr-2`}></i>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personnel Grid - Grouped by Role */}
      {!activeFilter && !searchQuery ? (
        <div className="space-y-8">
          {/* Dirigenziale */}
          {roleGroups.dirigenziale.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: `hsl(var(--role-dirigenziale))` }}>
                  <i className="fas fa-crown text-xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold">Dirigenziale</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roleGroups.dirigenziale.map((person) => (
                  <PersonnelCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}

          {/* Amministrativo */}
          {roleGroups.amministrativo.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: `hsl(var(--role-amministrativo))` }}>
                  <i className="fas fa-file-alt text-xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold">Amministrativo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roleGroups.amministrativo.map((person) => (
                  <PersonnelCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}

          {/* Operativo */}
          {roleGroups.operativo.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: `hsl(var(--role-operativo))` }}>
                  <i className="fas fa-shield-alt text-xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold">Operativo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roleGroups.operativo.map((person) => (
                  <PersonnelCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPersonnel.map((person) => (
            <PersonnelCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl">
          <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground">Nessun risultato trovato</p>
        </div>
      )}
    </div>
  );
};
