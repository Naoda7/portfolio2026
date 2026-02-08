import { createContext } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);