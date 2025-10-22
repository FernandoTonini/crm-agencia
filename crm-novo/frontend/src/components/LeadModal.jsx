import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { leadsAPI } from '../services/api';

export const LeadModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    classification: 'Morno',
    score: 40,
    status: 'novo',
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
    question7: '',
    locationCity: '',
    locationState: '',
    locationCountry: 'Brasil',
    observations: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        instagram: lead.instagram || '',
        classification: lead.classification || 'Morno',
        score: lead.score || 40,
        status: lead.status || 'novo',
        question1: lead.question1 || '',
        question2: lead.question2 || '',
        question3: lead.question3 || '',
        question4: lead.question4 || '',
        question5: lead.question5 || '',
        question6: lead.question6 || '',
        question7: lead.question7 || '',
        locationCity: lead.locationCity || '',
        locationState: lead.locationState || '',
        locationCountry: lead.locationCountry || 'Brasil',
        observations: lead.observations || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        instagram: '',
        classification: 'Morno',
        score: 40,
        status: 'novo',
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: '',
        question6: '',
        question7: '',
        locationCity: '',
        locationState: '',
        locationCountry: 'Brasil',
        observations: ''
      });
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (lead) {
        await leadsAPI.update(lead.id, formData);
        alert('Lead atualizado com sucesso!');
      } else {
        await leadsAPI.create(formData);
        alert('Lead criado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      alert('Erro ao salvar lead: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-gold">
            {lead ? 'Editar Lead' : 'Adicionar Novo Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Telefone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Instagram</label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@usuario"
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Classificação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Temperatura *</label>
                <select
                  value={formData.classification}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  className="w-full"
                >
                  <option value="Quente">🔥 Quente</option>
                  <option value="Morno">⭐ Morno</option>
                  <option value="Frio">💡 Frio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Pontuação (0-70) *</label>
                <Input
                  type="number"
                  min="0"
                  max="70"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full"
                >
                  <option value="novo">Novo</option>
                  <option value="contatado">Contatado</option>
                  <option value="negociacao">Negociação</option>
                  <option value="fechado">Fechado</option>
                  <option value="perdido">Perdido</option>
                  <option value="renovacao">Renovação</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Localização</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Cidade</label>
                <Input
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Estado</label>
                <Input
                  value={formData.locationState}
                  onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                  placeholder="SP"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">País</label>
                <Input
                  value={formData.locationCountry}
                  onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Observações</h3>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Anotações</label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="w-full min-h-[100px]"
                placeholder="Adicione observações sobre este lead..."
              />
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
              {loading ? 'Salvando...' : lead ? 'Atualizar Lead' : 'Criar Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

