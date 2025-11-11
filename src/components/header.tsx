"use client";

import { Copy, RefreshCw, MailPlus, Sun, Moon, Loader2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AppHeaderProps = {
  email: string;
  onNewEmail: () => void;
  onExtend: () => void;
  timeLeft: string;
  isGenerating: boolean;
};

export default function AppHeader({
  email,
  onNewEmail,
  onExtend,
  timeLeft,
  isGenerating,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleCopy = () => {
    if (isGenerating || !email) return;
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied to clipboard!",
      description: email,
    });
  };

  return (
    <header className="border-b border-border/50 p-2 sm:p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <p className="text-sm text-muted-foreground">Your Temporary Email</p>
            <div className="flex items-center gap-2">
              {isGenerating ? (
                 <div className="flex items-center gap-2 text-lg font-bold text-primary animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                </div>
              ) : (
                <h1
                  className="text-lg font-bold text-primary truncate"
                  title={email}
                >
                  {email}
                </h1>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={isGenerating}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Time Left</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{timeLeft}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onExtend} disabled={isGenerating} className="h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Extend Time</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onNewEmail} disabled={isGenerating} className="h-8 w-8">
                    <MailPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
