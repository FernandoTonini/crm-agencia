import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Flame, Sparkles, Lightbulb, Search, Download, MapPin, Mail, Phone, Instagram, Plus } from "lucide-react";
import { LeadFormDialog } from "@/components/LeadFormDialog";
import { Link } from "wouter";
import { useState } from "react";

export default function Leads() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const { data: allLeads, isLoading } = trpc.leads.list.useQuery(undefined, {
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

  const filteredLeads = allLeads?.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && lead.classification.toLowerCase() === activeTab;
  }) || [];

  const exportEmails = () => {
    const emails = filteredLeads.map(lead => lead.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emails.txt';
    a.click();
  };

  const exportPhones = () => {
    const phones = filteredLeads.map(lead => lead.phone).join('\n');
    const blob = new Blob([phones], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'telefones.txt';
    a.click();
  };

  const exportInstagrams = () => {
    const instagrams = filteredLeads.filter(lead => lead.instagram).map(lead => lead.instagram).join('\n');
    const blob = new Blob([instagrams], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instagrams.txt';
    a.click();
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case "Quente":
        return <Flame className="h-4 w-4 icon-hot" />;
      case "Morno":
        return <Sparkles className="h-4 w-4 icon-warm" />;
      case "Frio":
        return <Lightbulb className="h-4 w-4 icon-cold" />;
      default:
        return null;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
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

  const getClassificationGlow = (classification: string) => {
    switch (classification) {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold gradient-gold">Leads</h2>
            <p className="text-muted-foreground mt-1">Gerencie todos os seus leads</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-[#b8941e] to-[#d4af37] text-black font-semibold hover:opacity-90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Lead
            </Button>
            <Button onClick={exportEmails} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Emails
            </Button>
            <Button onClick={exportPhones} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Telefones
            </Button>
            <Button onClick={exportInstagrams} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Instagrams
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-light"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="glass-light">
            <TabsTrigger value="all">Todos ({allLeads?.length || 0})</TabsTrigger>
            <TabsTrigger value="quente">
              <Flame className="h-4 w-4 mr-2" />
              Quentes ({allLeads?.filter(l => l.classification === "Quente").length || 0})
            </TabsTrigger>
            <TabsTrigger value="morno">
              <Sparkles className="h-4 w-4 mr-2" />
              Mornos ({allLeads?.filter(l => l.classification === "Morno").length || 0})
            </TabsTrigger>
            <TabsTrigger value="frio">
              <Lightbulb className="h-4 w-4 mr-2" />
              Frios ({allLeads?.filter(l => l.classification === "Frio").length || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className={`glass-card hover:shadow-gold transition-all cursor-pointer h-full ${getClassificationGlow(lead.classification)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-primary">{lead.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {new Date(lead.timestamp!).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(lead.timestamp!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </CardDescription>
                    </div>
                    <Badge className={`${getClassificationColor(lead.classification)} flex items-center gap-1`}>
                      {getClassificationIcon(lead.classification)}
                      {lead.classification}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                  {lead.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.instagram}</span>
                    </div>
                  )}
                  {lead.locationCity && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.locationCity}, {lead.locationState}</span>
                    </div>
                  )}
                  <div className="pt-2 space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {lead.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Pontuação: {lead.score}
                    </div>
                    {lead.lastModifiedBy && (
                      <div className="text-xs text-muted-foreground">
                        Última alteração: {lead.lastModifiedBy}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <Card className="glass-light">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Diálogo de Criar/Editar Lead */}
      <LeadFormDialog
        open={showCreateDialog || !!editingLead}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingLead(null);
          }
        }}
        lead={editingLead}
        onSuccess={() => {
          setShowCreateDialog(false);
          setEditingLead(null);
        }}
      />
    </div>
  );
}

