import { useState } from "react";
import { AnnouncementCard } from "./AnnouncementCard";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: "urgent" | "info" | "update";
  acknowledged: boolean;
  tags: string[];
}

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Riunione Operativa Mensile",
    content: "Si comunica che la riunione operativa mensile si terrà il 15 del mese corrente alle ore 10:00 presso la sala conferenze.",
    author: "Comando",
    date: "2025-01-10",
    category: "urgent",
    acknowledged: false,
    tags: ["Riunione", "Operativo"],
  },
  {
    id: "2",
    title: "Aggiornamento Protocolli",
    content: "Sono stati aggiornati i protocolli operativi standard. Consultare la sezione documentazione per i dettagli.",
    author: "Amministrazione",
    date: "2025-01-08",
    category: "update",
    acknowledged: true,
    tags: ["Protocolli", "Documentazione"],
  },
  {
    id: "3",
    title: "Formazione Obbligatoria",
    content: "Tutti gli agenti operativi sono tenuti a completare il corso di formazione entro fine mese.",
    author: "Formazione",
    date: "2025-01-05",
    category: "info",
    acknowledged: false,
    tags: ["Formazione", "Operativo"],
  },
];

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isComposing, setIsComposing] = useState(false);

  const handleAcknowledge = (id: string) => {
    setAnnouncements(prev => 
      prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
    );
  };

  const stats = {
    total: announcements.length,
    unread: announcements.filter(a => !a.acknowledged).length,
    urgent: announcements.filter(a => a.category === "urgent").length,
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold">Comunicazioni</h2>
            <p className="text-muted-foreground">
              Centro comunicazioni e annunci del reparto operativo
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
                <i className="fas fa-bullhorn"></i>
                Aggiornamenti
              </span>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Progresso lettura</span>
              <span className="text-sm font-bold text-primary">{Math.round((stats.total - stats.unread) / stats.total * 100)}%</span>
            </div>
            <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${(stats.total - stats.unread) / stats.total * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.total - stats.unread} di {stats.total} comunicazioni lette
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Totali", value: stats.total, icon: "fa-list", color: "primary" },
          { label: "Da Leggere", value: stats.unread, icon: "fa-envelope", color: "warning" },
          { label: "Urgenti", value: stats.urgent, icon: "fa-exclamation-triangle", color: "danger" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</span>
              <i className={`fas ${stat.icon} text-2xl`} style={{ color: `hsl(var(--${stat.color}))` }}></i>
            </div>
            <div className="text-3xl font-extrabold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Compose Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsComposing(!isComposing)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <i className="fas fa-plus mr-2"></i>
          Nuova Comunicazione
        </button>
      </div>

      {/* Compose Form */}
      {isComposing && (
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-bold">Nuova Comunicazione</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Titolo</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Categoria</label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="info">Info</option>
                <option value="urgent">Urgente</option>
                <option value="update">Aggiornamento</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contenuto</label>
            <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setIsComposing(false)} className="px-5 py-2.5 rounded-xl bg-secondary font-semibold hover:bg-secondary/70 transition-colors">
              Annulla
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all">
              <i className="fas fa-paper-plane mr-2"></i>
              Pubblica
            </button>
          </div>
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((announcement) => (
          <AnnouncementCard 
            key={announcement.id} 
            announcement={announcement}
            onAcknowledge={() => handleAcknowledge(announcement.id)}
          />
        ))}
      </div>
    </div>
  );
};
