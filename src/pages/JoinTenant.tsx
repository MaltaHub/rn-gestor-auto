import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function JoinTenant() {
  const { token } = useParams<{ token: string }>();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Aceitar convite | RN Gestor ERP";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!token) {
      setResult("error");
      setMessage("Token de convite inválido.");
      return;
    }
  }, [user, token, navigate]);

  async function handleAcceptInvite() {
    if (!token || !user) return;
    try {
      setProcessing(true);
      const { data, error } = await supabase.rpc("accept_tenant_invite", { p_token: token });
      if (error) throw error;
      if (data) {
        setResult("success");
        setMessage("Convite aceito com sucesso! Redirecionando...");
        toast({ title: "Convite aceito com sucesso!" });
        setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
      } else {
        setResult("error");
        setMessage("Convite inválido, expirado ou já utilizado.");
      }
    } catch (err: any) {
      setResult("error");
      setMessage("Erro ao aceitar convite: " + err.message);
      toast({ title: "Erro ao aceitar convite", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  if (!user || !token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Token de convite inválido ou usuário não autenticado.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Aceitar convite</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Você foi convidado para participar de uma empresa. Deseja aceitar o convite?</p>
              <Button onClick={handleAcceptInvite} disabled={processing} className="w-full">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Aceitar convite"
                )}
              </Button>
            </div>
          )}
          {result === "success" && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-lg text-foreground">{message}</p>
            </div>
          )}
          {result === "error" && (
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-lg text-foreground">{message}</p>
              <Button onClick={() => navigate("/create-tenant", { replace: true })} variant="outline" className="w-full">
                Criar nova empresa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}