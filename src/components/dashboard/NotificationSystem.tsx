import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
}

const notificationConfig = {
  success: { color: "hsl(var(--success))", icon: "fa-check-circle" },
  error: { color: "hsl(var(--danger))", icon: "fa-exclamation-circle" },
  warning: { color: "hsl(var(--warning))", icon: "fa-exclamation-triangle" },
  info: { color: "hsl(var(--primary))", icon: "fa-info-circle" },
};

export const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Demo notification
    const demoNotification: Notification = {
      id: "demo-1",
      type: "success",
      title: "Sistema Attivo",
      message: "Dashboard U.O.P.I. operativa e funzionante",
      timestamp: new Date(),
    };
    
    setTimeout(() => {
      setNotifications([demoNotification]);
      setTimeout(() => {
        setNotifications([]);
      }, 5000);
    }, 1000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "ora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min fa`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h fa`;
  };

  return (
    <div className="fixed top-20 right-2 sm:right-6 z-50 flex flex-col gap-2 sm:gap-4 max-w-[calc(100vw-1rem)] sm:max-w-md w-full pointer-events-none">
      {notifications.map((notification) => {
        const config = notificationConfig[notification.type];
        
        return (
          <div
            key={notification.id}
            className="glass-strong rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xl animate-in slide-in-from-right duration-500 pointer-events-auto border"
          >
            <div className="flex gap-2 sm:gap-4">
              <div 
                className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: `${config.color}20`,
                  boxShadow: `0 0 20px ${config.color}40`
                }}
              >
                <i 
                  className={`fas ${config.icon} text-sm sm:text-xl`}
                  style={{ color: config.color }}
                ></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-xs sm:text-sm truncate">{notification.title}</h4>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold flex-shrink-0">
                    {getTimeSince(notification.timestamp)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors flex-shrink-0"
              >
                <i className="fas fa-times text-xs sm:text-sm text-muted-foreground"></i>
              </button>
            </div>

            <div 
              className="absolute bottom-0 left-3 right-3 sm:left-6 sm:right-6 h-0.5 sm:h-1 rounded-full"
              style={{ backgroundColor: config.color }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};
