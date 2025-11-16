import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
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
        .in("module_type", ["patrol_activation", "patrol_deactivation", "heist_activation", "heist_deactivation"]);

      if (error) throw error;
      
      console.log("Shifts caricati:", shifts?.length || 0);
      console.log("Primi 3 shifts:", shifts?.slice(0, 3));

      // Raggruppa shifts per coppia attivazione-disattivazione
      const activationPairs = new Map<string, { activation: any; deactivation?: any }>();
      
      shifts?.forEach((shift) => {
        // Crea una chiave unica basata su tipo modulo e operatori
        let keyBase = '';
        let operators: Person[] = [];
        
        if (shift.module_type === "patrol_activation" || shift.module_type === "patrol_deactivation") {
          operators = (Array.isArray(shift.operators_out) ? shift.operators_out : 
                       Array.isArray(shift.operators_back) ? shift.operators_back : []) as unknown as Person[];
          keyBase = 'patrol_' + operators.map(o => o.id).sort().join('_');
        } else if (shift.module_type === "heist_activation" || shift.module_type === "heist_deactivation") {
          operators = (Array.isArray(shift.operators_involved) ? shift.operators_involved : []) as unknown as Person[];
          keyBase = 'heist_' + operators.map(o => o.id).sort().join('_');
        }
        
        // Usa solo la data senza l'ora per raggruppare attivazioni e disattivazioni dello stesso giorno
        const shiftDate = new Date(shift.start_time).toISOString().split('T')[0];
        const key = `${keyBase}_${shiftDate}`;
        
        if (shift.module_type?.includes('activation')) {
          const existing = activationPairs.get(key) || { activation: null, deactivation: null };
          existing.activation = shift;
          activationPairs.set(key, existing);
        } else if (shift.module_type?.includes('deactivation')) {
          const existing = activationPairs.get(key) || { activation: null, deactivation: null };
          existing.deactivation = shift;
          activationPairs.set(key, existing);
        }
      });

      // Calcola le statistiche per operatore
      const statsMap = new Map<string, ActivationStats>();

      activationPairs.forEach((pair) => {
        // Salta le coppie incomplete
        if (!pair.activation || !pair.deactivation) {
          console.log("Coppia incompleta:", pair);
          return;
        }
        
        let operators: Person[] = [];
        let durationMinutes = 0;
        
        // Prendi gli operatori dall'attivazione
        if (pair.activation.module_type === "patrol_activation" && pair.activation.operators_out) {
          operators = (Array.isArray(pair.activation.operators_out) ? pair.activation.operators_out : []) as unknown as Person[];
        } else if (pair.activation.module_type === "heist_activation" && pair.activation.operators_involved) {
          operators = (Array.isArray(pair.activation.operators_involved) ? pair.activation.operators_involved : []) as unknown as Person[];
        }

        // Calcola la durata usando i tempi corretti
        if (pair.activation.activation_time && pair.deactivation.deactivation_time) {
          try {
            const [actHours, actMinutes] = pair.activation.activation_time.split(':').map(Number);
            const [deactHours, deactMinutes] = pair.deactivation.deactivation_time.split(':').map(Number);
            
            const actTotalMinutes = actHours * 60 + actMinutes;
            let deactTotalMinutes = deactHours * 60 + deactMinutes;
            
            // Se la disattivazione è il giorno dopo (orario inferiore all'attivazione)
            if (deactTotalMinutes < actTotalMinutes) {
              deactTotalMinutes += 24 * 60;
            }
            
            durationMinutes = deactTotalMinutes - actTotalMinutes;
            
            console.log(`Coppia valida - Attivazione: ${pair.activation.activation_time}, Disattivazione: ${pair.deactivation.deactivation_time}, Durata: ${durationMinutes} minuti, Operatori:`, operators.map(o => o.name));
          } catch (e) {
            console.error("Errore nel calcolo della durata:", e, pair);
          }
        } else {
          console.warn("Coppia senza tempi di attivazione/disattivazione:", {
            activation_time: pair.activation.activation_time,
            deactivation_time: pair.deactivation.deactivation_time,
            activation_id: pair.activation.id,
            deactivation_id: pair.deactivation.id
          });
        }

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

          if (durationMinutes > 0) {
            existing.totalMinutes += durationMinutes;
          }
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

      console.log("Statistiche finali:", enrichedStats);
      setStats(enrichedStats);
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Dirigenza
          </h1>
          <p className="text-muted-foreground">
            Statistiche di attivazione degli operatori ordinate per grado
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Classifica Operatori</CardTitle>
            </div>
            <CardDescription>
              Tempi totali di attivazione e numero di interventi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                  </div>
                ))}
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium mb-2">
                  Nessuna statistica disponibile
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Crea turni di attivazione/disattivazione per visualizzare le statistiche
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      #{index + 1}
                    </div>
                    
                    {/* Avatar e Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={stat.avatarUrl} alt={stat.operator} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {stat.operator.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {stat.operator}
                        </h3>
                        <Badge variant="outline" className="text-xs font-normal mt-1">
                          {stat.qualification}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {stat.hours}h {stat.minutes}m
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tempo Totale
                        </div>
                      </div>
                      
                      <div className="h-10 w-px bg-border" />
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {stat.activations}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Attivazioni
                        </div>
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
