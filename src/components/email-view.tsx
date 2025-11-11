"use client";

import type { MessageDetails } from "@/lib/mail";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Inbox, ChevronLeft, Loader2, Paperclip, Download } from "lucide-react";
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
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary"/>
              <p className="text-muted-foreground">Loading email...</p>
            </div>
        </div>
    )
  }

  if (!message) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background p-8">
        <Inbox className="w-20 h-20 mb-4 text-primary/20" />
        <h3 className="font-semibold text-xl">Select an email to read</h3>
        <p className="text-md">Your emails will be displayed here once you select one from the inbox.</p>
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
    <div className="flex flex-col h-full bg-background">
       <div className="p-4 border-b md:hidden">
         <Button onClick={onBack} variant="ghost">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Inbox
          </Button>
       </div>
      <div className="flex-1 overflow-y-auto p-0 sm:p-4">
        <Card className="rounded-none sm:rounded-xl shadow-none sm:shadow-lg h-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">{message.subject}</CardTitle>
            <Separator className="my-4" />
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={senderName}/>
                <AvatarFallback>{senderInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-md font-semibold">{senderName}</p>
                <p className="text-sm text-muted-foreground">{`<${fromAddress}>`}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{format(new Date(message.date), "PPpp")}</p>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 sm:p-6">
             <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: message.htmlBody || `<p>${message.textBody}</p>` }}
            />
          </CardContent>
          {message.attachments && message.attachments.length > 0 && (
            <>
              <Separator />
              <CardFooter className="p-4 sm:p-6 flex-col items-start gap-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Paperclip className="w-5 h-5" />
                  <span>Attachments</span>
                  <Badge variant="secondary">{message.attachments.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {message.attachments.map(att => (
                    <div key={att.id} className="border rounded-lg p-3 flex items-center justify-between gap-2">
                       <div className="truncate">
                        <p className="text-sm font-medium truncate" title={att.filename}>{att.filename}</p>
                        <p className="text-xs text-muted-foreground">{bytesToSize(att.size)}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button size="icon" variant="ghost" onClick={() => handleDownload(att.id, att.filename)}>
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
