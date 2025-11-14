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

interface HeistDeactivationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const HeistDeactivationForm = ({ onSubmit, onCancel }: HeistDeactivationFormProps) => {
  const [operatorsBack, setOperatorsBack] = useState<Person[]>([]);
  const [deactivationTime, setDeactivationTime] = useState("");

  const personnel: Person[] = operatoriData.operators.map((op) => ({
    id: op.matricola,
    name: op.name,
    role: op.qualification,
  }));

  const handleAddOperator = (personId: string) => {
    if (operatorsBack.length >= 15) return;
    const person = personnel.find((p) => p.id === personId);
    if (person && !operatorsBack.find((p) => p.id === person.id)) {
      setOperatorsBack([...operatorsBack, person]);
    }
  };

  const handleRemoveOperator = (personId: string) => {
    setOperatorsBack(operatorsBack.filter((p) => p.id !== personId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (operatorsBack.length < 6) {
      alert("Seleziona almeno 6 operatori in rientro");
      return;
    }

    onSubmit({
      module_type: "heist_deactivation",
      operators_back: operatorsBack,
      deactivation_time: deactivationTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Operatori in Rientro (Min 6, Max 15)</Label>
        <Select
          value=""
          onValueChange={handleAddOperator}
          disabled={operatorsBack.length >= 15}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aggiungi operatore" />
          </SelectTrigger>
          <SelectContent>
            {personnel
              .filter((p) => !operatorsBack.find((op) => op.id === p.id))
              .map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name} - {person.role}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {operatorsBack.map((person) => (
            <Badge key={person.id} variant="secondary" className="gap-2">
              {person.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveOperator(person.id)}
              />
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {operatorsBack.length}/15 operatori selezionati (minimo 6)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deactivationTime">Orario di Disattivazione</Label>
        <Input
          id="deactivationTime"
          type="time"
          value={deactivationTime}
          onChange={(e) => setDeactivationTime(e.target.value)}
          required
        />
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
