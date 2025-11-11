"use client";

import type { Message } from "@/lib/mail";
import { cn } from "@/lib/utils";
import { Inbox, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type InboxViewProps = {
  messages: Message[];
  onSelectMessage: (id: string) => void;
  selectedId: string | null;
  isLoading: boolean;
};

export default function InboxView({
  messages,
  onSelectMessage,
  selectedId,
  isLoading,
}: InboxViewProps) {

  return (
    <div className="p-4 space-y-2 h-full flex flex-col">
       <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Inbox 
        </h2>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
       </div>

      {isLoading && messages.length === 0 ? (
        <div className="space-y-3 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2 p-3 rounded-lg border border-transparent">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4 mt-1" />
                </div>
            ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <Inbox className="w-16 h-16 mb-4 text-primary/50" />
            <h3 className="font-semibold text-lg">Your inbox is empty</h3>
            <p className="text-sm">Waiting for new emails to arrive...</p>
        </div>
      ) : (
        <div className="space-y-3 mt-2 overflow-y-auto">
            {messages.map((message) => (
            <button
                key={message.id}
                onClick={() => onSelectMessage(message.id)}
                className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-colors",
                selectedId === message.id
                    ? "bg-primary/10 border-primary"
                    : "border-transparent hover:bg-accent"
                )}
            >
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm truncate max-w-[200px]">{message.from.name || message.from.address}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(message.date), { addSuffix: true })}</p>
                </div>
                <p className="font-medium text-sm truncate mt-1 text-foreground">{message.subject}</p>
                <p className="text-xs text-muted-foreground truncate mt-1.5">{message.intro}</p>
            </button>
            ))}
        </div>
      )}
    </div>
  );
}
