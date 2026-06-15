# Arquitectura — HORIZONTE DIGITAL

## Sistema web institucional con intranet académica para la I.E.P. Horizonte

Este documento describe la **arquitectura simple** del frontend Angular. El diseño prioriza claridad, orden y defensa académica, **sin sobreingeniería** ni capas innecesarias.

**Estado:** Planificación técnica completada en **Fase 2**. Implementación a partir de **Fase 3**.

---

## 1. Visión general

HORIZONTE DIGITAL es una aplicación **SPA (Single Page Application)** con Angular 21 que combina:

1. **Zona pública** — Web institucional accesible sin autenticación.
2. **Zona privada (intranet)** — Módulos académicos protegidos por guards y alimentados por servicios mock.

No hay backend en esta etapa. Toda la lógica de datos reside en el cliente mediante servicios mock e interfaces TypeScript.

```
┌─────────────────────────────────────────────────────────┐
│                    HORIZONTE DIGITAL                     │
├──────────────────────────┬──────────────────────────────┤
│     ZONA PÚBLICA         │      INTRANET PRIVADA         │
│   (PublicLayout)         │      (AdminLayout)            │
│                          │                               │
│  /, /nosotros, /login    │  /admin/dashboard,            │
│  /noticias, /contacto    │  /admin/estudiantes, etc.     │
│                          │                               │
│  Sin autenticación       │  authGuard + sesión mock      │
└──────────────────────────┴──────────────────────────────┘
                              │
                              ▼
                    Servicios mock + data/
                    (sin backend)
```

---

## 2. Estructura de carpetas

La organización principal bajo `src/app/` será:

```txt
src/app/
├── layouts/
│   ├── public-layout/
│   └── admin-layout/
├── pages/
│   ├── home/
│   ├── about/
│   ├── levels/
│   ├── admission/
│   ├── news/
│   ├── announcements/
│   ├── gallery/
│   ├── contact/
│   ├── login/
│   ├── dashboard/
│   ├── profile/
│   ├── grades/
│   ├── schedules/
│   ├── tasks/
│   ├── resources/
│   ├── attendance/
│   ├── parent-tracking/
│   ├── students/
│   ├── teachers/
│   ├── parents/
│   ├── users/
│   ├── courses/
│   └── settings/
├── components/
│   ├── navbar/
│   ├── footer/
│   ├── sidebar/
│   ├── page-header/
│   ├── stat-card/
│   ├── data-table/
│   └── empty-state/
├── services/
├── interfaces/
├── guards/
├── data/
├── app.routes.ts
├── app.config.ts
└── main.ts
```

Esta estructura se implementará a partir de la **Fase 3**.

---

## 3. Responsabilidad de cada carpeta

### `layouts/`

Contiene los **layouts maestros** que envuelven grupos de páginas.

| Layout | Función |
|--------|---------|
| `public-layout` | Estructura de la web institucional: navbar público, contenido central, footer. |
| `admin-layout` | Estructura de la intranet: sidebar, navbar interno, área de contenido administrativo. |

**Propósito:** Separar visual y estructuralmente la experiencia pública de la privada sin duplicar código en cada página.

---

### `pages/`

Contiene **páginas o vistas** asociadas a rutas concretas. Un componente por ruta principal.

- **Páginas públicas:** `home`, `about`, `levels`, `admission`, `platform`, `news`, `announcements`, `gallery`, `contact`, `login`.
- **Páginas privadas:** `dashboard`, `profile`, `grades`, `schedules`, `tasks`, `resources`, `attendance`, `parent-tracking`, `students`, `teachers`, `parents`, `users`, `courses`, `settings`.

**Propósito:** La lógica de presentación de cada módulo vive aquí; consume servicios mock, no accede directamente a `data/`.

---

### `components/`

Contiene **componentes reutilizables** compartidos entre páginas. Ver sección **10. Componentes reutilizables planificados**.

---

### `services/`

Contiene **servicios Angular** que encapsulan lógica de negocio y acceso a datos mock. Ver sección **9. Servicios mock planificados**.

**Propósito:** Separar la lógica de datos de los componentes; facilitar sustitución futura por API real.

---

### `interfaces/`

Contiene **interfaces TypeScript** que definen la forma de las entidades del dominio. Ver sección **8. Interfaces TypeScript planificadas**.

**Propósito:** Tipado fuerte, autocompletado y código defendible académicamente.

---

### `guards/`

Contiene **route guards** de Angular.

| Guard | Archivo sugerido | Función |
|-------|------------------|---------|
| `authGuard` | `auth.guard.ts` | Protege rutas `/admin/*`; redirige a `/login` sin sesión |
| `roleGuard` | `role.guard.ts` | (Opcional) Restringe rutas según rol mock |

**Propósito:** Proteger la intranet y demostrar routing avanzado de Angular.

---

### `data/`

Contiene **datos estáticos mock** importables por servicios.

Ejemplos: `students.data.ts`, `teachers.data.ts`, `courses.data.ts`, `news.data.ts`, `dashboard-metrics.data.ts`.

**Propósito:** Centralizar semillas de datos; mantener servicios legibles.

---

### Archivos raíz de la aplicación

| Archivo | Función |
|---------|---------|
| `app.routes.ts` | Rutas públicas, privadas y layouts (ver `ROUTE_MAP.md`) |
| `app.config.ts` | Configuración de la aplicación (providers, etc.) |
| `main.ts` | Punto de entrada de bootstrap de Angular |

---

## 4. Separación: página pública vs intranet privada

### Zona pública

- **Layout:** `PublicLayout`
- **Rutas:** `/`, `/nosotros`, `/niveles`, `/admision`, `/noticias`, `/comunicados`, `/galeria`, `/contacto`, `/login`
- **Acceso:** Libre, sin guard
- **Objetivo:** Imagen institucional premium de la I.E.P. Horizonte

### Intranet privada

- **Layout:** `AdminLayout`
- **Rutas:** `/admin/*` (ver `ROUTE_MAP.md`)
- **Acceso:** Requiere login mock exitoso; protegido por `authGuard`
- **Objetivo:** Simular un ERP escolar con módulos académicos

---

## 5. Mapa de rutas

El detalle completo de rutas, layouts y guards está en **`ROUTE_MAP.md`**.

---

## 6. Flujo de datos (mock)

```
Página (pages/)
       │
       ▼
  Servicio mock (services/)
       │
       ├──► Interface TypeScript (interfaces/)
       │
       └──► Datos semilla (data/) — solo vía servicio
```

**Reglas:**

- Los componentes de página **no** importan directamente desde `data/`.
- Los servicios devuelven `Observable<T>` o signals según convención adoptada en Fase 3.
- Las mutaciones mock (crear/editar) modifican el array en memoria del servicio.

---

## 7. Principios de diseño arquitectónico

1. **Simplicidad** — Angular standalone moderno; sin NgModules extras ni micro-frontends.
2. **Separación de responsabilidades** — Páginas presentan; servicios proveen datos; guards protegen; interfaces tipan.
3. **Convenciones del curso** — `ng generate component`, `ng generate service`, `ng generate interface`, `ng generate guard`.
4. **Preparado para crecer** — Sustituir servicios mock por HTTP en el futuro sin reescribir toda la UI.
5. **Documentación por fase** — Cambios relevantes en `CHANGELOG.md`.

---

## 8. Interfaces TypeScript planificadas

> **Estado Fase 8B:** interfaces académicas implementadas en `src/app/interfaces/`. Interfaces públicas (noticias, galería) pendientes.

| Interface | Archivo | Estado | Representa |
|-----------|---------|--------|------------|
| `User` | `user.ts` | ✅ Fase 6 | Usuario autenticado mock |
| `Role` | `role.ts` | ✅ Fase 6 | Rol: `ADMIN`, `DIRECTOR`, `TEACHER`, `STUDENT`, `PARENT` |
| `Student` | `student.ts` | ✅ Fase 8B | Estudiante: código, nombre, nivel, grado, sección, estado |
| `Teacher` | `teacher.ts` | ✅ Fase 8B | Docente: código, nombre, especialidad, email, estado |
| `Parent` | `parent.ts` | ✅ Fase 8B | Apoderado: datos personales y vínculo con estudiante |
| `Course` | `course.ts` | ✅ Fase 8B | Curso: código, nombre, nivel, grado, docente, estado |
| `Grade` | `grade.ts` | ✅ Fase 8B | Calificación: curso, bimestre, nota, estado |
| `Schedule` | `schedule.ts` | ✅ Fase 8B | Horario: día, hora, curso, docente, aula |
| `Task` | `task.ts` | ✅ Fase 8B | Tarea: título, curso, fecha entrega, estado |
| `Resource` | `resource.ts` | ✅ Fase 8B | Recurso: título, tipo, curso, fecha, estado |
| `Attendance` | `attendance.ts` | ✅ Fase 8B | Asistencia: fecha, estudiante, curso, estado |
| `ParentTracking` | `parent-tracking.ts` | ✅ Fase 8B | Seguimiento padres: comunicación y estado académico |
| `AcademicUser` | `academic-user.ts` | ✅ Fase 8B | Usuario académico: nombre, email, rol, estado |
| `DashboardMetric` | `dashboard-metric.ts` | ✅ Fase 7 | Métrica del dashboard |
| `Announcement` | — | ⏳ Pendiente | Comunicado institucional |
| `NewsItem` | — | ⏳ Pendiente | Noticia pública |
| `GalleryImage` | — | ⏳ Pendiente | Imagen de galería |

---

## 9. Servicios mock planificados

> **Estado Fase 8B:** servicios académicos implementados con datos en memoria, `getAll()` y `getById()`. Sin HTTP.

| Servicio | Archivo | Estado | Datos / acciones simuladas |
|----------|---------|--------|----------------------------|
| `AuthService` | `auth.service.ts` | ✅ Fase 6 | Login/logout mock; sesión actual |
| `DashboardService` | `dashboard.service.ts` | ✅ Fase 7 | Métricas, resumen, actividades |
| `StudentService` | `student.service.ts` | ✅ Fase 8B | Listado mock de `Student[]` |
| `TeacherService` | `teacher.service.ts` | ✅ Fase 8B | Listado mock de `Teacher[]` |
| `ParentService` | `parent.service.ts` | ✅ Fase 8B | Listado mock de `Parent[]` |
| `CourseService` | `course.service.ts` | ✅ Fase 8B | Listado mock de `Course[]` |
| `GradeService` | `grade.service.ts` | ✅ Fase 8B | Listado mock de `Grade[]` |
| `ScheduleService` | `schedule.service.ts` | ✅ Fase 8B | Listado mock de `Schedule[]` |
| `TaskService` | `task.service.ts` | ✅ Fase 8B | Listado mock de `Task[]` |
| `ResourceService` | `resource.service.ts` | ✅ Fase 8B | Listado mock de `Resource[]` |
| `AttendanceService` | `attendance.service.ts` | ✅ Fase 8B | Listado mock de `Attendance[]` |
| `ParentTrackingService` | `parent-tracking.service.ts` | ✅ Fase 8B | Listado mock de `ParentTracking[]` |
| `AcademicUserService` | `academic-user.service.ts` | ✅ Fase 8B | Listado mock de `AcademicUser[]` |
| `AnnouncementService` | — | ⏳ Pendiente | Comunicados públicos |
| `NewsService` | — | ⏳ Pendiente | Noticias públicas |
| `GalleryService` | — | ⏳ Pendiente | Galería pública |

### Patrón de implementación (Fase 8B)

```typescript
@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly students: Student[] = [/* datos mock */];

  getAll(): Student[] {
    return [...this.students];
  }

  getById(id: number): Student | undefined {
    return this.students.find((student) => student.id === id);
  }
}
```

---

## 10. Componentes reutilizables planificados

> **Nota:** Solo documentación. No crear componentes hasta Fases 4–7.

### Navbar

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | `PublicLayout` (variante pública); opcionalmente navbar compacto en `AdminLayout` |
| **Responsabilidad** | Logo/nombre institucional, enlaces de navegación, botón "Ingresar", menú responsive colapsable |
| **Qué NO debe hacer** | No gestionar autenticación internamente; no contener lógica de servicios mock; no duplicar el sidebar de la intranet |

---

### Footer

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | `PublicLayout` únicamente |
| **Responsabilidad** | Datos de contacto, enlaces institucionales, copyright, redes (placeholders) |
| **Qué NO debe hacer** | No aparecer en intranet admin; no incluir formularios complejos |

---

### Sidebar

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | `AdminLayout` |
| **Responsabilidad** | Menú lateral con enlaces a módulos `/admin/*`; ítem activo resaltado; colapsable en móvil |
| **Qué NO debe hacer** | No filtrar rutas por rol con lógica compleja en MVP inicial; no cargar datos de módulos |

---

### PageHeader

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | Páginas de intranet y opcionalmente páginas públicas internas |
| **Responsabilidad** | Título de página, subtítulo opcional, breadcrumb simple, slot para acciones (botón "Nuevo") |
| **Qué NO debe hacer** | No implementar routing propio; no ser un layout completo |

---

### PublicChatbot (v1.3.0)

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | `PublicLayout` únicamente |
| **Responsabilidad** | Widget flotante de orientación institucional; respuestas predefinidas por palabras clave |
| **Estado** | Angular Signals (`isOpen`, `messages`, `userInput`) |
| **Qué NO debe hacer** | No backend, API externa, ML ni IA real; no en `/admin/*`; no es tutor inteligente |

---

### StatCard

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | Dashboard principal |
| **Responsabilidad** | Mostrar una métrica: valor numérico, etiqueta, icono/color de acento, variación opcional |
| **Qué NO debe hacer** | No fetch de datos; recibe inputs del componente padre; no gráficos complejos |

---

### DataTable (v1.5.0 premium)

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | Estudiantes, Docentes, Cursos, Notas, Horarios, Asistencia, Usuarios, Pagos, Pensiones, Ventas, etc. |
| **Responsabilidad** | Card contenedora premium, header con título/subtítulo/icono, contador, buscador visual simple, tabla responsive con badges de estado automáticos y columna de acciones simuladas (Ver / Detalle) |
| **Inputs clave** | `title`, `subtitle?`, `icon`, `columns`, `rows`, `showActions?`, `showSearch?` |
| **Qué NO debe hacer** | No sorting/filtering avanzado tipo DataGrid; no paginación real; no integración con backend; no CRUD real en acciones |

---

### EmptyState

| Aspecto | Detalle |
|---------|---------|
| **Dónde se usa** | Cualquier listado sin registros |
| **Responsabilidad** | Mensaje amigable, icono simple, botón opcional de acción ("Agregar estudiante") |
| **Qué NO debe hacer** | No decidir cuándo mostrarse; el padre pasa `@Input() visible` o usa `@if` en la página |

---

## 11. Guards planificados

| Guard | Cuándo implementar | Comportamiento |
|-------|-------------------|----------------|
| `authGuard` | Fase 6 | Bloquea `/admin/*` sin sesión; guarda `returnUrl` |
| `roleGuard` | Post-Fase 6 (opcional) | Verifica rol en `AuthService`; útil cuando se simulen roles beyond ADMIN |

---

## 12. Lo que esta arquitectura NO incluye

- Backend, API REST, GraphQL.
- Supabase, Firebase u otras BaaS.
- State management global (NgRx, etc.).
- Machine Learning o tutor inteligente.
- Librerías UI pesadas además de Bootstrap 5.
- Pagos, PDF avanzado, notificaciones push, chat en tiempo real.

---

## 13. Criterios de avance a Fase 3

La Fase 2 queda completa cuando:

- ✅ Alcance MVP documentado (`MVP_SCOPE.md`).
- ✅ Rutas definidas (`ROUTE_MAP.md`).
- ✅ Interfaces, servicios y componentes planificados (este documento).
- ✅ Roles y formularios documentados (`MVP_SCOPE.md`).
- ✅ Sin código Angular generado.

**Fase 3** iniciará: `ng new`, Bootstrap 5, carpetas base y rutas mínimas en `app.routes.ts`.

---

## 14. Estado actual

| Elemento | Estado |
|----------|--------|
| Documentación de arquitectura | ✅ Fase 2 completada |
| Mapa de rutas | ✅ `ROUTE_MAP.md` |
| Proyecto Angular 21 | ✅ Fase 3 — creado |
| Bootstrap 5 | ✅ Fase 3 — configurado |
| Estructura base `src/app/` | ✅ Fase 3 — carpetas con `.gitkeep` |
| `PublicLayout`, `AdminLayout` | ✅ Fase 4 — implementados |
| `Navbar`, `Footer`, `Sidebar` | ✅ Fase 4 — implementados |
| `PageHeader` | ✅ Fase 5 — implementado |
| Rutas públicas completas | ✅ Fase 5 — 9 rutas bajo `PublicLayout` |
| Rutas base con layouts | ✅ Fase 4 — `/admin/dashboard` |
| Páginas públicas premium | ✅ Fase 5 — Home, About, Levels, etc. |
| Guards (`authGuard`) | ✅ Fase 6 — protege `/admin/*` |
| `AuthService` mock | ✅ Fase 6 — `auth.service.ts` |
| Interfaces `User`, `Role`, `LoginCredentials` | ✅ Fase 6 |
| `DashboardService` mock | ✅ Fase 7 — `dashboard.service.ts` |
| Interfaces dashboard | ✅ Fase 7 — `DashboardMetric`, `DashboardSummary`, `RecentActivity` |
| `StatCard`, `DataTable`, `EmptyState` | ✅ Fase 7 — implementados |
| Dashboard ERP | ✅ Fase 7 — métricas, tablas, resumen |
| Dashboard ejecutivo por rol | ✅ Fase 8F — métricas, alertas, eventos, accesos rápidos (sin tablas largas) |
| Páginas privadas base (14 módulos) | ✅ Fase 8A — rutas activas, contenido simulado local |
| Sidebar intranet navegable | ✅ Fase 8A — todos los enlaces activos |
| Servicios mock académicos por módulo | ✅ Fase 8B — 11 servicios con `getAll()` |
| Interfaces académicas | ✅ Fase 8B — 11 interfaces tipadas |
| Paneles por rol / sidebar adaptado | ✅ Fase 8C–8D — portales por rol |
| Módulos institucionales simulados | ✅ Fase 8D — matrículas, pensiones, pagos, ventas, reportes |
| Pagos / ventas reales | ❌ Simulados — sin pasarela ni backend |
| `RoleContextService` | ✅ Fase 8E — datos contextuales por rol |
| Layout ERP sidebar full-height | ✅ Fase 8E |
| Pagos premium simulados | ✅ Fase 8F — vista institucional, familiar e informativa |
| Clases ERP ejecutivas | ✅ Fase 8F — `.erp-hero`, `.erp-quick-access`, `.erp-payment-timeline`, etc. |
| Formularios con Angular Signals | ✅ Fase 9 — Login, contacto, estudiante, docente, curso, tarea, recurso |
| Validaciones visibles | ✅ Fase 9 — `computed()` + `invalid-feedback` |
| Visibilidad formularios por rol | ✅ Fase 9 — `RoleContextService.canRegister*()` |
| Cypress E2E | ✅ Fase 10 — 6 specs, 16 pruebas, `e2e:local` |
| Revisión final rúbrica | ✅ Fase 11 — MVP 1.0.0 |

---

## Referencias

- Requisitos: `SYSTEM_REQUIREMENTS.md`
- Alcance MVP: `MVP_SCOPE.md`
- Mapa de rutas: `ROUTE_MAP.md`
- Fases: `PROJECT_PHASES.md`
- UI: `UI_GUIDELINES.md`
- Revisión final: `FINAL_REVIEW.md`
- Exposición: `PRESENTATION_GUIDE.md`
- Entrega: `DELIVERY_CHECKLIST.md`
