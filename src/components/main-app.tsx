"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import type { Account, Message, MessageDetails } from "@/lib/mail";
import { createAccount, getMessages, getMessage } from "@/lib/mail";
import AppHeader from "@/components/header";
import InboxView from "@/components/inbox-view";
import EmailView from "@/components/email-view";
import { cn } from "@/lib/utils";

const POLLING_INTERVAL = 10000; // 10 seconds
const TIMER_MINUTES = 10;

export default function MainApp() {
  const [account, setAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetails | null>(
    null
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const { toast } = useToast();

  const handleExpire = useCallback(() => {
    toast({
      title: "Email Expired",
      description: "Generating a new temporary email address.",
      variant: "destructive",
    });
    generateNewEmail();
  }, [toast]);

  const { timeLeft, resetTimer } = useTimer(TIMER_MINUTES, handleExpire);

  const generateNewEmail = useCallback(async () => {
    setIsGenerating(true);
    setMessages([]);
    setSelectedMessage(null);
    setSelectedMessageId(null);
    setAccount(null);
    try {
      const newAccount = await createAccount();
      setAccount(newAccount);
      resetTimer();
      toast({
        title: "New Email Generated!",
        description: "Your new temporary email is ready to use.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Generating Email",
        description: `Failed to generate a new email: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [resetTimer, toast]);

  useEffect(() => {
    generateNewEmail();
  }, [generateNewEmail]);

  useEffect(() => {
    if (!account?.token) return;

    const fetchMsgs = async () => {
      if(!account?.token) return;
      setIsFetchingMessages(true);
      try {
        const newMessages = await getMessages(account.token);
        
        const newMessagesIds = new Set(newMessages.map(m => m.id));
        const currentMessagesIds = new Set(messages.map(m => m.id));
        
        if (newMessages.length !== messages.length || !Array.from(newMessagesIds).every(id => currentMessagesIds.has(id))) {
          setMessages(newMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsFetchingMessages(false);
      }
    };

    fetchMsgs();
    const intervalId = setInterval(fetchMsgs, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [account?.token, messages]);

  const handleSelectMessage = async (messageId: string) => {
    if (!account?.token || isFetchingDetails) return;
    
    if (selectedMessageId === messageId && selectedMessage) return;

    setIsFetchingDetails(true);
    setSelectedMessageId(messageId);
    setSelectedMessage(null);

    try {
      const fullMessage = await getMessage(account.token, messageId);
      setSelectedMessage(fullMessage);
    } catch (error) {
      toast({
        title: "Error Fetching Email",
        description: "Could not fetch email content. Please try again.",
        variant: "destructive",
      });
      setSelectedMessageId(null);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleDeselect = () => {
    setSelectedMessage(null);
    setSelectedMessageId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <AppHeader
        email={account?.address || ""}
        onNewEmail={generateNewEmail}
        onExtend={resetTimer}
        timeLeft={timeLeft}
        isGenerating={isGenerating}
      />
      <main className="flex-1 flex overflow-hidden">
        <div
          className={cn(
            "w-full md:w-[400px] lg:w-[450px] md:flex-shrink-0 border-r h-full overflow-y-auto",
            selectedMessageId && "hidden md:block"
          )}
        >
          <InboxView
            messages={messages}
            onSelectMessage={handleSelectMessage}
            selectedId={selectedMessageId}
            isLoading={isFetchingMessages || isGenerating}
          />
        </div>
        <div
          className={cn(
            "flex-1 h-full overflow-y-auto",
            !selectedMessageId && "hidden md:flex"
          )}
        >
          <EmailView
            message={selectedMessage}
            isLoading={isFetchingDetails}
            onBack={handleDeselect}
          />
        </div>
      </main>
    </div>
  );
}
