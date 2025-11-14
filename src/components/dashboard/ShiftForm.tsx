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
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import operatoriData from "@/data/operatori_reparto.json";

interface Person {
  id: string;
  name: string;
  role: string;
}

interface ShiftFormProps {
  onSubmit: (shift: {
    name: string;
    start_time: string;
    end_time: string;
    role: string;
    status: string;
    assigned_personnel: Person[];
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    start_time: string;
    end_time: string;
    role: string;
    status: string;
    assigned_personnel: Person[];
  };
}

export const ShiftForm = ({ onSubmit, onCancel, initialData }: ShiftFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [startTime, setStartTime] = useState(initialData?.start_time || "");
  const [endTime, setEndTime] = useState(initialData?.end_time || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [status, setStatus] = useState(initialData?.status || "scheduled");
  const [selectedPersonnel, setSelectedPersonnel] = useState<Person[]>(
    initialData?.assigned_personnel || []
  );

  const personnel: Person[] = operatoriData.operators.map((op) => ({
    id: op.matricola,
    name: op.name,
    role: op.role,
  }));

  const handleAddPersonnel = (personId: string) => {
    const person = personnel.find((p) => p.id === personId);
    if (person && !selectedPersonnel.find((p) => p.id === person.id)) {
      setSelectedPersonnel([...selectedPersonnel, person]);
    }
  };

  const handleRemovePersonnel = (personId: string) => {
    setSelectedPersonnel(selectedPersonnel.filter((p) => p.id !== personId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      start_time: startTime,
      end_time: endTime,
      role,
      status,
      assigned_personnel: selectedPersonnel,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Turno</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es: Turno Mattina"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Inizio</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Fine</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Ruolo</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Es: Vigilanza"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Stato</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Programmato</SelectItem>
            <SelectItem value="active">In Corso</SelectItem>
            <SelectItem value="completed">Completato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="personnel">Assegna Operatori</Label>
        <Select onValueChange={handleAddPersonnel}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona dalla gerarchia" />
          </SelectTrigger>
          <SelectContent>
            {personnel
              .filter((p) => !selectedPersonnel.find((sp) => sp.id === p.id))
              .map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name} - {person.role}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPersonnel.length > 0 && (
        <div className="space-y-2">
          <Label>Operatori Assegnati</Label>
          <div className="flex flex-wrap gap-2">
            {selectedPersonnel.map((person) => (
              <Badge key={person.id} variant="secondary" className="pl-3 pr-1">
                {person.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 ml-1 hover:bg-transparent"
                  onClick={() => handleRemovePersonnel(person.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Salva Turno
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
      </div>
    </form>
  );
};