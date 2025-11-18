import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import operatoriData from "@/data/operatori_reparto.json";
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
import { Textarea } from "@/components/ui/textarea";

interface Person {
  id: string;
  name: string;
  role: string;
}

interface ShiftDetailsProps {
  moduleType: string;
  managedBy?: Person | null;
  activationTime?: string | null;
  deactivationTime?: string | null;
  interventionType?: string | null;
  vehicleUsed?: string | null;
  operatorsOut?: Person[] | null;
  operatorsBack?: Person[] | null;
  coordinator?: Person | null;
  negotiator?: Person | null;
  operatorsInvolved?: Person[] | null;
  shiftId: string;
  onAcknowledge?: (shiftId: string) => void;
  initialAcknowledgedBy?: any[];
  onAcknowledgeUpdate?: () => void;
  rejectedBy?: any | null;
  rejectedAt?: string | null;
  rejectedReason?: string | null;
  onReject?: () => void;
}

const formatInterventionType = (type: string): string => {
  const types: Record<string, string> = {
    pattugliamento_cittadino: "Pattugliamento Cittadino/Intervento Rapine",
    gioielleria: "Gioielleria",
    banca_credito_capitolina: "Banca di Credito Capitolina",
    banca_roma: "Banca di Roma",
  };
  return types[type] || type;
};

const formatVehicle = (vehicle: string): string => {
  const vehicles: Record<string, string> = {
    jeep_cherokee: "Jeep Cherokee",
    land_rover_defender: "Land Rover Defender",
  };
  return vehicles[vehicle] || vehicle;
};

export const ShiftDetailsCard = ({
  moduleType,
  managedBy,
  activationTime,
  deactivationTime,
  interventionType,
  vehicleUsed,
  operatorsOut,
  operatorsBack,
  coordinator,
  negotiator,
  operatorsInvolved,
  shiftId,
  onAcknowledge,
  initialAcknowledgedBy = [],
  onAcknowledgeUpdate,
  rejectedBy = null,
  rejectedAt = null,
  rejectedReason = null,
  onReject,
}: ShiftDetailsProps) => {
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [acknowledgedBy, setAcknowledgedBy] = useState<any[]>(initialAcknowledgedBy);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  useEffect(() => {
    setAcknowledgedBy(initialAcknowledgedBy || []);
  }, [initialAcknowledgedBy]);
  
  const isAcknowledgedByUser = acknowledgedBy.some((ack: any) => ack.userId === user?.id);
  
  const handleAcknowledge = async () => {
    if (!user) return;
    
    try {
      // Recupera il profilo dal database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('discord_tag')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Trova l'operatore corrispondente nel JSON usando il discord_tag
      const operator = operatoriData.operators.find(
        op => op.discordTag === profileData?.discord_tag
      );

      // Usa il nome dall'operatori.json, altrimenti fallback
      const userName = operator?.name || profileData?.discord_tag || user.email || "Utente Sconosciuto";
      
      const newAcknowledgement = {
        userId: user.id,
        userName: userName,
        timestamp: new Date().toISOString(),
      };
      
      const updatedAcknowledgements = [...acknowledgedBy, newAcknowledgement];
      
      const { error } = await supabase
        .from('shifts')
        .update({
          acknowledged_by: updatedAcknowledgements,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', shiftId);
      
      if (error) throw error;
      
      setAcknowledgedBy(updatedAcknowledgements);
      if (onAcknowledgeUpdate) onAcknowledgeUpdate();
      
      toast({
        title: "Presa visione confermata",
        description: "La tua conferma è stata salvata con successo.",
      });
    } catch (error) {
      console.error("Errore nella presa visione:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile salvare la presa visione.",
        variant: "destructive",
      });
    }
  };

  const handleRejectConfirm = async () => {
    if (!user || !rejectReason.trim()) {
      toast({
        title: "Errore",
        description: "Il motivo del rifiuto è obbligatorio.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('discord_tag')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      const operator = operatoriData.operators.find(
        op => op.discordTag === profileData?.discord_tag
      );

      const userName = operator?.name || profileData?.discord_tag || user.email || "Dirigenza";
      
      const rejectionData = {
        userId: user.id,
        userName: userName,
        timestamp: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('shifts')
        .update({
          rejected_by: rejectionData,
          rejected_at: new Date().toISOString(),
          rejected_reason: rejectReason.trim()
        })
        .eq('id', shiftId);
      
      if (error) throw error;
      
      setShowRejectDialog(false);
      setRejectReason("");
      if (onAcknowledgeUpdate) onAcknowledgeUpdate();
      
      toast({
        title: "Modulo rifiutato",
        description: "Il modulo è stato rifiutato con successo.",
      });
    } catch (error) {
      console.error("Errore nel rifiuto del modulo:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile rifiutare il modulo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 text-sm">
      {/* Patrol Activation Details */}
      {moduleType === "patrol_activation" && (
        <>
          {managedBy && (
            <div>
              <span className="text-muted-foreground">Gestito da: </span>
              <Badge variant="secondary" className="ml-2">
                {managedBy.name} - {managedBy.role}
              </Badge>
            </div>
          )}
          {activationTime && (
            <div>
              <span className="text-muted-foreground">Orario Attivazione: </span>
              <span className="font-medium">{activationTime}</span>
            </div>
          )}
          {interventionType && (
            <div>
              <span className="text-muted-foreground">Tipo Intervento: </span>
              <span className="font-medium">{formatInterventionType(interventionType)}</span>
            </div>
          )}
          {vehicleUsed && (
            <div>
              <span className="text-muted-foreground">Veicolo: </span>
              <span className="font-medium">{formatVehicle(vehicleUsed)}</span>
            </div>
          )}
          {operatorsOut && operatorsOut.length > 0 && (
            <div>
              <span className="text-muted-foreground block mb-2">Operatori in Uscita:</span>
              <div className="flex flex-wrap gap-2">
                {operatorsOut.map((op) => (
                  <Badge key={op.id} variant="secondary">
                    {op.name} - {op.role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Patrol Deactivation Details */}
      {moduleType === "patrol_deactivation" && (
        <>
          {deactivationTime && (
            <div>
              <span className="text-muted-foreground">Orario Disattivazione: </span>
              <span className="font-medium">{deactivationTime}</span>
            </div>
          )}
          {operatorsBack && operatorsBack.length > 0 && (
            <div>
              <span className="text-muted-foreground block mb-2">Operatori in Rientro:</span>
              <div className="flex flex-wrap gap-2">
                {operatorsBack.map((op) => (
                  <Badge key={op.id} variant="secondary">
                    {op.name} - {op.role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Heist Activation Details */}
      {moduleType === "heist_activation" && (
        <>
          {coordinator && (
            <div>
              <span className="text-muted-foreground">Coordinatore: </span>
              <Badge variant="secondary" className="ml-2">
                {coordinator.name} - {coordinator.role}
              </Badge>
            </div>
          )}
          {negotiator && (
            <div>
              <span className="text-muted-foreground">Contrattatore: </span>
              <Badge variant="secondary" className="ml-2">
                {negotiator.name} - {negotiator.role}
              </Badge>
            </div>
          )}
          {activationTime && (
            <div>
              <span className="text-muted-foreground">Orario Attivazione: </span>
              <span className="font-medium">{activationTime}</span>
            </div>
          )}
          {interventionType && (
            <div>
              <span className="text-muted-foreground">Tipo Intervento: </span>
              <span className="font-medium">{formatInterventionType(interventionType)}</span>
            </div>
          )}
          {operatorsInvolved && operatorsInvolved.length > 0 && (
            <div>
              <span className="text-muted-foreground block mb-2">
                Operatori Coinvolti ({operatorsInvolved.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {operatorsInvolved.map((op) => (
                  <Badge key={op.id} variant="secondary">
                    {op.name} - {op.role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Heist Deactivation Details */}
      {moduleType === "heist_deactivation" && (
        <>
          {deactivationTime && (
            <div>
              <span className="text-muted-foreground">Orario Disattivazione: </span>
              <span className="font-medium">{deactivationTime}</span>
            </div>
          )}
          {operatorsBack && operatorsBack.length > 0 && (
            <div>
              <span className="text-muted-foreground block mb-2">
                Operatori in Rientro ({operatorsBack.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {operatorsBack.map((op) => (
                  <Badge key={op.id} variant="secondary">
                    {op.name} - {op.role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
      
      {/* Stato di rifiuto / presa visione */}
      {rejectedBy ? (
        <div className="mt-4 space-y-2">
          <div className="p-3 border border-destructive/40 bg-destructive/10 rounded-lg text-sm text-destructive flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              Rifiutato da: {rejectedBy.userName || "Dirigenza"}
            </span>
          </div>
          {rejectedReason && (
            <div className="p-3 border border-destructive/40 bg-destructive/10 rounded-lg text-sm text-destructive">
              <span className="font-medium">Motivo: </span>
              <span>{rejectedReason}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {!isAcknowledgedByUser ? (
              <Button 
                onClick={handleAcknowledge}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Presa Visione
              </Button>
            ) : (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">
                  Presa Visione Confermata da: {acknowledgedBy.find((ack: any) => ack.userId === user?.id)?.userName || "Tu"}
                </span>
              </div>
            )}
          </div>

          {isAdmin && !rejectedBy && (
            <Button
              type="button"
              variant="default"
              className="sm:w-auto w-full"
              onClick={() => setShowRejectDialog(true)}
            >
              <X className="w-4 h-4 mr-2" />
              Rifiuto del Modulo
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rifiuto del Modulo</AlertDialogTitle>
            <AlertDialogDescription>
              Inserisci il motivo del rifiuto. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo del rifiuto..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason("")}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Conferma Rifiuto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
