CREATE DATABASE db;

\c db

CREATE TABLE usuarios(
    id INT GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    empresa_id INT,
    usuario_id INT,
    PRIMARY KEY(id)
);

CREATE TABLE empresas(
    id INT GENERATED ALWAYS AS IDENTITY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    usuario_id INT NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE sedes(
    id INT GENERATED ALWAYS AS IDENTITY,
    cnpj VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    empresa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE tokens(
    token VARCHAR(255) UNIQUE NOT NULL,
    usuario_id INT NOT NULL
    PRIMARY KEY(usuario_id) -- Am I free to do this?
);

ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuario_empresa
    FOREIGN KEY (empresa_id)
    REFERENCES empresas(id)
    ON DELETE CASCADE;
ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuario_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

ALTER TABLE empresas
    ADD CONSTRAINT fk_empresa_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

ALTER TABLE sedes
    ADD CONSTRAINT fk_sede_empresa
    FOREIGN KEY (empresa_id)
    REFERENCES empresas(id)
    ON DELETE CASCADE;
ALTER TABLE sedes
    ADD CONSTRAINT fk_sede_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

ALTER TABLE tokens
    ADD CONSTRAINT fk_token_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;