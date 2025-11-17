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

interface HeistActivationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const HeistActivationForm = ({ onSubmit, onCancel }: HeistActivationFormProps) => {
  const [coordinator, setCoordinator] = useState<Person | null>(null);
  const [negotiator, setNegotiator] = useState<Person | null>(null);
  const [activationTime, setActivationTime] = useState("");
  const [interventionType, setInterventionType] = useState("");
  const [operatorsInvolved, setOperatorsInvolved] = useState<Person[]>([]);

  const personnel: Person[] = operatoriData.operators.map((op) => ({
    id: op.matricola,
    name: op.name,
    role: op.qualification,
  }));

  const handleAddOperator = (personId: string) => {
    if (operatorsInvolved.length >= 15) return;
    const person = personnel.find((p) => p.id === personId);
    if (person && !operatorsInvolved.find((p) => p.id === person.id)) {
      setOperatorsInvolved([...operatorsInvolved, person]);
    }
  };

  const handleRemoveOperator = (personId: string) => {
    setOperatorsInvolved(operatorsInvolved.filter((p) => p.id !== personId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (operatorsInvolved.length < 6) {
      alert("Seleziona almeno 6 operatori coinvolti");
      return;
    }

    onSubmit({
      module_type: "heist_activation",
      coordinator,
      negotiator,
      activation_time: activationTime,
      intervention_type: interventionType,
      operators_involved: operatorsInvolved,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Coordinatore (Max 1)</Label>
          <Select
            value={coordinator?.id || ""}
            onValueChange={(value) => {
              const person = personnel.find((p) => p.id === value);
              setCoordinator(person || null);
            }}
          >
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder="Seleziona coordinatore" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {personnel.map((person) => (
                <SelectItem key={person.id} value={person.id} className="text-sm">
                  {person.name} - {person.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {coordinator && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {coordinator.name}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Contrattatore (Max 1)</Label>
          <Select
            value={negotiator?.id || ""}
            onValueChange={(value) => {
              const person = personnel.find((p) => p.id === value);
              setNegotiator(person || null);
            }}
          >
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder="Seleziona contrattatore" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {personnel.map((person) => (
                <SelectItem key={person.id} value={person.id} className="text-sm">
                  {person.name} - {person.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {negotiator && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {negotiator.name}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="activationTime" className="text-sm font-medium">Orario di Attivazione</Label>
          <Input
            id="activationTime"
            type="time"
            value={activationTime}
            onChange={(e) => setActivationTime(e.target.value)}
            required
            className="h-10 sm:h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo di Intervento</Label>
          <Select value={interventionType} onValueChange={setInterventionType}>
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="rapina_gioielleria" className="text-sm">
                Rapina Gioielleria
              </SelectItem>
              <SelectItem value="rapina_banca" className="text-sm">
                Rapina Banca Centrale
              </SelectItem>
              <SelectItem value="rapina_villa" className="text-sm">
                Rapina Villa
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Operatori Coinvolti (Min 6, Max 15)</Label>
          <Select
            value=""
            onValueChange={handleAddOperator}
            disabled={operatorsInvolved.length >= 15}
          >
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder="Aggiungi operatore" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {personnel
                .filter((p) => !operatorsInvolved.find((op) => op.id === p.id))
                .map((person) => (
                  <SelectItem key={person.id} value={person.id} className="text-sm">
                    {person.name} - {person.role}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {operatorsInvolved.map((person) => (
              <Badge key={person.id} variant="secondary" className="gap-2 text-xs">
                {person.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveOperator(person.id)}
                />
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {operatorsInvolved.length}/15 operatori selezionati (minimo 6)
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="text-sm">
            Annulla
          </Button>
          <Button type="submit" className="text-sm">Salva Modulo</Button>
        </div>
      </form>
    </div>
  );
};
