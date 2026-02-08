import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20", className)}>
    {children}
  </span>
);