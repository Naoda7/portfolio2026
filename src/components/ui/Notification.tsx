import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
    error: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
  };

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md 
      shadow-lg animate-in slide-in-from-right-full duration-300 min-w-[300px]
      ${styles[type]}
    `}>
      <span className="shrink-0">{icons[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-foreground/10 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}