CREATE TABLE customers (
    id           BIGSERIAL PRIMARY KEY,
    nombre       VARCHAR(120) NOT NULL,
    telefono     VARCHAR(30),
    email        VARCHAR(120),
    notas        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_nombre ON customers (nombre);