import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import operatoriData from "@/data/operatori_reparto.json";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: "urgent" | "info" | "update" | "training" | "regulation" | "promotion" | "sanction";
  acknowledged: boolean;
  tags: string[];
  created_by?: string;
  acknowledgedBy?: string[];
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onAcknowledge: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  isAdmin?: boolean;
}

const categoryConfig = {
  info: { color: "hsl(var(--primary))", icon: "fa-info-circle", label: "Info" },
  update: { color: "hsl(var(--accent))", icon: "fa-sync-alt", label: "Aggiornamenti" },
  regulation: { color: "hsl(217 91% 75%)", icon: "fa-book", label: "Regolamento" },
  training: { color: "hsl(var(--warning))", icon: "fa-graduation-cap", label: "Addestramento" },
  promotion: { color: "hsl(142 71% 70%)", icon: "fa-star", label: "Promozioni" },
  sanction: { color: "hsl(0 84% 78%)", icon: "fa-gavel", label: "Sanzioni" },
  urgent: { color: "hsl(var(--danger))", icon: "fa-exclamation-triangle", label: "Urgente" },
};

export const AnnouncementCard = ({ announcement, onAcknowledge, onDelete, canDelete, isAdmin }: AnnouncementCardProps) => {
  const category = categoryConfig[announcement.category];

  return (
    <div className="glass rounded-2xl p-6 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 space-y-4 relative overflow-hidden border animate-fade-in-up">
      {/* Category Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: category.color }}
      ></div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-2xl sm:text-3xl font-bold flex-1 leading-tight">{announcement.title}</h3>
        <div className="flex items-center gap-2">
          <span 
            className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{ 
              backgroundColor: `${category.color}20`, 
              color: category.color 
            }}
          >
            <i className={`fas ${category.icon}`}></i>
            {category.label}
          </span>
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              title="Elimina comunicato"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <i className="fas fa-user"></i>
          {(() => {
            const operator = operatoriData.operators.find((op: any) => op.discordTag === announcement.author);
            return operator ? operator.name : announcement.author;
          })()}
        </span>
        <span className="flex items-center gap-2">
          <i className="fas fa-calendar"></i>
          {new Date(announcement.date).toLocaleDateString('it-IT')}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {announcement.tags.map((tag, idx) => (
          <span 
            key={idx}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Content */}
      <div 
        className="text-sm text-foreground/90 leading-relaxed prose prose-invert max-w-none [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_a]:transition-colors"
        dangerouslySetInnerHTML={{ __html: announcement.content }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'A') {
            e.preventDefault();
            const href = target.getAttribute('href');
            if (href) window.open(href, '_blank', 'noopener,noreferrer');
          }
        }}
      />

      {/* Acknowledgment */}
      <div className="glass rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              announcement.acknowledged 
                ? 'bg-success/20 text-success' 
                : 'bg-primary/20 text-primary'
            }`}
          >
            <i className={`fas ${announcement.acknowledged ? 'fa-check-circle' : 'fa-envelope'} text-lg`}></i>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">
              {announcement.acknowledged ? 'Presa Visione' : 'Conferma Lettura'}
            </div>
            <div className="text-xs text-muted-foreground">
              {announcement.acknowledged ? 'Letto e confermato' : 'Spunta per confermare'}
            </div>
          </div>
        </div>

        <CustomCheckbox
          id={`acknowledge-${announcement.id}`}
          checked={announcement.acknowledged}
          onChange={onAcknowledge}
          size={1.5}
        />
      </div>


    </div>
  );
};
