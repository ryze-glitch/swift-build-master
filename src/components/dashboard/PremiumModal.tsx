import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Check, Loader2 } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PremiumModal = ({ open, onOpenChange }: PremiumModalProps) => {
  const { user, subscribed } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per abbonarti",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Errore",
        description: "Impossibile avviare il checkout. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast({
        title: "Errore",
        description: "Impossibile aprire il portale. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    "AI Planner per generazione turni intelligente",
    "Analytics avanzati con grafici in tempo reale",
    "Export illimitati in PDF ed Excel",
    "Report personalizzati e automazioni",
    "Notifiche push prioritarie",
    "Supporto dedicato 24/7",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass-strong">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Piano Premium
          </DialogTitle>
          <DialogDescription className="text-base">
            {subscribed 
              ? "Stai già utilizzando il Piano Premium" 
              : "Sblocca tutte le funzionalità avanzate"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!subscribed && (
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold mb-2">€0.50<span className="text-2xl text-muted-foreground"> una tantum</span></div>
              <p className="text-muted-foreground">Pagamento sicuro gestito da Stripe</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Funzionalità incluse:</h3>
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-success/20 p-1">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            {subscribed ? (
              <Button 
                onClick={handleManageSubscription} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  "Gestisci Abbonamento"
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleUpgrade} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Passa a Premium
                  </>
                )}
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              Pagamento sicuro gestito da Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
