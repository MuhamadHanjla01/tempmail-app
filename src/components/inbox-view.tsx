"use client";

import type { Message, Account } from "@/lib/mail";
import { cn } from "@/lib/utils";
import { Inbox, Loader2, RefreshCw, Star, Wifi, WifiOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InboxViewProps = {
  messages: Message[];
  onSelectMessage: (id: string) => void;
  selectedId: string | null;
  isLoading: boolean;
  isPolling: boolean;
  onRefresh: () => void;
  favoriteAccounts: Account[];
  onSwitchToFavorite: (account: Account) => void;
  currentAccount: Account | null;
};

const EmailItemSkeleton = () => (
    <div className="flex items-start space-x-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
        </div>
    </div>
)

export default function InboxView({
  messages,
  onSelectMessage,
  selectedId,
  isLoading,
  isPolling,
  onRefresh,
  favoriteAccounts,
  onSwitchToFavorite,
  currentAccount,
}: InboxViewProps) {

  return (
    <div className="h-full flex flex-col bg-secondary/30">
        <Tabs defaultValue="inbox" className="flex-1 flex flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        Inbox 
                        <span className="text-sm font-normal text-muted-foreground">({messages.length})</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading || isPolling}>
                                    <RefreshCw className={cn("w-5 h-5", (isLoading || isPolling) && "animate-spin")} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Refresh Inbox</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 text-muted-foreground p-2">
                                    {isPolling ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent><p>{isPolling ? "Live polling enabled" : "Polling disabled"}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="favorites">
                        <Star className="w-4 h-4 mr-2"/>
                        Favorites
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="inbox" className="flex-1 overflow-y-auto">
              <div className="p-2 md:p-4 space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                      {Array.from({ length: 7 }).map((_, i) => (
                          <EmailItemSkeleton key={i} />
                      ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground pt-16">
                      <Inbox className="w-16 h-16 mb-4 text-primary/30" />
                      <h3 className="font-semibold text-lg">Your inbox is empty</h3>
                      <p className="text-sm">As soon as you receive an email, it will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2 pr-2">
                      {messages.map((message) => {
                        const fromAddress = message.from.address;
                        const senderName = message.from.name || fromAddress.split('@')[0];
                        const senderInitial = senderName ? senderName[0].toUpperCase() : 'U';
                        const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(senderName)}`;
                        
                        return (
                          <button
                              key={message.id}
                              onClick={() => onSelectMessage(message.id)}
                              className={cn(
                              "w-full text-left p-3 rounded-lg border-2 transition-all",
                              selectedId === message.id
                                  ? "bg-primary/10 border-primary/50 shadow-sm"
                                  : "border-transparent hover:bg-card hover:border-border"
                              )}
                          >
                              <div className="flex items-start gap-4">
                                  <Avatar className="h-10 w-10">
                                      <AvatarImage src={avatarUrl} alt={senderName}/>
                                      <AvatarFallback>{senderInitial}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 truncate">
                                      <div className="flex justify-between items-baseline">
                                          <p className="font-semibold text-sm truncate">{senderName}</p>
                                          <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatDistanceToNow(new Date(message.date), { addSuffix: true })}</p>
                                      </div>
                                      <p className="font-medium text-sm truncate mt-0.5 text-foreground">{message.subject}</p>
                                      <p className="text-xs text-muted-foreground truncate mt-1">{message.intro}</p>
                                  </div>
                              </div>
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="flex-1 overflow-y-auto">
               <div className="p-2 md:p-4 space-y-2">
                 {favoriteAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                        <Star className="w-16 h-16 mb-4 text-primary/30" />
                        <h3 className="font-semibold text-lg">No Favorite Addresses</h3>
                        <p className="text-sm">Click the star next to an email address to save it.</p>
                    </div>
                 ) : (
                    <div className="space-y-2">
                        {favoriteAccounts.map(favAccount => (
                            <Button
                            key={favAccount.address}
                            variant={currentAccount?.address === favAccount.address ? "secondary" : "ghost"}
                            className="w-full h-auto justify-start"
                            onClick={() => onSwitchToFavorite(favAccount)}
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(favAccount.address)}`} />
                                        <AvatarFallback>{favAccount.address[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-mono truncate">{favAccount.address}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                 )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
