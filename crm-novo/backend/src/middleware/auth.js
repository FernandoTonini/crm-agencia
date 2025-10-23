import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware para verificar token JWT
export const authenticateToken = (req, res, next) => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação não fornecido' 
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          success: false, 
          message: 'Token inválido ou expirado' 
        });
      }

      // Adicionar usuário ao request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar autenticação' 
    });
  }
};

// Middleware para verificar se é admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
    });
  }
  next();
};

// Gerar token JWT
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export default { authenticateToken, requireAdmin, generateToken };

