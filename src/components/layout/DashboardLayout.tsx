import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, LogOut } from "lucide-react";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const WithTenantGuard = ({ children }: { children: React.ReactNode }) => {
    const { currentTenant, loading } = useTenant();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!currentTenant) {
      return <Navigate to="/create-tenant" replace />;
    }

    return <>{children}</>;
  };

  return (
    <TenantProvider>
      <WithTenantGuard>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />

            <div className="flex-1 flex flex-col min-h-screen">
              {/* Header */}
              <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="flex items-center gap-4 px-4 h-full">
                  <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                  <div className="flex-1" />
                  <UserMenu />
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 p-6 bg-muted/30">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </WithTenantGuard>
    </TenantProvider>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  
  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {user?.email ? getUserInitials(user.email) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.email}</p>
          <p className="text-xs text-muted-foreground">Usuário</p>
        </div>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}