import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  checkUserRole: (userId: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        // Error logged server-side, silent fail for user
        return;
      }

      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      // Error logged server-side, silent fail for user
    }
  };

  const checkUserRole = async (userId: string): Promise<string | null> => {
    try {
      // Server-side role validation via RLS-protected query
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Log login event
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('discord_tag')
                .eq('id', session.user.id)
                .single();
              
              await supabase.from('auth_logs').insert({
                user_id: session.user.id,
                discord_tag: profile?.discord_tag || null,
                event_type: 'login'
              });

              // Notify Discord
              try {
                await supabase.functions.invoke('notify-discord-auth', {
                  body: {
                    discord_tag: profile?.discord_tag || session.user.email,
                    event_type: 'login',
                    user_name: profile?.discord_tag || session.user.email,
                    qualification: 'N/A'
                  }
                });
              } catch (err) {
                console.error('Failed to notify Discord:', err);
              }
            }, 0);
          }
          
          // Log logout event
          if (event === 'SIGNED_OUT') {
            setTimeout(async () => {
              const userId = session?.user?.id || user?.id;
              if (!userId) return;

              const { data: profile } = await supabase
                .from('profiles')
                .select('discord_tag')
                .eq('id', userId)
                .single();
              
              await supabase.from('auth_logs').insert({
                user_id: userId,
                discord_tag: profile?.discord_tag || null,
                event_type: 'logout'
              });

              // Notify Discord
              try {
                await supabase.functions.invoke('notify-discord-auth', {
                  body: {
                    discord_tag: profile?.discord_tag || session?.user?.email,
                    event_type: 'logout',
                    user_name: profile?.discord_tag || session?.user?.email,
                    qualification: 'N/A'
                  }
                });
              } catch (err) {
                console.error('Failed to notify Discord:', err);
              }
            }, 0);
          }
          
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else {
          setSubscribed(false);
          setSubscriptionEnd(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
        }, 0);
      }
    });

    // Check subscription every 60 seconds
    const interval = setInterval(() => {
      if (session?.user) {
        checkSubscription();
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Errore durante la registrazione",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Registrazione completata",
      description: "Controlla la tua email per verificare l'account",
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Errore durante l'accesso",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Accesso effettuato",
      description: "Benvenuto!",
    });
  };

  const signOut = async () => {
    try {
      // Log logout event before signing out
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('discord_tag')
          .eq('id', user.id)
          .single();
        
        await supabase.from('auth_logs').insert({
          user_id: user.id,
          discord_tag: profile?.discord_tag || null,
          event_type: 'logout'
        });
      }
    } catch (error) {
      console.error('Error logging logout:', error);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Errore durante il logout",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    setSubscribed(false);
    setSubscriptionEnd(null);
    
    toast({
      title: "Logout effettuato",
      description: "A presto!",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        subscribed,
        subscriptionEnd,
        loading,
        signUp,
        signIn,
        signOut,
        checkSubscription,
        checkUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
