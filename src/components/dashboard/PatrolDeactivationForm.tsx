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

interface PatrolDeactivationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PatrolDeactivationForm = ({ onSubmit, onCancel }: PatrolDeactivationFormProps) => {
  const [operatorsBack, setOperatorsBack] = useState<Person[]>([]);
  const [deactivationTime, setDeactivationTime] = useState("");

  const personnel: Person[] = operatoriData.operators.map((op) => ({
    id: op.matricola,
    name: op.name,
    role: op.qualification,
  }));

  const handleAddOperator = (personId: string) => {
    if (operatorsBack.length >= 2) return;
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
    onSubmit({
      module_type: "patrol_deactivation",
      operators_back: operatorsBack,
      deactivation_time: deactivationTime,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Operatori in Rientro (Max 2)</Label>
          <Select
            value=""
            onValueChange={handleAddOperator}
            disabled={operatorsBack.length >= 2}
          >
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder="Aggiungi operatore" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {personnel
                .filter((p) => !operatorsBack.find((op) => op.id === p.id))
                .map((person) => (
                  <SelectItem key={person.id} value={person.id} className="text-sm">
                    {person.name} - {person.role}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {operatorsBack.map((person) => (
              <Badge key={person.id} variant="secondary" className="gap-2 text-xs">
                {person.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveOperator(person.id)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deactivationTime" className="text-sm font-medium">Orario di Disattivazione</Label>
          <Input
            id="deactivationTime"
            type="time"
            value={deactivationTime}
            onChange={(e) => setDeactivationTime(e.target.value)}
            required
            className="h-10 sm:h-11"
          />
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
