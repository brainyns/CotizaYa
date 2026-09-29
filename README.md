# CotizaYa

Sistema de gestión de cotizaciones y órdenes de trabajo para talleres automotrices, técnicos independientes y pequeños negocios de servicios en Colombia.

> **Estado:** En desarrollo activo — Fase 4 completada (Clientes, Assets, Cotizaciones, Órdenes de trabajo).

---

## 📋 ¿Qué es CotizaYa?

CotizaYa es una aplicación web pensada para talleres y técnicos que hoy gestionan su operación con WhatsApp, cuadernos y Excel. Permite:

- 📇 **Gestionar clientes** con historial completo
- 🚗 **Registrar vehículos o equipos** por cliente (placa, marca, modelo, año)
- 📄 **Crear cotizaciones** con múltiples ítems y cálculo automático de total
- ✅ **Controlar el ciclo de vida** de cada cotización (borrador → enviada → aprobada/rechazada)
- 🔧 **Generar órdenes de trabajo** desde cotizaciones aprobadas
- 📅 **Rastrear fechas del flujo** (apertura, cierre, entrega) en cada orden
- 📲 **Enviar cotizaciones por WhatsApp** (próximamente)
- 📄 **Generar PDF de cotizaciones** (próximamente)

**Problema que resuelve:** los talleres pequeños no pueden pagar un ERP empresarial como Siigo, pero ya necesitan más que un cuaderno. CotizaYa ocupa ese espacio intermedio: simple, en español, y pensado para el día a día de un taller real.

---

## 🚧 Estado del proyecto

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Clientes (CRUD completo) | ✅ Completado |
| 2 | Assets / Vehículos (CRUD + relación con cliente) | ✅ Completado |
| 3 | Cotizaciones (cabecera + ítems + estados) | ✅ Completado |
| 4 | Órdenes de trabajo (con fechas y transiciones) | ✅ Completado |
| 5 | PDF de cotizaciones + WhatsApp | 🚧 En desarrollo |
| 6 | Autenticación y multi-usuario | ⬜ Pendiente |
| 7 | Dashboard con métricas | ⬜ Pendiente |

---

## 🛠️ Stack técnico

### Backend
- **Java 21** — lenguaje
- **Spring Boot 4.1.1** — framework
- **Spring Web MVC** — API REST
- **Spring Data JPA + Hibernate** — persistencia
- **PostgreSQL 16** — base de datos
- **Flyway** — migraciones de esquema
- **Bean Validation** — validación de entrada
- **Lombok** — reducción de boilerplate
- **Maven** — gestión de dependencias

### Frontend
- **React 19** — UI
- **TypeScript** — tipado estático
- **Vite 8** — bundler y dev server
- **TailwindCSS 4** — estilos
- **TanStack Query v5** — estado del servidor
- **React Router v7** — navegación
- **Fetch API nativa** — cliente HTTP

### Arquitectura backend
Patrón **MVC + capa de servicio** (layered architecture):

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
- **Maven 3.9+** (o el wrapper `./mvnw` incluido)
- **Node.js 20+** y **npm** — [Descargar](https://nodejs.org/)
- **PostgreSQL 16** — [Descargar](https://www.postgresql.org/download/) (o [Neon](https://neon.tech/) gratis)

```bash
java -version
mvn -version
node -v
npm -v
psql --version
```

---

## 🚀 Cómo correrlo localmente

### 1. Clonar el repositorio

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
│   │   ├── Service/                   # Lógica de negocio
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
│           └── V4__work_orders.sql
└── frontend/
    └── src/
        ├── api/                       # Cliente HTTP (fetch)
        ├── components/                # Componentes reutilizables
        ├── pages/                     # Páginas / rutas
        ├── types/                     # Tipos TypeScript
        ├── App.tsx                    # Router principal
        └── main.tsx
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8080/api`

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
| `POST` | `/quotes` | Crear |
| `PUT` | `/quotes/{id}` | Actualizar (solo BORRADOR) |
| `PATCH` | `/quotes/{id}/estado?estado=X` | Cambiar estado |
| `DELETE` | `/quotes/{id}` | Eliminar (solo BORRADOR) |

**Estados:** `BORRADOR` → `ENVIADA` → `APROBADA` / `RECHAZADA`.

**Transiciones válidas:**
- BORRADOR → ENVIADA
- ENVIADA → APROBADA o RECHAZADA
- APROBADA/RECHAZADA: finales

### Órdenes de trabajo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/work-orders?customerId=&estado=` | Listar con filtros |
| `GET` | `/work-orders/{id}` | Obtener |
| `POST` | `/work-orders` | Crear (con o sin cotización origen) |
| `PUT` | `/work-orders/{id}` | Actualizar (solo ABIERTA/EN_PROCESO) |
| `PATCH` | `/work-orders/{id}/estado?estado=X` | Cambiar estado |
| `DELETE` | `/work-orders/{id}` | Eliminar (solo ABIERTA/CANCELADA) |

**Estados:** `ABIERTA` → `EN_PROCESO` → `TERMINADA` → `ENTREGADA`, más `CANCELADA`.

**Transiciones válidas:**
- ABIERTA → EN_PROCESO o CANCELADA
- EN_PROCESO → TERMINADA o CANCELADA
- TERMINADA → ENTREGADA
- ENTREGADA/CANCELADA: finales

**Fechas automáticas:**
- `fechaApertura`: al crear
- `fechaCierre`: al pasar a TERMINADA
- `fechaEntrega`: al pasar a ENTREGADA

### Formato de errores

Todos los errores siguen **RFC 7807 (Problem Details)**:

```json
{
  "type": "about:blank",
  "title": "Datos inválidos",
  "status": 400,
  "detail": "Validation failed",
  "errors": ["nombre: no debe estar vacío"]
}
```

**Códigos:**
- `400` → datos malformados, validación falla, reglas cruzadas
- `404` → recurso no encontrado
- `409` → regla de negocio (ej: editar una cotización enviada)

---

## 🗺️ Roadmap

### Corto plazo
- [ ] Configuración del taller (nombre, logo, teléfono, dirección)
- [ ] Generación de PDF de cotizaciones
- [ ] Envío de PDF por WhatsApp (Meta Cloud API)
- [ ] Generación de PDF de órdenes de trabajo

### Medio plazo
- [ ] Autenticación con Spring Security + JWT
- [ ] Multi-usuario por taller (roles: admin, técnico)
- [ ] Registro de pagos y anticipos
- [ ] Adjuntar fotos a las órdenes (antes/después del trabajo)

### Largo plazo
- [ ] Dashboard con métricas (cotizaciones del mes, tasa de aprobación, ingresos)
- [ ] App móvil (React Native o PWA)
- [ ] Integración con facturación electrónica DIAN
- [ ] Módulo de inventario de repuestos

---

## 🧠 Decisiones de diseño

- **Patrón MVC + capa de servicio** para separar responsabilidades y facilitar testing.
- **DTOs separados** de las entidades JPA, para no acoplar la API al esquema de base de datos.
- **Flyway** en lugar de `ddl-auto: update` de Hibernate, para migraciones versionadas.
- **BigDecimal** para todos los montos (nunca `double` o `float`).
- **Estados con transiciones controladas** en el Service, no en el Controller.
- **`orphanRemoval=true`** en relaciones `@OneToMany` para que al actualizar ítems, los viejos se borren automáticamente.
- **Numeración correlativa** con prefijos (`COT-YYYY-NNNN`, `OT-YYYY-NNNN`).
- **TanStack Query** en el frontend en lugar de Redux (el 90% del estado es del servidor).
- **Fetch API nativa** en lugar de Axios (menos dependencias).
- **Package by layer** porque el proyecto es mediano; si crece a 15+ features, migrar a package-by-feature.

---
## 🤝 Contribuir

Este es un proyecto personal en desarrollo. Si quieres contribuir, abre un issue describiendo qué te gustaría mejorar antes de mandar un PR.

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
