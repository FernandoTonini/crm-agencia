import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { leadsAPI } from '../services/api';
import { Search, Plus, Download, Flame, Droplet, Snowflake } from 'lucide-react';
import { format } from 'date-fns';

export const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassification, setFilterClassification] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadLeads();
  }, [filterClassification, filterStatus]);

  const loadLeads = async () => {
    try {
      const params = {};
      if (filterClassification) params.classification = filterClassification;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;

      const response = await leadsAPI.getAll(params);
      setLeads(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadLeads();
  };

  const handleExport = async (type) => {
    try {
      const response = await leadsAPI.export(type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados');
    }
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'Quente': return <Flame className="icon-hot" size={20} />;
      case 'Morno': return <Droplet className="icon-warm" size={20} />;
      case 'Frio': return <Snowflake className="icon-cold" size={20} />;
      default: return null;
    }
  };

  const getClassificationGlow = (classification) => {
    switch (classification) {
      case 'Quente': return 'hot';
      case 'Morno': return 'warm';
      case 'Frio': return 'cold';
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      novo: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
      contatado: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
      negociacao: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
      fechado: 'bg-green-600/20 text-green-400 border-green-600/30',
      perdido: 'bg-red-600/20 text-red-400 border-red-600/30',
      renovacao: 'bg-gold/20 text-gold border-gold/30'
    };
    return colors[status] || colors.novo;
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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-gold mb-2">Leads</h1>
            <p className="text-gray-400">Gerencie seus leads capturados</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/leads/new')}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Adicionar Lead
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <form onSubmit={handleSearch} className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  <Search size={20} />
                </Button>
              </div>
            </form>

            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="px-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="">Todas Classificações</option>
              <option value="Quente">Quente</option>
              <option value="Morno">Morno</option>
              <option value="Frio">Frio</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="">Todos Status</option>
              <option value="novo">Novo</option>
              <option value="contatado">Contatado</option>
              <option value="negociacao">Negociação</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
              <option value="renovacao">Renovação</option>
            </select>
          </div>
        </Card>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => handleExport('emails')} className="flex items-center gap-2">
            <Download size={18} />
            Exportar Emails
          </Button>
          <Button variant="secondary" onClick={() => handleExport('phones')} className="flex items-center gap-2">
            <Download size={18} />
            Exportar Telefones
          </Button>
          <Button variant="secondary" onClick={() => handleExport('instagram')} className="flex items-center gap-2">
            <Download size={18} />
            Exportar Instagram
          </Button>
          <Button variant="secondary" onClick={() => handleExport('locations')} className="flex items-center gap-2">
            <Download size={18} />
            Exportar Localizações
          </Button>
        </div>

        {/* Leads Grid */}
        {leads.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum lead encontrado</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <Card
                key={lead.id}
                glow={getClassificationGlow(lead.classification)}
                className="cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getClassificationIcon(lead.classification)}
                    <span className="text-sm font-medium text-gray-400">
                      {lead.classification}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{lead.name}</h3>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <p>{lead.email}</p>
                  <p>{lead.phone}</p>
                  {lead.instagram && <p>@{lead.instagram}</p>}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Score: {lead.score}</span>
                    <span>{format(new Date(lead.timestamp), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

