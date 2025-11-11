"use client";

import { Copy, MailPlus, Sun, Moon, Loader2, ShieldCheck, Settings, Star, Download } from "lucide-react";
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

  const handleCopy = () => {
    if (isGenerating || !email) return;
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied to clipboard!",
      description: email,
    });
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onToggleFavorite}
                          disabled={isGenerating || !email}
                          className="h-8 w-8"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              isFavorite && "fill-yellow-400 text-yellow-400"
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

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
                <Button variant="default" size="icon" onClick={onNewEmail} disabled={isGenerating}>
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
                  <Button variant="outline" size="icon" onClick={handleDownload}>
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download App</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                {favoriteAddresses.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Favorite Addresses</DropdownMenuLabel>
                    {favoriteAddresses.map((favEmail) => (
                      <DropdownMenuItem key={favEmail} disabled>
                        <span className="truncate">{favEmail}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onToggleFavorite}
                          disabled={isGenerating || !email}
                          className="h-8 w-8"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              isFavorite && "fill-yellow-400 text-yellow-400"
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
