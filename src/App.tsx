import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Estoque from "./pages/Estoque";
import Anuncios from "./pages/Anuncios";
import Vendas from "./pages/Vendas";
import TenantProfile from "./pages/TenantProfile";
import NotFound from "./pages/NotFound";
import CreateTenant from "./pages/CreateTenant";
import JoinTenant from "./pages/JoinTenant";

const queryClient = new QueryClient();

const App = () => {
  console.log("🚀 App: Starting application...");
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-tenant" element={<CreateTenant />} />
            <Route path="/join-tenant/:token" element={<JoinTenant />} />
            <Route path="/dashboard" element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            } />
            <Route path="/dashboard/estoque" element={
              <DashboardLayout>
                <Estoque />
              </DashboardLayout>
            } />
            <Route path="/dashboard/anuncios" element={
              <DashboardLayout>
                <Anuncios />
              </DashboardLayout>
            } />
            <Route path="/dashboard/vendas" element={
              <DashboardLayout>
                <Vendas />
              </DashboardLayout>
            } />
            <Route path="/dashboard/tenant-profile" element={
              <DashboardLayout>
                <TenantProfile />
              </DashboardLayout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
