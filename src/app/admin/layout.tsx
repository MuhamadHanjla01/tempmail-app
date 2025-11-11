
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Home, Settings, PanelLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2 p-2">
              <ShieldCheck className="w-8 h-8 text-sidebar-primary" />
              <h2 className="text-xl font-bold tracking-tighter group-data-[collapsible=icon]:hidden">
                Admin
              </h2>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" isActive>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="flex h-14 items-center gap-4 border-b bg-background/60 px-6 backdrop-blur-sm sticky top-0">
          <SidebarTrigger className="md:hidden">
            <PanelLeft />
          </SidebarTrigger>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
