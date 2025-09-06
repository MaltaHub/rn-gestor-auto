import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, Loader2, User, LogOut, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function CreateTenant() {
  const [nome, setNome] = useState("");
  const [dominio, setDominio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Criar empresa | RN Gestor ERP";
  }, []);

  // If user already belongs to a tenant, redirect away from this page
  useEffect(() => {
    let active = true;
    const checkMembership = async () => {
      if (!user) return;
      const { data: tenantId, error } = await supabase.rpc("get_current_user_tenant_id");
      console.log("🧭 CreateTenant: membership check", { tenantId, error });
      if (active && tenantId) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkMembership();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!nome.trim()) {
      toast({ title: "Informe o nome da empresa.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const { data, error } = await supabase.rpc("create_tenant", {
        p_nome: nome.trim(),
        p_dominio: dominio.trim() || null,
      });
      if (error) throw error;
      if (!data) throw new Error("Falha ao criar tenant");
      toast({ title: "Empresa criada com sucesso!" });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao criar empresa", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">RN Gestor</h1>
              <p className="text-xs text-muted-foreground">Sistema ERP</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
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
              <DropdownMenuItem onClick={async () => {
                await signOut();
                navigate("/auth", { replace: true });
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Bem-vindo ao RN Gestor
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Crie sua empresa e comece a gerenciar seu negócio de forma inteligente e eficiente.
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <h2 className="text-2xl font-semibold">Criar sua empresa</h2>
              <p className="text-muted-foreground">Configure sua empresa para começar a usar o sistema</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="nome" className="text-base font-medium">Nome da empresa *</Label>
                  <Input 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    placeholder="Ex: Minha Empresa LTDA"
                    className="h-12 text-base"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="dominio" className="text-base font-medium">Domínio da empresa (opcional)</Label>
                  <Input 
                    id="dominio" 
                    value={dominio} 
                    onChange={(e) => setDominio(e.target.value)} 
                    placeholder="Ex: minhaempresa.com.br"
                    className="h-12 text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Usado para auto-adicionar novos usuários com esse domínio de email
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full h-12 text-base font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando empresa...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-5 w-5" />
                      Criar empresa
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
