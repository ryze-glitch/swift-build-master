import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, LogIn, LogOut } from "lucide-react";
import operatoriData from "@/data/operatori_reparto.json";
import { Separator } from "@/components/ui/separator";

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

interface AuthLog {
  id: string;
  user_id: string;
  discord_tag: string | null;
  event_type: 'login' | 'logout';
  created_at: string;
}

export default function Dirigenza() {
  const [stats, setStats] = useState<ActivationStats[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivationStats();
    loadAuthLogs();
  }, []);

  const formatTime = (hours: number, minutes: number) => {
    return `${hours}h ${minutes}m`;
  };

  const loadAuthLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuthLogs((data || []) as AuthLog[]);
    } catch (error) {
      console.error('Errore caricamento log:', error);
    }
  };

  const getOperatorByDiscordTag = (discordTag: string | null) => {
    if (!discordTag) return null;
    return operatoriData.operators.find(op => op.discordTag === discordTag);
  };

  const loadActivationStats = async () => {
    try {
      const { data: shifts, error } = await supabase
        .from("shifts")
        .select("*")
        .in("module_type", ["patrol_activation", "patrol_deactivation", "heist_activation", "heist_deactivation"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("Shifts caricati:", shifts?.length || 0);
      console.log("Tutti gli shifts:", shifts);

      // Raggruppa shifts per coppia attivazione-disattivazione
      const activationPairs: Array<{ activation: any; deactivation: any }> = [];
      
      shifts?.forEach((shift) => {
        if (shift.module_type === "patrol_activation" || shift.module_type === "heist_activation") {
          // Questo è un turno di attivazione, cerchiamo la sua disattivazione
          const deactivationType = shift.module_type.replace('activation', 'deactivation');
          
          // Ottieni gli operatori dall'attivazione
          let activationOperators: Person[] = [];
          if (shift.module_type === "patrol_activation" && shift.operators_out) {
            activationOperators = (Array.isArray(shift.operators_out) ? shift.operators_out : []) as unknown as Person[];
          } else if (shift.module_type === "heist_activation" && shift.operators_involved) {
            activationOperators = (Array.isArray(shift.operators_involved) ? shift.operators_involved : []) as unknown as Person[];
          }
          
          // Cerca la disattivazione corrispondente
          const matchingDeactivation = shifts?.find((s) => {
            if (s.module_type !== deactivationType) return false;
            
            // Ottieni gli operatori dalla disattivazione
            let deactivationOperators: Person[] = [];
            if (s.module_type === "patrol_deactivation" && s.operators_back) {
              deactivationOperators = (Array.isArray(s.operators_back) ? s.operators_back : []) as unknown as Person[];
            } else if (s.module_type === "heist_deactivation" && s.operators_involved) {
              deactivationOperators = (Array.isArray(s.operators_involved) ? s.operators_involved : []) as unknown as Person[];
            }
            
            // Controlla se gli operatori coincidono
            const activationIds = activationOperators.map((o: Person) => o.id).sort().join(',');
            const deactivationIds = deactivationOperators.map((o: Person) => o.id).sort().join(',');
            
            // Devono essere gli stessi operatori e la disattivazione deve essere dopo l'attivazione
            return activationIds === deactivationIds && 
                   new Date(s.created_at) > new Date(shift.created_at);
          });
          
          if (matchingDeactivation && shift.activation_time && matchingDeactivation.deactivation_time) {
            activationPairs.push({
              activation: shift,
              deactivation: matchingDeactivation
            });
          }
        }
      });

      console.log("Coppie di attivazione/disattivazione trovate:", activationPairs.length);

      // Calcola le statistiche per operatore
      const statsMap = new Map<string, ActivationStats>();

      activationPairs.forEach((pair) => {
        let operators: Person[] = [];
        let durationMinutes = 0;
        
        // Prendi gli operatori dall'attivazione
        if (pair.activation.module_type === "patrol_activation" && pair.activation.operators_out) {
          operators = (Array.isArray(pair.activation.operators_out) ? pair.activation.operators_out : []) as unknown as Person[];
        } else if (pair.activation.module_type === "heist_activation" && pair.activation.operators_involved) {
          operators = (Array.isArray(pair.activation.operators_involved) ? pair.activation.operators_involved : []) as unknown as Person[];
        }

        // Calcola la durata usando i tempi corretti
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl space-y-8">
        {/* Header con gradiente */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-lexend font-bold text-foreground tracking-tight">
                Dirigenza
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Statistiche di attivazione degli operatori ordinate per grado
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card con design migliorato */}
        <Card className="glass-strong border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-br from-card to-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-semibold">Classifica Operatori</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Tempi totali di attivazione e numero di interventi
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-card/30">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="hidden md:block">
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-muted/30">
                  <Users className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-muted-foreground">
                    Nessuna statistica disponibile
                  </p>
                  <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                    Le statistiche verranno generate automaticamente quando gli operatori completano attivazioni con orari registrati
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="group relative flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Decorazione gradiente su hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    
                    <div className="relative flex items-center gap-3 md:gap-4 flex-1">
                      {/* Position Badge */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-bold text-primary border border-primary/20 flex-shrink-0">
                        #{index + 1}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12 md:w-14 md:h-14 border-2 border-border shadow-md flex-shrink-0">
                        <AvatarImage src={stat.avatarUrl} alt={stat.operator} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {stat.operator.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Operator Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base md:text-lg text-foreground truncate">
                          {stat.operator}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1 border-primary/30">
                          ⭐ {stat.qualification}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats - Layout migliorato per mobile */}
                    <div className="relative flex items-center gap-4 md:gap-6 justify-between md:justify-end ml-14 md:ml-0">
                      <div className="text-center md:text-right">
                        <div className="font-bold text-primary text-xl md:text-2xl">
                          {formatTime(stat.hours, stat.minutes)}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Tempo Totale
                        </div>
                      </div>
                      <div className="h-10 w-px bg-border/50 hidden md:block"></div>
                      <div className="text-center md:text-right min-w-[60px]">
                        <div className="font-bold text-foreground text-xl md:text-2xl">
                          {stat.activations}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Interventi
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auth Logs Section */}
        <Card className="glass-strong border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-br from-card to-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <LogIn className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-semibold">Log Accessi</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Cronologia login e logout degli operatori
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {authLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nessun log disponibile</p>
              </div>
            ) : (
              <div className="space-y-2">
                {authLogs.map((log) => {
                  const operator = getOperatorByDiscordTag(log.discord_tag);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:border-primary/40 transition-all"
                    >
                      <div className={`p-2 rounded-lg ${log.event_type === 'login' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {log.event_type === 'login' ? (
                          <LogIn className="w-4 h-4 text-success" />
                        ) : (
                          <LogOut className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      
                      {operator && (
                        <Avatar className="w-10 h-10 border-2 border-border">
                          <AvatarImage src={operator.avatarUrl} alt={operator.name} />
                          <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{operator?.name || log.discord_tag || 'Sconosciuto'}</p>
                          {operator?.qualification && (
                            <Badge variant="secondary" className="text-xs">
                              {operator.qualification}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {log.discord_tag || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{new Date(log.created_at).toLocaleDateString('it-IT')}</p>
                        <p>{new Date(log.created_at).toLocaleTimeString('it-IT')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
