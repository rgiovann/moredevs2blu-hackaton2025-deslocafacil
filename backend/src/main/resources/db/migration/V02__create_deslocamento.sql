CREATE TABLE deslocamento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    origem_cidade VARCHAR(100) NOT NULL,
    origem_estado CHAR(2) NOT NULL,
    origem_endereco VARCHAR(255) NULL,
    destino_cidade VARCHAR(100) NOT NULL,
    destino_estado CHAR(2) NOT NULL,
    destino_endereco VARCHAR(255) NULL,
    motivo VARCHAR(255) NOT NULL,
    data_saida DATETIME NOT NULL,
    data_chegada_prevista DATETIME NOT NULL,
    data_chegada_real DATETIME NULL,
    meio_transporte ENUM('AVIAO','ONIBUS','CARRO','UBER_99','TAXI','BARCO','OUTROS') NOT NULL,
    custo_estimado DECIMAL(10,2) NULL,
    custo_real DECIMAL(10,2) NULL,
    status ENUM('PLANEJADO','EM_TRANSITO','ATRASADO','CONCLUIDO','CANCELADO','CONCLUÍDO_COM_ATRASO')
        NOT NULL DEFAULT 'PLANEJADO',
    observacoes TEXT NULL,
    data_cadastro DATETIME NOT NULL,
    data_alteracao DATETIME NULL,
    criado_por BIGINT NULL,
    alterado_por BIGINT NULL,
    CONSTRAINT fk_deslocamento_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

