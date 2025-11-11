"use client";

import type { Message } from "@/lib/mail";
import { cn } from "@/lib/utils";
import { Inbox, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type InboxViewProps = {
  messages: Message[];
  onSelectMessage: (id: string) => void;
  selectedId: string | null;
  isLoading: boolean;
};

const EmailItemSkeleton = () => (
    <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
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
}: InboxViewProps) {

  return (
    <div className="p-2 md:p-4 space-y-2 h-full flex flex-col bg-secondary/30">
       <div className="flex items-center justify-between p-2">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            Inbox 
        </h2>
        {isLoading && messages.length > 0 && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
       </div>

      {isLoading && messages.length === 0 ? (
        <div className="space-y-2 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <EmailItemSkeleton key={i} />
            ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <Inbox className="w-16 h-16 mb-4 text-primary/30" />
            <h3 className="font-semibold text-lg">Your inbox is empty</h3>
            <p className="text-sm">New emails will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2 mt-2 overflow-y-auto">
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
                        ? "bg-primary/10 border-primary/50"
                        : "border-transparent hover:bg-background/50 hover:border-border"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarUrl} alt={senderName}/>
                            <AvatarFallback>{senderInitial}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <div className="flex justify-between items-center">
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
  );
}
