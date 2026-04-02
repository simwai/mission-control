import { StateCreator } from 'zustand'
import { ChatMessage, Conversation } from '@/types/entities'

export interface ChatSlice {
  chatMessages: ChatMessage[]
  conversations: Conversation[]
  activeConversation: string | null
  chatInput: string
  isSendingMessage: boolean
  chatPanelOpen: boolean
  setChatMessages: (messages: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setChatInput: (input: string) => void
  setIsSendingMessage: (loading: boolean) => void
  setChatPanelOpen: (open: boolean) => void
}

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
  chatMessages: [],
  conversations: [],
  activeConversation: null,
  chatInput: '',
  isSendingMessage: false,
  chatPanelOpen: false,
  setChatMessages: (messages) => set({ chatMessages: messages.slice(-500) }),
  addChatMessage: (message) => set((state) => {
    if (message.id > 0 && state.chatMessages.some(m => m.id === message.id)) return state
    return { chatMessages: [...state.chatMessages, message].slice(-500) }
  }),
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversation: id }),
  setChatInput: (input) => set({ chatInput: input }),
  setIsSendingMessage: (loading) => set({ isSendingMessage: loading }),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
})
