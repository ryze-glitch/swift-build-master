interface Person {
  id: string;
  name: string;
  role: "dirigenziale" | "amministrativo" | "operativo";
  qualification: string;
  matricola: string;
  status: "available" | "busy";
  avatar?: string;
}

interface PersonnelCardProps {
  person: Person;
}

const roleConfig = {
  dirigenziale: { color: "hsl(var(--role-dirigenziale))", icon: "fa-crown", label: "Dirigenziale" },
  amministrativo: { color: "hsl(var(--role-amministrativo))", icon: "fa-file-alt", label: "Amministrativo" },
  operativo: { color: "hsl(var(--role-operativo))", icon: "fa-shield-alt", label: "Operativo" },
};

const statusConfig = {
  available: { color: "hsl(var(--success))", label: "Disponibile", icon: "fa-check-circle" },
  busy: { color: "hsl(var(--warning))", label: "Occupato", icon: "fa-clock" },
};

export const PersonnelCard = ({ person }: PersonnelCardProps) => {
  const role = roleConfig[person.role];
  const status = statusConfig[person.status];

  return (
    <div className="glass rounded-2xl p-5 hover:scale-105 hover:shadow-2xl transition-all duration-300 group border">
      <div className="flex gap-4 mb-4">
        {/* Avatar */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl border-2"
          style={{ 
            background: `linear-gradient(135deg, ${role.color}, ${role.color}dd)`,
            borderColor: role.color
          }}
        >
          {person.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{person.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{person.qualification}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
          style={{ 
            backgroundColor: `${role.color}20`, 
            color: role.color,
            borderColor: `${role.color}40`
          }}
        >
          <i className={`fas ${role.icon}`}></i>
          {role.label}
        </span>

        <span 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
          style={{ 
            backgroundColor: `${status.color}20`, 
            color: status.color,
            borderColor: `${status.color}40`
          }}
        >
          <i className={`fas ${status.icon}`}></i>
          {status.label}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/40 font-mono">
          {person.matricola}
        </span>
      </div>
    </div>
  );
};
