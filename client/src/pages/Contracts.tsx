import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { FileText, Calendar, DollarSign, Clock, AlertTriangle, Plus, Edit } from "lucide-react";
import { ContractFormDialog } from "@/components/ContractFormDialog";
import { useState } from "react";
import { Link } from "wouter";

export default function Contracts() {
  const { user, loading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);

  const { data: activeContracts, isLoading: loadingActive } = trpc.contracts.listActive.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: nearExpiration, isLoading: loadingExpiration } = trpc.contracts.listNearExpiration.useQuery(
    { days: 30 },
    { enabled: !!user }
  );

  const { data: stats } = trpc.contracts.stats.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading || loadingActive || loadingExpiration) {
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

  const calculateMonthlyRevenue = (contractValue: number, duration: number) => {
    return contractValue / duration;
  };

  const getDaysUntilExpiration = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

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
              <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition">Dashboard</Link>
              <Link href="/leads" className="text-foreground/70 hover:text-primary transition">Leads</Link>
              <Link href="/contracts" className="text-primary font-semibold">Contratos</Link>
              <div className="text-sm text-muted-foreground">{user.name}</div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold gradient-gold">Contratos</h2>
            <p className="text-muted-foreground mt-1">Gerencie todos os contratos ativos</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-[#b8941e] to-[#d4af37] text-black font-semibold hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Contrato
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contratos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.active || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total de {stats?.total || 0} contratos</p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                R$ {((stats?.totalRevenue || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Valor total contratado</p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                R$ {((stats?.monthlyRevenue || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receita recorrente</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="mb-6">
          <TabsList className="glass-light">
            <TabsTrigger value="active">
              Ativos ({activeContracts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="expiring">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Próximos do Vencimento ({nearExpiration?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContracts?.map((contract) => {
                const { data: lead } = trpc.leads.getById.useQuery(
                  { id: contract.leadId },
                  { enabled: !!contract.leadId }
                );

                return (
                  <Card key={contract.id} className="glass-card hover:shadow-gold transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-primary">
                            {lead?.name || "Carregando..."}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Contrato #{contract.id}
                          </CardDescription>
                        </div>
                        <Badge className="bg-primary text-black">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor Total</span>
                        <span className="text-lg font-bold text-primary">
                          R$ {(contract.contractValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor Mensal</span>
                        <span className="text-sm font-semibold">
                          R$ {(calculateMonthlyRevenue(contract.contractValue, contract.contractDuration) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{contract.contractDuration} meses</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(contract.startDate).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {contract.services && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">Serviços</div>
                          <div className="text-sm">{contract.services}</div>
                        </div>
                      )}
                      {contract.notes && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">Observações</div>
                          <div className="text-sm">{contract.notes}</div>
                        </div>
                      )}
                      {contract.createdBy && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            Criado por: <span className="text-primary font-medium">{contract.createdBy}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => setEditingContract(contract)}
                          variant="outline"
                          className="flex-1 glass-light"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Link href={`/leads/${contract.leadId}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Ver Lead
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(!activeContracts || activeContracts.length === 0) && (
              <Card className="glass-light">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum contrato ativo</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expiring" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearExpiration?.map((contract) => {
                const { data: lead } = trpc.leads.getById.useQuery(
                  { id: contract.leadId },
                  { enabled: !!contract.leadId }
                );

                const daysLeft = getDaysUntilExpiration(contract.endDate);

                return (
                  <Card key={contract.id} className="glass-card hover:shadow-gold transition-all border-2 border-yellow-500/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-primary">
                            {lead?.name || "Carregando..."}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Contrato #{contract.id}
                          </CardDescription>
                        </div>
                        <Badge className="bg-yellow-500 text-black">
                          {daysLeft} dias
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">Vence em {daysLeft} dias</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor Total</span>
                        <span className="text-lg font-bold text-primary">
                          R$ {(contract.contractValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Vence em {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {contract.services && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">Serviços</div>
                          <div className="text-sm">{contract.services}</div>
                        </div>
                      )}
                      <Link href={`/leads/${contract.leadId}`}>
                        <Button className="w-full mt-2 shadow-gold">
                          Renovar Contrato
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(!nearExpiration || nearExpiration.length === 0) && (
              <Card className="glass-light">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum contrato próximo do vencimento</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogo de Criar Contrato */}
      <ContractFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => setShowCreateDialog(false)}
      />

      {/* Diálogo de Editar Contrato */}
      <ContractFormDialog
        open={!!editingContract}
        onOpenChange={(open) => !open && setEditingContract(null)}
        contract={editingContract}
        onSuccess={() => setEditingContract(null)}
      />
    </div>
  );
}

