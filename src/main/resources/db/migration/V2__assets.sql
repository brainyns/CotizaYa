CREATE TABLE assets (
    id            BIGSERIAL PRIMARY KEY,
    customer_id   BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tipo          VARCHAR(30) NOT NULL,
    marca         VARCHAR(60),
    modelo        VARCHAR(60),
    placa_serial  VARCHAR(60),
    anio          INTEGER,
    notas         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_customer ON assets (customer_id);
CREATE INDEX idx_assets_placa ON assets (placa_serial);