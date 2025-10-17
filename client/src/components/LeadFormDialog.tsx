import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: any; // Se fornecido, é edição; senão, é criação
  onSuccess?: () => void;
}

export function LeadFormDialog({ open, onOpenChange, lead, onSuccess }: LeadFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    classification: "Morno" as "Quente" | "Morno" | "Frio",
    score: 40,
    status: "novo" as "novo" | "contatado" | "negociacao" | "fechado" | "perdido" | "renovacao",
    question_1: "",
    question_2: "",
    question_3: "",
    question_4: "",
    question_5: "",
    question_6: "",
    question_7: "",
    location_city: "",
    location_state: "",
    location_country: "Brasil",
    observations: "",
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.leads.createManual.useMutation({
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      utils.leads.list.invalidate();
      utils.leads.stats.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar lead: " + error.message);
    },
  });

  const updateMutation = trpc.leads.updateFull.useMutation({
    onSuccess: () => {
      toast.success("Lead atualizado com sucesso!");
      utils.leads.list.invalidate();
      utils.leads.getById.invalidate();
      utils.leads.stats.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar lead: " + error.message);
    },
  });

  useEffect(() => {
    if (lead) {
      // Modo edição - preencher formulário com dados do lead
      setFormData({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        instagram: lead.instagram || "",
        classification: lead.classification || "Morno",
        score: lead.score || 40,
        status: lead.status || "novo",
        question_1: lead.question1 || "",
        question_2: lead.question2 || "",
        question_3: lead.question3 || "",
        question_4: lead.question4 || "",
        question_5: lead.question5 || "",
        question_6: lead.question6 || "",
        question_7: lead.question7 || "",
        location_city: lead.locationCity || "",
        location_state: lead.locationState || "",
        location_country: lead.locationCountry || "Brasil",
        observations: lead.observations || "",
      });
    } else {
      // Modo criação - limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        instagram: "",
        classification: "Morno",
        score: 40,
        status: "novo",
        question_1: "",
        question_2: "",
        question_3: "",
        question_4: "",
        question_5: "",
        question_6: "",
        question_7: "",
        location_city: "",
        location_state: "",
        location_country: "Brasil",
        observations: "",
      });
    }
  }, [lead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (lead) {
      // Atualizar lead existente
      updateMutation.mutate({
        id: lead.id,
        ...formData,
      });
    } else {
      // Criar novo lead
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-gold">
            {lead ? "Editar Lead" : "Adicionar Novo Lead"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="glass-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="glass-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="glass-light"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="glass-light"
                  placeholder="@usuario"
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Classificação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classification">Temperatura *</Label>
                <Select
                  value={formData.classification}
                  onValueChange={(value: any) => setFormData({ ...formData, classification: value })}
                >
                  <SelectTrigger className="glass-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quente">🔥 Quente</SelectItem>
                    <SelectItem value="Morno">⭐ Morno</SelectItem>
                    <SelectItem value="Frio">💡 Frio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Pontuação (0-70) *</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="70"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                  required
                  className="glass-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="glass-light">
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
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Localização</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_city">Cidade</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  className="glass-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_state">Estado</Label>
                <Input
                  id="location_state"
                  value={formData.location_state}
                  onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                  className="glass-light"
                  placeholder="SP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_country">País</Label>
                <Input
                  id="location_country"
                  value={formData.location_country}
                  onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                  className="glass-light"
                />
              </div>
            </div>
          </div>

          {/* Respostas do Quiz (Opcional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Respostas do Quiz (Opcional)</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="space-y-2">
                  <Label htmlFor={`question_${num}`}>Pergunta {num}</Label>
                  <Input
                    id={`question_${num}`}
                    value={formData[`question_${num}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`question_${num}`]: e.target.value })}
                    className="glass-light"
                    placeholder="Resposta..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Observações</h3>
            
            <div className="space-y-2">
              <Label htmlFor="observations">Anotações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="glass-light min-h-[100px]"
                placeholder="Adicione observações sobre este lead..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="glass-light"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#b8941e] to-[#d4af37] text-black font-semibold hover:opacity-90"
            >
              {isLoading ? "Salvando..." : lead ? "Atualizar Lead" : "Criar Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

