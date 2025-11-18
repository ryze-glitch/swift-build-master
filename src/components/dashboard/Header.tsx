import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import operatoriData from "@/data/operatori_reparto.json";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-mobile";

type Page = "dashboard" | "personnel" | "shifts" | "announcements" | "status" | "dirigenza";

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { isOnline } = useOnlineStatus();
  
  // Show green dot only when on dashboard page and online
  const showGreenDot = currentPage === "dashboard" && user && isOnline(user.id);

  const getOperatorInfo = () => {
    if (!userOperator) return null;
    return userOperator;
  };

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
    ...(isAdmin ? [{ id: "dirigenza" as Page, icon: "fa-lock", label: "Dirigenza" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 glass-strong border-b shadow-lg">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo a sinistra */}
          <div className="flex-shrink-0">
            <img 
              src="https://i.imgur.com/B6E4u1X.png" 
              alt="UOPI Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-glow transition-transform hover:scale-110"
            />
          </div>

          {/* Navigation - Centrata */}
          <nav className="flex items-center gap-1.5 glass rounded-3xl px-2 py-1.5 sm:px-3 sm:py-2 border border-border/50">
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`
                      group relative flex items-center font-medium
                      transition-all duration-300 ease-out overflow-hidden
                      ${isDesktop 
                        ? 'w-[60px] h-[50px] rounded-2xl hover:w-[140px] hover:justify-start hover:pl-5 justify-center' 
                        : 'w-10 h-10 rounded-xl sm:w-12 sm:h-12 justify-center'
                      }
                      ${currentPage === item.id 
                        ? 'bg-primary/20 text-primary shadow-glow' 
                        : 'bg-background/50 hover:bg-primary/10 text-muted-foreground hover:text-primary'
                      }
                    `}
                  >
                    <i className={`fas ${item.icon} text-base sm:text-lg flex-shrink-0 flex items-center justify-center`}></i>
                    {isDesktop && (
                      <span className="opacity-0 max-w-0 whitespace-nowrap text-sm ml-2 font-medium group-hover:opacity-100 group-hover:max-w-[100px] transition-all duration-300 overflow-hidden">
                        {item.label}
                      </span>
                    )}
                    {/* Badge notifiche solo su announcements */}
                    {item.id === "announcements" && unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground z-10">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          {/* User Section - Compatto su mobile */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 glass hover:glass-strong rounded-full pr-2 sm:pr-4 pl-1 sm:pl-2 py-1 sm:py-2 transition-all duration-300 group"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                    {userOperator?.avatarUrl ? (
                      <img 
                        src={userOperator.avatarUrl} 
                        alt={userOperator?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    )}
                  </div>
                </div>
                {/* Pallino online/offline basato su presenza reale */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                  showGreenDot ? "bg-success" : "bg-muted-foreground/40"
                }`}></div>
              </div>

              {/* User Info - Hidden su mobile molto piccolo */}
              <div className="hidden md:block text-left">
                <p className="text-xs sm:text-sm font-bold truncate max-w-[120px]">
                  {userOperator?.name || user?.email}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-muted-foreground">
                    {isAdmin ? "Dirigenza" : "Operatore"}
                  </p>
                  {/* Mostra il grado solo da desktop */}
                  {isDesktop && userOperator?.rank && (
                    <>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {userOperator.rank}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Dropdown Icon */}
              <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''} hidden sm:block`}></i>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl shadow-2xl border overflow-hidden z-50 animate-scale-in">
                  <div className="p-4 border-b bg-gradient-to-br from-card to-card/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                        {userOperator?.avatarUrl ? (
                          <img 
                            src={userOperator.avatarUrl} 
                            alt={userOperator?.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{userOperator?.name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">{getOperatorInfo()?.matricola || user?.email}</p>
                    </div>
                  </div>
                  {isAdmin ? (
                    <Badge variant="default" className="text-xs bg-amber-500/20 text-amber-500 border-amber-500/30">
                      <i className="fas fa-crown w-3 h-3 mr-1"></i>
                      Dirigenza
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      Operatore
                    </Badge>
                  )}
                </div>

                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-left group"
                  >
                    <i className="fas fa-sign-out-alt text-sm group-hover:scale-110 transition-transform"></i>
                    <span className="text-sm font-semibold">Logout</span>
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
