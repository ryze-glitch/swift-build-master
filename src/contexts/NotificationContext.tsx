import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface NotificationContextType {
  unreadCount: number;
  markAsRead: (announcementId: string) => void;
  addNotification: (announcementId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());

  const unreadCount = unreadIds.size;

  const markAsRead = (announcementId: string) => {
    setUnreadIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(announcementId);
      return newSet;
    });
  };

  const addNotification = (announcementId: string) => {
    setUnreadIds(prev => new Set(prev).add(announcementId));
  };

  const clearAll = () => {
    setUnreadIds(new Set());
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, markAsRead, addNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
