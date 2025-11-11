"use client";

import type { MessageDetails } from "@/lib/mail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Inbox, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmailViewProps = {
  message: MessageDetails | null;
  isLoading: boolean;
  onBack: () => void;
};

export default function EmailView({ message, isLoading, onBack }: EmailViewProps) {
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full bg-background">
            <Loader2 className="w-10 h-10 animate-spin text-primary"/>
        </div>
    )
  }

  if (!message) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background p-4">
        <Inbox className="w-20 h-20 mb-4 text-primary/20" />
        <h3 className="font-semibold text-xl">Select an email to read</h3>
        <p className="text-md">Your emails will be displayed here.</p>
      </div>
    );
  }
  
  const fromAddress = message.from.address;
  const senderName = message.from.name || fromAddress.split('@')[0];
  const senderInitial = senderName ? senderName[0].toUpperCase() : 'U';
  const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(senderName)}`;

  return (
    <div className="p-0 sm:p-4 bg-background h-full">
       <Button onClick={onBack} variant="ghost" className="md:hidden m-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Inbox
        </Button>
      <Card className="rounded-none sm:rounded-xl shadow-none sm:shadow-lg h-full overflow-y-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">{message.subject}</CardTitle>
          <Separator className="my-4" />
          <div className="flex items-center space-x-4">
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
      </Card>
    </div>
  );
}
