CREATE DATABASE IF NOT EXISTS glingo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glingo;

-- Tabela de idiomas
CREATE TABLE IF NOT EXISTS idioma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(200)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idioma_id INT NOT NULL,
    nivel VARCHAR(30) NOT NULL,
    professor VARCHAR(100) NOT NULL,
    horario VARCHAR(50) NOT NULL,
    modalidade VARCHAR(20) NOT NULL,
    vagas_total INT NOT NULL,
    vagas_restantes INT NOT NULL,
    FOREIGN KEY (idioma_id) REFERENCES idioma(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(200) NOT NULL,
    telefone VARCHAR(20),
    data_nasc DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de professores
CREATE TABLE IF NOT EXISTS professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(200) NOT NULL,
    ra VARCHAR(20) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    especialidade VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    turma_id INT NOT NULL,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ativa',
    FOREIGN KEY (aluno_id) REFERENCES aluno(id),
    FOREIGN KEY (turma_id) REFERENCES turma(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de atendimentos
CREATE TABLE IF NOT EXISTS atendimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT,
    status VARCHAR(30) DEFAULT 'aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES aluno(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    atendimento_id INT NOT NULL,
    remetente VARCHAR(20) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(30) DEFAULT 'mensagem',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (atendimento_id) REFERENCES atendimento(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dados para teste
INSERT INTO idioma (nome, descricao) VALUES
('Inglês', 'Curso de língua inglesa para todos os níveis'),
('Espanhol', 'Curso de língua espanhola para todos os níveis'),
('Português', 'Curso de português para estrangeiros'),
('Mandarim', 'Curso de língua chinesa mandarim');

INSERT INTO turma (idioma_id, nivel, professor, horario, modalidade, vagas_total, vagas_restantes) VALUES
(1, 'Iniciante', 'Prof. Allie Hayes', 'Ter/Qui 19h-20h30', 'Presencial', 20, 8),
(1, 'Intermediário', 'Prof. Jonh Logan', 'Seg/Qua 18h-19h30', 'Online', 20, 3),
(2, 'Avançado', 'Prof. Hanna Wells', 'Sex 19h-21h', 'Online', 20, 12),
(3, 'Iniciante', 'Prof. Dean Di Laurentis', 'Sáb 09h-11h', 'Presencial', 15, 0),
(4, 'Iniciante', 'Prof. Jonh Tucker', 'Ter/Qui 18h-19h30', 'Presencial', 15, 6);