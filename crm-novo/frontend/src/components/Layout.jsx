import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { LayoutDashboard, Users, FileText, Package, LogOut } from 'lucide-react';

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: FileText, label: 'Contratos', path: '/contracts' },
    { icon: Package, label: 'Serviços', path: '/services' },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/10 flex flex-col z-50">
        {/* Logo/Title */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold gradient-gold">CRM A Agência</h1>
          <p className="text-sm text-gray-400 mt-1">Gestão de Leads & Contratos</p>
        </div>

        {/* User Info */}
        <div className="p-6">
          <div className="glass-light p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Bem-vindo(a)</p>
            <p className="text-lg font-semibold text-gold truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'glass-button text-gold shadow-gold'
                    : 'glass-light text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass-light text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
