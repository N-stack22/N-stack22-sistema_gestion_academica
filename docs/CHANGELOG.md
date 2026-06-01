# Changelog — HORIZONTE DIGITAL

Registro cronológico de cambios y avances del proyecto **Sistema web institucional con intranet académica para la I.E.P. Horizonte**.

El formato sigue principios de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), adaptado al desarrollo por fases académicas.

---

## [Unreleased]

Cambios pendientes de registrar en la próxima fase autorizada.

---

## [1.6.2] — 2026-05-31 — Corrección: Login público y chatbot asistente

### Completado

- **Corrección v1.6.2** — Login menos redundante y botón de chatbot con icono de asistente.

### Cambiado

- **Login (`/login`)** — Eliminado hero superior duplicado; un solo encabezado claro; card institucional izquierda refinada; formulario primero en móvil.
- **Chatbot** — Botón flotante con `bi-robot`, etiqueta “Asistente”, punto de estado verde y estilo premium azul marino.

### Sin cambios

- AuthService, guards, credenciales, formularios Signals, lógica de autenticación.
- Intranet `/admin/*`.
- Atributos `data-cy` de Cypress.

### Verificación

- `npm run build` — OK.
- `npm run e2e:local` — OK.

---

## [1.6.1] — 2026-05-31 — Corrección: Hero público sin datos personales

### Completado

- **Corrección v1.6.1** — Hero de Home con mockup institucional referencial, sin nombres ni datos internos sensibles.

### Cambiado

- Mockup lateral: de “Panel académico” con métricas operativas a **“Ecosistema académico”** con indicadores institucionales (niveles, perfiles, acceso informativo, gestión escolar).
- Cards flotantes: eliminados nombre de estudiante y asistencia individual; reemplazados por Admisión 2026, Portal familiar y Gestión digital.
- Microcopy de privacidad: *“Vista referencial del ecosistema digital institucional”*.
- Sección comunidad conectada: mockup bridge sin porcentajes ni tareas personales.

### Sin cambios

- Intranet `/admin/*`, AuthService, guards, servicios mock.
- Cypress `data-cy` conservados.

### Verificación

- `npm run build` — OK.
- `npm run e2e:local` — OK.

---

## [1.6.0] — 2026-05-31 — Mejora: Web pública con impacto visual e imágenes institucionales

### Completado

- **Mejora v1.6.0** — Rediseño visual fuerte de la web pública con hero premium, visuales institucionales CSS y secciones con más color.

### Agregado

- **Hero Home v1.6** — Composición visual con mockup ERP, cards flotantes (estudiante, asistencia), badge “Admisión abierta” y bloque fotográfico simulado “Comunidad Horizonte”.
- **`.school-photo-card`** — Bloques visuales tipo fotografía institucional con gradientes CSS (sin imágenes externas obligatorias).
- **Secciones alternadas** — Fondos tintados, franja institucional rojo/azul, divisores onda CSS y CTA final `.public-cta-premium--v16`.
- **Métricas v1.6** — Cards `.public-metric-card--v16` más grandes con borde superior de color.
- **Visuales en páginas internas** — `/nosotros`, `/niveles`, `/admision`, `/plataforma`, `/contacto`, `/login`.

### Mejorado

- Propuesta educativa con card destacada “Gestión académica digital”.
- Sección “Comunidad conectada” con mockup ERP, badge HORIZONTE DIGITAL y cards por rol.
- Niveles y noticias con diseño editorial premium.
- Page headers internos con patrón institucional.
- Navbar con sombra y acento dorado refinado.

### Sin cambios

- Intranet `/admin/*`, AuthService, guards, servicios mock, formularios Signals.
- Chatbot (lógica intacta; hover conservado).
- Modo oscuro, backend, API externa.

### Verificación

- `npm run build` — OK.
- `npm run e2e:local` — OK.

---

## [1.5.0] — 2026-05-31 — Mejora: Pulido visual premium, tablas ERP y experiencia pública viva

### Completado

- **Mejora v1.5.0** — Tablas ERP premium, microinteracciones públicas y refinamiento responsive.

### Agregado

- **DataTable premium** — Card contenedora, header con icono, subtítulo opcional, contador de registros, buscador visual simple, badges de estado automáticos y columna de acciones simuladas (Ver / Detalle).
- **Clases ERP globales** — `.erp-table-card`, `.erp-table-header`, `.erp-table-title`, `.erp-table-subtitle`, `.erp-table-toolbar`, `.erp-table-search`, `.erp-table`, `.erp-status-badge`, `.erp-action-btn`, `.erp-module-shell`, `.erp-kpi-row`.
- **Microinteracciones CSS** — `.public-card-lift`, `.premium-button`, `.public-glow`, hover en navbar, chatbot, métricas y cards de plataforma/noticias.
- **Home v1.5** — Mockup ERP con sombra premium, malla decorativa en hero, CTAs con microinteracciones.
- **Plataforma v1.5** — Mockup con hover elevado; cards de rol con lift.

### Mejorado

- Todos los módulos administrativos con tablas (`/admin/estudiantes`, docentes, padres, usuarios, cursos, notas, horarios, tareas, recursos, asistencia, seguimiento-padres, matrículas, pensiones, pagos, ventas, comunicados-internos) usan el nuevo estilo DataTable premium con subtítulos y shell `.erp-module-shell`.
- **Horarios** — Vista semanal tipo calendario para STUDENT/PARENT; tablas premium para TEACHER e institucional.
- **Pagos, pensiones y ventas** — KPIs, tablas premium, avisos de simulación reforzados; timeline para PARENT en pagos.
- **Páginas públicas** — Home, plataforma, niveles, noticias y CTAs con hover y profundidad visual.

### Sin cambios

- AuthService, guards, roles, formularios Signals.
- Backend, Supabase, Firebase, API externa, pagos reales, modo oscuro.
- Atributos `data-cy` de Cypress conservados.

### Verificación

- `npm run build` — OK.
- `npm run e2e:local` — OK.

---

## [1.4.0] — 2026-05-31 — Mejora: Página pública Plataforma Digital

### Completado

- **Mejora v1.4.0** — Nueva landing pública `/plataforma` para presentar la intranet académica tipo ERP.

### Agregado

- `Platform` — Página pública con hero tecnológico, módulos por perfil, flujo digital, mockup ERP, beneficios y CTA.
- Ruta `/plataforma` en `PublicLayout`.
- Enlaces en navbar (`nav-platform`) y footer.
- Cypress: prueba de navegación a Plataforma en `public.cy.ts`.

### Sin cambios

- Intranet `/admin/*`, AuthService, guards, dashboard, sidebar admin.
- Backend, API externa, modo oscuro.

### Verificado

- `npm run build` — OK.
- `npm run e2e:local` — **18/18 pruebas passing**.

---

## [1.3.0] — 2026-05-31 — Mejora: Chatbot institucional público informativo

### Completado

- **Mejora v1.3.0** — Asistente virtual informativo en la web pública con respuestas predefinidas en frontend.

### Agregado

- `PublicChatbot` — Widget flotante en `PublicLayout` (no visible en `/admin/*`).
- `interfaces/chat-message.ts` — Interface `ChatMessage`.
- Estado con Angular Signals: `isOpen`, `messages`, `userInput`.
- Preguntas rápidas: Admisión, Niveles, Horarios, Contacto, Intranet, Pensiones, Comunicados.
- Respuestas por palabras clave (admisión, niveles, horarios, contacto, intranet, pensiones, comunicados, default).
- `cypress/e2e/public-chatbot.cy.ts` — prueba E2E del chatbot.

### Sin cambios

- Intranet, AuthService, guards, servicios mock, dashboard y sidebar admin.
- Backend, API externa, OpenAI, Machine Learning, tutor inteligente.

### Verificado

- `npm run build` — OK.
- `npm run e2e:local` — **17/17 pruebas passing**.

---

## [1.2.0] — 2026-05-31 — Mejora: Web pública premium tipo colegio privado + ERP

### Completado

- **Mejora v1.2.0** — Rediseño visual profundo de la web pública con estética de colegio privado premium y comunicación de plataforma ERP.

### Agregado / Mejorado

- **Estilos globales v1.2** — Clases `.public-hero-premium`, `.public-dashboard-mock`, `.public-metric-card`, `.public-card-lift`, `.public-cta-premium`, `.public-login-shell`, etc.
- **Home** — Landing premium con hero ERP mockup, métricas, propuesta educativa, sección plataforma digital, niveles, noticias y CTA.
- **Login público** — Panel de beneficios intranet, formulario premium y credenciales demo ordenadas.
- **Contacto** — Hero interno, mapa simulado premium, formulario en card elegante; Signals y `data-cy` intactos.
- **Páginas internas** — Nosotros, niveles, admisión (timeline), noticias (destacada + secundarias), comunicados (tablero), galería.
- **Navbar / Footer** — Glass effect, CTA institucional en footer.

### Sin cambios

- Intranet `/admin/*`, AuthService, guards, servicios mock, dashboard y sidebar admin.
- Backend, Supabase, Firebase, APIs externas.

### Verificado

- `npm run build` — OK.
- `npm run e2e:local` — **16/16 pruebas passing**.

---

## [1.1.0] — 2026-05-31 — Mejora: Página pública institucional premium

### Completado

- **Mejora v1.1.0** — Rediseño visual de la web pública sin alterar intranet, auth ni servicios mock.

### Agregado / Mejorado

- **Navbar público** — Fondo blanco con sombra, logo con icono, botón Intranet destacado, estado activo con `routerLinkActive`.
- **Footer** — Franja de color institucional, columnas de enlaces y contacto.
- **Home** — Hero premium, franja de confianza, propuesta educativa (4 pilares), niveles, sección intranet por roles, noticias destacadas y CTA final.
- **Páginas internas** — Nosotros, niveles, admisión (+ FAQ), noticias, comunicados (badges Importante/Informativo/Académico), galería, contacto y login con diseño consistente.
- **Estilos globales** — Clases `.public-hero`, `.public-section`, `.public-card-premium`, `.public-gradient-panel`, `.public-stat`, `.public-cta`, `.public-badge`, etc. en `src/styles.scss`.

### Sin cambios

- AuthService, guards, rutas `/admin/*`, dashboard, sidebar administrativo y formularios de intranet.
- Backend (no existe), Supabase, Firebase ni APIs externas.
- Atributos `data-cy` de Cypress en navbar, contacto y login.

### Verificado

- `npm run build` — OK (warnings Sass y budget no bloqueantes).
- `npm run e2e:local` — **16/16 pruebas passing**.

---

## [1.0.0] — 2026-05-31 — Fase 11: Revisión final para rúbrica

### Completado

- **Fase 11** — Revisión final del MVP. Proyecto listo para exposición académica.

### Agregado

- `README.md` — Documentación principal del repositorio.
- `docs/FINAL_REVIEW.md` — Cumplimiento de rúbrica y checklists.
- `docs/PRESENTATION_GUIDE.md` — Guía de defensa (5–8 min).
- `docs/DELIVERY_CHECKLIST.md` — Checklist de entrega.

### Verificado

- Revisión técnica: estructura, servicios mock, guards, Signals, sin backend/HTTP.
- `npm run build` — OK (warnings Sass y budget no bloqueantes).
- `npm run e2e:local` — **16/16 pruebas passing**.

### Estado final

- MVP frontend académico completado (Fases 1–11).
- Sin backend, pagos reales, Supabase ni Firebase.

---

## [0.10.1] — 2026-05-31 — Corrección Fase 10: Cypress E2E confiable

### Corregido

- Fallo E2E por instancia antigua en puerto 4200 (sin `data-cy`).
- `npm run e2e:local` ahora libera el puerto con `kill-port` antes de levantar Angular.

### Agregado

- Dependencias: `start-server-and-test`, `kill-port`.
- Script `pree2e:local` + `e2e:local`.
- Spec `cypress/e2e/smoke.cy.ts`.
- `allowCypressEnv: false` en `cypress.config.ts`.

### Verificado

- `npm run build` — OK.
- `npm run e2e:local` — **16/16 pruebas pasando**.

---

## [0.10.0] — 2026-05-31 — Fase 10: Pruebas E2E con Cypress

### Completado

- **Fase 10** — Cypress configurado con pruebas E2E básicas para flujos frontend principales.

### Agregado

- Dependencia de desarrollo `cypress`.
- Configuración `cypress.config.ts` con `baseUrl: http://localhost:4200`.
- Scripts: `cypress:open`, `cypress:run`, `e2e`.
- Comandos personalizados: `loginAsAdmin`, `loginAsTeacher`, `loginAsParent`.
- Atributos `data-cy` en navbar, login, contacto, dashboard, sidebar, formularios académicos.
- Pruebas E2E:
  - `cypress/e2e/public.cy.ts`
  - `cypress/e2e/auth.cy.ts`
  - `cypress/e2e/contact-form.cy.ts`
  - `cypress/e2e/role-dashboard.cy.ts`
  - `cypress/e2e/forms-role.cy.ts`

### Verificado

- `npm run build` — Compilación exitosa.
- Cypress prueba flujos frontend simulados; **no hay backend ni API real**.

### Nota de ejecución

- **Comando recomendado:** `npm run e2e:local` — libera el puerto 4200, levanta Angular y ejecuta Cypress.
- Si usas `npm run cypress:run` manualmente, asegúrate de que `npm start` esté activo con el código actualizado.
- Si el puerto 4200 está ocupado por una instancia antigua, `pree2e:local` ejecuta `kill-port 4200` automáticamente.

### Corrección Fase 10 (Cypress)

- `start-server-and-test` + `kill-port` para E2E confiable contra la app actual.
- Spec `smoke.cy.ts` de diagnóstico.
- Pruebas más robustas con `data-cy` y textos flexibles (`HORIZONTE`).
- **16/16 pruebas E2E aprobadas** con `npm run e2e:local`.

### Próximo paso

- **Fase 11: Revisión final para rúbrica** (requiere autorización).

---

## [0.9.0] — 2026-05-31 — Fase 9: Formularios con Angular Signals y validaciones visibles

### Completado

- **Fase 9** — Formularios principales con Angular Signals, validaciones visibles y envío simulado.

### Agregado

- Helper simple `src/app/utils/form-validation.ts` (`isValidEmail`, `isRequired`, `minLength`, `isPhoneNineDigits`).
- Clases reutilizables: `.form-panel`, `.form-panel__title`, `.form-success-card`, `.form-help-text`.
- Formularios con Signals en: Login (mejorado), Contacto, Estudiante, Docente, Curso, Tarea, Recurso.
- Métodos de visibilidad en `RoleContextService`: `canRegisterStudents`, `canRegisterTeachers`, `canRegisterCourses`, `canRegisterTasks`, `canRegisterResources`.
- Registro simulado local en tablas (filas temporales en memoria al enviar correctamente).

### Implementado

- Patrón `signal()` + `computed()` para errores y `isFormValid`.
- Mensajes `invalid-feedback` visibles tras intento de envío.
- Botones deshabilitados cuando el formulario no es válido después de enviar.
- Contacto: envío simulado con mensaje de éxito y limpieza de campos.
- Ocultamiento visual de formularios administrativos según rol (sin `roleGuard`).

### Verificado

- `npm run build` — Compilación exitosa.
- Auth mock, guards y rutas intactos. Sin backend, HTTP ni CRUD real.

### Próximo paso

- **Fase 10: Pruebas Cypress** (requiere autorización).

---

## [0.8.5] — 2026-05-31 — Fase 8F: Dashboard ejecutivo y mejora visual de pagos

### Completado

- **Fase 8F** — Dashboard redefinido como panel ejecutivo por rol; módulo de pagos rediseñado con estética premium ERP.

### Corregido

- Dashboard ya no replica contenido completo de módulos (tablas largas y secciones duplicadas eliminadas).
- Estética unificada institucional: azul marino, blanco, gris; acentos por rol solo en badge (sin fondos verdes/púrpura).
- Estructura ejecutiva común: hero, 4–6 métricas, 3 alertas, 3 eventos, 4 accesos rápidos, aviso de datos simulados.

### Agregado

- Interfaces `DashboardAlert` y `DashboardQuickAccess` en `role-dashboard-panel.ts`.
- Clases ERP globales: `.erp-hero`, `.erp-metric-grid`, `.erp-alert-card`, `.erp-event-list`, `.erp-quick-access`, `.erp-payment-summary`, `.erp-payment-timeline`.
- Vista premium de pagos institucional: tabla con badges (Pagado, Pendiente, Observado) y resumen financiero simulado.
- Vista familiar de pagos: card destacada, timeline premium y aviso informativo.
- Vista estudiante en pagos: consulta informativa de matrícula (solo lectura).

### Modificado

- `DashboardService` — paneles ejecutivos por rol (ADMIN/DIRECTOR, TEACHER, STUDENT, PARENT).
- `DashboardPage` — layout ejecutivo sin `DataTable`.
- `PaymentsPage` — diseño premium por contexto de rol.
- Documentación actualizada.

### Verificado

- `npm run build` — Compilación exitosa.
- Auth, guards, sidebar, logout y web pública intactos. Sin pagos reales.

### Próximo paso

- **Fase 9: Formularios con Signal Forms y validaciones** (requiere autorización).

---

## [0.8.4] — 2026-05-31 — Fase 8E: Corrección UX/UI ERP y consistencia por rol

### Completado

- **Fase 8E** — Corrección visual del layout administrativo, coherencia de datos y módulos por rol.

### Corregido

- Sidebar con altura completa (`100vh`, sticky) — sin espacio blanco al hacer scroll.
- `AdminLayout` reestructurado como shell ERP (`admin-shell`).
- Sidebar rediseñado: marca con icono, card de usuario, menú profesional.
- Datos contextuales para **STUDENT** (Lucía Torres, 2° Secundaria A) y **PARENT** (Rosa Quispe → Lucía Torres).
- Módulos filtrados por rol: notas, tareas, asistencia, recursos, horarios, pensiones, pagos, padres, seguimiento.

### Agregado

- `RoleContextService` — helpers de rol y datos simulados contextuales.
- `StudentContext` interface.
- Clases globales ERP: `.admin-page-header`, `.admin-card`, `.admin-table-card`, `.status-badge`, etc.
- Horario semanal visual para estudiante y apoderado.

### Modificado

- Páginas: `parents`, `pensions`, `payments`, `schedules`, `grades`, `tasks`, `attendance`, `resources`, `parent-tracking`.
- Dashboard institucional con sección de alertas administrativas.
- Documentación actualizada.

### Verificado

- `npm run build` — Compilación exitosa.
- Auth, guards y rutas intactos. Sin `roleGuard`.

### Próximo paso

- **Fase 9: Formularios con Signal Forms y validaciones** (requiere autorización).

---

## [0.8.3] — 2026-05-31 — Fase 8D: Mejora visual de paneles por rol y módulos diferenciados

### Completado

- **Fase 8D** — Paneles visuales por rol, sidebar realista y nuevos módulos institucionales simulados.

### Agregado

- Páginas: `enrollments`, `pensions`, `payments`, `sales`, `internal-announcements`, `reports`.
- Rutas: `/admin/matriculas`, `/admin/pensiones`, `/admin/pagos`, `/admin/ventas`, `/admin/comunicados-internos`, `/admin/reportes`.
- Interface `DashboardTheme` y campos ampliados en `RoleDashboardPanel`.
- Estilos por tema en dashboard: `institutional`, `teacher`, `student`, `parent`.

### Modificado

- `DashboardService` — ADMIN y DIRECTOR comparten **Panel de Gestión Institucional**; paneles mejorados para TEACHER, STUDENT y PARENT.
- `Sidebar` — menús completos por rol con etiquetas contextualizadas (ej. «Mis notas», «Padres de familia»).
- `pages/dashboard` — sección económica simulada para roles institucional y apoderado.
- Documentación actualizada.

### Datos simulados

- Matrículas, pensiones, pagos, ventas, comunicados y reportes — **sin backend, sin pagos reales, sin pasarela de pago**.

### Verificado

- `npm run build` — Compilación exitosa.
- Rutas `/admin/*` protegidas con `authGuard` (sin `roleGuard`).

### No incluido (pendiente Fase 9)

- CRUD, formularios avanzados, Signal Forms, Cypress, backend.

### Próximo paso

- **Fase 9: Formularios con Signal Forms y validaciones** (requiere autorización).

---

## [0.8.2] — 2026-05-31 — Fase 8C: Paneles por rol y experiencia diferenciada

### Completado

- **Fase 8C** — Login multirol, dashboard dinámico y sidebar adaptado por rol simulado.

### Agregado

- Cinco usuarios mock en `AuthService` (ADMIN, DIRECTOR, TEACHER, STUDENT, PARENT).
- Método `getDemoCredentials()` para credenciales de prueba.
- Interface `RoleDashboardPanel` y método `DashboardService.getRolePanel(role)`.
- Paneles diferenciados: Panel Administrativo, Directivo, Docente, Estudiante y Apoderado.

### Modificado

- `AuthService` — login con 5 cuentas; restauración de sesión para cualquier usuario mock.
- `pages/login` — tabla de credenciales por rol; mantiene validaciones y `returnUrl`.
- `pages/dashboard` — contenido dinámico según `currentUser().role` (Signals + `computed`).
- `components/sidebar` — menú filtrado por rol con `computed`.
- `layouts/admin-layout` — aviso contextual para roles TEACHER, STUDENT y PARENT.
- Documentación actualizada.

### Verificado

- `npm run build` — Compilación exitosa.
- Rutas `/admin/*` protegidas con `authGuard` (sin `roleGuard`).

### No incluido (pendiente Fase 9 y posteriores)

- `roleGuard`, JWT, backend, HTTP.
- CRUD real, formularios avanzados y Signal Forms (Fase 9).
- Cypress, NgRx.

### Próximo paso

- **Fase 9: Formularios con Signal Forms y validaciones** (requiere autorización).

---

## [0.8.1] — 2026-05-31 — Fase 8B: Interfaces y servicios mock académicos

### Completado

- **Fase 8B** — Interfaces TypeScript y servicios mock por entidad académica; páginas privadas consumen servicios.

### Agregado

- Interfaces: `Student`, `Teacher`, `Parent`, `Course`, `Grade`, `Schedule`, `Task`, `Resource`, `Attendance`, `ParentTracking`, `AcademicUser`.
- Servicios mock: `StudentService`, `TeacherService`, `ParentService`, `CourseService`, `GradeService`, `ScheduleService`, `TaskService`, `ResourceService`, `AttendanceService`, `ParentTrackingService`, `AcademicUserService`.
- Cada servicio con datos simulados (mínimo 5 registros), `getAll()` y `getById(id)`.

### Modificado

- Páginas privadas: `students`, `teachers`, `parents`, `users`, `courses`, `grades`, `schedules`, `tasks`, `resources`, `attendance`, `parent-tracking` — consumen su servicio mock vía inyección.
- `docs/PROJECT_PHASES.md`, `docs/ARCHITECTURE.md`, `docs/ROUTE_MAP.md`, `docs/SETUP.md`, `docs/MVP_SCOPE.md`.

### Sin cambios

- `Profile` sigue usando `AuthService`.
- `Settings` mantiene cards simuladas locales.
- `AuthService`, guards y web pública — sin modificar.

### Verificado

- `npm run build` — Compilación exitosa.
- Rutas `/admin/*` protegidas con `authGuard`.

### No incluido (pendiente Fase 8C y posteriores)

- CRUD real, formularios avanzados y Signal Forms (Fase 9).
- Paneles por rol, sidebar adaptado y usuarios mock por rol (Fase 8C).
- `roleGuard`, backend, HTTP, Cypress.

### Próximo paso

- **Fase 8C: Paneles por rol y experiencia diferenciada** (requiere autorización).

---

## [0.8.0] — 2026-05-31 — Fase 8A: Rutas y páginas base privadas

### Completado

- **Fase 8A** — Páginas base privadas de la intranet y rutas protegidas bajo `/admin`.

### Agregado

- Componentes de página: `profile`, `grades`, `schedules`, `tasks`, `resources`, `attendance`, `parent-tracking`, `students`, `teachers`, `parents`, `users`, `courses`, `settings`.
- Rutas privadas activas en `app.routes.ts` para los 14 módulos académicos.
- Contenido visual base por módulo: encabezado, badge «Módulo académico», tablas/listas simuladas y aviso «Datos simulados para fines académicos».
- Clases globales `.admin-page__badge-module` y `.admin-module-card` en `styles.scss`.

### Modificado

- `components/sidebar` — Todos los enlaces con `routerLink` y `routerLinkActive` (sin ítems deshabilitados).
- `docs/PROJECT_PHASES.md`, `docs/ARCHITECTURE.md`, `docs/ROUTE_MAP.md`, `docs/SETUP.md`.

### Datos simulados

- Arrays locales en cada componente de página (sin servicios mock por entidad).
- Perfil muestra datos del usuario autenticado vía `AuthService`.

### Verificado

- `npm run build` — Compilación exitosa.
- Rutas `/admin/*` protegidas con `authGuard` (sin sesión → `/login`).

### No incluido (pendiente Fase 8B y posteriores)

- CRUD completo, formularios avanzados y Signal Forms (Fase 9).
- Servicios mock por entidad e interfaces académicas dedicadas (Fase 8B).
- `roleGuard`, backend, Cypress.

### Próximo paso

- **Fase 8B: Interfaces y servicios mock académicos** (requiere autorización).

---

## [0.7.1] — 2026-05-31 — Fase 7.1: Iconografía institucional y visual

### Completado

- **Mini fase 7.1** — Bootstrap Icons integrado en web pública e intranet.

### Agregado

- Paquete `bootstrap-icons` e import global en `src/styles.scss`.
- Clases utilitarias: `.horizonte-icon-circle`, `.horizonte-icon-inline`.

### Modificado (solo visual)

- `Navbar`, `Footer`, `Home` y páginas públicas (About, Levels, Admission, News, Announcements, Gallery, Contact).
- `Sidebar`, `AdminLayout`, `Dashboard`.
- `StatCard`, `DataTable`, `EmptyState` — renderizado de iconos Bootstrap.
- `DashboardService` — iconos en métricas (`bi-person-badge-fill`, etc.).

### Sin cambios de lógica

- Autenticación, guards, login y rutas — **sin modificar**.
- No se crearon módulos académicos ni servicios nuevos.

### Verificado

- `npm run build` — Compilación exitosa.

### Próximo paso

- **Fase 8B: Interfaces y servicios mock académicos** (requiere autorización).

---

### Completado

- **Fase 7 del proyecto** — Dashboard académico profesional, componentes reutilizables y `DashboardService` mock.

### Agregado

- `interfaces/dashboard-metric.ts`, `dashboard-summary.ts`, `recent-activity.ts`.
- `services/dashboard.service.ts` — `DashboardService` con datos simulados (sin HTTP).
- `components/stat-card` — Card estadística reutilizable con `@Input()`.
- `components/data-table` — Tabla Bootstrap reutilizable con `@Input()`.
- `components/empty-state` — Estado vacío reutilizable.

### Modificado

- `pages/dashboard` — Métricas, resumen académico, actividad reciente y próximos eventos.
- `layouts/admin-layout` — Header profesional con usuario y badge de sesión simulada.
- `components/sidebar` — Menú ERP agrupado (General, Académico, Gestión, Sistema).
- `docs/PROJECT_PHASES.md`, `docs/ARCHITECTURE.md`, `docs/ROUTE_MAP.md`, `docs/SETUP.md`.

### Datos simulados

- 850 estudiantes, 65 docentes, 42 cursos, 94.5% asistencia.
- Actividades recientes y eventos próximos mock.
- Badge visible: «Datos simulados para fines académicos».

### Verificado

- `npm run build` — Compilación exitosa.
- Rutas `/admin/*` siguen protegidas con `authGuard` (Fase 6).

### No incluido (pendiente Fase 8)

- Módulos académicos completos (Estudiantes, Docentes, Notas, etc.).
- CRUD y servicios mock académicos por entidad.
- Formularios avanzados con Signal Forms.
- Backend, Supabase, Firebase — No utilizados.

### Próximo paso

- **Fase 8: Módulos académicos** (requiere autorización).

---

## [0.6.0] — 2026-05-31 — Fase 6: Login, auth simulado y guards

### Completado

- **Fase 6 del proyecto** — Autenticación simulada con `localStorage`, guard funcional y flujo login/logout.

### Agregado

- `interfaces/role.ts` — Tipo `Role` (ADMIN, DIRECTOR, TEACHER, STUDENT, PARENT).
- `interfaces/user.ts` — Interface `User`.
- `interfaces/login-credentials.ts` — Interface `LoginCredentials`.
- `services/auth.service.ts` — `AuthService` mock con Signals y persistencia en `localStorage`.
- `guards/auth-guard.ts` — `authGuard` funcional para rutas `/admin/*`.

### Modificado

- `pages/login` — Formulario funcional con Signals, validaciones visibles y credenciales de prueba.
- `components/sidebar` — Usuario actual, rol y botón «Cerrar sesión».
- `pages/dashboard` — Mensaje de bienvenida con usuario autenticado.
- `layouts/admin-layout` — Badge de sesión simulada activa.
- `app.routes.ts` — `canActivate: [authGuard]` en ruta `/admin`.
- `docs/PROJECT_PHASES.md`, `docs/ARCHITECTURE.md`, `docs/ROUTE_MAP.md`, `docs/SETUP.md`.

### Credenciales de prueba

| Campo | Valor |
|-------|-------|
| Correo | `admin@horizonte.edu.pe` |
| Contraseña | `Admin123` |

### Flujo implementado

1. `/admin/dashboard` sin sesión → redirige a `/login?returnUrl=...`
2. Login incorrecto → mensaje de error visible.
3. Login correcto → sesión en `localStorage` → redirige a dashboard.
4. Recarga con sesión → mantiene acceso.
5. Cerrar sesión → limpia sesión → redirige a `/login`.
6. Tras logout, `/admin/dashboard` queda protegido.

### Verificado

- `npm run build` — Compilación exitosa.

### No incluido (pendiente)

- Backend, Supabase, Firebase, JWT real — No utilizados.
- Dashboard ERP real — Fase 7.
- Servicios mock académicos — Fases 7–8.
- `roleGuard` y roles adicionales — Posterior.
- Cypress — Fase 10.

### Próximo paso

- **Fase 7: Dashboard e intranet tipo ERP** (requiere autorización).

---

## [0.5.0] — 2026-05-31 — Fase 5: Página web pública premium

### Completado

- **Fase 5 del proyecto** — Web pública institucional completa con diseño premium, responsive y contenido simulado.

### Agregado (Angular CLI)

- `pages/about`, `pages/levels`, `pages/admission`, `pages/news`, `pages/announcements`, `pages/gallery`, `pages/contact`.
- `components/page-header` — Encabezado reutilizable para páginas públicas internas.

### Modificado

- `pages/home` — Hero premium, pilares, métricas, niveles resumidos y CTA admisión.
- `components/navbar` — Enlaces reales a todas las rutas públicas; insignia institucional.
- `components/footer` — Enlaces rápidos, contacto simulado y diseño ampliado.
- `src/app/app.routes.ts` — 9 rutas públicas bajo `PublicLayout`.
- `src/styles.scss` — Clases `.public-card`, badges institucionales.
- `docs/PROJECT_PHASES.md`, `docs/ROUTE_MAP.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`.

### Rutas públicas activas

| Ruta | Página |
|------|--------|
| `/` | Home |
| `/nosotros` | About |
| `/niveles` | Levels |
| `/admision` | Admission |
| `/noticias` | News |
| `/comunicados` | Announcements |
| `/galeria` | Gallery |
| `/contacto` | Contact |
| `/login` | Login |

### Verificado

- `npm run build` — Compilación exitosa.

### No incluido (pendiente)

- Autenticación real y guards — Fase 6.
- Validaciones Signal Forms en contacto — Fase 9.
- Servicios mock académicos — Fases 6–8.
- Dashboard e intranet avanzada — Fase 7.
- Backend, Supabase, Firebase, ML — No utilizados.

### Próximo paso

- **Fase 6: Login, auth simulado y guards** (requiere autorización).

---

## [0.4.0] — 2026-05-31 — Fase 4: Layouts principales

### Completado

- **Fase 4 del proyecto** — Layouts público y admin, navegación base y rutas con layouts anidados.

### Agregado (componentes Angular CLI)

- `layouts/public-layout` — `PublicLayout` (Navbar + router-outlet + Footer).
- `layouts/admin-layout` — `AdminLayout` (Sidebar + header interno + router-outlet).
- `components/navbar` — Navbar institucional responsive Bootstrap 5.
- `components/footer` — Footer institucional.
- `components/sidebar` — Menú lateral intranet tipo ERP.
- `pages/home` — Home temporal con hero y 3 cards.
- `pages/login` — Login temporal (sin formulario; enlace demo al dashboard).
- `pages/dashboard` — Dashboard temporal con 3 cards de prueba.

### Modificado

- `src/app/app.routes.ts` — Rutas con `PublicLayout` y `AdminLayout`.
- `src/app/app.html` — Solo `<router-outlet />`.
- `src/styles.scss` — Clase `.bg-horizonte-dark`.
- `angular.json` — Bootstrap JS bundle para navbar colapsable.
- `docs/PROJECT_PHASES.md`, `docs/ARCHITECTURE.md`, `docs/ROUTE_MAP.md`.

### Rutas activas

| Ruta | Layout |
|------|--------|
| `/` | `PublicLayout` → `Home` |
| `/login` | `PublicLayout` → `Login` |
| `/admin/dashboard` | `AdminLayout` → `Dashboard` |
| `/admin` | Redirige a `dashboard` |

### Verificado

- `npm run build` — Compilación exitosa.
- `npm start` — Rutas `/`, `/login`, `/admin/dashboard` navegables.

### No incluido (pendiente)

- Guards y autenticación mock — Fase 6.
- Web pública premium completa — Fase 5.
- Dashboard e intranet con datos — Fase 7.
- Servicios mock, interfaces `.ts` — Fases 6–8.
- Resto de rutas públicas e intranet del mapa MVP.

### Próximo paso

- **Fase 5: Página web pública premium** (requiere autorización).

---

## [0.3.0] — 2026-05-31 — Fase 3: Inicialización Angular y Bootstrap

### Completado

- **Fase 3 del proyecto** — Proyecto Angular 21 creado y verificado con `ng build` y `ng serve`.

### Agregado

- Proyecto Angular 21 en la raíz `colegio-horizonte` (routing, SCSS, standalone, sin SSR).
- Bootstrap 5.3.x (`npm install bootstrap`).
- Estructura base de carpetas en `src/app/` con `.gitkeep` (layouts, pages, components, services, interfaces, guards, data).
- Pantalla inicial mínima en `App` con mensaje institucional y botón Bootstrap.
- Variables CSS institucionales y clases utilitarias en `src/styles.scss`.
- `docs/SETUP.md` — Guía de instalación, ejecución y notas de Bootstrap.

### Modificado

- `src/styles.scss` — Import de Bootstrap y estilos globales Horizonte.
- `src/app/app.html`, `src/app/app.ts`, `src/app/app.scss` — Pantalla inicial Fase 3.
- `src/index.html` — Título y `lang="es"`.
- `src/app/app.spec.ts` — Prueba actualizada al nuevo título.
- `docs/PROJECT_PHASES.md` — Fase 3 marcada como completada.

### Verificado

- `npm run build` — Compilación exitosa.
- `npm start` (`ng serve`) — Servidor en `http://localhost:4200/`.

### No incluido (pendiente de fases posteriores)

- Layouts (`PublicLayout`, `AdminLayout`) — Fase 4.
- Páginas del sistema, login, dashboard, intranet — Fases 4–8.
- Servicios mock, interfaces `.ts`, guards — Fases 6–8.
- Formularios con Signal Forms — Fase 9.
- Cypress — Fase 10.
- Backend, Supabase, Firebase, Machine Learning — No utilizados.

### Próximo paso

- **Fase 4: Layouts principales** — PublicLayout, AdminLayout, Navbar, Footer, Sidebar y routing con layouts (requiere autorización).

---

### Completado

- **Fase 2 del proyecto** — Planificación técnica y documentación del MVP.

### Agregado

- `docs/ROUTE_MAP.md` — Mapa de rutas públicas y privadas, layouts (`PublicLayout`, `AdminLayout`), guards (`authGuard`) y relación ruta-servicio.

### Actualizado

- `docs/MVP_SCOPE.md` — Alcance MVP reorganizado en 12 secciones; catálogo de 23 módulos con propósito, prioridad, funcionalidad, mock y formularios; roles simulados; formularios principales con campos y validaciones; exclusiones ampliadas; criterios de avance a Fase 3.
- `docs/ARCHITECTURE.md` — Interfaces TypeScript planificadas (15); servicios mock planificados (14); componentes reutilizables con responsabilidades y límites anti-sobreingeniería; referencia a `ROUTE_MAP.md`; estado Fase 2.
- `docs/PROJECT_PHASES.md` — Fase 2 marcada como completada con checklist de criterios para Fase 3.

### Planificado (sin código)

- 15 interfaces TypeScript (`User`, `Role`, `Student`, etc.).
- 14 servicios mock (`AuthService`, `DashboardService`, etc.).
- 7 componentes reutilizables (`Navbar`, `Footer`, `Sidebar`, etc.).
- 7 formularios con Signal Forms / validaciones visibles.
- 5 roles simulados (implementación inicial con `ADMIN`).
- 9 rutas públicas + 14 rutas privadas bajo `/admin/*`.

### No incluido (pendiente de fases posteriores)

- Código Angular — **No se generó código Angular**.
- Proyecto Angular (`ng new`) — **No ejecutado**.
- Bootstrap 5 — **No instalado**.
- Componentes, servicios, interfaces `.ts`, guards — **No creados**.
- Rutas reales en `app.routes.ts` — **No implementadas**.
- Cypress — **No agregado**.
- Backend, Supabase, Firebase, Machine Learning, tutor inteligente — **No utilizados**.

### Próximo paso

- **Fase 3: Inicialización Angular y Bootstrap** — `ng new`, Bootstrap 5, estructura base y rutas mínimas (requiere autorización).

---

## [0.1.0] — 2026-05-31 — Fase 1: Documentación inicial

### Iniciado

- **Fase 1 del proyecto** — Documentación inicial completada.
- Proyecto **HORIZONTE DIGITAL** definido desde cero en la carpeta raíz `colegio-horizonte`.

### Agregado

- `docs/SYSTEM_REQUIREMENTS.md` — Contiene el **prompt maestro** del sistema: contexto, reglas de desarrollo, alcance, identidad visual, estructura deseada, fases oficiales, roles, datos mock, componentes sugeridos, criterios de calidad y restricciones técnicas.
- `docs/PROJECT_PHASES.md` — Las 11 fases del proyecto con objetivos, entregables y regla de no avanzar sin autorización.
- `docs/MVP_SCOPE.md` — Definición del alcance MVP: web pública, login mock, dashboard, módulos académicos, servicios mock, interfaces, guards y formularios con Signals.
- `docs/ARCHITECTURE.md` — Arquitectura simple del frontend: carpetas `layouts`, `pages`, `components`, `services`, `interfaces`, `guards`, `data` y separación público/privado.
- `docs/UI_GUIDELINES.md` — Identidad visual institucional, paleta de colores, estilo premium/ERP, Bootstrap 5 y criterios responsive.
- `docs/CHANGELOG.md` — Este archivo.

### No incluido (pendiente de fases posteriores)

- Código Angular — **No se generó código Angular**.
- Proyecto Angular (`ng new`) — **No ejecutado**.
- Bootstrap 5 — **No instalado**.
- Componentes, servicios, rutas, guards — **No creados**.
- Cypress — **No agregado**.
- Backend, Supabase, Machine Learning, tutor inteligente — **No utilizados**.

### Próximo paso

- **Fase 2: Arquitectura simple y alcance MVP** — Refinar módulos, rutas, interfaces, servicios mock y roles (requiere autorización para iniciar).

---

## Convenciones de versionado por fase

| Versión | Fase |
|---------|------|
| 0.1.x | Fase 1 — Documentación |
| 0.2.x | Fase 2 — Arquitectura y MVP detallado |
| 0.3.x | Fase 3 — Inicialización Angular |
| 0.4.x | Fase 4 — Layouts |
| 0.5.x | Fase 5 — Web pública |
| 0.6.x | Fase 6 — Auth mock y guards |
| 0.7.x | Fase 7 — Dashboard e intranet |
| 0.8.x | Fase 8 — Módulos académicos |
| 0.9.x | Fase 9 — Formularios con Angular Signals |
| 0.10.x | Fase 10 — Pruebas Cypress E2E |
| 1.0.0-rc | Fase 10 — Cypress |
| 1.0.0 | Fase 11 — Revisión final rúbrica |
