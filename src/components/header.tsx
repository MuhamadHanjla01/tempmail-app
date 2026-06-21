"use client";

import { Copy, MailPlus, Sun, Moon, Loader2, ShieldCheck, Settings, Star, Download, Timer } from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePwa } from "@/hooks/use-pwa";
import { useState } from "react";

type AppHeaderProps = {
  email: string;
  onNewEmail: () => void;
  timeLeft: string;
  isGenerating: boolean;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  favoriteAddresses: string[];
};

export default function AppHeader({
  email,
  onNewEmail,
  timeLeft,
  isGenerating,
  onToggleFavorite,
  isFavorite,
  favoriteAddresses,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { canInstall, promptInstall, isInstallAvailable } = usePwa();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isGenerating || !email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast({
      title: "✅ Copied to clipboard!",
      description: email,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isInstallAvailable) {
      promptInstall();
    } else {
      toast({
        title: "App Install",
        description: "App is already installed or not available for installation.",
        variant: "default",
      });
    }
  };

  // Parse minutes and seconds from timeLeft for progress calculation
  const parseTime = (t: string) => {
    const parts = t.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };
  const totalSeconds = 10 * 60; // 10 minutes
  const remainingSeconds = parseTime(timeLeft);
  const progress = Math.max(0, (remainingSeconds / totalSeconds) * 100);
  const isLow = remainingSeconds <= 120; // 2 minutes or less

  return (
    <header className="border-b glass sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto flex items-center justify-between gap-2 w-full p-3">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="rounded-xl bg-gradient-to-br from-primary to-purple-600 p-2 text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter hidden sm:block">
            Temp<span className="gradient-text">Mail</span>
          </h1>
        </div>

        {/* Email Address Bar - Desktop */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <div className="flex items-center gap-2 bg-secondary/50 p-2.5 rounded-xl border border-transparent transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
              {isGenerating ? (
                <div className="flex items-center gap-2 text-md font-semibold text-primary/80 animate-pulse w-full">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating new email...</span>
                </div>
              ) : (
                <p className="text-md font-mono font-semibold text-foreground truncate flex-1 tracking-wide" title={email}>
                  {email}
                </p>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleFavorite}
                      disabled={isGenerating || !email}
                      className="h-8 w-8 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-all",
                          isFavorite && "fill-yellow-400 text-yellow-400 scale-110"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={copied ? "default" : "ghost"}
                      size="icon"
                      onClick={handleCopy}
                      disabled={isGenerating}
                      className={cn("h-8 w-8 transition-all", copied && "scale-95")}
                    >
                      <Copy className={cn("h-4 w-4 transition-transform", copied && "scale-0")} />
                      {copied && <span className="absolute text-xs">✓</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{copied ? "Copied!" : "Copy Email"}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Timer Progress Bar */}
            <div className="absolute -bottom-[1px] left-4 right-4 h-[3px] rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-linear",
                  isLow ? "bg-destructive animate-pulse" : "timer-bar"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "text-right px-3 py-1 hidden sm:flex items-center gap-2 rounded-lg transition-colors",
            isLow ? "bg-destructive/10 text-destructive" : "bg-secondary/50"
          )}>
            <Timer className={cn("w-4 h-4", isLow && "animate-pulse")} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-none mb-0.5">Expires</p>
              <p className={cn("font-bold text-lg leading-none tabular-nums", isLow && "text-destructive")}>{timeLeft}</p>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  onClick={onNewEmail}
                  disabled={isGenerating}
                  className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
                >
                  <MailPlus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>New Email Address</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canInstall && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleDownload} className="rounded-xl">
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Download App</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-scale-in">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Theme</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
                {theme === "light" && <span className="ml-auto text-primary">●</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
                {theme === "dark" && <span className="ml-auto text-primary">●</span>}
              </DropdownMenuItem>
              {favoriteAddresses.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    Favorites ({favoriteAddresses.length})
                  </DropdownMenuLabel>
                  {favoriteAddresses.map((favEmail) => (
                    <DropdownMenuItem key={favEmail} disabled className="font-mono text-xs">
                      <Star className="h-3 w-3 mr-2 fill-yellow-400 text-yellow-400" />
                      <span className="truncate">{favEmail}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email Address Bar - Mobile */}
      <div className="md:hidden px-3 pb-3">
        <div className="relative">
          <div className="flex items-center gap-2 bg-secondary/50 p-2.5 rounded-xl border border-transparent">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 animate-pulse w-full">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <p className="text-sm font-mono font-semibold text-foreground truncate flex-1" title={email}>
                {email}
              </p>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleFavorite}
                    disabled={isGenerating || !email}
                    className="h-8 w-8"
                  >
                    <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-400 text-yellow-400")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={copied ? "default" : "ghost"} size="icon" onClick={handleCopy} disabled={isGenerating} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy Email</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* Mobile Timer Progress Bar */}
          <div className="absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-linear",
                isLow ? "bg-destructive animate-pulse" : "timer-bar"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
