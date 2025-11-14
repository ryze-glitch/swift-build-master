import { Card } from "@/components/ui/card";
import { Car, DollarSign } from "lucide-react";

interface ModuleSelectorProps {
  onSelectModule: (moduleType: string) => void;
  onCancel: () => void;
}

export const ModuleSelector = ({ onSelectModule }: ModuleSelectorProps) => {
  const modules = [
    {
      type: "patrol_activation",
      icon: Car,
      title: "🚓・Modulo Attivazione Pattugliamento",
      color: "border-success hover:bg-success/10",
    },
    {
      type: "patrol_deactivation",
      icon: Car,
      title: "🚓・Modulo Disattivazione Pattugliamento",
      color: "border-destructive hover:bg-destructive/10",
    },
    {
      type: "heist_activation",
      icon: DollarSign,
      title: "💰・Modulo Attivazione Grandi Rapine",
      color: "border-success hover:bg-success/10",
    },
    {
      type: "heist_deactivation",
      icon: DollarSign,
      title: "💰・Modulo Disattivazione Grandi Rapine",
      color: "border-destructive hover:bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Seleziona Tipo di Modulo</h3>
        <p className="text-sm text-muted-foreground">
          Scegli il tipo di turno da creare
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modules.map((module) => (
          <Card
            key={module.type}
            className={`p-6 cursor-pointer transition-all border-2 ${module.color} hover:shadow-lg`}
            onClick={() => onSelectModule(module.type)}
          >
            <div className="flex items-center gap-4">
              <module.icon className="h-7 w-7" />
              <span className="font-semibold text-lg">{module.title}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
