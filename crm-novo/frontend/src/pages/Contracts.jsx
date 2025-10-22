import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ContractModal } from '../components/ContractModal';
import { contractsAPI, leadsAPI } from '../services/api';
import { Plus, Search, DollarSign, Calendar, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contractsRes, leadsRes] = await Promise.all([
        contractsAPI.getAll(),
        leadsAPI.getAll()
      ]);
      setContracts(contractsRes.data.data || []);
      setLeads(leadsRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeadName = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Lead não encontrado';
  };

  const getLeadEmail = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.email : '';
  };

  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    return end < today;
  };

  const filteredContracts = contracts.filter(contract => {
    const leadName = getLeadName(contract.leadId);
    const leadEmail = getLeadEmail(contract.leadId);
    return (
      leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leadEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.services?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const activeContracts = filteredContracts.filter(c => c.isActive && !isExpired(c.endDate));
  const expiringContracts = activeContracts.filter(c => isExpiringSoon(c.endDate));
  const expiredContracts = filteredContracts.filter(c => isExpired(c.endDate));

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingContract(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingContract(null);
  };

  const handleSuccess = () => {
    loadData();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-gold mb-2">Contratos</h1>
            <p className="text-gray-400">Gerencie todos os contratos</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-[#b8941e] to-[#d4af37] text-black font-semibold"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Contrato
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl glass-light">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Contratos Ativos</p>
                <p className="text-2xl font-bold text-gold">{activeContracts.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl glass-light">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Renovações (30d)</p>
                <p className="text-2xl font-bold text-yellow-500">{expiringContracts.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl glass-light">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Expirados</p>
                <p className="text-2xl font-bold text-red-500">{expiredContracts.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, email ou serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 glass-light"
          />
        </div>

        {/* Alerts - Expiring Soon */}
        {expiringContracts.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-500 mb-1">
                  Atenção: {expiringContracts.length} contrato(s) expirando em 30 dias
                </h3>
                <p className="text-sm text-gray-400">
                  Entre em contato com os clientes para renovação
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contracts Grid */}
        {filteredContracts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum contrato encontrado</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm ? 'Tente ajustar sua busca' : 'Adicione seu primeiro contrato para começar'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContracts.map((contract) => {
              const expiring = isExpiringSoon(contract.endDate);
              const expired = isExpired(contract.endDate);
              
              return (
                <Card 
                  key={contract.id} 
                  className={`card-hover cursor-pointer ${
                    expired ? 'border-red-500/30' : expiring ? 'border-yellow-500/30' : ''
                  }`}
                  onClick={() => handleEdit(contract)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {getLeadName(contract.leadId)}
                        </h3>
                        <p className="text-sm text-gray-400">{getLeadEmail(contract.leadId)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gold">
                          {formatCurrency(contract.contractValue)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {contract.contractDuration} {contract.contractDuration === 1 ? 'mês' : 'meses'}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Calendar size={14} />
                          <span>Início</span>
                        </div>
                        <div className="text-white">{formatDate(contract.startDate)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Calendar size={14} />
                          <span>Término</span>
                        </div>
                        <div className={`font-semibold ${
                          expired ? 'text-red-500' : expiring ? 'text-yellow-500' : 'text-white'
                        }`}>
                          {formatDate(contract.endDate)}
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    {contract.services && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                          <FileText size={14} />
                          <span>Serviços</span>
                        </div>
                        <p className="text-sm text-white line-clamp-2">{contract.services}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Valor Mensal:</span>
                        <span className="text-sm text-white font-semibold">
                          {formatCurrency(contract.contractValue / contract.contractDuration)}
                        </span>
                      </div>
                      {expired ? (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-500 border border-red-500/30">
                          Expirado
                        </span>
                      ) : expiring ? (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                          Expira em breve
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-500 border border-green-500/30">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <ContractModal
        isOpen={showModal}
        onClose={handleModalClose}
        contract={editingContract}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
};
