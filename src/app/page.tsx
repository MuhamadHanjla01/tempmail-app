'use client';

import { useEffect } from 'react';
import { useTempMail } from '@/hooks/use-temp-mail';
import AppHeader from '@/components/app-header';
import InboxSidebar from '@/components/inbox-sidebar';
import MessageViewer from '@/components/message-viewer';
import AdSenseAd from '@/components/adsense-ad';

export default function Home() {
  const { restoreSession, fetchMessages, isAutoRefreshEnabled } = useTempMail();

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
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      <AppHeader />
      
      {/* AdSense Ad Unit as requested */}
      <div className="hidden md:flex justify-center border-b bg-muted/30 min-h-[90px] max-h-[90px] w-full overflow-hidden">
        <AdSenseAd 
          adSlot="YYYYYYYYYY" 
          className="w-full max-w-[728px] h-[90px]" 
        />
      </div>

      <main className="flex-1 flex overflow-hidden">
        <InboxSidebar />
        <div className="flex-1 overflow-hidden hidden md:flex">
          <MessageViewer />
        </div>
        
        {/* Simple mobile logic: If a message is selected, show it on mobile, otherwise show inbox.
            For simplicity in this layout, we just hide the viewer on very small screens unless 
            further mobile tab logic is added. But shadcn handles responsiveness well. */}
      </main>
    </div>
  );
}
