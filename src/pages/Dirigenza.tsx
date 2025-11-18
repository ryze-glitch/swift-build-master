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
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl glass">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dirigenza
              </h1>
              <p className="text-sm text-muted-foreground">
                Statistiche di attivazione degli operatori ordinate per grado
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="glass rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl glass">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Classifica Operatori</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Tempi totali di attivazione e numero di interventi
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card/30">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
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
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex p-4 rounded-2xl glass">
                  <Users className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-base md:text-lg font-medium text-muted-foreground">
                    Nessuna statistica disponibile
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground/70 max-w-md mx-auto px-4">
                    Le statistiche verranno generate automaticamente quando gli operatori completano attivazioni con orari registrati
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-card/50 hover:bg-card border border-border/30 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Position Badge */}
                      <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full glass font-bold text-sm text-primary flex-shrink-0">
                        #{index + 1}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-primary/20 flex-shrink-0">
                        <AvatarImage src={stat.avatarUrl} alt={stat.operator} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                          {stat.operator.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Operator Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm md:text-base truncate">
                          {stat.operator}
                        </p>
                        <Badge variant="outline" className="text-[10px] md:text-xs mt-0.5 border-primary/30">
                          ⭐ {stat.qualification}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="text-right">
                        <div className="font-bold text-primary text-base md:text-lg">
                          {formatTime(stat.hours, stat.minutes)}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">
                          Tempo
                        </div>
                      </div>
                      <div className="h-8 w-px bg-border/50"></div>
                      <div className="text-right min-w-[50px]">
                        <div className="font-bold text-base md:text-lg">
                          {stat.activations}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">
                          Interventi
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auth Logs Section */}
        <div className="glass rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl glass">
                <LogIn className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Log Accessi</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Cronologia login e logout degli operatori
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            {authLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>Nessun log disponibile</p>
              </div>
            ) : (
              <div className="space-y-2">
                {authLogs.map((log) => {
                  const operator = getOperatorByDiscordTag(log.discord_tag);
                  const isLogin = log.event_type === 'login';
                  
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-card/50 hover:bg-card border border-border/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isLogin ? (
                          <LogIn className="w-4 h-4 md:w-5 md:h-5 text-success flex-shrink-0" />
                        ) : (
                          <LogOut className="w-4 h-4 md:w-5 md:h-5 text-destructive flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm md:text-base truncate">
                              {operator?.name || log.discord_tag || 'Utente sconosciuto'}
                            </p>
                            {operator && (
                              <Badge variant="outline" className="text-[10px] border-primary/30 flex-shrink-0">
                                {operator.qualification}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {log.discord_tag}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant={isLogin ? "default" : "destructive"} className="text-[10px] md:text-xs">
                          {isLogin ? 'Login' : 'Logout'}
                        </Badge>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
