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
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary"/>
        </div>
    )
  }

  if (!message) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background p-4">
        <Inbox className="w-16 h-16 mb-4" />
        <h3 className="font-semibold text-lg">Select an email to read</h3>
        <p className="text-sm">Your emails will be displayed here.</p>
      </div>
    );
  }
  
  const fromAddress = message.from;
  const senderName = fromAddress.split('@')[0];
  const senderInitial = senderName ? senderName[0].toUpperCase() : 'U';

  return (
    <div className="p-2 sm:p-4">
       <Button onClick={onBack} variant="ghost" className="md:hidden mb-2">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Inbox
        </Button>
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">{message.subject}</CardTitle>
          <Separator className="my-4" />
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{senderInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold">{senderName}</p>
              <p className="text-xs text-muted-foreground">{`<${fromAddress}>`}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{format(new Date(message.date), "PPpp")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 prose dark:prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: message.htmlBody || message.textBody }}
            className="prose-sm sm:prose-base"
          />
        </CardContent>
      </Card>
    </div>
  );
}
