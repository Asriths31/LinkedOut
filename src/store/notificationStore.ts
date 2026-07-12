import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (message: string, type?: NotificationItem['type']) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message, type = 'info') => {
    const newItem: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ notifications: [newItem, ...state.notifications] }));
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
  clearAll: () => set({ notifications: [] }),
}));
