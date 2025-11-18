import { useMediaQuery } from "@/hooks/use-mobile";

export const OrgSidebar = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isDesktop) return null;

  return (
    <aside className="w-64 glass-strong border-r border-border/50 p-6 flex flex-col items-center gap-6 sticky top-20 h-[calc(100vh-5rem)]">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent p-1 shadow-glow">
            <img 
              src="https://i.imgur.com/B6E4u1X.png" 
              alt="UOPI Logo" 
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-background flex items-center justify-center">
            <div className="w-2 h-2 bg-background rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            U.O.P.I. - IPRP X
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unità Operativa di Primo Intervento
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      <div className="flex-1 w-full space-y-4">
        <div className="glass rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Stato Sistema
            </span>
          </div>
          <p className="text-lg font-bold text-success">Operativo</p>
        </div>

        <div className="glass rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-shield-alt text-primary text-sm"></i>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Livello Sicurezza
            </span>
          </div>
          <p className="text-lg font-bold text-primary">Alto</p>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>© 2024 U.O.P.I.</p>
        <p className="mt-1">Sistema di Gestione Integrato</p>
      </div>
    </aside>
  );
};
