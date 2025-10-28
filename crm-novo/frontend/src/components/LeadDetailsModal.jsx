import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Plus, Calendar, Mail, Phone, MapPin, Award, Tag } from 'lucide-react';
import api from '../services/api';

export const LeadDetailsModal = ({ isOpen, onClose, leadId, onSuccess }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && leadId) {
      loadLeadDetails();
    }
  }, [isOpen, leadId]);

  const loadLeadDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leads/${leadId}`);
      setLead(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/leads/${leadId}`, formData);
      setLead(formData);
      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${leadId}`);
      setShowDeleteConfirm(false);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gold-400">Detalhes do Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400 mx-auto"></div>
          </div>
        ) : lead ? (
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <section>
              <h3 className="text-lg font-semibold text-gold-400 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Nome</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={16} className="text-gray-500" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Telefone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={16} className="text-gray-500" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Instagram</label>
                  <input
                    type="text"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    disabled={!isEditing}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </section>

            {/* Localização */}
            <section>
              <h3 className="text-lg font-semibold text-gold-400 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Localização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={formData.locationCity || ''}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  disabled={!isEditing}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="Estado"
                  value={formData.locationState || ''}
                  onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                  disabled={!isEditing}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="País"
                  value={formData.locationCountry || ''}
                  onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                  disabled={!isEditing}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                />
              </div>
            </section>

            {/* Classificação */}
            <section>
              <h3 className="text-lg font-semibold text-gold-400 mb-4 flex items-center gap-2">
                <Award size={20} />
                Classificação
              </h3>
              <select
                value={formData.classification || ''}
                onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
              >
                <option value="">Selecione uma classificação</option>
                <option value="Quente">🔥 Quente</option>
                <option value="Morno">🌤️ Morno</option>
                <option value="Frio">❄️ Frio</option>
              </select>
            </section>

            {/* Serviços Contratados */}
            {lead.services && lead.services.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gold-400 mb-4 flex items-center gap-2">
                  <Tag size={20} />
                  Serviços Contratados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {lead.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full text-sm border border-gold-500/50"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Respostas do Quiz */}
            <section>
              <h3 className="text-lg font-semibold text-gold-400 mb-4">Respostas do Quiz</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const key = `question${num}`;
                  const answer = formData[key];
                  return (
                    <div key={num} className="bg-gray-800 p-3 rounded">
                      <p className="text-sm text-gray-400 mb-1">Pergunta {num}</p>
                      <p className="text-white">{answer || 'Sem resposta'}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Auditoria */}
            <section className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg font-semibold text-gold-400 mb-3">Auditoria</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <span className="text-white">Criado por:</span> {lead.createdBy || 'Desconhecido'}
                </p>
                <p>
                  <span className="text-white">Data de criação:</span>{' '}
                  {new Date(lead.createdAt).toLocaleString('pt-BR')}
                </p>
                {lead.lastModifiedBy && (
                  <>
                    <p>
                      <span className="text-white">Modificado por:</span> {lead.lastModifiedBy}
                    </p>
                    <p>
                      <span className="text-white">Última modificação:</span>{' '}
                      {new Date(lead.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </>
                )}
              </div>
            </section>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    <Trash2 size={18} />
                    Deletar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(lead);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">Lead não encontrado</div>
        )}

        {/* Modal de Confirmação de Deleção */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Confirmar Deleção</h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja deletar este lead? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

