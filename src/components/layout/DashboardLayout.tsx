import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";

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
                  {/* Espaço para outros elementos do header */}
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