-- Órdenes de trabajo
CREATE TABLE work_orders (
    id              BIGSERIAL PRIMARY KEY,
    numero          VARCHAR(30) NOT NULL UNIQUE,
    quote_id        BIGINT REFERENCES quotes(id) ON DELETE SET NULL,
    customer_id     BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    asset_id        BIGINT REFERENCES assets(id) ON DELETE SET NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    notas           TEXT,
    total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
    fecha_apertura  TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre    TIMESTAMPTZ,
    fecha_entrega   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_orders_customer ON work_orders (customer_id);
CREATE INDEX idx_work_orders_estado ON work_orders (estado);
CREATE INDEX idx_work_orders_quote ON work_orders (quote_id);
CREATE INDEX idx_work_orders_created ON work_orders (created_at DESC);

-- Ítems de la orden de trabajo
CREATE TABLE work_order_items (
    id                BIGSERIAL PRIMARY KEY,
    work_order_id     BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    descripcion       VARCHAR(255) NOT NULL,
    cantidad          NUMERIC(10, 2) NOT NULL,
    precio_unitario   NUMERIC(14, 2) NOT NULL,
    subtotal          NUMERIC(14, 2) NOT NULL,
    orden             INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_work_order_items_wo ON work_order_items (work_order_id);