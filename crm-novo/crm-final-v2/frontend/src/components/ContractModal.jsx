import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { contractsAPI, leadsAPI } from '../services/api';

export const ContractModal = ({ isOpen, onClose, contract, onSuccess }) => {
  const [formData, setFormData] = useState({
    leadId: '',
    contractValue: '',
    contractDuration: 12,
    services: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen]);

  useEffect(() => {
    if (contract) {
      const startDate = new Date(contract.startDate).toISOString().split('T')[0];
      const endDate = new Date(contract.endDate).toISOString().split('T')[0];
      
      setFormData({
        leadId: contract.leadId || '',
        contractValue: (contract.contractValue / 100).toFixed(2),
        contractDuration: contract.contractDuration || 12,
        services: contract.services || '',
        startDate: startDate,
        endDate: endDate,
        notes: contract.notes || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const endDate = oneYearLater.toISOString().split('T')[0];
      
      setFormData({
        leadId: '',
        contractValue: '',
        contractDuration: 12,
        services: '',
        startDate: today,
        endDate: endDate,
        notes: ''
      });
    }
  }, [contract, isOpen]);

  const loadLeads = async () => {
    try {
      const response = await leadsAPI.getAll();
      setLeads(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    }
  };

  const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + parseInt(duration));
    return start.toISOString().split('T')[0];
  };

  const handleStartDateChange = (date) => {
    setFormData({
      ...formData,
      startDate: date,
      endDate: calculateEndDate(date, formData.contractDuration)
    });
  };

  const handleDurationChange = (duration) => {
    setFormData({
      ...formData,
      contractDuration: duration,
      endDate: calculateEndDate(formData.startDate, duration)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        contractValue: Math.round(parseFloat(formData.contractValue) * 100),
        contractDuration: parseInt(formData.contractDuration),
        leadId: parseInt(formData.leadId)
      };

      if (contract) {
        await contractsAPI.update(contract.id, payload);
        alert('Contrato atualizado com sucesso!');
      } else {
        await contractsAPI.create(payload);
        alert('Contrato criado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      alert('Erro ao salvar contrato: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-gold">
            {contract ? 'Editar Contrato' : 'Adicionar Novo Contrato'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Cliente</h3>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Lead/Cliente *</label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                required
                className="w-full"
              >
                <option value="">Selecione um lead...</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detalhes do Contrato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Detalhes do Contrato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Valor do Contrato (R$) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Duração (meses) *</label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.contractDuration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Data de Início *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Data de Término *</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Serviços Contratados</label>
              <textarea
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="w-full min-h-[100px]"
                placeholder="Descreva os serviços incluídos no contrato..."
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Observações</h3>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Notas Adicionais</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full min-h-[100px]"
                placeholder="Adicione observações sobre este contrato..."
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="glass-light p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gold mb-2">Resumo</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Valor Total:</div>
              <div className="text-white font-semibold">
                R$ {parseFloat(formData.contractValue || 0).toFixed(2)}
              </div>
              <div className="text-gray-400">Duração:</div>
              <div className="text-white font-semibold">
                {formData.contractDuration} {formData.contractDuration === 1 ? 'mês' : 'meses'}
              </div>
              <div className="text-gray-400">Valor Mensal:</div>
              <div className="text-white font-semibold">
                R$ {(parseFloat(formData.contractValue || 0) / parseInt(formData.contractDuration || 1)).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#b8941e] to-[#d4af37] text-black font-semibold"
            >
              {loading ? 'Salvando...' : contract ? 'Atualizar Contrato' : 'Criar Contrato'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

