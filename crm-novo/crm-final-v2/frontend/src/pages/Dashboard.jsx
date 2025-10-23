import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { dashboardAPI } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, DollarSign, AlertCircle, TrendingUp, Flame, Zap, Lightbulb } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  // Calcular contadores por classificação
  const hotLeads = stats.leadsByClassification.find(l => l.name === 'Quente')?.value || 0;
  const warmLeads = stats.leadsByClassification.find(l => l.name === 'Morno')?.value || 0;
  const coldLeads = stats.leadsByClassification.find(l => l.name === 'Frio')?.value || 0;

  const COLORS_CLASSIFICATION = {
    'Quente': '#ef4444',
    'Morno': '#eab308',
    'Frio': '#3b82f6'
  };

  const COLORS_STATUS = ['#d4af37', '#c0c0c0', '#f4d03f', '#b8941f', '#ef4444', '#3b82f6'];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold gradient-gold mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral do seu CRM</p>
        </div>

        {/* Stats Cards - Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total de Leads</p>
                <p className="text-3xl font-bold text-white">{stats.totalLeads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center">
                <Users className="text-gold" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Contratos Ativos</p>
                <p className="text-3xl font-bold text-white">{stats.activeContracts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center">
                <FileText className="text-gold" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-white">
                  R$ {(stats.totalValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center">
                <DollarSign className="text-gold" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Renovações (30d)</p>
                <p className="text-3xl font-bold text-white">{stats.renewalCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center">
                <AlertCircle className="text-gold" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards - Linha 2: Classificação de Leads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leads Quentes */}
          <Card className="border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">🔥 Leads Quentes</p>
                <p className="text-3xl font-bold text-red-500">{hotLeads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center glow-hot">
                <Flame className="text-red-500" size={24} />
              </div>
            </div>
          </Card>

          {/* Leads Mornos */}
          <Card className="border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">⭐ Leads Mornos</p>
                <p className="text-3xl font-bold text-yellow-500">{warmLeads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center glow-warm">
                <Zap className="text-yellow-500" size={24} />
              </div>
            </div>
          </Card>

          {/* Leads Frios */}
          <Card className="border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">💡 Leads Frios</p>
                <p className="text-3xl font-bold text-blue-500">{coldLeads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-button flex items-center justify-center glow-cold">
                <Lightbulb className="text-blue-500" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-gold" size={24} />
              <div>
                <p className="text-sm text-gray-400">Leads Recentes (7 dias)</p>
                <p className="text-2xl font-bold text-white">{stats.recentLeads}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-gold" size={24} />
              <div>
                <p className="text-sm text-gray-400">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Classificação de Leads */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">
              Classificação de Leads
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.leadsByClassification}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.leadsByClassification.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CLASSIFICATION[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Barras - Pipeline de Vendas */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">
              Pipeline de Vendas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.leadsByStatus}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

