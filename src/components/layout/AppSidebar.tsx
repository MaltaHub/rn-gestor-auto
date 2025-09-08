
import { NavLink, useLocation } from "react-router-dom";
import { 
  Building2, 
  Package, 
  Megaphone, 
  TrendingUp, 
  Store,
  LogOut,
  ChevronDown,
  Settings,
  Home,
  Cog
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/TenantContext";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Estoque Geral", url: "/dashboard/estoque-geral", icon: Package },
  { title: "Vitrine", url: "/dashboard/vitrine", icon: Store },
  { title: "Anúncios", url: "/dashboard/anuncios", icon: Megaphone },
  { title: "Vendas", url: "/dashboard/vendas", icon: TrendingUp },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Cog },
  { title: "Company", url: "/dashboard/company", icon: Settings },
];

// Dados de lojas e tenants agora vêm do Supabase via TenantContext

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { currentTenant, lojas, selectedLojaId, setSelectedLojaId, loading } = useTenant();
  const currentLoja = lojas.find((l) => l.id === selectedLojaId) || null;

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b bg-gradient-secondary">
        <div className="flex items-center gap-2 px-4 py-3">
          <Building2 className="h-8 w-8 text-primary" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">RN Gestor</h1>
              <p className="text-xs text-muted-foreground">Sistema ERP</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>

        {/* Seletor de Loja */}
        <SidebarGroup>
          <SidebarGroupLabel>Loja Atual</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!currentTenant || loading}>
                    <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {!collapsed && <span>{currentLoja?.nome ?? (loading ? "Carregando..." : "Selecione")}</span>}
                      </div>
                      {!collapsed && <ChevronDown className="h-4 w-4" />}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {(lojas || []).map((loja) => (
                      <DropdownMenuItem
                        key={loja.id}
                        onClick={() => setSelectedLojaId(loja.id)}
                        className={currentLoja?.id === loja.id ? "bg-primary/10" : ""}
                      >
                        <Store className="h-4 w-4 mr-2" />
                        {loja.nome}
                      </DropdownMenuItem>
                    ))}
                    {currentTenant && (!lojas || lojas.length === 0) && (
                      <div className="px-2 py-1 text-sm text-muted-foreground">Nenhuma loja</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-gradient-secondary">
        <div className="p-4">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium">{currentTenant?.nome ?? "Empresa"}</p>
              <p className="text-xs text-muted-foreground">
                {currentLoja?.nome ?? (lojas?.length === 0 ? "Nenhuma loja" : "Selecione uma loja")}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "Sair"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}