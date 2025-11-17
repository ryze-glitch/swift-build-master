import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import operatoriData from "@/data/operatori_reparto.json";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Menu, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-mobile";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    { id: "credits" as Page, icon: "fa-award", label: "Crediti" },
    ...(isAdmin ? [{ id: "dirigenza" as Page, icon: "fa-lock", label: "Dirigenza" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 glass-strong border-b shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo e titolo a sinistra */}
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/B6E4u1X.png" 
              alt="UOPI Logo" 
              className="w-12 h-12 rounded-xl shadow-glow"
            />
            {isDesktop && (
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  U.O.P.I. - IPRP X
                </span>
                <span className="text-xs text-muted-foreground">
                  Unità Operativa di Primo Intervento
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          {isDesktop ? (
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onPageChange(item.id)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 group whitespace-nowrap ${
                        currentPage === item.id
                          ? "text-primary bg-primary/10 shadow-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <i className={`fas ${item.icon}`}></i>
                      <span className="text-sm">{item.label}</span>
                      {item.id === "announcements" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          ) : (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg glass hover:bg-muted/50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          {/* User Info a destra - Solo Desktop */}
          {isDesktop && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 glass rounded-lg px-3 py-2 hover:bg-muted/50 transition-all duration-300"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-glow">
                    {userProfile?.discord_tag?.charAt(0) || "U"}
                  </div>
                  {showGreenDot && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background shadow-glow"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">
                    {userProfile?.discord_tag || "Caricamento..."}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <Shield className="h-3 w-3" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        Operatore
                      </>
                    )}
                  </div>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-fade-in">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-glow">
                        {userProfile?.discord_tag?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">
                          {userProfile?.discord_tag || "Utente"}
                        </div>
                        <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs mt-1">
                          {isAdmin ? "Admin" : "Operatore"}
                        </Badge>
                      </div>
                    </div>
                    {getOperatorInfo() && (
                      <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <div><span className="font-semibold">Reparto:</span> {getOperatorInfo().reparto}</div>
                        <div><span className="font-semibold">Qualifica:</span> {getOperatorInfo().qualifica}</div>
                        <div><span className="font-semibold">Badge:</span> {getOperatorInfo().badge}</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Esci
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {!isDesktop && isMobileMenuOpen && (
          <div className="mt-3 glass-strong rounded-2xl p-3 animate-fade-in">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                    currentPage === item.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span className="text-sm">{item.label}</span>
                  {item.id === "announcements" && unreadCount > 0 && (
                    <span className="ml-auto bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User Info Mobile */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-glow">
                    {userProfile?.discord_tag?.charAt(0) || "U"}
                  </div>
                  {showGreenDot && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    {userProfile?.discord_tag || "Caricamento..."}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <Shield className="h-3 w-3" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        Operatore
                      </>
                    )}
                  </div>
                </div>
              </div>
              {getOperatorInfo() && (
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <div><span className="font-semibold">Reparto:</span> {getOperatorInfo().reparto}</div>
                  <div><span className="font-semibold">Qualifica:</span> {getOperatorInfo().qualifica}</div>
                  <div><span className="font-semibold">Badge:</span> {getOperatorInfo().badge}</div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                Esci
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
