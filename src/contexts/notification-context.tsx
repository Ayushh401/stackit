import { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'answer' | 'comment' | 'mention' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  questionId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'answer',
      title: 'New Answer',
      message: 'Someone answered your question about React hooks',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      questionId: '1',
    },
    {
      id: '2',
      type: 'mention',
      title: 'You were mentioned',
      message: '@john mentioned you in an answer',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: false,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}