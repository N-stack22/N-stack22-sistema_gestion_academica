# Instalación y ejecución — HORIZONTE DIGITAL

## Sistema web institucional con intranet académica para la I.E.P. Horizonte

Guía para instalar dependencias y ejecutar el proyecto en desarrollo local.

**Estado actual:** Mejora v1.1.0 completada — web pública premium; intranet sin cambios funcionales.

---

## 1. Requisitos

| Requisito | Versión usada en Fase 3 |
|-----------|-------------------------|
| Node.js | v22.22.0 o superior recomendado |
| npm | 10.x o superior |
| Angular CLI | 21.2.x |
| Angular | 21.2.x |
| Bootstrap | 5.3.x |

---

## 2. Comandos usados en Fase 3

Creación del proyecto (en la carpeta raíz `colegio-horizonte`, conservando `docs/`):

```bash
npx @angular/cli@21 new colegio-horizonte --routing --style=scss --skip-git --directory . --defaults --ssr=false
```

Instalación de Bootstrap 5:

```bash
npm install bootstrap
```

Verificación de compilación:

```bash
npm run build
```

---

## 3. Instalar dependencias

Si clonas o descargas el proyecto por primera vez:

```bash
cd colegio-horizonte
npm install
```

---

## 4. Ejecutar el proyecto

Servidor de desarrollo:

```bash
npm start
```

Equivalente:

```bash
ng serve
```

Abrir en el navegador:

```txt
http://localhost:4200/
```

Deberías ver la pantalla inicial con el título **HORIZONTE DIGITAL** y el mensaje de Fase 3.

---

## 5. Detener el servidor

En la terminal donde corre `ng serve`, presionar:

```txt
Ctrl + C
```

Confirmar si el sistema lo solicita.

---

## 6. Otros comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Compila el proyecto para producción en `dist/` |
| `npm test` | Ejecuta pruebas unitarias (Vitest) |
| `ng version` | Muestra versiones de Angular CLI y dependencias |

---

## 7. Bootstrap 5

Bootstrap se importa globalmente en `src/styles.scss`:

```scss
@import 'bootstrap/scss/bootstrap';
```

**Nota:** Sass puede mostrar un aviso de deprecación por `@import`. Es esperado en esta fase; no afecta la compilación ni la ejecución.

Variables CSS institucionales definidas en el mismo archivo:

```scss
:root {
  --horizonte-blue: #0B1F3A;
  --horizonte-dark: #071527;
  --horizonte-red: #C1121F;
  --horizonte-yellow: #F4C430;
  --horizonte-gray-light: #F3F4F6;
  --horizonte-gray: #9CA3AF;
  --horizonte-gray-dark: #4B5563;
  --horizonte-white: #FFFFFF;
}
```

Clases utilitarias mínimas: `.text-horizonte-blue`, `.bg-horizonte-blue`, `.btn-horizonte-primary`, `.section-padding`.

---

## 8. Bootstrap Icons (Fase 7.1)

```bash
npm install bootstrap-icons
```

Import en `src/styles.scss`:

```scss
@import 'bootstrap-icons/font/bootstrap-icons.css';
```

Uso en plantillas:

```html
<i class="bi bi-mortarboard-fill" aria-hidden="true"></i>
```

Clases utilitarias adicionales: `.horizonte-icon-circle`, `.horizonte-icon-inline`.

No se usa FontAwesome ni Angular Material.

---

## 9. Estructura base creada

Carpetas preparadas bajo `src/app/` (con `.gitkeep`; sin componentes generados aún):

```txt
layouts/          → public-layout, admin-layout
pages/            → home, about, levels, … settings (23 carpetas)
components/       → navbar, footer, sidebar, … empty-state
services/
interfaces/
guards/
data/
```

---

## 10. Estado de la Fase 3

| Elemento | Estado |
|----------|--------|
| Proyecto Angular 21 | ✅ Creado |
| Bootstrap 5 | ✅ Instalado y configurado |
| Estilos globales institucionales | ✅ En `src/styles.scss` |
| Estructura base de carpetas | ✅ Creada |
| Layouts y navegación base | ✅ Fase 4 — ver abajo |

---

## 11. Estado de la Fase 4

| Elemento | Estado |
|----------|--------|
| `PublicLayout`, `AdminLayout` | ✅ Implementados |
| `Navbar`, `Footer`, `Sidebar` | ✅ Implementados |
| Rutas base | ✅ `/`, `/login`, `/admin/dashboard` |

---

## 12. Estado de la Fase 5

| Elemento | Estado |
|----------|--------|
| Web pública premium | ✅ 9 páginas activas |
| `PageHeader` | ✅ Componente reutilizable |
| Formulario contacto | ✅ Signals + validaciones (Fase 9) |
| Autenticación / guards | ✅ Fase 6 |

---

## 13. Credenciales de prueba por rol

Autenticación simulada (Fase 8C). No hay backend ni API real. La sesión se persiste en `localStorage` bajo la clave `horizonte_session`.

| Rol | Nombre | Correo | Contraseña |
|-----|--------|--------|------------|
| Administrador | Administrador Horizonte | `admin@horizonte.edu.pe` | `Admin123` |
| Director | María Elena Vargas | `director@horizonte.edu.pe` | `Director123` |
| Docente | Carlos Mendoza | `docente@horizonte.edu.pe` | `Docente123` |
| Estudiante | Lucía Torres | `estudiante@horizonte.edu.pe` | `Estudiante123` |
| Padre de familia | Rosa Quispe | `padre@horizonte.edu.pe` | `Padre123` |

Cada rol muestra un **panel de dashboard** y un **menú lateral** diferente. Todas las rutas `/admin/*` requieren sesión (`authGuard`); aún no hay `roleGuard`.

---

## 14. Próxima fase

**No hay fases pendientes.** El MVP académico (Fases 1–11) está completado.

Mejoras futuras opcionales: backend, `roleGuard`, CRUD persistente — fuera del alcance actual.

---

## 15. Documentos finales (Fase 11)

| Documento | Descripción |
|-----------|-------------|
| [`FINAL_REVIEW.md`](FINAL_REVIEW.md) | Cumplimiento de rúbrica |
| [`PRESENTATION_GUIDE.md`](PRESENTATION_GUIDE.md) | Guía de exposición |
| [`DELIVERY_CHECKLIST.md`](DELIVERY_CHECKLIST.md) | Checklist de entrega |
| [`../README.md`](../README.md) | Inicio rápido del proyecto |

---

## 16. Pruebas E2E con Cypress

Cypress valida flujos **frontend** del MVP simulado. No prueba backend ni APIs reales.

### Comando recomendado

Libera el puerto 4200, levanta Angular y ejecuta todas las pruebas:

```bash
npm run e2e:local
```

Este es el flujo más confiable. Evita ejecutar Cypress contra una instancia antigua de `ng serve`.

### Otros comandos

Modo interactivo (requiere `npm start` en otra terminal):

```bash
npm start
npm run cypress:open
```

Modo headless manual (requiere `npm start` activo):

```bash
npm run cypress:run
```

Alias:

```bash
npm run e2e
```

### Si el puerto 4200 está ocupado

`npm run e2e:local` ejecuta automáticamente `kill-port 4200` antes de iniciar. Si usas `npm start` manualmente y el puerto está en uso, detén el proceso previo con **Ctrl+C** o cierra la terminal.

### Specs incluidos

| Archivo | Qué prueba |
|---------|------------|
| `cypress/e2e/smoke.cy.ts` | Diagnóstico: app Angular actual y formulario login |
| `cypress/e2e/public.cy.ts` | Home, navbar, navegación a contacto y login |
| `cypress/e2e/auth.cy.ts` | Ruta protegida, login incorrecto, login ADMIN y logout |
| `cypress/e2e/contact-form.cy.ts` | Validaciones y envío simulado del formulario de contacto |
| `cypress/e2e/role-dashboard.cy.ts` | Panel ejecutivo por rol y sidebar del apoderado |
| `cypress/e2e/forms-role.cy.ts` | Visibilidad de formularios ADMIN / TEACHER / PARENT |

### Comandos personalizados

- `cy.loginAsAdmin()`
- `cy.loginAsTeacher()`
- `cy.loginAsParent()`

---

## 17. Estado de la Fase 11

| Elemento | Estado |
|----------|--------|
| Revisión técnica | ✅ |
| README.md | ✅ |
| FINAL_REVIEW.md | ✅ |
| PRESENTATION_GUIDE.md | ✅ |
| DELIVERY_CHECKLIST.md | ✅ |
| `npm run build` | ✅ |
| `npm run e2e:local` | ✅ 16/16 |
| **Versión MVP** | **1.0.0** |

---

## 19. Mejora v1.1.0 — Web pública premium

| Elemento | Estado |
|----------|--------|
| Navbar / Footer públicos | ✅ Diseño premium |
| Home landing institucional | ✅ 7 secciones |
| Páginas públicas internas | ✅ Nosotros, niveles, admisión, noticias, comunicados, galería, contacto, login |
| Intranet `/admin/*` | ✅ Sin cambios |
| AuthService / guards | ✅ Sin cambios |
| `data-cy` Cypress | ✅ Preservados |
| `npm run build` | ✅ OK |
| `npm run e2e:local` | ✅ 16/16 |
| Backend | ❌ No existe (sin cambios) |
| **Versión actual** | **1.1.0** |

---

## 18. Estado de la Fase 10

| Elemento | Estado |
|----------|--------|
| Cypress instalado | ✅ |
| Configuración `cypress.config.ts` | ✅ |
| Scripts npm | ✅ `e2e:local` (recomendado), `cypress:open`, `cypress:run`, `e2e` |
| Dependencias E2E | ✅ `start-server-and-test`, `kill-port` |
| Selectores `data-cy` | ✅ Elementos clave |
| Specs E2E | ✅ 6 archivos, **16 pruebas** |
| Verificación | ✅ `npm run e2e:local` — 16/16 passing |
| Backend en pruebas | ❌ Solo frontend mock |

---

## 17. Estado de la Fase 9

| Elemento | Estado |
|----------|--------|
| Login con Signals | ✅ Validaciones `computed()` |
| Contacto con Signals | ✅ Envío simulado |
| Formularios académicos | ✅ Estudiante, docente, curso, tarea, recurso |
| Visibilidad por rol | ✅ `RoleContextService.canRegister*()` |
| Backend / HTTP | ❌ No implementado |
| CRUD real | ❌ Registro local temporal en memoria |
| Cypress | ✅ Fase 10 — ver sección 15 |

---

## 16. Estado de la Fase 8E

| Elemento | Estado |
|----------|--------|
| Layout ERP full-height | ✅ Sidebar sticky 100vh |
| `RoleContextService` | ✅ Datos STUDENT/PARENT contextualizados |
| Módulos por rol | ✅ Padres, pensiones, pagos, horarios, notas, etc. |
| Horario escolar visual | ✅ Vista semanal estudiante/apoderado |
| `roleGuard` | ❌ No implementado |

---

## 16. Estado de la Fase 8D

| Elemento | Estado |
|----------|--------|
| Panel institucional (ADMIN/DIRECTOR) | ✅ Gestión académica + económica simulada |
| Panel docente / estudiante / apoderado | ✅ Temas visuales diferenciados |
| Sidebar por rol | ✅ Menús realistas por portal |
| Módulos nuevos | ✅ Matrículas, pensiones, pagos, ventas, comunicados, reportes |
| Pagos / ventas reales | ❌ Solo simulación visual |
| `roleGuard` | ❌ No implementado |

---

## 16. Estado de la Fase 8C

| Elemento | Estado |
|----------|--------|
| Usuarios mock por rol | ✅ 5 cuentas en `AuthService` |
| Login multirol | ✅ Tabla de credenciales en `/login` |
| Dashboard por rol | ✅ `getRolePanel(role)` — una ruta `/admin/dashboard` |
| Sidebar por rol | ✅ Menú filtrado con `computed` |
| `roleGuard` | ❌ No implementado (por diseño 8C) |
| CRUD / Signal Forms | ❌ Fase 9 |

---

## 16. Estado de la Fase 8B

| Elemento | Estado |
|----------|--------|
| Interfaces académicas | ✅ 11 interfaces en `src/app/interfaces/` |
| Servicios mock académicos | ✅ 11 servicios con `getAll()` y `getById()` |
| Páginas consumiendo servicios | ✅ 11 módulos refactorizados |
| Perfil / Configuración | ✅ Sin servicio dedicado (por diseño) |
| CRUD / formularios | ❌ Fases 8C–9 |
| Paneles por rol | ✅ Fase 8C |

---

## 16. Estado de la Fase 8A

| Elemento | Estado |
|----------|--------|
| Páginas privadas base | ✅ 13 módulos + Dashboard |
| Rutas `/admin/*` | ✅ 14 rutas protegidas con `authGuard` |
| Sidebar navegable | ✅ Todos los enlaces activos |
| Datos simulados | ✅ Servicios mock académicos (Fase 8B) |
| Servicios mock por entidad | ✅ Fase 8B |
| CRUD / formularios avanzados | ❌ Fases 8B–9 |

---

## 16. Estado de la Fase 7

| Elemento | Estado |
|----------|--------|
| Dashboard ERP | ✅ Métricas, resumen, tablas mock |
| `DashboardService` | ✅ Datos simulados locales |
| `StatCard`, `DataTable`, `EmptyState` | ✅ Componentes reutilizables |
| AdminLayout / Sidebar mejorados | ✅ Apariencia ERP |
| Módulos académicos con rutas | ✅ Fase 8A — 14 rutas privadas activas |

---

## 17. Estado de la Fase 7.1

| Elemento | Estado |
|----------|--------|
| Bootstrap Icons | ✅ Instalado y configurado |
| Iconografía web pública | ✅ Navbar, Footer, Home, páginas |
| Iconografía intranet | ✅ Sidebar, AdminLayout, Dashboard, componentes |
| Lógica auth / rutas | ✅ Sin cambios |

---

## Referencias

- Requisitos del sistema: `SYSTEM_REQUIREMENTS.md`
- Arquitectura: `ARCHITECTURE.md`
- Mapa de rutas planificado: `ROUTE_MAP.md`
- Historial de cambios: `CHANGELOG.md`
