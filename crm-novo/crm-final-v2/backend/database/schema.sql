-- Schema do CRM A Agência
-- Banco de dados MySQL/TiDB

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  instagram VARCHAR(255),
  
  -- Classificação e pontuação
  score INT NOT NULL,
  classification ENUM('Quente', 'Morno', 'Frio') NOT NULL,
  
  -- Respostas do quiz
  question1 TEXT,
  question2 TEXT,
  question3 TEXT,
  question4 TEXT,
  question5 TEXT,
  question6 TEXT,
  question7 TEXT,
  
  -- Dados de geolocalização
  ipAddress VARCHAR(100),
  locationCity VARCHAR(255),
  locationState VARCHAR(255),
  locationCountry VARCHAR(255),
  locationLatitude VARCHAR(50),
  locationLongitude VARCHAR(50),
  
  -- Status do lead
  status ENUM('novo', 'contatado', 'negociacao', 'fechado', 'perdido', 'renovacao') DEFAULT 'novo' NOT NULL,
  
  -- Observações
  observations TEXT,
  
  -- Auditoria
  lastModifiedBy VARCHAR(255),
  lastModifiedAt TIMESTAMP NULL,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_classification (classification),
  INDEX idx_status (status),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leadId INT NOT NULL,
  
  -- Informações do contrato
  contractValue INT NOT NULL COMMENT 'Valor em centavos',
  contractDuration INT NOT NULL COMMENT 'Duração em meses',
  services TEXT COMMENT 'Serviços contratados (JSON)',
  
  -- Datas
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  
  -- Status
  isActive BOOLEAN DEFAULT TRUE NOT NULL,
  renewalNotified BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- Observações
  notes TEXT,
  
  -- Auditoria
  createdBy VARCHAR(255),
  lastModifiedBy VARCHAR(255),
  lastModifiedAt TIMESTAMP NULL,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_leadId (leadId),
  INDEX idx_isActive (isActive),
  INDEX idx_endDate (endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário admin padrão (senha: admin123)
-- Hash bcrypt de "admin123": $2a$10$rZ7YvqOXKJKGxKx5qXxqXuYvJ8vqOXKJKGxKx5qXxqXuYvJ8vqOXK
INSERT INTO users (id, name, email, password, role) 
VALUES (
  'admin-default',
  'Administrador',
  'admin@agenciaa.com',
  '$2a$10$rZ7YvqOXKJKGxKx5qXxqXuYvJ8vqOXKJKGxKx5qXxqXuYvJ8vqOXK',
  'admin'
) ON DUPLICATE KEY UPDATE email = email;

