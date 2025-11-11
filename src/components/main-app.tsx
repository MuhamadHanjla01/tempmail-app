"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import type { Account, Message, MessageDetails } from "@/lib/mail";
import { createAccount, getMessages, getMessage, login } from "@/lib/mail";
import AppHeader from "@/components/header";
import InboxView from "@/components/inbox-view";
import EmailView from "@/components/email-view";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [favoriteAccounts, setFavoriteAccounts] = useState<Account[]>([]);
  const [prevFavoritesCount, setPrevFavoritesCount] = useState(0);

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

  const switchAccount = useCallback((newAccount: Account) => {
    setIsGenerating(true);
    setAccount(newAccount);
    setMessages([]);
    setSelectedMessage(null);
    setSelectedMessageId(null);
    resetTimer();
    setIsGenerating(false);
  }, [resetTimer]);


  const generateNewEmail = useCallback(async (isSwitching = false) => {
    if (!isSwitching) {
      setIsGenerating(true);
      setIsLoading(true);
    }
    setMessages([]);
    setSelectedMessage(null);
    setSelectedMessageId(null);
    setAccount(null);
    try {
      const newAccount = await createAccount();
      setAccount(newAccount);
      resetTimer();
      if (!isSwitching) {
        toast({
          title: "New Email Generated!",
          description: "Your new temporary email is ready to use.",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Generating Email",
        description: `Failed to generate a new email: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      if (!isSwitching) {
        setIsGenerating(false);
      }
    }
  }, [resetTimer, toast]);

  const handleSwitchToFavorite = async (favAccount: Account) => {
    if (account?.address === favAccount.address) return;
    setIsGenerating(true);
    try {
      const loggedInAccount = await login(favAccount.address, favAccount.password);
      switchAccount(loggedInAccount);
    } catch(error: any) {
      toast({
        title: "Failed to switch account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  
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
      const storedFavorites = localStorage.getItem("favoriteAccounts");
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavoriteAccounts(parsedFavorites);
        setPrevFavoritesCount(parsedFavorites.length);
      }
    } catch (error) {
      console.error("Failed to load favorite accounts from local storage", error);
    }
    generateNewEmail();
  }, []);

  // Save favorite addresses to local storage and show toast
  useEffect(() => {
    try {
      localStorage.setItem("favoriteAccounts", JSON.stringify(favoriteAccounts));
      if (favoriteAccounts.length > prevFavoritesCount) {
        toast({ title: "Address Favorited!", description: "Saved to your favorite addresses."});
      } else if (favoriteAccounts.length < prevFavoritesCount) {
        toast({ title: "Address Removed", description: "Removed from your favorite addresses."});
      }
      setPrevFavoritesCount(favoriteAccounts.length);
    } catch (error) {
       console.error("Failed to save favorite addresses to local storage", error);
    }
  }, [favoriteAccounts, prevFavoritesCount, toast]);
  
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
    if (!account) return;
    
    setFavoriteAccounts(prev => {
        const isFavorited = prev.some(acc => acc.address === account.address);
        if (isFavorited) {
            return prev.filter(addr => addr.address !== account.address);
        } else {
            return [...prev, account];
        }
    })
  }
  
  const isCurrentAddressFavorite = account?.address ? favoriteAccounts.some(acc => acc.address === account.address) : false;

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground font-sans">
        <AppHeader
          email={account?.address || ""}
          onNewEmail={() => generateNewEmail(false)}
          timeLeft={timeLeft}
          isGenerating={isGenerating}
          onToggleFavorite={handleToggleFavoriteAddress}
          isFavorite={isCurrentAddressFavorite}
          favoriteAddresses={favoriteAccounts.map(acc => acc.address)}
        />
        {favoriteAccounts.length > 0 && (
          <div className="p-3 border-b">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-md flex items-center gap-2"><Star className="w-4 h-4"/> Favorite Addresses</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-wrap gap-2">
                  {favoriteAccounts.map(favAccount => (
                    <Button
                      key={favAccount.address}
                      variant={account?.address === favAccount.address ? "secondary" : "outline"}
                      className="h-auto"
                      onClick={() => handleSwitchToFavorite(favAccount)}
                    >
                      <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{favAccount.address}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
