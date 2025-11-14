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

interface PersonnelCardProps {
  person: Person;
  showQualification?: boolean;
}

const roleConfig = {
  dirigenziale: { color: "hsl(var(--role-dirigenziale))", icon: "fa-crown", label: "Dirigenziale" },
  amministrativo: { color: "hsl(var(--role-amministrativo))", icon: "fa-file-alt", label: "Amministrativo" },
  operativo: { color: "hsl(var(--role-operativo))", icon: "fa-shield-alt", label: "Operativo" },
};

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  "Disponibile": { color: "hsl(var(--success))", label: "Disponibile", icon: "fa-check-circle" },
  "Occupato": { color: "hsl(var(--warning))", label: "Occupato", icon: "fa-hourglass-half" },
  "In Servizio": { color: "hsl(var(--primary))", label: "In Servizio", icon: "fa-shield-alt" },
  "Non Disponibile": { color: "hsl(var(--danger))", label: "Non Disponibile", icon: "fa-times-circle" },
};

export const PersonnelCard = ({ person, showQualification = true }: PersonnelCardProps) => {
  const role = roleConfig[person.role];
  const status = statusConfig[person.status] || statusConfig["Disponibile"];

  return (
    <div className="bg-background/50 rounded-lg border border-border/50 p-3 hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div className="relative">
          {person.avatarUrl ? (
            <img 
              src={person.avatarUrl} 
              alt={person.name} 
              className="w-10 h-10 rounded-full object-cover border-2 group-hover:ring-2 ring-primary/30 transition-all" 
              style={{ borderColor: role.color }} 
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs border-2"
              style={{ backgroundColor: role.color, borderColor: role.color }}
            >
              {person.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background"
            style={{ backgroundColor: status.color }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {person.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">Mat. {person.matricola}</p>
          {showQualification && (
            <p className="text-xs text-primary/80 truncate mt-0.5">{person.qualification}</p>
          )}
        </div>
        <div 
          className="shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: status.color }}
        />
      </div>
    </div>
  );
};
