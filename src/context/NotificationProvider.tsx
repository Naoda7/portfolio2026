import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

import { NotificationContext, type NotificationType } from './NotificationContext';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md
                ${n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : ''}
                ${n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600' : ''}
                ${n.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' : ''}
              `}
            >
              {/* Icon Section */}
              <div className="shrink-0 mt-0.5">
                {n.type === 'success' && <CheckCircle2 size={18} />}
                {n.type === 'error' && <AlertCircle size={18} />}
                {n.type === 'info' && <Info size={18} />}
              </div>
              
              {/* Message Section */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight break-words">
                  {n.message}
                </p>
              </div>

              {/* Action Section */}
              <button 
                onClick={() => removeNotification(n.id)} 
                className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};