'use client';

import { useTempMail } from '@/hooks/use-temp-mail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function InboxSidebar() {
  const { messages, selectedMessageId, selectMessage, deleteMessage, readMessageIds } = useTempMail();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter((msg) => 
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.from.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.from.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !readMessageIds.includes(m.id)).length;

  return (
    <div className="flex h-full flex-col border-r bg-muted/20 md:w-80 lg:w-96 shrink-0">
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Inbox
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2 rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <span className="text-xs text-muted-foreground">{messages.length} messages</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search emails..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4 text-center">
            <Mail className="h-10 w-10 mb-4 opacity-20" />
            <p className="text-sm font-medium">No messages found</p>
            {messages.length === 0 ? (
              <p className="text-xs mt-1">Waiting for incoming emails...</p>
            ) : (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y">
            {filteredMessages.map((msg) => {
              const isRead = readMessageIds.includes(msg.id);
              const isSelected = selectedMessageId === msg.id;

              return (
                <button
                  key={msg.id}
                  onClick={() => selectMessage(msg.id)}
                  className={`flex flex-col items-start gap-2 p-4 text-left text-sm transition-colors hover:bg-muted/50 relative group ${
                    isSelected ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={`truncate font-medium ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {msg.from.name || msg.from.address}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <span className={`w-full truncate ${isRead ? 'text-muted-foreground font-normal' : 'text-foreground font-medium'}`}>
                    {msg.subject || '(No subject)'}
                  </span>
                  
                  <span className="w-full truncate text-xs text-muted-foreground line-clamp-2 white-space-normal">
                    {msg.intro}
                  </span>

                  {!isRead && (
                    <span className="absolute left-2 top-4 h-2 w-2 rounded-full bg-primary" />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
