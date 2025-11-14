import { useState } from "react";
import { PersonnelCard } from "./PersonnelCard";
import operatoriData from "@/data/operatori_reparto.json";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { isAdmin } = useUserRole();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gerarchia Operatori</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestisci il personale organizzato per ruolo
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi
          </Button>
        )}
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

      {/* Personnel Cards - Redesigned Layout */}
      {!activeFilter && !searchQuery ? (
        // Group by role with modern card layout
        <div className="space-y-6">
          {Object.entries(roleGroups).map(([role, people]) => {
            if (people.length === 0) return null;
            
            const roleLabels: Record<string, string> = {
              dirigenziale: "Dirigenziale",
              amministrativo: "Amministrativo",
              operativo: "Operativo"
            };

            return (
              <div key={role} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    {roleLabels[role]}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({people.length})
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {people.map((person) => (
                    <PersonnelCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat list when filtering or searching
        <div>
          {filteredPersonnel.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredPersonnel.map((person) => (
                <PersonnelCard key={person.id} person={person} />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nessun risultato trovato
            </div>
          )}
        </div>
      )}
    </div>
  );
};
