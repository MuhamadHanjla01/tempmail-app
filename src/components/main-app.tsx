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
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [favoriteAddresses, setFavoriteAddresses] = useState<string[]>([]);

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
    setIsGenerating(true);
    setIsLoading(true);
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

  
  const fetchMsgs = useCallback(async (isInitial: boolean = false) => {
      if(!account?.token) return;
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsPolling(true);
      }
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
        if (isInitial) {
            setIsLoading(false);
        } else {
            setIsPolling(false);
        }
      }
    }, [account?.token, messages.length, toast]);
    
  // Load favorite addresses from local storage on initial render
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("favoriteAddresses");
      if (storedFavorites) {
        setFavoriteAddresses(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorite addresses from local storage", error);
    }
    generateNewEmail();
  }, []);

  // Save favorite addresses to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("favoriteAddresses", JSON.stringify(favoriteAddresses));
    } catch (error) {
       console.error("Failed to save favorite addresses to local storage", error);
    }
  }, [favoriteAddresses]);
  
  useEffect(() => {
    if (!account?.token || isGenerating) return;
    
    // Fetch immediately after generation
    if (messages.length === 0) {
        fetchMsgs(true);
    }
    
    const intervalId = setInterval(() => fetchMsgs(false), POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [account?.token, isGenerating, fetchMsgs, messages.length]);


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
  
  const handleToggleFavoriteAddress = () => {
    if (!account?.address) return;
    
    setFavoriteAddresses(prev => {
        if (prev.includes(account.address)) {
            toast({ title: "Address Removed", description: "Removed from your favorite addresses."});
            return prev.filter(addr => addr !== account.address);
        } else {
            toast({ title: "Address Favorited!", description: "Saved to your favorite addresses."});
            return [...prev, account.address];
        }
    })
  }
  
  const isCurrentAddressFavorite = account?.address ? favoriteAddresses.includes(account.address) : false;

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground font-sans">
        <AppHeader
          email={account?.address || ""}
          onNewEmail={generateNewEmail}
          timeLeft={timeLeft}
          isGenerating={isGenerating}
          onToggleFavorite={handleToggleFavoriteAddress}
          isFavorite={isCurrentAddressFavorite}
          favoriteAddresses={favoriteAddresses}
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
              isLoading={isLoading || (isGenerating && messages.length === 0)}
              isPolling={isPolling}
              onRefresh={() => fetchMsgs(true)}
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
    </>
  );
}
