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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const POLLING_INTERVAL = 5000; // 5 seconds
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
  const [showNewEmailDialog, setShowNewEmailDialog] = useState(false);

  const { toast } = useToast();

  const handleExpire = useCallback(() => {
    toast({
      title: "Email Expired",
      description: "Generating a new temporary email address.",
      variant: "destructive",
    });
    generateNewEmail();
  }, [toast]);

  const { timeLeft, resetTimer, isRunning } = useTimer(TIMER_MINUTES, handleExpire);

  const generateNewEmail = useCallback(async () => {
    setShowNewEmailDialog(false);
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

  const extendSession = () => {
    resetTimer();
    toast({
      title: "Session Extended!",
      description: `Your session has been extended by ${TIMER_MINUTES} minutes.`,
    })
  }

  useEffect(() => {
    generateNewEmail();
  }, []);

  useEffect(() => {
    if (!account?.token || !isRunning) return;

    const fetchMsgs = async () => {
      if(!account?.token) return;
      setIsFetchingMessages(true);
      try {
        const newMessages = await getMessages(account.token);
        
        if (newMessages.length > messages.length) {
           const latestMessage = newMessages[0];
            toast({
              title: "New Email Received!",
              description: `From: ${latestMessage.from.name || latestMessage.from.address} - ${latestMessage.subject}`,
            });
        }
        setMessages(newMessages);

      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsFetchingMessages(false);
      }
    };

    const intervalId = setInterval(fetchMsgs, POLLING_INTERVAL);
    // initial fetch
    fetchMsgs();

    return () => clearInterval(intervalId);
  }, [account?.token, isRunning, toast]);

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
    <>
      <div className="flex flex-col h-screen bg-background text-foreground font-sans">
        <AppHeader
          email={account?.address || ""}
          onNewEmail={() => setShowNewEmailDialog(true)}
          onExtend={extendSession}
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
              isLoading={isFetchingMessages && messages.length === 0}
              isPolling={isFetchingMessages}
            />
          </div>
          <div
            className={cn(
              "flex-1 h-full",
              !selectedMessageId && "hidden md:flex"
            )}
          >
            <EmailView
              message={selectedMessage}
              isLoading={isFetchingDetails}
              onBack={handleDeselect}
              token={account?.token}
            />
          </div>
        </main>
      </div>

      <AlertDialog open={showNewEmailDialog} onOpenChange={setShowNewEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new temporary email address. All emails from the current address will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={generateNewEmail}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
