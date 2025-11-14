import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import operatoriData from "@/data/operatori_reparto.json";

interface Person {
  id: string;
  name: string;
  role: string;
}

interface PatrolActivationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PatrolActivationForm = ({ onSubmit, onCancel }: PatrolActivationFormProps) => {
  const [managedBy, setManagedBy] = useState<Person | null>(null);
  const [activationTime, setActivationTime] = useState("");
  const [interventionType, setInterventionType] = useState("");
  const [vehicleUsed, setVehicleUsed] = useState("");
  const [operatorsOut, setOperatorsOut] = useState<Person[]>([]);

  const personnel: Person[] = operatoriData.operators.map((op) => ({
    id: op.matricola,
    name: op.name,
    role: op.qualification,
  }));

  const handleAddOperator = (personId: string) => {
    if (operatorsOut.length >= 2) return;
    const person = personnel.find((p) => p.id === personId);
    if (person && !operatorsOut.find((p) => p.id === person.id)) {
      setOperatorsOut([...operatorsOut, person]);
    }
  };

  const handleRemoveOperator = (personId: string) => {
    setOperatorsOut(operatorsOut.filter((p) => p.id !== personId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      module_type: "patrol_activation",
      managed_by: managedBy,
      activation_time: activationTime,
      intervention_type: interventionType,
      vehicle_used: vehicleUsed,
      operators_out: operatorsOut,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Gestito da (Max 1)</Label>
        <Select
          value={managedBy?.id || ""}
          onValueChange={(value) => {
            const person = personnel.find((p) => p.id === value);
            setManagedBy(person || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona operatore" />
          </SelectTrigger>
          <SelectContent>
            {personnel.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name} - {person.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {managedBy && (
          <Badge variant="secondary" className="mt-2">
            {managedBy.name}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="activationTime">Orario di Attivazione</Label>
        <Input
          id="activationTime"
          type="time"
          value={activationTime}
          onChange={(e) => setActivationTime(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo di Intervento</Label>
        <Select value={interventionType} onValueChange={setInterventionType}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pattugliamento_cittadino">
              Pattugliamento Cittadino/Intervento Rapine
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Veicolo Utilizzato</Label>
        <Select value={vehicleUsed} onValueChange={setVehicleUsed}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona veicolo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jeep_cherokee">Jeep Cherokee</SelectItem>
            <SelectItem value="land_rover_defender">Land Rover Defender</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Operatori in Uscita (Max 2)</Label>
        <Select
          value=""
          onValueChange={handleAddOperator}
          disabled={operatorsOut.length >= 2}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aggiungi operatore" />
          </SelectTrigger>
          <SelectContent>
            {personnel
              .filter((p) => !operatorsOut.find((op) => op.id === p.id))
              .map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name} - {person.role}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {operatorsOut.map((person) => (
            <Badge key={person.id} variant="secondary" className="gap-2">
              {person.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveOperator(person.id)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Salva Modulo</Button>
      </div>
    </form>
  );
};
