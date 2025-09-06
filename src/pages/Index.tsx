import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Car, Megaphone, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-erp.jpg';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect to dashboard if authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">RN Gestor</h1>
              <p className="text-xs text-muted-foreground">Sistema ERP</p>
            </div>
          </div>
          <Button 
            variant="hero" 
            onClick={() => window.location.href = '/auth'}
          >
            Entrar na Plataforma
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                  RN Gestor
                </h1>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Sistema ERP para Concessionárias
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Gerencie seu estoque, anúncios e vendas de forma integrada e eficiente. 
                  A solução completa para modernizar sua concessionária.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="xl"
                  onClick={() => window.location.href = '/auth'}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="xl">
                  Conhecer Recursos
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">245+</div>
                  <div className="text-sm text-muted-foreground">Veículos Gerenciados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">98%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">24/7</div>
                  <div className="text-sm text-muted-foreground">Suporte</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={heroImage} 
                  alt="RN Gestor Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principais</h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para gerenciar sua concessionária
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-dropdown transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Gestão de Estoque</CardTitle>
                <CardDescription>
                  Controle completo do inventário de veículos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cadastro detalhado de veículos</li>
                  <li>• Controle de localização</li>
                  <li>• Histórico completo</li>
                  <li>• Relatórios em tempo real</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-dropdown transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="h-8 w-8 text-info" />
                </div>
                <CardTitle>Gestão de Anúncios</CardTitle>
                <CardDescription>
                  Publique em múltiplas plataformas simultaneamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Integração com portais</li>
                  <li>• Métricas de performance</li>
                  <li>• Gestão centralizada</li>
                  <li>• Otimização automática</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-dropdown transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <CardTitle>Controle de Vendas</CardTitle>
                <CardDescription>
                  Acompanhe toda a jornada de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pipeline de vendas</li>
                  <li>• Controle de comissões</li>
                  <li>• Relatórios financeiros</li>
                  <li>• Gestão de contratos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Pronto para modernizar sua concessionária?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Junte-se às concessionárias que já modernizaram seus processos com o RN Gestor
          </p>
          <Button 
            variant="secondary" 
            size="xl"
            onClick={() => window.location.href = '/auth'}
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">RN Gestor</span>
          </div>
          <p className="text-muted-foreground">
            Sistema ERP para Concessionárias - Desenvolvido com tecnologia de ponta
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
