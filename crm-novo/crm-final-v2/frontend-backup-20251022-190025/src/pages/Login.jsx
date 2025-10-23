import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-gold-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-gold mb-2">
              CRM A Agência
            </h1>
            <p className="text-gray-400">
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Mensagem de erro */}
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 text-sm">
              {message}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loading /> : 'Entrar'}
            </Button>
          </form>

          {/* Link para registro */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-gold hover:underline">
              Criar conta
            </Link>
          </div>
        </div>

        {/* Credenciais padrão */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Credenciais padrão:</p>
          <p>Email: admin@agenciaa.com | Senha: admin123</p>
        </div>
      </div>
    </div>
  );
};

