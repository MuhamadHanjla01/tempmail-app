'use client';

import { useEffect } from 'react';
import { useTempMail } from '@/hooks/use-temp-mail';
import AppHeader from '@/components/app-header';
import InboxSidebar from '@/components/inbox-sidebar';
import MessageViewer from '@/components/message-viewer';
import { Mail, Plus, RefreshCw } from 'lucide-react';

export default function Home() {
  const { restoreSession, fetchMessages, isAutoRefreshEnabled, generateNewAccount, selectedMessageId, selectMessage } = useTempMail();

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Handle auto-refresh interval
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;
    
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [fetchMessages, isAutoRefreshEnabled]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground font-sans overflow-hidden">
      <AppHeader />

      <main className="flex-1 flex overflow-hidden relative">
        <div className={`w-full md:w-auto md:flex shrink-0 ${selectedMessageId ? 'hidden md:block' : 'block'}`}>
          <InboxSidebar />
        </div>
        
        <div className={`flex-1 overflow-hidden ${selectedMessageId ? 'block' : 'hidden md:flex'}`}>
          <MessageViewer onBack={() => selectMessage(null)} />
        </div>
      </main>

      {/* Mobile Bottom Navigation (App Feel) */}
      <nav className="md:hidden flex items-center justify-between border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3 pb-safe">
        <button 
          onClick={() => selectMessage(null)}
          className={`flex flex-col items-center gap-1 ${!selectedMessageId ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Mail className="h-6 w-6" />
          <span className="text-[10px] font-medium">Inbox</span>
        </button>
        
        <button 
          onClick={() => generateNewAccount()}
          className="flex flex-col items-center justify-center -mt-6 bg-primary text-primary-foreground h-14 w-14 rounded-full shadow-lg border-4 border-background transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
        
        <button 
          onClick={() => fetchMessages()}
          className="flex flex-col items-center gap-1 text-muted-foreground active:text-primary"
        >
          <RefreshCw className="h-6 w-6" />
          <span className="text-[10px] font-medium">Refresh</span>
        </button>
      </nav>
    </div>
  );
}
