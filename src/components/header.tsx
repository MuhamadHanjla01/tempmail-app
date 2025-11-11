"use client";

import { Copy, RefreshCw, MailPlus, Sun, Moon, Loader2, ShieldCheck } from "lucide-react";
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
    <header className="border-b p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tighter">TempMail</h1>
        </div>
        <div className="flex-1 max-w-md">
            <div className="relative">
                <div className="flex items-center gap-2 bg-secondary p-2 rounded-lg">
                {isGenerating ? (
                    <div className="flex items-center gap-2 text-md font-semibold text-primary/80 animate-pulse w-full">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating email...</span>
                    </div>
                ) : (
                    <p className="text-md font-semibold text-foreground truncate flex-1" title={email}>{email}</p>
                )}

                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isGenerating} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                </Button>
                </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Expires in</p>
                <p className="font-bold text-lg">{timeLeft}</p>
            </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onExtend} disabled={isGenerating}>
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Extend Time</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onNewEmail} disabled={isGenerating}>
                  <MailPlus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>New Email</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
      </div>
    </header>
  );
}
