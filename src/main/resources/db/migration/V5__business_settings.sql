CREATE TABLE business_settings (
    id              BIGSERIAL PRIMARY KEY,
    nombre_taller   VARCHAR(120) NOT NULL,
    nit             VARCHAR(30),
    telefono        VARCHAR(30),
    email           VARCHAR(120),
    direccion       VARCHAR(200),
    ciudad          VARCHAR(80),
    notas_pie       TEXT,
    logo_base64     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertar una fila por defecto (singleton) para que GET nunca devuelva vacío
INSERT INTO business_settings (nombre_taller, ciudad)
VALUES ('Mi Taller', 'Bogotá');