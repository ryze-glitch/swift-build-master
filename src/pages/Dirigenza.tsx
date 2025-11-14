import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import operatoriData from "@/data/operatori_reparto.json";

interface Person {
  id: string;
  name: string;
  role: string;
}

interface ActivationStats {
  operator: string;
  qualification: string;
  avatarUrl: string;
  totalMinutes: number;
  hours: number;
  minutes: number;
  activations: number;
}

export default function Dirigenza() {
  const [stats, setStats] = useState<ActivationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivationStats();
  }, []);

  const loadActivationStats = async () => {
    try {
      const { data: shifts, error } = await supabase
        .from("shifts")
        .select("*")
        .in("module_type", ["patrol_activation", "heist_activation"]);

      if (error) throw error;

      // Calcola le statistiche per operatore
      const statsMap = new Map<string, ActivationStats>();

      shifts?.forEach((shift) => {
        let operators: Person[] = [];
        
        if (shift.module_type === "patrol_activation" && shift.operators_out) {
          operators = (Array.isArray(shift.operators_out) ? shift.operators_out : []) as unknown as Person[];
        } else if (shift.module_type === "heist_activation" && shift.operators_involved) {
          operators = (Array.isArray(shift.operators_involved) ? shift.operators_involved : []) as unknown as Person[];
        }

        // Calcola durata in minuti
        const startTime = new Date(shift.start_time);
        const endTime = new Date(shift.end_time);
        const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        operators.forEach((operator) => {
          const existing = statsMap.get(operator.name) || {
            operator: operator.name,
            qualification: "",
            avatarUrl: "",
            totalMinutes: 0,
            hours: 0,
            minutes: 0,
            activations: 0,
          };

          existing.totalMinutes += durationMinutes;
          existing.activations += 1;

          statsMap.set(operator.name, existing);
        });
      });

      // Aggiungi dati operatori da JSON
      const enrichedStats = Array.from(statsMap.values()).map((stat) => {
        const operatorData = operatoriData.operators.find(
          (op) => op.name === stat.operator
        );

        return {
          ...stat,
          qualification: operatorData?.qualification || "",
          avatarUrl: operatorData?.avatarUrl || "",
          hours: Math.floor(stat.totalMinutes / 60),
          minutes: stat.totalMinutes % 60,
        };
      });

      // Ordina per grado (dirigenziali prima)
      const gradeOrder = [
        "✨・Comandante Generale",
        "💎・Comandante",
        "🥏・Vice Comandante",
        "🪁・Sostituto Vice Comandante",
        "⚜️・Capitano",
        "🪖・Caposquadra",
        "🎖️・Sergente",
        "🎗️・Caporale",
        "🏅・Operatore Scelto",
        "👮・Operatore",
      ];

      enrichedStats.sort((a, b) => {
        const indexA = gradeOrder.indexOf(a.qualification);
        const indexB = gradeOrder.indexOf(b.qualification);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });

      setStats(enrichedStats);
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="p-4 rounded-xl bg-primary/20 backdrop-blur-sm shadow-lg">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dirigenza
            </h1>
            <p className="text-muted-foreground text-lg">
              Statistiche attivazioni moduli per operatore
            </p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Ore di Attivazione</CardTitle>
            <CardDescription className="text-base">
              Conteggio totale delle ore effettuate tramite moduli (in ordine di grado)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nessuna attivazione registrata
              </div>
            ) : (
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div
                    key={stat.operator}
                    className="group relative flex items-center gap-4 p-5 rounded-xl border border-border/50 bg-gradient-to-r from-card to-card/50 hover:from-accent/10 hover:to-accent/5 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <span className="text-lg font-bold text-primary">
                          #{index + 1}
                        </span>
                      </div>
                      <Avatar className="h-14 w-14 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        <AvatarImage src={stat.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {stat.operator
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-lg truncate">{stat.operator}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {stat.qualification}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="secondary" className="text-lg font-bold px-4 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20">
                        {stat.hours}h {stat.minutes}m
                      </Badge>
                      <div className="text-xs text-muted-foreground font-medium">
                        {stat.activations} {stat.activations === 1 ? 'attivazione' : 'attivazioni'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
