import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export const DropdownMenu = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 mt-2 w-56 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
              align === 'right' ? "right-0 origin-top-right" : "left-0 origin-top-left"
            )}
          >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {React.Children.map(children, (child) => {
                 // Clone child to pass close handler if needed, or just render
                 return React.cloneElement(child, {
                    onClick: (e) => {
                        child.props.onClick && child.props.onClick(e);
                        setIsOpen(false);
                    }
                 });
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ children, onClick, active, className, icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center px-4 py-2 text-sm text-left transition-colors",
        active ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50",
        className
      )}
      role="menuitem"
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export const DropdownLabel = ({ children }) => (
    <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {children}
    </div>
);

export const DropdownSeparator = () => (
    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
);
