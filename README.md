# CotizaYa

Sistema de gestión de cotizaciones y órdenes de trabajo para talleres automotrices, técnicos independientes y pequeños negocios de servicios en Colombia.

> **Estado:** En desarrollo activo — Fase 2 completada (Clientes + Assets).

---

## 📋 ¿Qué es CotizaYa?

CotizaYa es una aplicación web pensada para talleres y técnicos que hoy gestionan su operación con WhatsApp, cuadernos y Excel. Permite:

- 📇 **Gestionar clientes** con historial completo
- 🚗 **Registrar vehículos o equipos** por cliente (placa, marca, modelo, año)
- 📄 **Crear cotizaciones** en minutos (próximamente)
- 🛠️ **Generar órdenes de trabajo** desde cotizaciones aprobadas (próximamente)
- 📲 **Enviar cotizaciones por WhatsApp** (próximamente)
- 💰 **Cobrar anticipos y llevar control de pagos** (próximamente)

**Problema que resuelve:** los talleres pequeños no pueden pagar un ERP empresarial como Siigo, pero ya necesitan más que un cuaderno. CotizaYa ocupa ese espacio intermedio: simple, en español, y pensado para el día a día de un taller real.

---

## 🚧 Estado del proyecto

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Clientes (CRUD completo) | ✅ Completado |
| 2 | Assets / Vehículos (CRUD + relación con cliente) | ✅ Completado |
| 3 | Cotizaciones (cabecera + ítems) | 🚧 En desarrollo |
| 4 | Órdenes de trabajo | ⬜ Pendiente |
| 5 | Generación de PDF + envío por WhatsApp | ⬜ Pendiente |
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
- **TanStack Query v5** — estado del servidor (cache, refetch, mutations)
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

Antes de correr el proyecto, asegúrate de tener instalado:

- **Java 21** — [Descargar](https://adoptium.net/)
- **Maven 3.9+** — [Descargar](https://maven.apache.org/download.cgi) (o usar el wrapper `./mvnw` incluido)
- **Node.js 20+** y **npm** — [Descargar](https://nodejs.org/)
- **PostgreSQL 16** — [Descargar](https://www.postgresql.org/download/) (o usar [Neon](https://neon.tech/) gratis en la nube)

Verifica las versiones:

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

O desde pgAdmin: clic derecho en **Databases → Create → Database**, nombre `cotizaciones`.

### 3. Configurar el backend

Edita `src/main/resources/application.properties` con tus credenciales:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cotizaciones
spring.datasource.username=postgres
spring.datasource.password=TU_PASSWORD
```

### 4. Correr el backend

Desde la raíz del proyecto:

```bash
./mvnw spring-boot:run
```

En Windows:

```powershell
.\mvnw spring-boot:run
```

El backend queda corriendo en `http://localhost:8080`. Flyway aplica las migraciones automáticamente al arrancar.

**Verifica que arrancó bien** — en el log debe aparecer:

```
Flyway ... Successfully applied N migrations
Started AppApplication in X.XXX seconds
```

### 5. Correr el frontend

En **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:5173`.

### 6. Abrir la app

Abre tu navegador en **http://localhost:5173** y deberías ver la lista de clientes.

---

## 📂 Estructura del proyecto

```
cotizaya/
├── pom.xml                                # Maven del backend
├── mvnw, mvnw.cmd                         # Maven wrapper
├── src/
│   ├── main/
│   │   ├── java/cotizaciones/app/
│   │   │   ├── AppApplication.java        # Entry point Spring Boot
│   │   │   ├── Controller/                # Endpoints REST
│   │   │   ├── Service/                   # Lógica de negocio
│   │   │   ├── Repository/                # Acceso a datos (JPA)
│   │   │   ├── Model/                     # Entidades (@Entity)
│   │   │   ├── DTO/                       # Request/Response DTOs
│   │   │   └── shared/                    # Config global, excepciones
│   │   └── resources/
│   │       ├── application.properties     # Configuración
│   │       └── db/migration/              # Migraciones Flyway
│   │           ├── V1__init.sql
│   │           └── V2__assets.sql
│   └── test/                              # Tests
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/                           # Cliente HTTP (fetch)
        ├── components/                    # Componentes reutilizables
        ├── pages/                         # Páginas / rutas
        ├── types/                         # Tipos TypeScript
        ├── App.tsx                        # Router principal
        └── main.tsx                       # Entry point React
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8080/api`

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/customers` | Listar todos (soporta `?q=nombre` para buscar) |
| `GET` | `/customers/{id}` | Obtener un cliente |
| `POST` | `/customers` | Crear cliente |
| `PUT` | `/customers/{id}` | Actualizar cliente |
| `DELETE` | `/customers/{id}` | Eliminar cliente |

**Ejemplo de request:**

```json
POST /api/customers
{
  "nombre": "Juan Pérez",
  "telefono": "3001234567",
  "email": "juan@test.com",
  "notas": "Cliente frecuente"
}
```

### Assets (Vehículos / Equipos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/customers/{customerId}/assets` | Listar assets de un cliente |
| `POST` | `/customers/{customerId}/assets` | Crear asset para un cliente |
| `GET` | `/assets/{id}` | Obtener un asset |
| `PUT` | `/assets/{id}` | Actualizar asset |
| `DELETE` | `/assets/{id}` | Eliminar asset |

**Ejemplo de request:**

```json
POST /api/customers/1/assets
{
  "tipo": "VEHICULO",
  "marca": "Toyota",
  "modelo": "Corolla",
  "placaSerial": "ABC123",
  "anio": 2020,
  "notas": "Cliente prefiere revisiones cada 5000km"
}
```

**Tipos válidos de asset:** `VEHICULO`, `ELECTRODOMESTICO`, `INMUEBLE`, `EQUIPO`, `OTRO`.

### Formato de errores

Todos los errores siguen el estándar **RFC 7807 (Problem Details)**:

```json
{
  "type": "about:blank",
  "title": "Datos inválidos",
  "status": 400,
  "detail": "Validation failed",
  "errors": [
    "nombre: no debe estar vacío"
  ]
}
```

---

## 🗺️ Roadmap

### Corto plazo
- [ ] Cotizaciones con ítems (líneas) y cálculo automático de total
- [ ] Estados de cotización: borrador → enviada → aprobada / rechazada
- [ ] Numeración correlativa (ej: `COT-2026-0001`)
- [ ] Órdenes de trabajo generadas desde cotizaciones aprobadas

### Medio plazo
- [ ] Generación de PDF de cotizaciones
- [ ] Envío por WhatsApp (Meta Cloud API)
- [ ] Registro de pagos y anticipos
- [ ] Autenticación con Spring Security + JWT
- [ ] Multi-usuario por taller (roles: admin, técnico)

### Largo plazo
- [ ] Dashboard con métricas (cotizaciones del mes, tasa de aprobación, ingresos)
- [ ] App móvil (React Native o PWA)
- [ ] Integración con facturación electrónica DIAN
- [ ] Módulo de inventario de repuestos

---

## 🧠 Decisiones de diseño

- **Patrón MVC + capa de servicio** en el backend, para separar responsabilidades y facilitar testing.
- **DTOs** (`Request` y `Response`) separados de las entidades JPA, para no acoplar la API al esquema de base de datos.
- **Flyway** en lugar de `ddl-auto: update` de Hibernate, para tener migraciones versionadas y controladas.
- **TanStack Query** en el frontend en lugar de Redux, porque el 90% del estado es estado del servidor.
- **Fetch API nativa** en lugar de Axios, para no agregar dependencias innecesarias.
- **Package by layer** en lugar de package by feature, porque el proyecto aún es pequeño.

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
