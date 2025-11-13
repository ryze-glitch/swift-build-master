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

export const PersonnelCard = ({ person }: PersonnelCardProps) => {
  const role = roleConfig[person.role];
  const status = statusConfig[person.status] || statusConfig["Disponibile"];

  return (
    <div className="glass rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 space-y-4 border-l-4" style={{ borderLeftColor: role.color }}>
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {person.avatarUrl ? (
            <img 
              src={person.avatarUrl} 
              alt={person.name} 
              className="w-16 h-16 rounded-full object-cover border-2" 
              style={{ borderColor: role.color }} 
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-2"
              style={{ backgroundColor: role.color, borderColor: role.color }}
            >
              {person.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center"
            style={{ backgroundColor: status.color }}
          >
            <i className={`fas ${status.icon} text-xs text-white`}></i>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate">{person.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{person.qualification}</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <span 
          className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 flex-1"
          style={{ backgroundColor: `${role.color}20`, color: role.color }}
        >
          <i className={`fas ${role.icon}`}></i>
          {person.roleName}
        </span>
      </div>

      {/* Discord & Matricola */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discord:</span>
          <span className="font-semibold">{person.discordTag}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Matricola:</span>
          <span className="font-mono font-bold">{person.matricola}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Aggiunto:</span>
          <span className="text-xs">{person.addedDate}</span>
        </div>
      </div>
    </div>
  );
};
