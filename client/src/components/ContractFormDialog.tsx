import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: any; // Se fornecido, é edição; senão, é criação
  leadId?: number; // Para criar contrato associado a um lead específico
  onSuccess?: () => void;
}

export function ContractFormDialog({ open, onOpenChange, contract, leadId, onSuccess }: ContractFormDialogProps) {
  const [formData, setFormData] = useState({
    leadId: leadId || 0,
    contractValue: "",
    contractDuration: "",
    services: "",
    startDate: "",
    notes: "",
  });

  const utils = trpc.useUtils();

  // Query para listar todos os leads (para seleção)
  const { data: leads } = trpc.leads.list.useQuery(undefined, {
    enabled: !leadId, // Só busca se não tiver leadId pré-definido
  });

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast.success("Contrato criado com sucesso!");
      utils.contracts.list.invalidate();
      utils.contracts.listByLead.invalidate();
      utils.leads.stats.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar contrato: " + error.message);
    },
  });

  const updateMutation = trpc.contracts.updateFull.useMutation({
    onSuccess: () => {
      toast.success("Contrato atualizado com sucesso!");
      utils.contracts.list.invalidate();
      utils.contracts.listByLead.invalidate();
      utils.leads.stats.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar contrato: " + error.message);
    },
  });

  useEffect(() => {
    if (contract) {
      // Modo edição - preencher formulário com dados do contrato
      setFormData({
        leadId: contract.leadId,
        contractValue: (contract.contractValue / 100).toFixed(2),
        contractDuration: contract.contractDuration.toString(),
        services: contract.services || "",
        startDate: new Date(contract.startDate).toISOString().split('T')[0],
        notes: contract.notes || "",
      });
    } else {
      // Modo criação - limpar formulário
      setFormData({
        leadId: leadId || 0,
        contractValue: "",
        contractDuration: "",
        services: "",
        startDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    }
  }, [contract, leadId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valueInCents = Math.round(parseFloat(formData.contractValue) * 100);

    if (contract) {
      // Atualizar contrato existente
      updateMutation.mutate({
        id: contract.id,
        contractValue: valueInCents,
        contractDuration: parseInt(formData.contractDuration),
        services: formData.services,
        startDate: formData.startDate,
        notes: formData.notes,
      });
    } else {
      // Criar novo contrato
      createMutation.mutate({
        leadId: formData.leadId,
        contractValue: valueInCents,
        contractDuration: parseInt(formData.contractDuration),
        services: formData.services,
        startDate: formData.startDate,
        notes: formData.notes,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-gold">
            {contract ? "Editar Contrato" : "Adicionar Novo Contrato"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Lead (apenas na criação) */}
          {!contract && !leadId && (
            <div className="space-y-2">
              <Label htmlFor="leadId">Lead *</Label>
              <Select
                value={formData.leadId.toString()}
                onValueChange={(value) => setFormData({ ...formData, leadId: parseInt(value) })}
                required
              >
                <SelectTrigger className="glass-light">
                  <SelectValue placeholder="Selecione um lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads?.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id.toString()}>
                      {lead.name} - {lead.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Informações do Contrato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Informações do Contrato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractValue">Valor do Contrato (R$) *</Label>
                <Input
                  id="contractValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                  required
                  className="glass-light"
                  placeholder="5000.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractDuration">Duração (meses) *</Label>
                <Input
                  id="contractDuration"
                  type="number"
                  min="1"
                  value={formData.contractDuration}
                  onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                  required
                  className="glass-light"
                  placeholder="12"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="glass-light"
                />
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Serviços Contratados</h3>
            
            <div className="space-y-2">
              <Label htmlFor="services">Descrição dos Serviços *</Label>
              <Textarea
                id="services"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                required
                className="glass-light min-h-[100px]"
                placeholder="Ex: Tráfego pago, gestão de redes sociais, criação de conteúdo..."
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#d4af37]">Observações</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Anotações Adicionais</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="glass-light min-h-[80px]"
                placeholder="Observações sobre o contrato..."
              />
            </div>
          </div>

          {/* Resumo */}
          {formData.contractValue && formData.contractDuration && (
            <div className="glass-light p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-[#d4af37]">Resumo do Contrato</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor Total:</span>
                  <div className="font-bold text-primary">
                    R$ {parseFloat(formData.contractValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Mensal:</span>
                  <div className="font-bold text-primary">
                    R$ {(parseFloat(formData.contractValue) / parseInt(formData.contractDuration || "1")).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duração:</span>
                  <div className="font-bold">{formData.contractDuration} meses</div>
                </div>
                {formData.startDate && formData.contractDuration && (
                  <div>
                    <span className="text-muted-foreground">Data Final:</span>
                    <div className="font-bold">
                      {new Date(new Date(formData.startDate).setMonth(
                        new Date(formData.startDate).getMonth() + parseInt(formData.contractDuration)
                      )).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
              {isLoading ? "Salvando..." : contract ? "Atualizar Contrato" : "Criar Contrato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

