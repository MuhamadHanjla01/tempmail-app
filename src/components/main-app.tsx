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
        title: "New Email Generated",
        description: "Your new temporary email is ready.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
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
      setIsFetchingMessages(true);
      try {
        const newMessages = await getMessages(account.token);
        // Check for new messages before updating state to avoid unnecessary re-renders
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
        }
      } catch (error) {
        // Silent fail for polling
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsFetchingMessages(false);
      }
    };

    fetchMsgs(); // Initial fetch
    const intervalId = setInterval(fetchMsgs, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [account?.token, messages]);

  const handleSelectMessage = async (messageId: string) => {
    if (selectedMessageId === messageId) return;

    if (!account?.token) return;
    setIsFetchingDetails(true);
    setSelectedMessage(null);
    setSelectedMessageId(messageId);
    try {
      const fullMessage = await getMessage(account.token, messageId);
      setSelectedMessage(fullMessage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch email content.",
        variant: "destructive",
      });
      setSelectedMessageId(null); // Deselect on error
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleDeselect = () => {
    setSelectedMessage(null);
    setSelectedMessageId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <AppHeader
        email={account?.address || "Generating..."}
        onNewEmail={generateNewEmail}
        onExtend={resetTimer}
        timeLeft={timeLeft}
        isGenerating={isGenerating}
      />
      <main className="flex-1 flex overflow-hidden">
        <div
          className={cn(
            "w-full md:w-[350px] md:flex-shrink-0 border-r border-border/50 h-full overflow-y-auto",
            selectedMessage && "hidden md:block"
          )}
        >
          <InboxView
            messages={messages}
            onSelectMessage={handleSelectMessage}
            selectedId={selectedMessageId}
            isLoading={isFetchingMessages && messages.length === 0}
          />
        </div>
        <div
          className={cn(
            "flex-1 h-full overflow-y-auto",
            !selectedMessage && "hidden md:flex"
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
