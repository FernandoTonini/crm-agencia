import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Flame, Sparkles, Lightbulb, TrendingUp, DollarSign, Users, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: overview, isLoading } = trpc.dashboard.overview.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl font-bold animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass max-w-md">
          <CardHeader>
            <CardTitle className="gradient-gold text-2xl">Acesso Restrito</CardTitle>
            <CardDescription>Faça login para acessar o CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full shadow-gold">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = {
    quente: '#d4af37',
    morno: '#f4d03f',
    frio: '#c0c0c0',
  };

  const leadsByClassification = [
    { name: 'Quente', value: overview?.leads.quente || 0, color: COLORS.quente },
    { name: 'Morno', value: overview?.leads.morno || 0, color: COLORS.morno },
    { name: 'Frio', value: overview?.leads.frio || 0, color: COLORS.frio },
  ];

  const leadsByStatus = [
    { name: 'Novo', value: overview?.leads.novo || 0 },
    { name: 'Contatado', value: overview?.leads.contatado || 0 },
    { name: 'Negociação', value: overview?.leads.negociacao || 0 },
    { name: 'Fechado', value: overview?.leads.fechado || 0 },
    { name: 'Perdido', value: overview?.leads.perdido || 0 },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full glass-light flex items-center justify-center shadow-gold">
              <span className="text-primary font-bold text-lg">A</span>
            </div>
            <h1 className="gradient-gold text-2xl font-bold">A AGÊNCIA</h1>
          </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-primary font-semibold">Dashboard</Link>
              <Link href="/leads" className="text-foreground/70 hover:text-primary transition">Leads</Link>
              <Link href="/contracts" className="text-foreground/70 hover:text-primary transition">Contratos</Link>
              <div className="text-sm text-muted-foreground">{user.name}</div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overview?.leads.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Todos os leads capturados</p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads Quentes</CardTitle>
              <Flame className="h-4 w-4 text-[#d4af37]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#d4af37]">{overview?.leads.quente || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Alta prioridade</p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contratos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overview?.contracts.active || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Contratos em andamento</p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                R$ {((overview?.contracts.monthlyRevenue || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receita recorrente</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Leads por Classificação */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-primary">Leads por Classificação</CardTitle>
              <CardDescription>Distribuição de leads por temperatura</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsByClassification}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadsByClassification.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leads por Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-primary">Leads por Status</CardTitle>
              <CardDescription>Pipeline de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadsByStatus}>
                  <XAxis dataKey="name" stroke="#c0c0c0" />
                  <YAxis stroke="#c0c0c0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(26, 26, 26, 0.9)', 
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-light">
          <CardHeader>
            <CardTitle className="text-primary">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setLocation('/leads')} 
              className="shadow-gold h-auto py-6 flex flex-col items-center gap-2"
            >
              <Users className="h-6 w-6" />
              <span>Ver Todos os Leads</span>
            </Button>
            <Button 
              onClick={() => setLocation('/contracts')} 
              variant="secondary"
              className="h-auto py-6 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <span>Gerenciar Contratos</span>
            </Button>
            <Button 
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

