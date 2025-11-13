import { Card } from "@/components/ui/card";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  category: "operational" | "training" | "excellence";
}

const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "Operazione Successo",
    description: "Completata con successo l'operazione di sorveglianza notturna",
    icon: "fa-medal",
    date: "2025-11-10",
    category: "operational"
  },
  {
    id: "2",
    title: "Addestramento Elite",
    description: "Superato con eccellenza il corso di addestramento avanzato",
    icon: "fa-graduation-cap",
    date: "2025-11-05",
    category: "training"
  },
  {
    id: "3",
    title: "Merito Operativo",
    description: "Riconoscimento per prestazioni eccellenti nel servizio",
    icon: "fa-trophy",
    date: "2025-10-28",
    category: "excellence"
  },
];

const categoryConfig = {
  operational: { color: "hsl(var(--primary))", label: "Operativo" },
  training: { color: "hsl(var(--accent))", label: "Addestramento" },
  excellence: { color: "hsl(var(--warning))", label: "Eccellenza" },
};

export const Credits = () => {
  const stats = {
    total: 127,
    operational: 85,
    training: 32,
    excellence: 10,
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-primary/10 pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-warning to-orange-600 rounded-3xl flex items-center justify-center">
            <i className="fas fa-award text-4xl text-white"></i>
          </div>
          <h2 className="text-5xl font-extrabold mb-3">Crediti & Riconoscimenti</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Tracciamento delle operazioni completate e riconoscimenti ottenuti
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-warning/20 text-warning text-sm font-bold uppercase tracking-wider">
              <i className="fas fa-star"></i>
              Totale Crediti: {stats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Totali", value: stats.total, icon: "fa-award", color: "warning" },
          { label: "Operativi", value: stats.operational, icon: "fa-medal", color: "primary" },
          { label: "Addestramento", value: stats.training, icon: "fa-graduation-cap", color: "accent" },
          { label: "Eccellenza", value: stats.excellence, icon: "fa-trophy", color: "success" },
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

      {/* Progress Overview */}
      <Card className="glass-strong p-6">
        <h3 className="text-2xl font-bold mb-4">
          <i className="fas fa-chart-bar mr-2 text-primary"></i>
          Progresso Generale
        </h3>
        <div className="space-y-4">
          {[
            { label: "Operazioni", current: stats.operational, max: 100, color: "primary" },
            { label: "Addestramenti", current: stats.training, max: 50, color: "accent" },
            { label: "Eccellenza", current: stats.excellence, max: 20, color: "success" },
          ].map((progress) => (
            <div key={progress.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{progress.label}</span>
                <span className="text-sm font-bold" style={{ color: `hsl(var(--${progress.color}))` }}>
                  {progress.current} / {progress.max}
                </span>
              </div>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${(progress.current / progress.max) * 100}%`,
                    background: `linear-gradient(to right, hsl(var(--${progress.color})), hsl(var(--${progress.color})) 50%, hsl(var(--accent)))`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">
          <i className="fas fa-star mr-2 text-warning"></i>
          Riconoscimenti Recenti
        </h3>
        {mockAchievements.map((achievement) => {
          const category = categoryConfig[achievement.category];
          return (
            <Card key={achievement.id} className="glass p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <i className={`fas ${achievement.icon} text-2xl`} style={{ color: category.color }}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xl font-bold">{achievement.title}</h4>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ 
                        backgroundColor: `${category.color}20`, 
                        color: category.color 
                      }}
                    >
                      {category.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <i className="fas fa-calendar"></i>
                    {new Date(achievement.date).toLocaleDateString('it-IT')}
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
