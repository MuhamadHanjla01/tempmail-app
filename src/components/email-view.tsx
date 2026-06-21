"use client";

import type { MessageDetails } from "@/lib/mail";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Inbox, ChevronLeft, Loader2, Paperclip, Download, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bytesToSize } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EmailViewProps = {
  message: MessageDetails | null;
  isLoading: boolean;
  onBack: () => void;
  token: string | undefined;
};

const API_URL = "https://api.mail.tm";

export default function EmailView({ message, isLoading, onBack, token }: EmailViewProps) {
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full bg-background p-4 md:p-8">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary"/>
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
              </div>
              <p className="text-muted-foreground font-medium">Loading email...</p>
            </div>
        </div>
    )
  }

  if (!message) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background p-8">
        <div className="relative">
          <Inbox className="w-24 h-24 mb-4 text-primary/10 animate-float" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-primary/5 blur-md" />
        </div>
        <h3 className="font-bold text-xl mt-2">Select an email</h3>
        <p className="text-sm mt-1 max-w-[280px] leading-relaxed">Choose a message from your inbox to read it here.</p>
      </div>
    );
  }

  const fromAddress = message.from.address;
  const senderName = message.from.name || fromAddress.split('@')[0];
  const senderInitial = senderName ? senderName[0].toUpperCase() : 'U';
  const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(senderName)}`;

  const handleDownload = async (attachmentId: string, filename: string) => {
    try {
      const response = await fetch(`${API_URL}/messages/${message.id}/download/${attachmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch(err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
       {/* Mobile Back Button */}
       <div className="p-3 border-b md:hidden glass">
         <Button onClick={onBack} variant="ghost" className="gap-2 rounded-xl hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4" />
              Back to Inbox
          </Button>
       </div>

      {/* Email Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-0 sm:p-4">
        <Card className="rounded-none sm:rounded-2xl shadow-none sm:shadow-xl sm:border">
          {/* Email Header */}
          <CardHeader className="p-4 sm:p-6 space-y-4">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight leading-snug animate-fade-in">
              {message.subject}
            </CardTitle>
            <Separator />
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-md">
                <AvatarImage src={avatarUrl} alt={senderName}/>
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/30 font-bold">{senderInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-md font-semibold">{senderName}</p>
                <p className="text-sm text-muted-foreground font-mono truncate">{fromAddress}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(message.date), "MMM d, yyyy")}</span>
                </div>
                <p className="mt-0.5 tabular-nums">{format(new Date(message.date), "h:mm a")}</p>
              </div>
            </div>
          </CardHeader>

          <Separator />

          {/* Email Body */}
          <CardContent className="p-4 sm:p-6 overflow-x-auto scrollbar-hide">
             <div
              className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-secondary prose-pre:rounded-xl"
              dangerouslySetInnerHTML={{ __html: message.htmlBody || `<p>${message.textBody}</p>` }}
            />
          </CardContent>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <>
              <Separator />
              <CardFooter className="p-4 sm:p-6 flex-col items-start gap-4">
                <div className="flex items-center gap-2 font-semibold">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Paperclip className="w-4 h-4 text-primary" />
                  </div>
                  <span>Attachments</span>
                  <Badge variant="secondary" className="rounded-full">{message.attachments.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {message.attachments.map(att => (
                    <div key={att.id} className="border rounded-xl p-3 flex items-center justify-between gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                       <div className="truncate">
                        <p className="text-sm font-medium truncate" title={att.filename}>{att.filename}</p>
                        <p className="text-xs text-muted-foreground">{bytesToSize(att.size)}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button
                               size="icon"
                               variant="ghost"
                               onClick={() => handleDownload(att.id, att.filename)}
                               className="rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                             >
                                <Download className="w-4 h-4"/>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Download</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
