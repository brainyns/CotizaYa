# CotizaYa

Sistema de gestión de cotizaciones y órdenes de trabajo para talleres automotrices, técnicos independientes y pequeños negocios de servicios en Colombia.

> **Estado:** En desarrollo activo — 6 fases completadas. Aplicación funcional con dashboard, PDFs y modo oscuro.

---

## 📋 ¿Qué es CotizaYa?

CotizaYa es una aplicación web pensada para talleres y técnicos que hoy gestionan su operación con WhatsApp, cuadernos y Excel. Permite:

- 📊 **Dashboard con métricas** — ingresos del mes, cotizaciones, tasa de aprobación, top clientes
- 📇 **Gestionar clientes** con historial completo
- 🚗 **Registrar vehículos o equipos** por cliente (placa, marca, modelo, año)
- 📄 **Crear cotizaciones** con múltiples ítems y cálculo automático de total
- ✅ **Controlar el ciclo de vida** de cada cotización (borrador → enviada → aprobada/rechazada)
- 🔧 **Generar órdenes de trabajo** desde cotizaciones aprobadas
- 📅 **Rastrear fechas del flujo** (apertura, cierre, entrega) en cada orden
- 📄 **Generar PDF** de cotizaciones y órdenes con logo del taller
- ⚙️ **Configurar el taller** (nombre, NIT, teléfono, dirección, logo, notas al pie)
- 🌓 **Modo claro/oscuro** con preferencia persistente

**Problema que resuelve:** los talleres pequeños no pueden pagar un ERP empresarial como Siigo, pero ya necesitan más que un cuaderno. CotizaYa ocupa ese espacio intermedio: simple, en español, y pensado para el día a día de un taller real.

---

## 🚧 Estado del proyecto

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Clientes (CRUD completo) | ✅ Completado |
| 2 | Assets / Vehículos (CRUD + relación con cliente) | ✅ Completado |
| 3 | Cotizaciones (cabecera + ítems + estados) | ✅ Completado |
| 4 | Órdenes de trabajo (fechas y transiciones de estado) | ✅ Completado |
| 5 | PDF de cotizaciones y órdenes | ✅ Completado |
| 6 | Dashboard (KPIs, gráficos, top clientes) | ✅ Completado |
| 7 | Rediseño UI + modo oscuro + componentes | ✅ Completado |
| 8 | Autenticación y multi-usuario | ⬜ Pendiente |
| 9 | WhatsApp (envío de PDFs) | ⬜ Pendiente |
| 10 | Facturación electrónica DIAN | ⬜ Pendiente |

---

## 🛠️ Stack técnico

### Backend
- **Java 21** — lenguaje
- **Spring Boot 4.1.1** — framework
- **Spring Web MVC** — API REST
- **Spring Data JPA + Hibernate** — persistencia
- **PostgreSQL 16** — base de datos
- **Flyway** — migraciones versionadas
- **Bean Validation** — validación de entrada
- **OpenPDF 1.3.39** — generación de PDFs
- **Lombok** — reducción de boilerplate
- **Maven** — gestión de dependencias

### Frontend
- **React 19** — UI
- **TypeScript** — tipado estático
- **Vite 8** — bundler y dev server
- **TailwindCSS 4** — estilos con dark mode
- **TanStack Query v5** — estado del servidor
- **React Router v7** — navegación
- **Recharts 2** — gráficos (línea + dona)
- **Lucide React** — iconos SVG
- **Fetch API nativa** — cliente HTTP

### Arquitectura backend
Patrón **MVC + capa de servicio**:

```
Cliente (React)
    ↓ HTTP/JSON
Controller  (@RestController)   ← recibe requests, valida, responde
    ↓
Service     (@Service)          ← lógica de negocio, transacciones
    ↓
Repository  (JpaRepository)     ← acceso a datos
    ↓
Entity      (@Entity)           ← modelo / mapeo a tabla
    ↓
PostgreSQL
```

---

## 📦 Requisitos previos

- **Java 21** — [Descargar](https://adoptium.net/)
- **Maven 3.9+** (o usar `./mvnw`)
- **Node.js 20+** y **npm** — [Descargar](https://nodejs.org/)
- **PostgreSQL 16** — [Descargar](https://www.postgresql.org/download/) (o [Neon](https://neon.tech/) gratis)

---

## 🚀 Cómo correrlo localmente

### 1. Clonar

```bash
git clone https://github.com/TU_USUARIO/cotizaya.git
cd cotizaya
```

### 2. Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE cotizaciones;"
```

### 3. Configurar el backend

Edita `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cotizaciones
spring.datasource.username=postgres
spring.datasource.password=TU_PASSWORD
```

### 4. Correr el backend

```bash
./mvnw spring-boot:run
```

En Windows:
```powershell
.\mvnw spring-boot:run
```

Backend en `http://localhost:8080`. Flyway aplica migraciones automáticamente.

### 5. Correr el frontend

En **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:5173`.

### 6. Configuración inicial

Al entrar por primera vez, ve a **Configuración** en el sidebar y llena los datos del taller (nombre, NIT, teléfono, dirección, logo, notas al pie). Esos datos se usarán en todos los PDFs que generes.

---

## 📂 Estructura del proyecto

```
cotizaya/
├── pom.xml
├── mvnw, mvnw.cmd
├── src/main/
│   ├── java/cotizaciones/app/
│   │   ├── AppApplication.java
│   │   ├── Controller/                # Endpoints REST
│   │   ├── Service/                   # Lógica de negocio + PDF services
│   │   ├── Repository/                # Acceso a datos (JPA)
│   │   ├── Model/                     # Entidades (@Entity)
│   │   ├── DTO/                       # Request/Response DTOs
│   │   └── shared/                    # Config global, excepciones
│   └── resources/
│       ├── application.properties
│       └── db/migration/
│           ├── V1__init.sql
│           ├── V2__assets.sql
│           ├── V3__quotes.sql
│           ├── V4__work_orders.sql
│           └── V5__business_settings.sql
└── frontend/
    └── src/
        ├── api/                       # Cliente HTTP (fetch)
        ├── components/
        │   ├── ui/                    # Componentes reutilizables (Card, Button, etc.)
        │   └── ...                    # Componentes específicos
        ├── contexts/                  # ThemeContext (dark mode)
        ├── pages/                     # Páginas / rutas
        ├── types/                     # Tipos TypeScript
        ├── App.tsx                    # Router principal
        └── main.tsx
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8080/api`

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | KPIs, ingresos por mes, top clientes |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/customers?q=nombre` | Listar / buscar |
| `GET` | `/customers/{id}` | Obtener uno |
| `POST` | `/customers` | Crear |
| `PUT` | `/customers/{id}` | Actualizar |
| `DELETE` | `/customers/{id}` | Eliminar |

### Assets (Vehículos / Equipos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/customers/{customerId}/assets` | Listar del cliente |
| `POST` | `/customers/{customerId}/assets` | Crear para cliente |
| `GET` | `/assets/{id}` | Obtener |
| `PUT` | `/assets/{id}` | Actualizar |
| `DELETE` | `/assets/{id}` | Eliminar |

**Tipos:** `VEHICULO`, `ELECTRODOMESTICO`, `INMUEBLE`, `EQUIPO`, `OTRO`.

### Cotizaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/quotes?customerId=&estado=` | Listar con filtros |
| `GET` | `/quotes/{id}` | Obtener |
| `GET` | `/quotes/{id}/pdf` | Descargar/ver PDF |
| `POST` | `/quotes` | Crear |
| `PUT` | `/quotes/{id}` | Actualizar (solo BORRADOR) |
| `PATCH` | `/quotes/{id}/estado?estado=X` | Cambiar estado |
| `DELETE` | `/quotes/{id}` | Eliminar (solo BORRADOR) |

**Estados:** `BORRADOR` → `ENVIADA` → `APROBADA` / `RECHAZADA`.

### Órdenes de trabajo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/work-orders?customerId=&estado=` | Listar con filtros |
| `GET` | `/work-orders/{id}` | Obtener |
| `GET` | `/work-orders/{id}/pdf` | Descargar/ver PDF |
| `POST` | `/work-orders` | Crear (con o sin cotización origen) |
| `PUT` | `/work-orders/{id}` | Actualizar (solo ABIERTA/EN_PROCESO) |
| `PATCH` | `/work-orders/{id}/estado?estado=X` | Cambiar estado |
| `DELETE` | `/work-orders/{id}` | Eliminar (solo ABIERTA/CANCELADA) |

**Estados:** `ABIERTA` → `EN_PROCESO` → `TERMINADA` → `ENTREGADA`, más `CANCELADA`.

**Fechas automáticas:** `fechaApertura` (al crear), `fechaCierre` (al pasar a TERMINADA), `fechaEntrega` (al pasar a ENTREGADA).

### Configuración del taller

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/business-settings` | Obtener configuración |
| `PUT` | `/business-settings` | Actualizar configuración |

---

## 🎨 Diseño y UX

- **Modo claro/oscuro** con toggle en el sidebar (persistencia en `localStorage`)
- **Componentes reutilizables** en `src/components/ui/`:
  - `Card` (con Header, Body, Footer)
  - `Button` (variantes: primary, secondary, danger, ghost)
  - `Input`, `Textarea`, `Select`, `Label`
  - `Badge`, `EmptyState`, `PageHeader`
- **Iconos Lucide React** en lugar de emojis
- **Tipografía Inter** (Google Fonts)
- **Estilo visual** inspirado en Vercel/Linear: minimalista, alto contraste, paleta `zinc`

---

## 🗺️ Roadmap

### Corto plazo
- [ ] Autenticación con Spring Security + JWT
- [ ] Multi-usuario por taller (roles: admin, técnico)
- [ ] Envío de PDFs por WhatsApp (Meta Cloud API)

### Medio plazo
- [ ] Registro de pagos y anticipos
- [ ] Adjuntar fotos a las órdenes (antes/después del trabajo)
- [ ] Búsqueda global (clientes, cotizaciones, órdenes)
- [ ] Historial de actividad por cliente

### Largo plazo
- [ ] Integración con facturación electrónica DIAN
- [ ] Módulo de inventario de repuestos
- [ ] App móvil (React Native o PWA)
- [ ] Reportes exportables (CSV, Excel)

---

## 🧠 Decisiones de diseño

- **Patrón MVC + capa de servicio** para separar responsabilidades y facilitar testing.
- **DTOs separados** de las entidades JPA, para no acoplar la API al esquema de base de datos.
- **Flyway** en lugar de `ddl-auto: update` de Hibernate, para migraciones versionadas.
- **BigDecimal** para todos los montos (nunca `double` o `float`).
- **Estados con transiciones controladas** en el Service, no en el Controller.
- **`orphanRemoval=true`** en relaciones `@OneToMany` para que al actualizar ítems, los viejos se borren automáticamente.
- **Numeración correlativa** con prefijos (`COT-YYYY-NNNN`, `OT-YYYY-NNNN`).
- **PDFs generados al momento** (no se guardan), para que siempre reflejen los datos actuales.
- **TanStack Query** en el frontend (el 90% del estado es del servidor).
- **Fetch API nativa** en lugar de Axios.
- **Tailwind v4** con `@custom-variant dark` para dark mode basado en clase.
- **Package by layer** en el backend (migrar a package-by-feature si crece a 15+ entidades).

---

## 🤝 Contribuir

Proyecto personal en desarrollo. Si quieres contribuir, abre un issue describiendo qué te gustaría mejorar antes de mandar un PR.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**[Tu Nombre]**
- GitHub: [@brainyns](https://github.com/brainyns)
- Email: brainyblanco17@gmail.com

---

## 🙏 Agradecimientos

- A los talleres y técnicos colombianos que inspiraron este proyecto.
- A la comunidad de Spring Boot y React por la documentación y ejemplos disponibles.
