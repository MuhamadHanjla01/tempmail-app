"use client";

import { Copy, RefreshCw, MailPlus, Sun, Moon, Loader2, ShieldCheck, Settings } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    <header className="border-b p-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tighter">TempMail</h1>
        </div>
        
        <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
                <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
                {isGenerating ? (
                    <div className="flex items-center gap-2 text-md font-semibold text-primary/80 animate-pulse w-full">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating new email...</span>
                    </div>
                ) : (
                    <p className="text-md font-semibold text-foreground truncate flex-1" title={email}>{email}</p>
                )}

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isGenerating} className="h-8 w-8">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy Email</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
            <div className="text-right p-2 hidden sm:block">
                <p className="text-sm text-muted-foreground">Expires in</p>
                <p className="font-bold text-lg">{timeLeft}</p>
            </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onExtend} disabled={isGenerating}>
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Extend Session</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="icon" onClick={onNewEmail} disabled={isGenerating}>
                  <MailPlus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>New Email Address</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
       <div className="md:hidden mt-3">
            <div className="relative">
                <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
                {isGenerating ? (
                    <div className="flex items-center gap-2 text-md font-semibold text-primary/80 animate-pulse w-full">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating...</span>
                    </div>
                ) : (
                    <p className="text-sm font-semibold text-foreground truncate flex-1" title={email}>{email}</p>
                )}

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isGenerating} className="h-8 w-8">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy Email</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                </div>
          </div>
        </div>
    </header>
  );
}
