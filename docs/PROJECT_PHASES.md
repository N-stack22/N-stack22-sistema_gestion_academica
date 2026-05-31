# Fases del proyecto — HORIZONTE DIGITAL

## Sistema web institucional con intranet académica para la I.E.P. Horizonte

Este documento describe las **11 fases oficiales** del proyecto. El avance debe ser **secuencial**, controlado y documentado. Cada fase tiene un objetivo claro y entregables concretos.

---

## Regla de avance

> **No se debe avanzar de fase sin autorización explícita.**

Antes de iniciar una nueva fase, se debe:

1. Completar los entregables de la fase actual.
2. Actualizar la documentación correspondiente (incluido `CHANGELOG.md`).
3. Obtener confirmación para continuar.

Esta regla garantiza un desarrollo ordenado, defendible académicamente y alineado con la rúbrica del curso.

---

## Fase 1: Documentación inicial

### Objetivo

Establecer la base documental del proyecto antes de escribir código Angular. Definir requisitos, alcance, arquitectura, identidad visual y registro de cambios.

### Entregables

- `docs/SYSTEM_REQUIREMENTS.md` — Prompt maestro y requisitos del sistema.
- `docs/PROJECT_PHASES.md` — Este documento.
- `docs/MVP_SCOPE.md` — Alcance mínimo viable del MVP.
- `docs/ARCHITECTURE.md` — Arquitectura simple del frontend.
- `docs/UI_GUIDELINES.md` — Guía de identidad visual.
- `docs/CHANGELOG.md` — Registro cronológico de avances.

### Restricciones

- No programar Angular.
- No instalar dependencias.
- No ejecutar `ng new`.

---

## Fase 2: Arquitectura simple y alcance MVP

### Objetivo

Detallar qué entra al MVP, qué queda simulado, qué datos serán mock, roles iniciales, rutas principales, componentes reutilizables, servicios e interfaces principales, y criterios de avance.

### Entregables

- Definición refinada de módulos incluidos y excluidos del MVP → `MVP_SCOPE.md`.
- Mapa de rutas públicas y privadas (documentado, no implementado) → `ROUTE_MAP.md`.
- Listado de interfaces TypeScript principales → `ARCHITECTURE.md` (sección 8).
- Listado de servicios mock iniciales → `ARCHITECTURE.md` (sección 9).
- Listado de componentes reutilizables planificados → `ARCHITECTURE.md` (sección 10).
- Roles simulados y permisos básicos por rol → `MVP_SCOPE.md` (sección 3).
- Formularios principales con campos y validaciones → `MVP_SCOPE.md` (sección 7).
- Criterios de avance a Fase 3 → `MVP_SCOPE.md` y `ARCHITECTURE.md`.
- Entrada en `CHANGELOG.md`.

### Restricciones

- Aún no se crea el proyecto Angular.
- No backend, Supabase ni Machine Learning.

### Estado

**Completada** — 2026-05-31. Documentación técnica lista para revisión. Sin código Angular.

### Criterios cumplidos para avanzar a Fase 3

| Criterio | Documento |
|----------|-----------|
| Alcance MVP claro | `MVP_SCOPE.md` |
| Rutas definidas | `ROUTE_MAP.md` |
| Módulos priorizados | `MVP_SCOPE.md` (secciones 4–5) |
| Interfaces planificadas | `ARCHITECTURE.md` (sección 8) |
| Servicios mock planificados | `ARCHITECTURE.md` (sección 9) |
| Componentes reutilizables planificados | `ARCHITECTURE.md` (sección 10) |
| Sin código Angular | ✅ |

---

## Fase 3: Inicialización Angular y Bootstrap

### Objetivo

Crear el proyecto Angular 21 desde cero en la carpeta `colegio-horizonte`, configurar Bootstrap 5, SCSS o CSS simple, y la estructura base de carpetas con rutas iniciales mínimas.

### Entregables

- Proyecto Angular 21 inicializado.
- Bootstrap 5 integrado.
- Estructura base de carpetas (`layouts`, `pages`, `components`, `services`, `interfaces`, `guards`, `data`).
- Rutas iniciales configuradas (sin módulos funcionales completos).
- Documentación de instalación y comandos usados.
- Entrada en `CHANGELOG.md`.

### Restricciones

- No implementar aún todos los módulos funcionales.
- Mantener arquitectura simple.

### Estado

**Completada** — 2026-05-31. Angular 21 y Bootstrap 5 configurados; estructura base creada; pantalla inicial verificada con `ng serve`. Ver `docs/SETUP.md`.

### Entregables cumplidos

| Entregable | Ubicación |
|------------|-----------|
| Proyecto Angular 21 | Raíz `colegio-horizonte` |
| Bootstrap 5 | `package.json`, `src/styles.scss` |
| Estructura base | `src/app/layouts`, `pages`, `components`, etc. |
| Pantalla inicial | `src/app/app.html` |
| Documentación instalación | `docs/SETUP.md` |

---

## Fase 4: Layouts principales

### Objetivo

Implementar la estructura visual base que separa la zona pública de la intranet privada.

### Entregables

- `PublicLayout` — Layout para la web institucional.
- `AdminLayout` — Layout para la intranet tipo ERP.
- Navbar público institucional.
- Footer público institucional.
- Sidebar administrativo.
- Routing con layouts anidados.
- Entrada en `CHANGELOG.md`.

### Estado

**Completada** — 2026-05-31. Layouts, Navbar, Footer, Sidebar y rutas base (`/`, `/login`, `/admin/dashboard`) funcionando. Sin guards ni autenticación.

### Entregables cumplidos

| Entregable | Ubicación |
|------------|-----------|
| `PublicLayout` | `src/app/layouts/public-layout/` |
| `AdminLayout` | `src/app/layouts/admin-layout/` |
| `Navbar`, `Footer`, `Sidebar` | `src/app/components/` |
| Páginas temporales | `pages/home`, `login`, `dashboard` |
| Rutas con layouts | `src/app/app.routes.ts` |

---

## Fase 5: Página web pública premium

### Objetivo

Construir la web institucional pública con apariencia profesional, moderna y responsive.

### Entregables

- Páginas: Home, About, Levels, Admission, News, Announcements, Gallery, Contact.
- Contenido institucional simulado pero realista.
- Hero, cards, secciones informativas y llamados a la acción.
- Diseño responsive (escritorio, tablet, móvil).
- Entrada en `CHANGELOG.md`.

### Estado

**Completada** — 2026-05-31. Web pública premium con 9 rutas activas, contenido institucional simulado y formulario de contacto visual (sin lógica avanzada).

### Entregables cumplidos

| Entregable | Ubicación |
|------------|-----------|
| Home premium | `pages/home` |
| About, Levels, Admission | `pages/about`, `levels`, `admission` |
| News, Announcements, Gallery | `pages/news`, `announcements`, `gallery` |
| Contact (formulario visual) | `pages/contact` |
| PageHeader | `components/page-header` |
| Navbar y Footer mejorados | `components/navbar`, `footer` |
| Rutas públicas | `app.routes.ts` |

---

## Fase 6: Login, auth simulado y guards

### Objetivo

Implementar autenticación simulada (mock) y protección de rutas privadas sin backend.

### Entregables

- Página Login.
- Servicio de autenticación mock.
- Interfaces de usuario y rol.
- Guard para rutas privadas.
- Simulación de sesión y redirección según autenticación.
- Entrada en `CHANGELOG.md`.

### Restricciones

- No usar backend ni servicios externos de autenticación.

### Estado

**Completada** — 2026-05-31. `AuthService` mock, `authGuard`, login funcional, logout y rutas `/admin/*` protegidas.

### Entregables cumplidos

| Entregable | Ubicación |
|------------|-----------|
| Interfaces `Role`, `User`, `LoginCredentials` | `src/app/interfaces/` |
| `AuthService` | `src/app/services/auth.service.ts` |
| `authGuard` | `src/app/guards/auth-guard.ts` |
| Login funcional | `src/app/pages/login/` |
| Logout en sidebar | `src/app/components/sidebar/` |
| Rutas protegidas | `app.routes.ts` (`canActivate`) |

---

## Fase 7: Dashboard e intranet tipo ERP

### Objetivo

Crear el panel principal de la intranet con apariencia de sistema académico real.

### Entregables

- Dashboard con métricas y resumen académico.
- Cards estadísticas (`StatCard`).
- Tablas Bootstrap (`DataTable`).
- Componentes reutilizables (PageHeader, EmptyState, etc.).
- Layout administrativo funcional.
- Entrada en `CHANGELOG.md`.

### Estado

**Completada** — 2026-05-31. Dashboard ERP con `DashboardService`, `StatCard`, `DataTable`, `EmptyState`; AdminLayout y Sidebar mejorados.

### Entregables cumplidos

| Entregable | Ubicación |
|------------|-----------|
| Interfaces dashboard | `interfaces/dashboard-metric`, `dashboard-summary`, `recent-activity` |
| `DashboardService` | `services/dashboard.service.ts` |
| `StatCard`, `DataTable`, `EmptyState` | `components/` |
| Dashboard académico | `pages/dashboard/` |
| AdminLayout mejorado | `layouts/admin-layout/` |
| Sidebar agrupado ERP | `components/sidebar/` |

---

## Fase 7.1: Iconografía institucional y visual

### Objetivo

Integrar **Bootstrap Icons** para mejorar la apariencia profesional de la web pública y la intranet, sin cambiar lógica de negocio.

### Entregables

- `bootstrap-icons` instalado y configurado en `styles.scss`.
- Iconos en Navbar, Footer, Home, páginas públicas, Sidebar, AdminLayout, Dashboard y componentes reutilizables.

### Estado

**Completada** — 2026-05-31. Solo mejoras visuales; auth y rutas intactas.

---

## Fase 8: Módulos académicos

### Objetivo

Implementar las páginas y lógica mock de los módulos académicos principales de la intranet.

### Subfases

| Subfase | Objetivo | Estado |
|---------|----------|--------|
| **8A** | Rutas y páginas base privadas (contenido simulado local) | ✅ Completada — 2026-05-31 |
| **8B** | Interfaces y servicios mock académicos por entidad | ✅ Completada — 2026-05-31 |
| **8C** | Paneles por rol y experiencia diferenciada | ✅ Completada — 2026-05-31 |
| **8D** | Mejora visual de paneles y módulos diferenciados | ✅ Completada — 2026-05-31 |
| **8E** | Corrección UX/UI ERP y consistencia por rol | ✅ Completada — 2026-05-31 |
| **8F** | Dashboard ejecutivo y mejora visual de pagos | ✅ Completada — 2026-05-31 |

### Fase 8A — Rutas y páginas base privadas (completada)

**Entregables cumplidos:**

- 13 páginas privadas nuevas + Dashboard existente, todas navegables.
- Rutas protegidas bajo `/admin/*` con `authGuard`.
- Sidebar con enlaces activos a todos los módulos.
- Contenido visual ERP con datos simulados en arrays locales.
- Documentación actualizada.

**No incluido en 8A:** servicios mock por entidad, CRUD, formularios avanzados, `roleGuard`.

### Fase 8B — Interfaces y servicios mock académicos (completada)

**Entregables cumplidos:**

- 11 interfaces académicas en `src/app/interfaces/`.
- 11 servicios mock en `src/app/services/*.service.ts` con `getAll()` y `getById()`.
- 11 páginas privadas refactorizadas para consumir servicios (sin arrays locales).
- Datos simulados centralizados; mínimo 5 registros por entidad.
- Perfil (`AuthService`) y Configuración (cards locales) sin servicio dedicado.

**No incluido en 8B:** CRUD, formularios, `roleGuard`, backend, paneles por rol.

### Fase 8C — Paneles por rol (completada)

**Entregables cumplidos:**

- 5 usuarios mock con credenciales de prueba por rol.
- Dashboard `/admin/dashboard` con contenido según rol (una sola ruta).
- Sidebar con opciones visibles filtradas por rol.
- Login con tabla de credenciales de demostración.
- Aviso contextual en intranet para roles no administrativos.

**No incluido en 8C:** `roleGuard`, CRUD, formularios, backend.

### Fase 8D — Mejora visual de paneles y módulos (completada)

**Entregables cumplidos:**

- ADMIN y DIRECTOR comparten panel y sidebar de **gestión institucional**.
- TEACHER, STUDENT y PARENT con portales visuales diferenciados.
- 6 módulos nuevos simulados: matrículas, pensiones, pagos, ventas, comunicados internos, reportes.
- Temas visuales por rol en dashboard (azul institucional, docente, estudiante, apoderado).
- Sin pagos reales, ventas reales ni backend.

**No incluido en 8D:** `roleGuard`, CRUD, Signal Forms.

### Fase 8E — Corrección UX/UI ERP (completada)

**Entregables cumplidos:**

- Layout administrativo con sidebar de altura completa (sin fondo blanco al scroll).
- `RoleContextService` y datos contextuales STUDENT/PARENT.
- Módulos coherentes por rol (padres, pensiones, pagos, horarios, notas, etc.).
- Horario escolar visual mejorado.
- Estilos ERP globales reutilizables.

**No incluido en 8E:** `roleGuard`, CRUD, Signal Forms, backend.

### Fase 8F — Dashboard ejecutivo y pagos premium (completada)

**Entregables cumplidos:**

- Dashboard como panel ejecutivo (métricas, alertas, eventos, accesos rápidos).
- Eliminación de tablas largas y exceso de información en dashboard.
- Estética ERP unificada con identidad institucional Horizonte.
- Módulo `/admin/pagos` rediseñado: vista institucional, familiar (PARENT) e informativa (STUDENT).
- Clases SCSS ERP reutilizables (`.erp-hero`, `.erp-quick-access`, etc.).
- Datos simulados; sin pagos reales ni pasarela.

**No incluido en 8F:** `roleGuard`, CRUD, Signal Forms (Fase 9), backend, pagos reales.

### Nota — Fase 8 completada

Las subfases 8A, 8B y 8C completan los módulos académicos del MVP a nivel frontend simulado. CRUD y formularios avanzados quedan para Fase 9.

---

## Fase 9: Formularios con Angular Signals y validaciones

### Objetivo

Aplicar Angular Signals en los formularios principales con validaciones visibles y envío simulado.

### Estado

| Elemento | Estado |
|----------|--------|
| Fase 9 | ✅ Completada — 2026-05-31 |

### Entregables cumplidos

- Formularios con Signals en: Login, Contacto, Estudiante, Docente, Curso, Tarea, Recurso.
- Validaciones visibles con `computed()` e `invalid-feedback`.
- Botones deshabilitados cuando el formulario no es válido tras envío.
- Envío simulado con mensajes de éxito; registro local temporal en tablas (sin persistencia).
- Visibilidad de formularios por rol vía `RoleContextService` (sin `roleGuard`).
- Helper `form-validation.ts` y clases `.form-panel*`.

**No incluido en Fase 9:** backend, HTTP, CRUD real, Reactive Forms, Cypress (Fase 10).

---

## Fase 10: Pruebas Cypress (completada)

### Objetivo

Agregar pruebas end-to-end básicas con Cypress para validar flujos críticos del frontend.

### Estado

| Elemento | Estado |
|----------|--------|
| Fase 10 | ✅ Completada — 2026-05-31 |

### Entregables cumplidos

- Cypress instalado y configurado (`cypress.config.ts`).
- Scripts `cypress:open`, `cypress:run`, `e2e`, **`e2e:local`** (recomendado).
- 6 specs E2E incluyendo `smoke.cy.ts` — **16 pruebas, todas passing**.
- Comandos `loginAsAdmin`, `loginAsTeacher`, `loginAsParent`.
- Selectores `data-cy` en elementos clave.
- `start-server-and-test` + `kill-port` para E2E confiable (evita instancia antigua en puerto 4200).

**No incluido en Fase 10:** backend, mocks HTTP, pruebas unitarias complejas, cobertura total.

---

## Fase 11: Revisión final para rúbrica (completada)

### Objetivo

Verificar que el proyecto cumple los criterios académicos y está listo para exposición y defensa.

### Estado

| Elemento | Estado |
|----------|--------|
| Fase 11 | ✅ Completada — 2026-05-31 |

### Entregables cumplidos

- Revisión técnica general (estructura, mock, guards, Signals, Cypress).
- `README.md` actualizado.
- `docs/FINAL_REVIEW.md` — cumplimiento de rúbrica.
- `docs/PRESENTATION_GUIDE.md` — guía de exposición.
- `docs/DELIVERY_CHECKLIST.md` — checklist de entrega.
- `npm run build` y `npm run e2e:local` verificados.

**Estado del proyecto:** MVP completado — versión **1.0.0**.

---

## Resumen de fases

| Fase | Nombre | ¿Código Angular? |
|------|--------|------------------|
| 1 | Documentación inicial | No |
| 2 | Arquitectura simple y alcance MVP | No |
| 3 | Inicialización Angular y Bootstrap | Sí |
| 4 | Layouts principales | Sí |
| 5 | Página web pública premium | Sí |
| 6 | Login, auth simulado y guards | Sí |
| 7 | Dashboard e intranet tipo ERP | Sí |
| 8 | Módulos académicos | Sí |
| 9 | Formularios con Angular Signals | ✅ Completada |
| 10 | Pruebas Cypress E2E | ✅ Completada |
| 11 | Revisión final para rúbrica | ✅ Completada |

---

## Referencia

Para requisitos completos del sistema, consultar `SYSTEM_REQUIREMENTS.md`.
