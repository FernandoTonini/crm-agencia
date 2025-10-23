import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import crypto from 'crypto';

// Registrar novo usuário
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gerar ID único
    const userId = crypto.randomUUID();

    // Inserir usuário
    await query(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, 'user']
    );

    // Buscar usuário criado
    const [newUser] = await query(
      'SELECT id, name, email, role, createdAt FROM users WHERE id = ?',
      [userId]
    );

    // Gerar token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    const user = users[0];

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Atualizar lastSignedIn
    await query(
      'UPDATE users SET lastSignedIn = NOW() WHERE id = ?',
      [user.id]
    );

    // Gerar token
    const token = generateToken(user);

    // Remover senha do objeto
    delete user.password;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
};

// Obter usuário atual
export const me = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await query(
      'SELECT id, name, email, role, createdAt, lastSignedIn FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário'
    });
  }
};

export default { register, login, me };

