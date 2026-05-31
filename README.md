# HORIZONTE DIGITAL

Sistema web institucional con intranet académica para la **I.E.P. Horizonte**.

Frontend académico desarrollado con Angular 21 que simula la experiencia de un ERP escolar: web pública institucional, login multirol, dashboard ejecutivo, módulos académicos y formularios con validaciones visibles. **No incluye backend ni base de datos real.**

---

## Tecnologías usadas

| Tecnología | Uso |
|------------|-----|
| Angular 21 | Framework principal (standalone components) |
| TypeScript | Tipado e interfaces |
| Bootstrap 5 | Grid, componentes y responsive |
| Bootstrap Icons | Iconografía |
| Angular Signals | Estado y validaciones en formularios |
| SCSS | Estilos e identidad visual |
| Cypress | Pruebas E2E |
| Servicios mock | Datos simulados locales |
| Guards | Protección de rutas privadas |

---

## Características principales

- **Web pública:** Home, nosotros, niveles, admisión, noticias, comunicados, galería, contacto.
- **Login simulado:** 5 roles con credenciales de prueba y sesión en `localStorage`.
- **Intranet ERP:** Dashboard ejecutivo, sidebar por rol, 20+ rutas `/admin/*`.
- **Módulos académicos:** Estudiantes, docentes, cursos, notas, tareas, horarios, asistencia, recursos, pagos simulados, etc.
- **Formularios con Signals:** Login, contacto y registros académicos simulados con validaciones visibles.
- **Pruebas Cypress:** 16 pruebas E2E sobre flujos críticos del frontend.

---

## Roles simulados

| Rol | Descripción |
|-----|-------------|
| ADMIN | Gestión institucional completa |
| DIRECTOR | Panel similar a ADMIN |
| TEACHER | Portal docente (cursos, tareas, recursos) |
| STUDENT | Portal estudiante (notas, horario, tareas) |
| PARENT | Portal apoderado (seguimiento de Lucía Torres) |

---

## Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| ADMIN | `admin@horizonte.edu.pe` | `Admin123` |
| DIRECTOR | `director@horizonte.edu.pe` | `Director123` |
| TEACHER | `docente@horizonte.edu.pe` | `Docente123` |
| STUDENT | `estudiante@horizonte.edu.pe` | `Estudiante123` |
| PARENT | `padre@horizonte.edu.pe` | `Padre123` |

---

## Instalación

```bash
npm install
```

---

## Ejecución

Servidor de desarrollo:

```bash
npm start
```

Abrir [http://localhost:4200](http://localhost:4200).

Compilación de producción:

```bash
npm run build
```

---

## Pruebas Cypress

**Comando recomendado** (levanta Angular y ejecuta pruebas):

```bash
npm run e2e:local
```

Modo interactivo (con `npm start` en otra terminal):

```bash
npm run cypress:open
```

Modo headless manual:

```bash
npm run cypress:run
```

---

## Estructura del proyecto

```txt
colegio-horizonte/
├── src/app/
│   ├── components/     # Navbar, sidebar, StatCard, DataTable, etc.
│   ├── guards/         # authGuard
│   ├── interfaces/     # Tipos TypeScript
│   ├── layouts/        # PublicLayout, AdminLayout
│   ├── pages/          # Páginas públicas y privadas
│   ├── services/       # Auth, dashboard, entidades mock
│   └── utils/          # Helpers de validación
├── cypress/e2e/        # Pruebas E2E
├── docs/               # Documentación académica
└── dist/               # Build de producción
```

Documentación detallada en la carpeta [`docs/`](docs/).

---

## Alcance del MVP

Incluye frontend funcional con datos simulados, experiencia diferenciada por rol, formularios con Signals y pruebas E2E básicas.

Ver [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md).

---

## Limitaciones actuales

- **No hay backend** ni API REST real.
- **No hay base de datos** ni persistencia de CRUD.
- **No hay pagos reales** ni pasarela de pago.
- **No se usa Supabase, Firebase** ni servicios externos.
- Los datos son **simulados** con servicios mock y arrays locales.
- No hay `roleGuard` en rutas (sidebar y UI filtran por rol).
- El sistema es un **proyecto frontend académico** para demostración y defensa de curso.

---

## Estado final del proyecto

**Fase 11 completada** — MVP listo para exposición académica.

| Verificación | Estado |
|--------------|--------|
| `npm run build` | OK |
| `npm run e2e:local` | 16/16 pruebas |
| Documentación | Completa en `docs/` |

Revisión final: [`docs/FINAL_REVIEW.md`](docs/FINAL_REVIEW.md)  
Guía de exposición: [`docs/PRESENTATION_GUIDE.md`](docs/PRESENTATION_GUIDE.md)  
Checklist de entrega: [`docs/DELIVERY_CHECKLIST.md`](docs/DELIVERY_CHECKLIST.md)

---

## Licencia y contexto académico

Proyecto desarrollado como trabajo académico para la I.E.P. Horizonte. Uso educativo.
