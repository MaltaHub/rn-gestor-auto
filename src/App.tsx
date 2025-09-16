import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDeviceVersion } from "@/hooks/use-mobile";
import { TenantProvider } from "@/contexts/TenantContext";
import { SupabaseProvider } from "@/shared/contexts/SupabaseContext";

// Desktop Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Vitrine from "./pages/Vitrine";
import EstoqueGeral from "./pages/EstoqueGeral";
import Anuncios from "./pages/Anuncios";
import Vendas from "./pages/Vendas";
import Company from "./pages/Company";
import NotFound from "./pages/NotFound";
import CreateTenant from "./pages/CreateTenant";
import JoinTenant from "./pages/JoinTenant";
import CadastrarVeiculo from "./pages/CadastrarVeiculo";
import CriarAnuncio from "./pages/CriarAnuncio";
import ConfiguracoesGerais from "./pages/ConfiguracoesGerais";
import VerVeiculo from "./pages/VerVeiculo";
import EditarVeiculo from "./pages/EditarVeiculo";
import EditarVeiculoLoja from "./pages/EditarVeiculoLoja";

// Mobile Pages
import DashboardMobile from "./pages/mobile/DashboardMobile";
import EstoqueGeralMobile from "./pages/mobile/EstoqueGeralMobile";
import VitrineMobile from "./pages/mobile/VitrineMobile";
import AnunciosMobile from "./pages/mobile/AnunciosMobile";

const queryClient = new QueryClient();

// Component to choose between mobile and desktop versions
function ResponsiveRoute({ 
  desktopComponent, 
  mobileComponent 
}: { 
  desktopComponent: React.ReactNode; 
  mobileComponent: React.ReactNode; 
}) {
  const { isMobile } = useDeviceVersion();
  return isMobile ? mobileComponent : desktopComponent;
}

const App = () => {
  console.log("🚀 App: Starting application...");
  return (
  <QueryClientProvider client={queryClient}>
    <SupabaseProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TenantProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create-tenant" element={<CreateTenant />} />
              <Route path="/join-tenant/:token" element={<JoinTenant />} />
              
              {/* Dashboard routes with responsive components */}
              <Route path="/dashboard" element={
                <ResponsiveRoute 
                  desktopComponent={
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  }
                  mobileComponent={<DashboardMobile />}
                />
              } />
              <Route path="/dashboard/vitrine" element={
                <ResponsiveRoute 
                  desktopComponent={
                    <DashboardLayout>
                      <Vitrine />
                    </DashboardLayout>
                  }
                  mobileComponent={<VitrineMobile />}
                />
              } />
              <Route path="/dashboard/estoque-geral" element={
                <ResponsiveRoute 
                  desktopComponent={
                    <DashboardLayout>
                      <EstoqueGeral />
                    </DashboardLayout>
                  }
                  mobileComponent={<EstoqueGeralMobile />}
                />
              } />
              <Route path="/dashboard/anuncios" element={
                <ResponsiveRoute 
                  desktopComponent={
                    <DashboardLayout>
                      <Anuncios />
                    </DashboardLayout>
                  }
                  mobileComponent={<AnunciosMobile />}
                />
              } />
              
              {/* Remaining desktop-only routes */}
              <Route path="/dashboard/vendas" element={
                <DashboardLayout>
                  <Vendas />
                </DashboardLayout>
              } />
              <Route path="/dashboard/company" element={
                <DashboardLayout>
                  <Company />
                </DashboardLayout>
              } />
              <Route path="/dashboard/vitrine/cadastrar" element={
                <DashboardLayout>
                  <CadastrarVeiculo />
                </DashboardLayout>
              } />
              <Route path="/dashboard/estoque-geral/cadastrar" element={
                <DashboardLayout>
                  <CadastrarVeiculo />
                </DashboardLayout>
              } />
              <Route path="/dashboard/anuncios/criar" element={
                <DashboardLayout>
                  <CriarAnuncio />
                </DashboardLayout>
              } />
              <Route path="/dashboard/configuracoes" element={
                <DashboardLayout>
                  <ConfiguracoesGerais />
                </DashboardLayout>
              } />
              <Route path="/dashboard/veiculo/:id" element={
                <DashboardLayout>
                  <VerVeiculo />
                </DashboardLayout>
              } />
              <Route path="/dashboard/veiculo/:id/editar" element={
                <DashboardLayout>
                  <EditarVeiculo />
                </DashboardLayout>
              } />
              <Route path="/dashboard/veiculo/:id/loja/:lojaId/editar" element={
                <DashboardLayout>
                  <EditarVeiculoLoja />
                </DashboardLayout>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TenantProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </SupabaseProvider>
  </QueryClientProvider>
  );
};

export default App;
