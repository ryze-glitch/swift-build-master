export const Credits = () => {
  const developers = [
    {
      name: "Ryze",
      role: "Lead Developer & System Architect",
      avatar: "💎",
      contributions: ["Dashboard UI/UX", "Sistema Gestione Personale", "Sistema Comunicazioni", "Architettura Backend"]
    }
  ];

  const technologies = [
    { name: "React", icon: "fa-react", color: "text-blue-400" },
    { name: "TypeScript", icon: "fa-code", color: "text-blue-500" },
    { name: "Vite", icon: "fa-bolt", color: "text-purple-500" },
    { name: "Tailwind CSS", icon: "fa-css3-alt", color: "text-cyan-400" },
    { name: "shadcn/ui", icon: "fa-layer-group", color: "text-slate-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <i className="fas fa-award text-3xl text-white"></i>
          </div>
          <h2 className="text-4xl font-extrabold mb-2">Crediti</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistema di gestione operativa U.O.P.I. sviluppato con passione e dedizione
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
              <i className="fas fa-heart"></i>
              Made with Love
            </span>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Swift Build Master</h3>
            <p className="text-sm text-muted-foreground">Sistema di Gestione Operativa Integrato</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-primary">v2.0.0</div>
            <div className="text-xs text-muted-foreground">Build 2025.11.12</div>
          </div>
        </div>
      </div>

      {/* Development Team */}
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6">
          <i className="fas fa-users mr-2 text-primary"></i>
          Team di Sviluppo
        </h3>
        <div className="space-y-4">
          {developers.map((dev, index) => (
            <div key={index} className="glass rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
                  {dev.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-1">{dev.name}</h4>
                  <p className="text-sm text-primary font-semibold mb-3">{dev.role}</p>
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contributi:</div>
                    <div className="flex flex-wrap gap-2">
                      {dev.contributions.map((contribution, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium">
                          {contribution}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6">
          <i className="fas fa-code mr-2 text-primary"></i>
          Tecnologie Utilizzate
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {technologies.map((tech, index) => (
            <div key={index} className="glass rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <i className={`fab ${tech.icon} text-4xl mb-3 ${tech.color}`}></i>
              <div className="font-bold">{tech.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6">
          <i className="fas fa-list-check mr-2 text-primary"></i>
          Funzionalità Principali
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: "fa-users", title: "Gestione Personale", desc: "Sistema completo di gestione e monitoraggio del personale operativo" },
            { icon: "fa-calendar-alt", title: "Pianificazione Turni", desc: "Organizzazione e scheduling automatizzato dei turni di servizio" },
            { icon: "fa-bullhorn", title: "Sistema Comunicazioni", desc: "Centro comunicazioni con notifiche in tempo reale e votazioni" },
            { icon: "fa-wave-square", title: "Monitoring Status", desc: "Monitoraggio continuo dello stato operativo dei sistemi" },
          ].map((feature, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-xl bg-secondary/30">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <i className={`fas ${feature.icon} text-xl text-primary`}></i>
              </div>
              <div>
                <h4 className="font-bold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Thanks */}
      <div className="glass-strong rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold mb-3">
          <i className="fas fa-heart text-red-500 mr-2"></i>
          Ringraziamenti Speciali
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Un ringraziamento speciale a tutti i membri dell'U.O.P.I. che utilizzano quotidianamente questo sistema e contribuiscono con feedback preziosi al suo continuo miglioramento.
        </p>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-muted-foreground">
        <p>© 2025 U.O.P.I. Swift Build Master. Tutti i diritti riservati.</p>
        <p className="mt-1">Sviluppato con ❤️ da Ryze</p>
      </div>
    </div>
  );
};