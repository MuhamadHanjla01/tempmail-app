'use client';

import { useTempMail } from '@/hooks/use-temp-mail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, RefreshCw, Plus, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function AppHeader() {
  const { account, isLoading, generateNewAccount, fetchMessages, isAutoRefreshEnabled, toggleAutoRefresh } = useTempMail();
  const { theme, setTheme } = useTheme();

  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success('Email copied to clipboard');
    }
  };

  const handleRefresh = async () => {
    toast.promise(fetchMessages(), {
      loading: 'Refreshing inbox...',
      success: 'Inbox updated',
      error: 'Failed to refresh inbox',
    });
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <span className="text-lg font-bold hidden sm:inline-block tracking-tight">Temp<span className="text-primary">Mail</span></span>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 max-w-lg">
          <div className="flex w-full items-center space-x-2 rounded-full border bg-muted/50 px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
            {isLoading || !account ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              <span className="flex-1 truncate font-medium text-sm sm:text-base">{account.address}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              disabled={isLoading || !account}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy email</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden md:flex gap-2"
            onClick={() => generateNewAccount()}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            New Email
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || !account}
            title="Manual refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoRefresh}
            className={isAutoRefreshEnabled ? "text-primary" : "text-muted-foreground"}
            title={isAutoRefreshEnabled ? "Auto-refresh is ON" : "Auto-refresh is OFF"}
          >
            <RefreshCw className={`h-5 w-5 ${isAutoRefreshEnabled ? 'animate-spin-slow' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
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
