"use client";

import type { Message } from "@/lib/mail";
import { cn } from "@/lib/utils";
import { Inbox, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type InboxViewProps = {
  messages: Message[];
  onSelectMessage: (id: number) => void;
  selectedId: number | undefined;
  isLoading: boolean;
};

export default function InboxView({
  messages,
  onSelectMessage,
  selectedId,
  isLoading,
}: InboxViewProps) {
  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        <h2 className="text-lg font-semibold p-2">Inbox</h2>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-1.5 p-4 rounded-lg border">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4 mt-1" />
            </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <Inbox className="w-16 h-16 mb-4" />
        <h3 className="font-semibold text-lg">Your inbox is empty</h3>
        <p className="text-sm">New emails will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-2">
       <h2 className="text-lg font-semibold p-2 flex items-center gap-2">
        Inbox 
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </h2>
      <div className="space-y-2">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => onSelectMessage(message.id)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-colors",
              selectedId === message.id
                ? "bg-primary/10 border-primary"
                : "hover:bg-accent/50"
            )}
          >
            <div className="flex justify-between items-start text-xs text-muted-foreground">
              <p className="truncate max-w-[150px]">{message.from}</p>
              <p>{formatDistanceToNow(new Date(message.date), { addSuffix: true })}</p>
            </div>
            <p className="text-sm truncate mt-1 text-foreground">{message.subject}</p>
            <p className="text-xs text-muted-foreground truncate mt-1">{message.intro}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
