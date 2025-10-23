import { X, Mail, Phone, Instagram, MapPin, Calendar, User, FileText, MessageSquare } from 'lucide-react';
import { Card } from './Card';

export const LeadDetailsModal = ({ lead, onClose, contracts = [] }) => {
  if (!lead) return null;

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Quente': return 'text-red-500';
      case 'Morno': return 'text-yellow-500';
      case 'Frio': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'Quente': return '🔥';
      case 'Morno': return '⭐';
      case 'Frio': return '💡';
      default: return '📊';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'novo': 'Novo',
      'contatado': 'Contatado',
      'negociacao': 'Negociação',
      'fechado': 'Fechado',
      'perdido': 'Perdido',
      'renovacao': 'Renovação'
    };
    return labels[status] || status;
  };

  // Perguntas do quiz
  const quizQuestions = [
    { key: 'question1', label: 'Pergunta 1' },
    { key: 'question2', label: 'Pergunta 2' },
    { key: 'question3', label: 'Pergunta 3' },
    { key: 'question4', label: 'Pergunta 4' },
    { key: 'question5', label: 'Pergunta 5' },
    { key: 'question6', label: 'Pergunta 6' },
    { key: 'question7', label: 'Pergunta 7' }
  ];

  const answeredQuestions = quizQuestions.filter(q => lead[q.key]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-4xl w-full my-8 relative animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full glass-button flex items-center justify-center text-3xl">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{lead.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`badge badge-${lead.classification.toLowerCase()} flex items-center gap-1`}>
                  <span>{getClassificationIcon(lead.classification)}</span>
                  <span>{lead.classification}</span>
                </span>
                <span className="text-sm text-gray-400">
                  Score: <span className="text-gold font-semibold">{lead.score}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg glass-button hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Informações de Contato */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-gold" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-white">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="text-white">{lead.phone}</p>
                </div>
              </div>
              {lead.instagram && (
                <div className="flex items-center gap-3">
                  <Instagram size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Instagram</p>
                    <p className="text-white">{lead.instagram}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Data de Cadastro</p>
                  <p className="text-white">
                    {new Date(lead.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Status e Classificação */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status Atual</p>
                <span className="px-3 py-1 rounded-lg bg-white/5 text-white text-sm">
                  {getStatusLabel(lead.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Classificação</p>
                <span className={`badge badge-${lead.classification.toLowerCase()}`}>
                  {getClassificationIcon(lead.classification)} {lead.classification}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Pontuação</p>
                <span className="text-2xl font-bold text-gold">{lead.score}</span>
              </div>
            </div>
          </Card>

          {/* Perguntas e Respostas do Quiz */}
          {answeredQuestions.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-gold" />
                Respostas do Quiz ({answeredQuestions.length})
              </h3>
              <div className="space-y-4">
                {answeredQuestions.map((q, index) => (
                  <div key={q.key} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">
                      {q.label}
                    </p>
                    <p className="text-white">{lead[q.key]}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Localização */}
          {(lead.locationCity || lead.ipAddress) && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-gold" />
                Localização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.ipAddress && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Endereço IP</p>
                    <p className="text-white">{lead.ipAddress}</p>
                  </div>
                )}
                {lead.locationCity && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Cidade</p>
                    <p className="text-white">{lead.locationCity}</p>
                  </div>
                )}
                {lead.locationState && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Estado</p>
                    <p className="text-white">{lead.locationState}</p>
                  </div>
                )}
                {lead.locationCountry && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">País</p>
                    <p className="text-white">{lead.locationCountry}</p>
                  </div>
                )}
                {(lead.locationLatitude && lead.locationLongitude) && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Coordenadas</p>
                    <p className="text-white text-sm">
                      {lead.locationLatitude}, {lead.locationLongitude}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Observações */}
          {lead.observations && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-gold" />
                Observações
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">{lead.observations}</p>
            </Card>
          )}

          {/* Contratos Vinculados */}
          {contracts.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-gold" />
                Contratos ({contracts.length})
              </h3>
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        R$ {(contract.contractValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${contract.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {contract.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Duração: {contract.contractDuration} meses
                    </p>
                    <p className="text-sm text-gray-400">
                      Início: {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                    </p>
                    {contract.notes && (
                      <p className="text-sm text-gray-300 mt-2">{contract.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Auditoria */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Histórico</h3>
            <div className="space-y-2 text-sm">
              {lead.createdBy && (
                <p className="text-gray-400">
                  Adicionado por: <span className="text-white">{lead.createdBy}</span>
                </p>
              )}
              {lead.lastModifiedBy && (
                <p className="text-gray-400">
                  Última modificação por: <span className="text-white">{lead.lastModifiedBy}</span>
                </p>
              )}
              {lead.lastModifiedAt && (
                <p className="text-gray-400">
                  Modificado em: <span className="text-white">
                    {new Date(lead.lastModifiedAt).toLocaleString('pt-BR')}
                  </span>
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

