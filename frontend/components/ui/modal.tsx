"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-bg-overlay/80 backdrop-blur-sm">
      <div 
        className="fixed inset-0 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={cn(
        "relative w-full max-w-lg transform overflow-hidden rounded-sm border border-bg-elevated bg-bg-base/95 p-6 text-left shadow-2xl transition-all shadow-black/50",
        className
      )}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-bg-base transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-wolf-red focus:ring-offset-2"
        >
          <X className="h-5 w-5 text-text-muted hover:text-text-primary" />
          <span className="sr-only">Close</span>
        </button>
        
        {title && (
          <h3 className="font-display text-2xl font-semibold leading-6 text-text-primary mb-2">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="font-body text-sm text-text-secondary mb-4">
            {description}
          </p>
        )}
        
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
