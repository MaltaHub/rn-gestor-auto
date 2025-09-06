import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function CreateTenant() {
  const [nome, setNome] = useState("");
  const [dominio, setDominio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Criar empresa (tenant) | RN Gestor ERP";
  }, []);

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

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Criar empresa (tenant)</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da empresa</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Minha Empresa LTDA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dominio">Domínio (opcional)</Label>
              <Input id="dominio" value={dominio} onChange={(e) => setDominio(e.target.value)} placeholder="exemplo.com.br" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar empresa"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
