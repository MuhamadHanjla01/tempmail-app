import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MailAPI, Account, Message } from '@/lib/mail-api';

interface TempMailState {
  account: Account | null;
  token: string | null;
  password: string | null;
  messages: Message[];
  selectedMessageId: string | null;
  readMessageIds: string[];
  isLoading: boolean;
  isAutoRefreshEnabled: boolean;
  
  // Actions
  generateNewAccount: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  selectMessage: (id: string) => void;
  deleteMessage: (id: string) => Promise<void>;
  toggleAutoRefresh: () => void;
  restoreSession: () => Promise<void>;
  clearSession: () => void;
}

export const useTempMail = create<TempMailState>()(
  persist(
    (set, get) => ({
      account: null,
      token: null,
      password: null,
      messages: [],
      selectedMessageId: null,
      readMessageIds: [],
      isLoading: false,
      isAutoRefreshEnabled: true,

      generateNewAccount: async () => {
        set({ isLoading: true });
        try {
          const domains = await MailAPI.getDomains();
          if (domains.length === 0) throw new Error("No domains available");
          
          const domain = domains[0].domain;
          const randomString = Math.random().toString(36).substring(2, 10);
          const address = `user_${randomString}@${domain}`;
          const password = Math.random().toString(36).substring(2, 15);

          const account = await MailAPI.createAccount(address, password);
          const { token } = await MailAPI.getToken(address, password);
          
          set({
            account,
            token,
            password,
            messages: [],
            selectedMessageId: null,
            readMessageIds: [],
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to generate account:", error);
          set({ isLoading: false });
        }
      },

      fetchMessages: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const messages = await MailAPI.getMessages(token);
          set({ messages });
        } catch (error) {
          console.error("Failed to fetch messages:", error);
          // If token is invalid or account deleted, clear session
          if (error instanceof Error && (error.message.includes("Unauthorized") || error.message.includes("Not Found"))) {
            get().clearSession();
          }
        }
      },

      selectMessage: (id: string) => {
        const { readMessageIds } = get();
        set({
          selectedMessageId: id,
          readMessageIds: readMessageIds.includes(id) ? readMessageIds : [...readMessageIds, id],
        });
      },

      deleteMessage: async (id: string) => {
        const { token, messages, selectedMessageId } = get();
        if (!token) return;

        try {
          await MailAPI.deleteMessage(id, token);
          set({
            messages: messages.filter(m => m.id !== id),
            selectedMessageId: selectedMessageId === id ? null : selectedMessageId,
          });
        } catch (error) {
          console.error("Failed to delete message:", error);
        }
      },

      toggleAutoRefresh: () => {
        set((state) => ({ isAutoRefreshEnabled: !state.isAutoRefreshEnabled }));
      },

      restoreSession: async () => {
        const { token, account } = get();
        if (!token || !account) {
          await get().generateNewAccount();
          return;
        }

        try {
          set({ isLoading: true });
          await MailAPI.getMe(token); // Verify account is still active
          await get().fetchMessages();
          set({ isLoading: false });
        } catch (error) {
          console.error("Session invalid, creating new one:", error);
          await get().generateNewAccount();
        }
      },

      clearSession: () => {
        set({
          account: null,
          token: null,
          password: null,
          messages: [],
          selectedMessageId: null,
          readMessageIds: [],
        });
      },
    }),
    {
      name: 'tempmail-storage',
      partialize: (state) => ({
        account: state.account,
        token: state.token,
        password: state.password,
        readMessageIds: state.readMessageIds,
        isAutoRefreshEnabled: state.isAutoRefreshEnabled,
      }),
    }
  )
);
