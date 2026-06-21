"use client";

import type { Message, Account } from "@/lib/mail";
import { cn } from "@/lib/utils";
import { Inbox, Loader2, RefreshCw, Star, Wifi, WifiOff, Mail, Clock } from "lucide-react";
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
    <div className="flex items-start space-x-4 p-4 animate-pulse">
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
    <div className="h-full flex flex-col bg-secondary/20">
        <Tabs defaultValue="inbox" className="flex-1 flex flex-col">
            <div className="p-4 border-b glass">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Inbox
                        {messages.length > 0 && (
                          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground animate-scale-in">
                            {messages.length}
                          </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={onRefresh}
                                  disabled={isLoading || isPolling}
                                  className="h-9 w-9 rounded-xl hover:bg-primary/10 transition-all"
                                >
                                    <RefreshCw className={cn("w-4 h-4", (isLoading || isPolling) && "animate-spin text-primary")} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Refresh Inbox</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-muted-foreground px-2 py-1.5 rounded-lg bg-secondary/50">
                                    <span className={cn(
                                      "w-2 h-2 rounded-full",
                                      isPolling ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
                                    )} />
                                    <span className="text-[10px] font-medium uppercase tracking-wider">
                                      {isPolling ? "Live" : "Idle"}
                                    </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent><p>{isPolling ? "Live polling active" : "Polling idle"}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <TabsList className="grid w-full grid-cols-2 rounded-xl h-10">
                    <TabsTrigger value="inbox" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
                      <Inbox className="w-3.5 h-3.5" />
                      Inbox
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
                        <Star className="w-3.5 h-3.5" />
                        Favorites
                        {favoriteAccounts.length > 0 && (
                          <span className="text-[10px] bg-muted rounded-full px-1.5 py-0.5">{favoriteAccounts.length}</span>
                        )}
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="inbox" className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-2 md:p-3">
                {isLoading ? (
                  <div className="space-y-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                          <EmailItemSkeleton key={i} />
                      ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground pt-20">
                      <div className="relative">
                        <Inbox className="w-20 h-20 mb-4 text-primary/15 animate-float" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-primary/5 blur-sm" />
                      </div>
                      <h3 className="font-semibold text-lg mt-2">Your inbox is empty</h3>
                      <p className="text-sm mt-1 max-w-[200px]">Emails will appear here as soon as they arrive.</p>
                      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <Clock className="w-3 h-3" />
                        <span>Auto-refreshes every 5s</span>
                      </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 stagger-children">
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
                              "w-full text-left p-3 rounded-xl border transition-all email-item-hover",
                              selectedId === message.id
                                  ? "bg-primary/10 border-primary/30 shadow-sm shadow-primary/10"
                                  : "border-transparent hover:bg-card hover:border-border/50"
                              )}
                          >
                              <div className="flex items-start gap-3">
                                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                                      <AvatarImage src={avatarUrl} alt={senderName}/>
                                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-sm font-bold">{senderInitial}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-baseline gap-2">
                                          <p className="font-semibold text-sm truncate">{senderName}</p>
                                          <p className="text-[11px] text-muted-foreground flex-shrink-0 tabular-nums">
                                            {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                                          </p>
                                      </div>
                                      <p className="font-medium text-sm truncate mt-0.5 text-foreground/90">{message.subject}</p>
                                      <p className="text-xs text-muted-foreground truncate mt-1 leading-relaxed">{message.intro}</p>
                                  </div>
                                  {!message.seen && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-2 animate-pulse-glow" />
                                  )}
                              </div>
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="flex-1 overflow-y-auto scrollbar-hide">
               <div className="p-2 md:p-3">
                 {favoriteAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                        <Star className="w-20 h-20 mb-4 text-yellow-400/20 animate-float" />
                        <h3 className="font-semibold text-lg">No Favorites Yet</h3>
                        <p className="text-sm mt-1 max-w-[220px]">Star an email address to save it for quick access later.</p>
                    </div>
                 ) : (
                    <div className="space-y-2 stagger-children">
                        {favoriteAccounts.map(favAccount => (
                            <Button
                            key={favAccount.address}
                            variant={currentAccount?.address === favAccount.address ? "secondary" : "ghost"}
                            className={cn(
                              "w-full h-auto justify-start rounded-xl py-3 transition-all",
                              currentAccount?.address === favAccount.address && "border border-primary/20 shadow-sm"
                            )}
                            onClick={() => onSwitchToFavorite(favAccount)}
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(favAccount.address)}`} />
                                        <AvatarFallback>{favAccount.address[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-mono truncate block">{favAccount.address}</span>
                                      {currentAccount?.address === favAccount.address && (
                                        <span className="text-[10px] text-primary font-medium">Active</span>
                                      )}
                                    </div>
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
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
