import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import operatoriData from "@/data/operatori_reparto.json";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Page = "dashboard" | "personnel" | "shifts" | "announcements" | "status" | "credits" | "dirigenza";

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Header = ({ currentPage, onPageChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userOperator, setUserOperator] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
        
        // Find operator by discord_tag
        const operator = operatoriData.operators.find(
          op => op.discordTag === data.discord_tag
        );
        setUserOperator(operator);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { id: "dashboard" as Page, icon: "fa-chart-line", label: "Panoramica" },
    { id: "personnel" as Page, icon: "fa-users", label: "Gerarchia" },
    { id: "shifts" as Page, icon: "fa-calendar-alt", label: "Turni" },
    { id: "announcements" as Page, icon: "fa-bullhorn", label: "Comunicati" },
    { id: "status" as Page, icon: "fa-wave-square", label: "Status" },
    { id: "credits" as Page, icon: "fa-award", label: "Crediti" },
    ...(isAdmin ? [{ id: "dirigenza" as Page, icon: "fa-lock", label: "Dirigenza" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 glass-strong border-b shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {/* Left Emblem */}
            <img 
              src="https://i.imgur.com/4T6qvKV.png" 
              alt="U.O.P.I. Emblem" 
              className="w-12 h-12 rounded-full shadow-lg transition-transform hover:scale-110"
            />

            {/* Logo */}
            <img 
              src="https://i.imgur.com/B6E4u1X.png" 
              alt="IPRP Logo" 
              className="w-14 h-14 rounded-xl shadow-glow transition-transform hover:scale-110"
            />

            {/* Brand */}
            <div className="hidden md:block">
              <h1 className="text-2xl font-extrabold">U.O.P.I.</h1>
              <p className="text-sm text-muted-foreground font-semibold">IPRP X</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 glass rounded-full px-3 py-2">
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-2xl font-semibold
                      transition-all duration-300 group relative overflow-hidden
                      ${currentPage === item.id 
                        ? 'bg-gradient-to-r from-primary/90 to-primary w-40 text-foreground shadow-xl' 
                        : 'w-14 text-muted-foreground hover:text-foreground hover:w-40 hover:bg-secondary'
                      }
                    `}
                  >
                    <div className="relative">
                      <i className={`fas ${item.icon} text-lg flex-shrink-0`}></i>
                      {item.id === "announcements" && unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className={`
                      flex items-center gap-2 whitespace-nowrap transition-all duration-300 text-sm
                      ${currentPage === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}>
                      {item.label}
                      {item.id === "announcements" && unreadCount > 0 && currentPage === item.id && (
                        <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </span>
                  </button>
                </TooltipTrigger>
                {item.id === "announcements" && unreadCount > 0 && currentPage !== item.id && (
                  <TooltipContent side="bottom" className="bg-destructive text-destructive-foreground border-destructive">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive-foreground rounded-full" />
                      <span className="font-semibold">
                        {unreadCount > 9 ? "9+" : unreadCount} {unreadCount === 1 ? "notifica" : "notifiche"}
                      </span>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-2 hover:bg-secondary/50 transition-all"
            >
              {userProfile?.discord_avatar_url ? (
                <img 
                  src={userProfile.discord_avatar_url} 
                  alt="Avatar Discord"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {userProfile?.discord_tag?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold">
                  {userProfile?.discord_tag || user?.email?.split('@')[0]}
                </div>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs h-5 mt-1">
                  {isAdmin ? (
                    <><Shield className="w-3 h-3 mr-1" />Dirigenza</>
                  ) : (
                    <><User className="w-3 h-3 mr-1" />Operatore</>
                  )}
                </Badge>
              </div>
              <i className={`fas fa-chevron-down text-xs transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 glass-strong rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    {userProfile?.discord_avatar_url && (
                      <img 
                        src={userProfile.discord_avatar_url} 
                        alt="Avatar Discord"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{userProfile?.discord_tag || user?.email}</div>
                      <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs h-5 mt-1">
                        {isAdmin ? (
                          <><Shield className="w-3 h-3 mr-1" />Dirigenza</>
                        ) : (
                          <><User className="w-3 h-3 mr-1" />Operatore</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-secondary/50 transition-colors text-left">
                    <i className="fas fa-user-circle"></i>
                    <span>Profilo</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-secondary/50 transition-colors text-left">
                    <i className="fas fa-cog"></i>
                    <span>Impostazioni</span>
                  </button>
                  <hr className="my-2 border-border" />
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-danger/10 text-danger transition-colors text-left"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Esci</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
