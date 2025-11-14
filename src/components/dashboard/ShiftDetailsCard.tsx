import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
}: ShiftDetailsProps) => {
  return (
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
  );
};
