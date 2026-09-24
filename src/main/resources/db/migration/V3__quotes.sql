-- Cabecera de cotización
CREATE TABLE quotes (
    id           BIGSERIAL PRIMARY KEY,
    numero       VARCHAR(30) NOT NULL UNIQUE,
    customer_id  BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    asset_id     BIGINT REFERENCES assets(id) ON DELETE SET NULL,
    estado       VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    notas        TEXT,
    total        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_customer ON quotes (customer_id);
CREATE INDEX idx_quotes_estado ON quotes (estado);
CREATE INDEX idx_quotes_created ON quotes (created_at DESC);

-- Líneas de cotización
CREATE TABLE quote_items (
    id                BIGSERIAL PRIMARY KEY,
    quote_id          BIGINT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    descripcion       VARCHAR(255) NOT NULL,
    cantidad          NUMERIC(10, 2) NOT NULL,
    precio_unitario   NUMERIC(14, 2) NOT NULL,
    subtotal          NUMERIC(14, 2) NOT NULL,
    orden             INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_quote_items_quote ON quote_items (quote_id);