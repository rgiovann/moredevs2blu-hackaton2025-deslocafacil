CREATE TABLE checkpoint (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    deslocamento_id BIGINT NOT NULL,
    descricao VARCHAR(255) NULL,
    ordem_sugerida INT NULL,
    icone VARCHAR(50) NULL,
    cor VARCHAR(7) NULL,
    localizacao VARCHAR(255) NULL,
    data_prevista DATETIME NULL,
    data_realizada DATETIME NULL,
    categoria ENUM('PARTIDA','INTERMEDIARIO','CHEGADA') NOT NULL,
    observacoes TEXT NULL,
    data_cadastro DATETIME NOT NULL,
    data_alteracao DATETIME NULL,
    criado_por BIGINT NULL,
    alterado_por BIGINT NULL,
    CONSTRAINT fk_checkpoint_deslocamento FOREIGN KEY (deslocamento_id)
        REFERENCES deslocamento(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;