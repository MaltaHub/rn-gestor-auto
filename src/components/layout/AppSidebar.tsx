import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Building2, 
  Package, 
  Megaphone, 
  TrendingUp, 
  Store,
  LogOut,
  ChevronDown
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

const navigationItems = [
  { title: "Estoque", url: "/dashboard/estoque", icon: Package },
  { title: "Anúncios", url: "/dashboard/anuncios", icon: Megaphone },
  { title: "Vendas", url: "/dashboard/vendas", icon: TrendingUp },
];

// Mock data para lojas - em produção viria do Supabase
const mockLojas = [
  { id: "1", nome: "Loja Centro" },
  { id: "2", nome: "Loja Norte" },
  { id: "3", nome: "Loja Sul" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [currentLoja, setCurrentLoja] = useState(mockLojas[0]);

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
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {!collapsed && <span>{currentLoja.nome}</span>}
                      </div>
                      {!collapsed && <ChevronDown className="h-4 w-4" />}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {mockLojas.map((loja) => (
                      <DropdownMenuItem
                        key={loja.id}
                        onClick={() => setCurrentLoja(loja)}
                        className={currentLoja.id === loja.id ? "bg-primary/10" : ""}
                      >
                        <Store className="h-4 w-4 mr-2" />
                        {loja.nome}
                      </DropdownMenuItem>
                    ))}
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
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}