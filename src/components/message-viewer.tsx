'use client';

import { useEffect, useState, useRef } from 'react';
import { useTempMail } from '@/hooks/use-temp-mail';
import { MailAPI, Message } from '@/lib/mail-api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Paperclip, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MessageViewerProps {
  onBack?: () => void;
}

export default function MessageViewer({ onBack }: MessageViewerProps) {
  const { selectedMessageId, token, messages } = useTempMail();
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function loadMessage() {
      if (!selectedMessageId || !token) {
        setMessage(null);
        return;
      }

      setIsLoading(true);
      try {
        const fullMessage = await MailAPI.getMessage(selectedMessageId, token);
        setMessage(fullMessage);
      } catch (error) {
        console.error("Failed to load message:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessage();
  }, [selectedMessageId, token]);

  const resizeIframe = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.style.height = iframeRef.current.contentWindow.document.documentElement.scrollHeight + 'px';
      } catch (e) {
        // Cross-origin restriction might block this if not careful, but srcdoc is same-origin
        iframeRef.current.style.height = '600px';
      }
    }
  };

  const getSafeHtml = (htmlArr?: string[]) => {
    if (!htmlArr || htmlArr.length === 0) return '';
    const rawHtml = htmlArr.join('');
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333; /* Default text color for light backgrounds typical in emails */
            margin: 0;
            padding: 16px;
            word-wrap: break-word;
          }
          img { max-width: 100%; height: auto; }
          a { color: #0066cc; }
          @media (prefers-color-scheme: dark) {
            body {
              color: #e5e7eb;
            }
            a { color: #60a5fa; }
          }
        </style>
      </head>
      <body>${rawHtml}</body>
      </html>
    `;
  };

  if (!selectedMessageId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background/50 text-muted-foreground p-8 text-center h-full">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Mail className="h-12 w-12 opacity-50" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-foreground">Select an email to read</h3>
        <p className="max-w-sm">Choose a message from your inbox to view its contents here.</p>
      </div>
    );
  }

  if (isLoading || !message) {
    return (
      <div className="flex-1 p-6 flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-4 border-b pb-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="p-4 md:p-6 border-b shrink-0 bg-background/95 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8 -ml-2" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl md:text-2xl font-bold tracking-tight line-clamp-2">{message.subject || '(No subject)'}</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">From:</span>
              <span className="text-muted-foreground">{message.from.name || message.from.address}</span>
              {message.from.name && <span className="text-muted-foreground">&lt;{message.from.address}&gt;</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">To:</span>
              <span className="text-muted-foreground">
                {message.to.map((t) => t.address).join(', ')}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground whitespace-nowrap text-right">
            {format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 min-h-[400px]">
          {message.html && message.html.length > 0 ? (
            <iframe
              ref={iframeRef}
              srcDoc={getSafeHtml(message.html)}
              sandbox="allow-same-origin allow-popups"
              className="w-full border-0 bg-white dark:bg-[#1a1b1e] rounded-md shadow-sm min-h-[500px]"
              onLoad={resizeIframe}
              title="Email content"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground bg-muted/30 p-6 rounded-lg">
              {message.text || 'No content provided.'}
            </pre>
          )}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="p-6 border-t bg-muted/10 mt-auto">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Paperclip className="h-4 w-4" />
              Attachments ({message.attachments.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {message.attachments.map((att, i) => (
                <a
                  key={i}
                  href={`https://api.mail.tm${att.downloadUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-background border rounded-md hover:bg-muted transition-colors text-sm"
                >
                  <Download className="h-4 w-4 text-primary" />
                  <span className="truncate max-w-[200px]">{att.filename || `Attachment ${i + 1}`}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(att.size / 1024)} KB)
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
