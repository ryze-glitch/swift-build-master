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
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-4 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => {
        const config = notificationConfig[notification.type];
        
        return (
          <div
            key={notification.id}
            className="glass-strong rounded-2xl p-5 shadow-2xl animate-in slide-in-from-right duration-500 pointer-events-auto border"
          >
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: `${config.color}20`,
                  boxShadow: `0 0 20px ${config.color}40`
                }}
              >
                <i 
                  className={`fas ${config.icon} text-xl`}
                  style={{ color: config.color }}
                ></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold truncate">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex-shrink-0">
                    {getTimeSince(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors flex-shrink-0"
              >
                <i className="fas fa-times text-muted-foreground"></i>
              </button>
            </div>

            <div 
              className="absolute bottom-0 left-6 right-6 h-1 rounded-full"
              style={{ backgroundColor: config.color }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};
