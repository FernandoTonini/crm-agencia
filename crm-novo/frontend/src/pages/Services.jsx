import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import Card from '../components/Card';
import Loading from '../components/Loading';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

export default function Services() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contracts/services/stats');
      setStats(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const totalRevenue = stats.reduce((sum, service) => sum + (service.totalRevenue || 0), 0);
  const totalContracts = stats.reduce((sum, service) => sum + (service.contractCount || 0), 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gold-400 mb-2">Serviços</h1>
          <p className="text-gray-400">Análise de serviços contratados e receita por categoria</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total de Serviços</p>
                <p className="text-3xl font-bold text-gold-400">{stats.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Contratos Totais</p>
                <p className="text-3xl font-bold text-blue-400">{totalContracts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Receita por Serviço */}
          <Card>
            <h3 className="text-xl font-semibold text-gold-400 mb-4">Receita por Serviço</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="serviceName" 
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#FFD700" name="Receita Total" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Pizza - Distribuição de Contratos */}
          <Card>
            <h3 className="text-xl font-semibold text-gold-400 mb-4">Distribuição de Contratos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ serviceName, percent }) => `${serviceName}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="contractCount"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabela de Serviços */}
        <Card>
          <h3 className="text-xl font-semibold text-gold-400 mb-4">Detalhes por Serviço</h3>
          
          {stats.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400">Nenhum serviço encontrado</p>
              <p className="text-sm text-gray-500 mt-2">Adicione contratos com descrições para ver estatísticas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gold-400">Serviço</th>
                    <th className="text-center py-3 px-4 text-gold-400">Contratos</th>
                    <th className="text-right py-3 px-4 text-gold-400">Receita Total</th>
                    <th className="text-right py-3 px-4 text-gold-400">Receita Média</th>
                    <th className="text-right py-3 px-4 text-gold-400">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((service, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-white">{service.serviceName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">
                        {service.contractCount}
                      </td>
                      <td className="py-3 px-4 text-right text-green-400 font-semibold">
                        {formatCurrency(service.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatCurrency(service.avgRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-gold-400">
                        {((service.totalRevenue / totalRevenue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

