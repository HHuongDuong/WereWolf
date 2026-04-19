"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, X, Info } from "lucide-react";

export interface ToastProps {
  message: string | null;
  type?: "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "error", onClose }: ToastProps) {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-10 duration-300">
      <div className={cn(
        "flex items-center gap-3 rounded-sm px-4 py-3 shadow-2xl backdrop-blur-md border min-w-[300px]",
        type === "error" 
          ? "bg-danger-red/10 border-danger-red/30 text-danger-red" 
          : "bg-village-gold/10 border-village-gold/30 text-village-gold"
      )}>
        {type === "error" ? <AlertCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
        <p className="font-body text-sm font-medium flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
