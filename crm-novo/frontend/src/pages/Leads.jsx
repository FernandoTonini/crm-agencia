import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { LeadModal } from '../components/LeadModal';
import { LeadDetailsModal } from '../components/LeadDetailsModal';
import { leadsAPI } from '../services/api';
import { Plus, Search, Download, Flame, Sparkles, Lightbulb, Mail, Phone, Instagram as InstagramIcon, MapPin } from 'lucide-react';

export const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await leadsAPI.getAll();
      setLeads(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && lead.classification.toLowerCase() === activeTab;
  });

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'Quente':
        return <Flame className="h-4 w-4 icon-hot" />;
      case 'Morno':
        return <Sparkles className="h-4 w-4 icon-warm" />;
      case 'Frio':
        return <Lightbulb className="h-4 w-4 icon-cold" />;
      default:
        return null;
    }
  };

  const getClassificationBadge = (classification) => {
    const badges = {
      'Quente': 'badge-hot glow-hot',
      'Morno': 'badge-warm glow-warm',
      'Frio': 'badge-cold glow-cold'
    };
    return badges[classification] || '';
  };

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

  const exportLocations = () => {
    const locations = filteredLeads
      .filter(lead => lead.locationCity || lead.locationState)
      .map(lead => `${lead.name}: ${lead.locationCity || ''}, ${lead.locationState || ''} - ${lead.locationCountry || ''}`)
      .join('\n');
    const blob = new Blob([locations], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localizacoes.txt';
    a.click();
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingLead(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  const handleSuccess = () => {
    loadLeads();
  };

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  const tabCounts = {
    all: leads.length,
    quente: leads.filter(l => l.classification === 'Quente').length,
    morno: leads.filter(l => l.classification === 'Morno').length,
    frio: leads.filter(l => l.classification === 'Frio').length
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-gold mb-2">Leads</h1>
            <p className="text-gray-400">Gerencie todos os seus leads</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-[#b8941e] to-[#d4af37] text-black font-semibold"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Lead
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 glass-light"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === 'all' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            Todos ({tabCounts.all})
          </button>
          <button
            onClick={() => setActiveTab('quente')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'quente' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Flame className="h-4 w-4 icon-hot" />
            Quente ({tabCounts.quente})
          </button>
          <button
            onClick={() => setActiveTab('morno')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'morno' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Sparkles className="h-4 w-4 icon-warm" />
            Morno ({tabCounts.morno})
          </button>
          <button
            onClick={() => setActiveTab('frio')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'frio' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Lightbulb className="h-4 w-4 icon-cold" />
            Frio ({tabCounts.frio})
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportEmails} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exportar Emails
          </Button>
          <Button onClick={exportPhones} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exportar Telefones
          </Button>
          <Button onClick={exportInstagrams} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exportar Instagram
          </Button>
          <Button onClick={exportLocations} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exportar Localizações
          </Button>
        </div>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum lead encontrado</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm ? 'Tente ajustar sua busca' : 'Adicione seu primeiro lead para começar'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="card-hover cursor-pointer" onClick={() => { setSelectedLead(lead); setShowDetailsModal(true); }}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{lead.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 ${getClassificationBadge(lead.classification)}`}>
                          {getClassificationIcon(lead.classification)}
                          {lead.classification}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gold">{lead.score}</div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone size={16} className="text-gray-400" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.instagram && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <InstagramIcon size={16} className="text-gray-400" />
                        <span>{lead.instagram}</span>
                      </div>
                    )}
                    {(lead.locationCity || lead.locationState) && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{lead.locationCity}, {lead.locationState}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-400">Status:</span>
                    <span className="ml-2 text-sm text-white capitalize">{lead.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <LeadModal
        isOpen={showModal}
        onClose={handleModalClose}
        lead={editingLead}
        onSuccess={handleSuccess}
      />

      {/* Details Modal */}
      {showDetailsModal && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => { setShowDetailsModal(false); setSelectedLead(null); }}
          contracts={[]}
        />
      )}
    </Layout>
  );
};
