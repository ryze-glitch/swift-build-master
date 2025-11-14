import { useState, useEffect } from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { Card } from "@/components/ui/card";
import { useNotifications } from "@/contexts/NotificationContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface TrainingVote {
  userId: string;
  choice: "presenza" | "assenza";
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: "urgent" | "info" | "update" | "training";
  acknowledged: boolean;
  tags: string[];
  isTraining?: boolean;
  trainingVotes?: TrainingVote[];
}

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newAnnouncementType, setNewAnnouncementType] = useState<"normal" | "training">("normal");
  const [loading, setLoading] = useState(true);
  const { markAsRead } = useNotifications();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  // Fetch announcements from database
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        toast.error("Errore nel caricamento dei comunicati");
      } else {
        const formattedAnnouncements: Announcement[] = (data || []).map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          author: a.author,
          date: a.date,
          category: a.category as any,
          acknowledged: Array.isArray(a.acknowledged_by) && user ? a.acknowledged_by.includes(user.id) : false,
          tags: [],
          isTraining: a.type === "training",
          trainingVotes: a.type === "training" && a.training_votes ? (() => {
            const votes = a.training_votes as any;
            return [
              ...(Array.isArray(votes.presenza) ? votes.presenza : []).map((userId: string) => ({ userId, choice: "presenza" as const })),
              ...(Array.isArray(votes.assenza) ? votes.assenza : []).map((userId: string) => ({ userId, choice: "assenza" as const }))
            ];
          })() : undefined
        }));
        setAnnouncements(formattedAnnouncements);
      }
      setLoading(false);
    };

    fetchAnnouncements();
  }, [user]);

  // Marca tutti i comunicati come letti quando la pagina viene visualizzata
  useEffect(() => {
    if (announcements.length > 0) {
      announcements.forEach(announcement => {
        if (!announcement.acknowledged) {
          markAsRead(announcement.id);
        }
      });
    }
  }, [announcements]);

  const handleAcknowledge = async (id: string) => {
    if (!user) return;

    // Fetch current acknowledgments
    const { data: currentData } = await supabase
      .from("announcements")
      .select("acknowledged_by")
      .eq("id", id)
      .single();

    const currentAcknowledgedBy = Array.isArray(currentData?.acknowledged_by) ? currentData.acknowledged_by : [];
    const newAcknowledgedBy = [...currentAcknowledgedBy, user.id];

    const { error } = await supabase
      .from("announcements")
      .update({ acknowledged_by: newAcknowledgedBy })
      .eq("id", id);

    if (error) {
      console.error("Error acknowledging announcement:", error);
      toast.error("Errore nell'aggiornamento");
    } else {
      setAnnouncements(prev => 
        prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
      );
      markAsRead(id);
    }
  };

  const handleTrainingVote = async (announcementId: string, choice: "presenza" | "assenza") => {
    if (!user) return;

    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement || !announcement.isTraining) return;

    // Get current votes from database
    const { data: currentData } = await supabase
      .from("announcements")
      .select("training_votes")
      .eq("id", announcementId)
      .single();

    const currentVotes: any = currentData?.training_votes || { presenza: [], assenza: [] };
    
    // Remove user from both arrays
    const newPresenza = (Array.isArray(currentVotes.presenza) ? currentVotes.presenza : []).filter((id: string) => id !== user.id);
    const newAssenza = (Array.isArray(currentVotes.assenza) ? currentVotes.assenza : []).filter((id: string) => id !== user.id);

    // Add user to selected choice
    if (choice === "presenza") {
      newPresenza.push(user.id);
    } else {
      newAssenza.push(user.id);
    }

    const newVotes = {
      presenza: newPresenza,
      assenza: newAssenza
    };

    const { error } = await supabase
      .from("announcements")
      .update({ training_votes: newVotes })
      .eq("id", announcementId);

    if (error) {
      console.error("Error voting:", error);
      toast.error("Errore nella votazione");
    } else {
      setAnnouncements(prev => prev.map(a => {
        if (a.id !== announcementId) return a;
        return {
          ...a,
          trainingVotes: [
            ...newPresenza.map((userId: string) => ({ userId, choice: "presenza" as const })),
            ...newAssenza.map((userId: string) => ({ userId, choice: "assenza" as const }))
          ]
        };
      }));
    }
  };

  const getTrainingStats = (votes: TrainingVote[] = []) => {
    const presenzaCount = votes.filter(v => v.choice === "presenza").length;
    const assenzaCount = votes.filter(v => v.choice === "assenza").length;
    const total = votes.length;

    return {
      presenzaCount,
      assenzaCount,
      total,
      presenzaPercentage: total > 0 ? Math.round((presenzaCount / total) * 100) : 0,
      assenzaPercentage: total > 0 ? Math.round((assenzaCount / total) * 100) : 0,
    };
  };

  const getUserVote = (announcement: Announcement): "presenza" | "assenza" | null => {
    if (!announcement.isTraining || !announcement.trainingVotes || !user) return null;
    const vote = announcement.trainingVotes.find(v => v.userId === user.id);
    return vote ? vote.choice : null;
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
          
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tipo Comunicazione</label>
            <div className="flex gap-3">
              <button
                onClick={() => setNewAnnouncementType("normal")}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  newAnnouncementType === "normal" 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <i className="fas fa-bullhorn mr-2"></i>
                Comunicazione Standard
              </button>
              <button
                onClick={() => setNewAnnouncementType("training")}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  newAnnouncementType === "training" 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <i className="fas fa-graduation-cap mr-2"></i>
                Addestramento con Votazione
              </button>
            </div>
          </div>

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
                {newAnnouncementType === "training" && <option value="training">Addestramento</option>}
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
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id}>
            {announcement.isTraining ? (
              <Card className="glass-strong p-6">
                <div className="space-y-4">
                  {/* Training Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                          <i className="fas fa-graduation-cap mr-1"></i>
                          Addestramento
                        </span>
                        <span className="text-sm text-muted-foreground">{new Date(announcement.date).toLocaleDateString('it-IT')}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{announcement.title}</h3>
                      <p className="text-muted-foreground">{announcement.content}</p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <i className="fas fa-user"></i>
                        <span>{announcement.author}</span>
                      </div>
                    </div>
                  </div>

                  {/* Voting Section */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">
                        <i className="fas fa-vote-yea mr-2 text-primary"></i>
                        Conferma Presenza
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {getTrainingStats(announcement.trainingVotes).total} votanti
                      </span>
                    </div>

                    {/* Vote Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <button
                        onClick={() => handleTrainingVote(announcement.id, "presenza")}
                        className={`p-4 rounded-xl font-semibold transition-all ${
                          getUserVote(announcement) === "presenza"
                            ? "bg-green-500 text-white shadow-lg scale-105"
                            : "bg-secondary/50 hover:bg-secondary"
                        }`}
                      >
                        <i className="fas fa-check-circle text-2xl mb-2"></i>
                        <div>Presenza</div>
                      </button>
                      <button
                        onClick={() => handleTrainingVote(announcement.id, "assenza")}
                        className={`p-4 rounded-xl font-semibold transition-all ${
                          getUserVote(announcement) === "assenza"
                            ? "bg-red-500 text-white shadow-lg scale-105"
                            : "bg-secondary/50 hover:bg-secondary"
                        }`}
                      >
                        <i className="fas fa-times-circle text-2xl mb-2"></i>
                        <div>Assenza</div>
                      </button>
                    </div>

                    {/* Results */}
                    <div className="space-y-3">
                      {(() => {
                        const stats = getTrainingStats(announcement.trainingVotes);
                        return (
                          <>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Presenza</span>
                                <span className="text-sm font-bold text-green-500">
                                  {stats.presenzaCount} ({stats.presenzaPercentage}%)
                                </span>
                              </div>
                              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                  style={{ width: `${stats.presenzaPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Assenza</span>
                                <span className="text-sm font-bold text-red-500">
                                  {stats.assenzaCount} ({stats.assenzaPercentage}%)
                                </span>
                              </div>
                              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
                                  style={{ width: `${stats.assenzaPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <AnnouncementCard 
                announcement={announcement}
                onAcknowledge={() => handleAcknowledge(announcement.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
