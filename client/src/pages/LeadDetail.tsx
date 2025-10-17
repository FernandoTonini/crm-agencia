import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Flame, Sparkles, Lightbulb, MapPin, Mail, Phone, Instagram, Calendar, DollarSign, FileText, ArrowLeft, Edit } from "lucide-react";
import { LeadFormDialog } from "@/components/LeadFormDialog";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function LeadDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [observations, setObservations] = useState("");
  const [status, setStatus] = useState("");
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Contract form state
  const [contractValue, setContractValue] = useState("");
  const [contractDuration, setContractDuration] = useState("");
  const [services, setServices] = useState("");
  const [startDate, setStartDate] = useState("");
  const [contractNotes, setContractNotes] = useState("");

  const { data: lead, isLoading } = trpc.leads.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!user && !!id }
  );

  const { data: contracts } = trpc.contracts.listByLead.useQuery(
    { leadId: parseInt(id!) },
    { enabled: !!user && !!id }
  );

  const updateLeadMutation = trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.getById.invalidate({ id: parseInt(id!) });
      toast.success("Lead atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar lead");
    },
  });

  const createContractMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      utils.contracts.listByLead.invalidate({ leadId: parseInt(id!) });
      utils.leads.getById.invalidate({ id: parseInt(id!) });
      setIsContractDialogOpen(false);
      toast.success("Contrato criado com sucesso!");
      // Reset form
      setContractValue("");
      setContractDuration("");
      setServices("");
      setStartDate("");
      setContractNotes("");
    },
    onError: () => {
      toast.error("Erro ao criar contrato");
    },
  });

  if (authLoading || isLoading) {
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

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass max-w-md">
          <CardHeader>
            <CardTitle>Lead não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/leads')}>Voltar para Leads</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getClassificationIcon = () => {
    switch (lead.classification) {
      case "Quente":
        return <Flame className="h-5 w-5 icon-hot" />;
      case "Morno":
        return <Sparkles className="h-5 w-5 icon-warm" />;
      case "Frio":
        return <Lightbulb className="h-5 w-5 icon-cold" />;
      default:
        return null;
    }
  };

  const getClassificationColor = () => {
    switch (lead.classification) {
      case "Quente":
        return "bg-[#d4af37] text-black";
      case "Morno":
        return "bg-[#f4d03f] text-black";
      case "Frio":
        return "bg-[#c0c0c0] text-black";
      default:
        return "bg-muted";
    }
  };

  const getClassificationGlow = () => {
    switch (lead.classification) {
      case "Quente":
        return "glow-hot";
      case "Morno":
        return "glow-warm";
      case "Frio":
        return "glow-cold";
      default:
        return "";
    }
  };
  const handleSaveObservations = () => {
    updateLeadMutation.mutate({
      id: lead.id,
      observations,
    });
  };

  const handleUpdateStatus = (newStatus: string) => {
    updateLeadMutation.mutate({
      id: lead.id,
      status: newStatus as any,
    });
    setStatus(newStatus);
  };

  const handleCreateContract = () => {
    const valueInCents = Math.round(parseFloat(contractValue) * 100);
    createContractMutation.mutate({
      leadId: lead.id,
      contractValue: valueInCents,
      contractDuration: parseInt(contractDuration),
      services,
      startDate,
      notes: contractNotes,
    });
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
              <Link href="/leads" className="text-primary font-semibold">Leads</Link>
              <Link href="/contracts" className="text-foreground/70 hover:text-primary transition">Contratos</Link>
              <div className="text-sm text-muted-foreground">{user.name}</div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Button onClick={() => setLocation('/leads')} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Leads
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className={`glass-card shadow-gold-lg ${getClassificationGlow()}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl gradient-gold">{lead.name}</CardTitle>
                    <CardDescription className="mt-2">
                      Cadastrado em {new Date(lead.timestamp!).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(lead.timestamp!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setIsEditDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="glass-light"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Badge className={`${getClassificationColor()} flex items-center gap-1 text-base px-3 py-1`}>
                      {getClassificationIcon()}
                      {lead.classification}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">{lead.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Telefone</div>
                      <div className="font-medium">{lead.phone}</div>
                    </div>
                  </div>
                  {lead.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Instagram</div>
                        <div className="font-medium">{lead.instagram}</div>
                      </div>
                    </div>
                  )}
                  {lead.locationCity && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Localização</div>
                        <div className="font-medium">{lead.locationCity}, {lead.locationState}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-border space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Pontuação do Quiz</div>
                    <div className="text-2xl font-bold text-primary">{lead.score} pontos</div>
                  </div>
                  {lead.lastModifiedBy && (
                    <div className="text-xs text-muted-foreground">
                      Última modificação por: <span className="text-primary font-medium">{lead.lastModifiedBy}</span>
                      {lead.lastModifiedAt && (
                        <> em {new Date(lead.lastModifiedAt).toLocaleString('pt-BR')}</>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Answers */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-primary">Respostas do Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const answer = lead[`question${num}` as keyof typeof lead];
                  if (!answer) return null;
                  return (
                    <div key={num} className="pb-3 border-b border-border last:border-0">
                      <div className="text-xs text-muted-foreground mb-1">Pergunta {num}</div>
                      <div className="text-sm">{answer as string}</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-primary">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status || lead.status} onValueChange={handleUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="contatado">Contatado</SelectItem>
                    <SelectItem value="negociacao">Negociação</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                    <SelectItem value="renovacao">Renovação</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-primary">Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Adicione observações sobre este lead..."
                  value={observations || lead.observations || ""}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleSaveObservations} className="w-full shadow-gold">
                  Salvar Observações
                </Button>
              </CardContent>
            </Card>

            {/* Contracts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-primary">Contratos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contracts && contracts.length > 0 ? (
                  contracts.map((contract) => (
                    <div key={contract.id} className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={contract.isActive ? "default" : "secondary"}>
                          {contract.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <div className="text-sm font-bold text-primary">
                          R$ {(contract.contractValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contract.contractDuration} meses
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(contract.startDate).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum contrato cadastrado</p>
                )}
                
                <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full shadow-gold">
                      <FileText className="h-4 w-4 mr-2" />
                      Criar Contrato
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass">
                    <DialogHeader>
                      <DialogTitle className="gradient-gold">Novo Contrato</DialogTitle>
                      <DialogDescription>Preencha os dados do contrato</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contractValue">Valor do Contrato (R$)</Label>
                        <Input
                          id="contractValue"
                          type="number"
                          step="0.01"
                          value={contractValue}
                          onChange={(e) => setContractValue(e.target.value)}
                          placeholder="5000.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contractDuration">Duração (meses)</Label>
                        <Input
                          id="contractDuration"
                          type="number"
                          value={contractDuration}
                          onChange={(e) => setContractDuration(e.target.value)}
                          placeholder="12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="startDate">Data de Início</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="services">Serviços</Label>
                        <Textarea
                          id="services"
                          value={services}
                          onChange={(e) => setServices(e.target.value)}
                          placeholder="Tráfego pago, gestão de redes sociais..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contractNotes">Observações</Label>
                        <Textarea
                          id="contractNotes"
                          value={contractNotes}
                          onChange={(e) => setContractNotes(e.target.value)}
                          placeholder="Observações adicionais..."
                          rows={2}
                        />
                      </div>
                      <Button onClick={handleCreateContract} className="w-full shadow-gold">
                        Criar Contrato
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Diálogo de Editar Lead */}
      <LeadFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        lead={lead}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          utils.leads.getById.invalidate({ id: parseInt(id!) });
        }}
      />
    </div>
  );
}

