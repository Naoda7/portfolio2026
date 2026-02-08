import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'icon' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-opacity-90 shadow-sm",
      outline: "border border-border bg-transparent hover:bg-muted text-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground text-foreground"
    };

    const sizes = {
      default: "px-4 py-2",
      sm: "px-3 py-1 text-xs",
      lg: "px-8 py-3 text-lg",
      icon: "h-10 w-10"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus:outline-none disabled:opacity-50 active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };