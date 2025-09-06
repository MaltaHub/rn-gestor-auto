import { Building2, Users, Settings, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import { useTenantMembers } from "@/hooks/useTenantMembers";
import { useAuth } from "@/hooks/useAuth";

const roleLabels = {
  owner: "Proprietário",
  admin: "Administrador", 
  manager: "Gerente",
  user: "Usuário"
};

const roleColors = {
  owner: "destructive",
  admin: "default",
  manager: "secondary", 
  user: "outline"
} as const;

export default function TenantProfile() {
  const { currentTenant, loading: tenantLoading } = useTenant();
  const { members, isLoading: membersLoading } = useTenantMembers();
  const { user } = useAuth();

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p>Carregando informações do tenant...</p>
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum tenant encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Perfil do Tenant</h1>
          <p className="text-muted-foreground">Gerencie as informações e colaboradores do seu tenant</p>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Tenant
              </CardTitle>
              <CardDescription>
                Dados básicos da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-semibold">{currentTenant.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Domínio</label>
                  <p className="text-lg font-semibold">{currentTenant.dominio || "Não configurado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Colaboradores
                  </CardTitle>
                  <CardDescription>
                    Gerencie os membros da sua organização
                  </CardDescription>
                </div>
                <Button variant="outline" disabled>
                  <Mail className="h-4 w-4 mr-2" />
                  Convidar Colaborador
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
                  <p>Carregando colaboradores...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.user_id === user?.id ? `${user?.email} (Você)` : member.user_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Membro desde {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={roleColors[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-4" />
                      <p>Nenhum colaborador encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}