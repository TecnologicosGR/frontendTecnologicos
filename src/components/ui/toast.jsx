import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from "../../lib/utils";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:max-w-[420px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} {...t} onRemove={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const toastVariants = {
  default: "bg-background border-border text-foreground",
  success: "bg-green-500/15 border-green-500/30 text-green-700 dark:text-green-400",
  destructive: "bg-destructive/15 border-destructive/30 text-destructive",
};

const icons = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
};

const ToastItem = ({ id, title, description, variant, onRemove }) => {
  const Icon = icons[variant] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        toastVariants[variant]
      )}
    >
        <div className="flex gap-3">
             <Icon className={cn("h-5 w-5", variant === 'default' ? "text-primary" : "currentColor")} />
             <div className="grid gap-1">
                {title && <div className="text-sm font-semibold">{title}</div>}
                {description && <div className="text-sm opacity-90">{description}</div>}
             </div>
        </div>
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-md p-1 pl-2 pb-2 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// Also export a simpler interface for direct usage if needed elsewhere, 
// though hook is preferred.
