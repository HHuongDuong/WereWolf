import { create } from "zustand";
import { Message } from "@/components/game/chat/types";

interface ChatState {
  globalMessages: Message[];
  wolvesMessages: Message[];
  addGlobalMessage: (message: Message) => void;
  addWolvesMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  globalMessages: [],
  wolvesMessages: [],
  
  addGlobalMessage: (message) =>
    set((state) => ({
      globalMessages: [...state.globalMessages, message],
    })),
  
  addWolvesMessage: (message) =>
    set((state) => ({
      wolvesMessages: [...state.wolvesMessages, message],
    })),
  
  clearMessages: () =>
    set({
      globalMessages: [],
      wolvesMessages: [],
    }),
}));
