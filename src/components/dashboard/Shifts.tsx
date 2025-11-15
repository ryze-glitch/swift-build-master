import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, CheckCircle2, Clock, Sparkles, Crown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShiftForm } from "./ShiftForm";
import { ModuleSelector } from "./ModuleSelector";
import { PatrolActivationForm } from "./PatrolActivationForm";
import { PatrolDeactivationForm } from "./PatrolDeactivationForm";
import { HeistActivationForm } from "./HeistActivationForm";
import { HeistDeactivationForm } from "./HeistDeactivationForm";
import { ShiftDetailsCard } from "./ShiftDetailsCard";

interface Person {
  id: string;
  name: string;
  role: string;
}

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  role: string;
  status: "scheduled" | "active" | "completed";
  assigned_personnel: Person[];
  created_by: string;
  module_type?: string;
  managed_by?: Person | null;
  activation_time?: string | null;
  deactivation_time?: string | null;
  intervention_type?: string | null;
  vehicle_used?: string | null;
  operators_out?: Person[] | null;
  operators_back?: Person[] | null;
  coordinator?: Person | null;
  negotiator?: Person | null;
  operators_involved?: Person[] | null;
  acknowledged_by?: any[];
}

const statusConfig = {
  active: { 
    color: "bg-success/10 text-success", 
    icon: <CheckCircle2 className="h-3 w-3" />, 
    label: "In Corso" 
  },
  completed: { 
    color: "bg-muted text-muted-foreground", 
    icon: <CheckCircle2 className="h-3 w-3" />, 
    label: "Completato" 
  },
  scheduled: { 
    color: "bg-warning/10 text-warning", 
    icon: <Clock className="h-3 w-3" />, 
    label: "Programmato" 
  },
};

export const Shifts = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "scheduled">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModuleType, setSelectedModuleType] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadShifts();

    // Setup realtime subscription
    const channel = supabase
      .channel('shifts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shifts'
        },
        () => {
          loadShifts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadShifts = async () => {
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;

      setShifts(
        data.map((shift) => ({
          id: shift.id,
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          role: shift.role,
          status: shift.status as "scheduled" | "active" | "completed",
          assigned_personnel: (shift.assigned_personnel as any) || [],
          created_by: shift.created_by,
          module_type: shift.module_type,
          managed_by: shift.managed_by as any,
          activation_time: shift.activation_time,
          deactivation_time: shift.deactivation_time,
          intervention_type: shift.intervention_type,
          vehicle_used: shift.vehicle_used,
          operators_out: shift.operators_out as any,
          operators_back: shift.operators_back as any,
          coordinator: shift.coordinator as any,
          negotiator: shift.negotiator as any,
          operators_involved: shift.operators_involved as any,
          acknowledged_by: shift.acknowledged_by as any,
        }))
      );
    } catch (error) {
      console.error("Error loading shifts:", error);
      toast.error("Errore nel caricamento dei turni");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (moduleData: any) => {
    try {
      const { error } = await supabase.from("shifts").insert({
        name: getModuleName(moduleData.module_type),
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        role: moduleData.module_type,
        status: "active",
        module_type: moduleData.module_type,
        managed_by: moduleData.managed_by || null,
        intervention_type: moduleData.intervention_type || null,
        vehicle_used: moduleData.vehicle_used || null,
        operators_out: moduleData.operators_out || null,
        operators_back: moduleData.operators_back || null,
        coordinator: moduleData.coordinator || null,
        negotiator: moduleData.negotiator || null,
        operators_involved: moduleData.operators_involved || null,
        activation_time: moduleData.activation_time || null,
        deactivation_time: moduleData.deactivation_time || null,
        assigned_personnel: [],
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success("Modulo creato con successo");
      setIsDialogOpen(false);
      setSelectedModuleType(null);
      loadShifts();
    } catch (error) {
      console.error("Error creating shift:", error);
      toast.error("Errore nella creazione del modulo");
    }
  };

  const getModuleName = (moduleType: string): string => {
    const names: Record<string, string> = {
      patrol_activation: "🚓 Attivazione Pattugliamento",
      patrol_deactivation: "🚓 Disattivazione Pattugliamento",
      heist_activation: "💰 Attivazione Grandi Rapine",
      heist_deactivation: "💰 Disattivazione Grandi Rapine",
    };
    return names[moduleType] || "Modulo Turno";
  };

  const handleUpdateShift = async (shiftData: {
    name: string;
    start_time: string;
    end_time: string;
    role: string;
    status: string;
    assigned_personnel: Person[];
  }) => {
    if (!editingShift) return;

    try {
      const { error } = await supabase
        .from("shifts")
        .update({
          name: shiftData.name,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          role: shiftData.role,
          status: shiftData.status,
          assigned_personnel: shiftData.assigned_personnel as any,
        })
        .eq("id", editingShift.id);

      if (error) throw error;

      toast.success("Turno aggiornato con successo");
      setIsDialogOpen(false);
      setEditingShift(null);
      loadShifts();
    } catch (error) {
      console.error("Error updating shift:", error);
      toast.error("Errore nell'aggiornamento del turno");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!isAdmin) {
      toast.error("Solo la dirigenza può eliminare i moduli");
      return;
    }

    try {
      const { error } = await supabase.from("shifts").delete().eq("id", shiftId);

      if (error) throw error;

      toast.success("Modulo eliminato con successo");
      setDeleteConfirmOpen(false);
      setShiftToDelete(null);
      loadShifts();
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Errore nell'eliminazione del turno");
    }
  };

  const openCreateDialog = () => {
    setEditingShift(null);
    setSelectedModuleType(null);
    setIsDialogOpen(true);
  };

  const handleModuleSelect = (moduleType: string) => {
    setSelectedModuleType(moduleType);
  };

  const handleAcknowledge = async (shiftId: string) => {
    toast.success("Presa visione registrata");
  };

  const filteredShifts =
    filter === "all" ? shifts : shifts.filter((shift) => shift.status === filter);

  const stats = {
    total: shifts.length,
    active: shifts.filter((s) => s.status === "active").length,
    completed: shifts.filter((s) => s.status === "completed").length,
    scheduled: shifts.filter((s) => s.status === "scheduled").length,
  };

  if (loading) {
    return <div className="p-6">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Turni di Servizio</h2>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Planner
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Turno
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Totali</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold">{stats.active}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">In Corso</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Completati</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Calendar className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold">{stats.scheduled}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Programmati</p>
        </div>
      </div>

      {/* Premium AI Banner */}
      <div className="bg-gradient-to-r from-warning/10 to-transparent border border-warning/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ottimizzazione AI dei Turni</h3>
              <p className="text-sm text-muted-foreground">
                Lascia che l'AI organizzi automaticamente i turni
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Crown className="h-4 w-4" />
            Sblocca Premium
          </Button>
        </div>
      </div>


      {/* Shifts List */}
      <div className="space-y-4">
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nessun turno trovato
          </div>
        ) : (
          <>
            {filteredShifts.reduce((acc: { date: string; shifts: Shift[] }[], shift) => {
              const shiftDate = new Date(shift.start_time).toLocaleDateString("it-IT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              
              const existingGroup = acc.find(group => group.date === shiftDate);
              if (existingGroup) {
                existingGroup.shifts.push(shift);
              } else {
                acc.push({ date: shiftDate, shifts: [shift] });
              }
              return acc;
            }, []).map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px bg-border flex-1" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
                    {group.date}
                  </h3>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{shift.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Calendar className="inline-block h-4 w-4 mr-1" />
                            {new Date(shift.start_time).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            statusConfig[shift.status].color
                          }`}
                        >
                          {statusConfig[shift.status].icon}
                          {statusConfig[shift.status].label}
                        </div>
                      </div>

                      {shift.module_type && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <ShiftDetailsCard
                            moduleType={shift.module_type}
                            managedBy={shift.managed_by}
                            activationTime={shift.activation_time}
                            deactivationTime={shift.deactivation_time}
                            interventionType={shift.intervention_type}
                            vehicleUsed={shift.vehicle_used}
                            operatorsOut={shift.operators_out}
                            operatorsBack={shift.operators_back}
                            coordinator={shift.coordinator}
                            negotiator={shift.negotiator}
                            operatorsInvolved={shift.operators_involved}
                            shiftId={shift.id}
                            onAcknowledge={handleAcknowledge}
                            initialAcknowledgedBy={shift.acknowledged_by}
                            onAcknowledgeUpdate={loadShifts}
                          />
                        </div>
                      )}

                      {isAdmin && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => handleDeleteShift(shift.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setSelectedModuleType(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingShift 
                ? "Modifica Turno" 
                : selectedModuleType 
                ? getModuleName(selectedModuleType)
                : "Seleziona Tipo di Modulo"}
            </DialogTitle>
          </DialogHeader>
          
          {!selectedModuleType && !editingShift && (
            <ModuleSelector
              onSelectModule={handleModuleSelect}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}

          {selectedModuleType === "patrol_activation" && !editingShift && (
            <PatrolActivationForm
              onSubmit={handleCreateShift}
              onCancel={() => {
                setSelectedModuleType(null);
                setIsDialogOpen(false);
              }}
            />
          )}

          {selectedModuleType === "patrol_deactivation" && !editingShift && (
            <PatrolDeactivationForm
              onSubmit={handleCreateShift}
              onCancel={() => {
                setSelectedModuleType(null);
                setIsDialogOpen(false);
              }}
            />
          )}

          {selectedModuleType === "heist_activation" && !editingShift && (
            <HeistActivationForm
              onSubmit={handleCreateShift}
              onCancel={() => {
                setSelectedModuleType(null);
                setIsDialogOpen(false);
              }}
            />
          )}

          {selectedModuleType === "heist_deactivation" && !editingShift && (
            <HeistDeactivationForm
              onSubmit={handleCreateShift}
              onCancel={() => {
                setSelectedModuleType(null);
                setIsDialogOpen(false);
              }}
            />
          )}

          {editingShift && (
            <ShiftForm
              onSubmit={handleUpdateShift}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingShift(null);
              }}
              initialData={{
                name: editingShift.name,
                start_time: editingShift.start_time,
                end_time: editingShift.end_time,
                role: editingShift.role,
                status: editingShift.status,
                assigned_personnel: editingShift.assigned_personnel,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione Modulo</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo modulo? Questa azione non può essere annullata.
              Solo i membri della dirigenza possono eliminare i moduli.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShiftToDelete(null);
            }}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => shiftToDelete && handleDeleteShift(shiftToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};