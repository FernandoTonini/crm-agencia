import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl font-bold animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card shadow-gold-lg max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full glass-light flex items-center justify-center mx-auto mb-4 shadow-gold">
            <span className="text-primary font-bold text-4xl">A</span>
          </div>
          <CardTitle className="gradient-gold text-3xl mb-2">A AGÊNCIA</CardTitle>
          <CardDescription className="text-base">
            Sistema de CRM para Gestão de Leads e Contratos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Faça login para acessar o painel de controle e gerenciar seus leads e contratos.
          </p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()} 
            className="w-full shadow-gold text-lg py-6"
          >
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

