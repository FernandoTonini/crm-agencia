import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
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
  const [aiProcessing, setAiProcessing] = useState(false);

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
    setAiProcessing(true);

    try {
      const payload = {
        ...formData,
        contractValue: formData.contractValue ? Math.round(parseFloat(formData.contractValue) * 100) : undefined,
        contractDuration: formData.contractDuration ? parseInt(formData.contractDuration) : undefined,
        leadId: parseInt(formData.leadId)
      };

      if (contract) {
        await contractsAPI.update(contract.id, payload);
      } else {
        await contractsAPI.create(payload);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      alert('Erro ao salvar contrato: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setAiProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold gradient-gold">
            {contract ? 'Editar Contrato' : 'Novo Contrato'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Lead Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lead *
            </label>
            <select
              required
              value={formData.leadId}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-500 transition-colors"
            >
              <option value="">Selecione um lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id} className="bg-gray-900">
                  {lead.name} - {lead.email}
                </option>
              ))}
            </select>
          </div>

          {/* AI Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Descrição do Contrato (IA)</span>
              </div>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: contrato de 3 meses por 750 de trafego, midias sociais e site"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 A IA vai extrair automaticamente: serviços, valores e duração
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contract Value */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Mensal (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.contractValue}
                onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                placeholder="Ex: 750.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco se informou na descrição
              </p>
            </div>

            {/* Contract Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duração (meses)
              </label>
              <Input
                type="number"
                value={formData.contractDuration}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="Ex: 12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Início *
              </label>
              <Input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>

            {/* End Date (calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Término
              </label>
              <Input
                type="date"
                value={formData.endDate}
                disabled
                className="bg-white/5 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  {aiProcessing && <Sparkles className="w-4 h-4 animate-pulse" />}
                  {aiProcessing ? 'Processando com IA...' : 'Salvando...'}
                </span>
              ) : (
                contract ? 'Atualizar' : 'Criar Contrato'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractModal;
