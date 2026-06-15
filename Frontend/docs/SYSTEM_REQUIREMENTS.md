# HORIZONTE DIGITAL

## Sistema web institucional con intranet académica para la I.E.P. Horizonte

## 1. Contexto general del proyecto

El proyecto se llamará **HORIZONTE DIGITAL**.

Será un sistema web desarrollado con **Angular 21**, orientado a una institución educativa privada llamada **I.E.P. Horizonte**.

El sistema debe combinar dos partes principales:

1. Una **página web pública institucional**, visualmente profesional, moderna y responsive.
2. Una **intranet académica privada**, tipo ERP escolar básico, con módulos académicos simulados mediante servicios mock.

La carpeta raíz del proyecto será:

```txt
colegio-horizonte
```

Este proyecto debe desarrollarse desde cero, de forma ordenada, por fases y sin sobreingeniería.

El objetivo principal es cumplir una rúbrica académica donde se evalúa que el frontend esté desarrollado al 80% o más, sea funcional, esté bien estructurado, tenga buena modularización, use Angular correctamente, maneje lógica de forma adecuada y aplique Signal Forms o Angular Signals en formularios principales con validaciones visibles.

---

## 2. Reglas obligatorias de desarrollo

El proyecto debe seguir estas reglas:

* Trabajar por fases.
* No generar todo el sistema de golpe.
* Documentar cada fase antes o durante su implementación.
* Mantener una arquitectura simple, entendible y defendible para un curso.
* Usar Angular 21.
* Usar Bootstrap 5 como base visual.
* Usar CSS/SCSS simple.
* Usar interfaces TypeScript.
* Usar servicios mock.
* Usar guards.
* Usar Angular Signals o Signal Forms en formularios principales.
* Mostrar validaciones visibles en formularios.
* Preparar el proyecto para pruebas Cypress más adelante.
* No implementar backend todavía.
* No usar Supabase todavía.
* No usar Machine Learning.
* No implementar tutor inteligente.
* No aplicar sobreingeniería.
* Priorizar claridad, orden y funcionalidad.

Cuando se generen archivos Angular, se deben preferir comandos reconocibles para un curso, tales como:

```bash
ng generate component
ng generate service
ng generate interface
ng generate guard
```

---

## 3. Alcance general del sistema

### 3.1 Página pública institucional

Debe incluir las siguientes secciones o páginas:

* Inicio.
* Nosotros.
* Niveles educativos.
* Admisión.
* Noticias.
* Comunicados.
* Galería.
* Contacto.
* Login.

La web pública debe verse como la página institucional de un colegio profesional.

Debe incluir:

* Header institucional.
* Hero moderno.
* Secciones informativas.
* Cards profesionales.
* Llamados a la acción.
* Diseño responsive.
* Footer institucional.

---

### 3.2 Intranet académica privada

La intranet será una zona privada simulada mediante autenticación mock.

Debe incluir:

* Login.
* Dashboard.
* Perfil.
* Notas.
* Horarios.
* Tareas.
* Recursos.
* Asistencia.
* Seguimiento de padres.
* Estudiantes.
* Docentes.
* Padres.
* Usuarios.
* Cursos.
* Configuración.

Debe parecer un ERP académico real, aunque los datos sean simulados.

Debe incluir:

* Sidebar administrativo.
* Navbar o encabezado interno.
* Dashboard con métricas.
* Cards estadísticas.
* Tablas Bootstrap.
* Formularios claros.
* Estados vacíos.
* Navegación protegida con guards.
* Servicios mock para datos.
* Interfaces TypeScript.
* Validaciones visibles.

---

## 4. Identidad visual institucional

El sistema debe usar los siguientes colores institucionales:

```txt
Azul marino: #0B1F3A
Azul oscuro: #071527
Rojo institucional: #C1121F
Amarillo institucional: #F4C430
Plomo claro: #F3F4F6
Plomo medio: #9CA3AF
Plomo oscuro: #4B5563
Blanco: #FFFFFF
```

Criterios visuales:

* Apariencia premium.
* Estilo institucional serio y moderno.
* Página pública limpia y profesional.
* Intranet con apariencia de sistema académico real.
* Buen uso de espacios, cards, tablas y formularios.
* Responsive en escritorio, tablet y móvil.
* Bootstrap 5 como base visual.
* SCSS o CSS simple para personalización.

---

## 5. Estructura deseada del proyecto

La estructura principal debe respetar esta organización:

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

---

## 6. Fases oficiales del proyecto

El proyecto debe avanzar en estas fases:

### Fase 1: Documentación inicial

Crear documentación base del proyecto.

Debe incluir como mínimo:

* `docs/SYSTEM_REQUIREMENTS.md`
* `docs/PROJECT_PHASES.md`
* `docs/MVP_SCOPE.md`
* `docs/ARCHITECTURE.md`
* `docs/UI_GUIDELINES.md`
* `docs/CHANGELOG.md`

En esta fase no se debe programar código Angular todavía.

---

### Fase 2: Arquitectura simple y alcance MVP

Definir:

* Qué módulos entran al MVP.
* Qué módulos quedan simulados.
* Qué datos serán mock.
* Roles iniciales.
* Rutas principales.
* Componentes reutilizables.
* Servicios iniciales.
* Interfaces principales.
* Criterios de avance por fase.

---

### Fase 3: Inicialización Angular y Bootstrap

Crear el proyecto Angular desde cero en la carpeta:

```txt
colegio-horizonte
```

Configurar:

* Angular 21.
* Bootstrap 5.
* SCSS o CSS simple.
* Estructura base de carpetas.
* Rutas iniciales.
* Documentación de instalación.

No crear aún todos los módulos funcionales.

---

### Fase 4: Layouts principales

Crear:

* `PublicLayout`
* `AdminLayout`
* Navbar público.
* Footer público.
* Sidebar administrativo.
* Estructura visual base para la intranet.
* Routing con layouts.

---

### Fase 5: Página web pública premium

Crear páginas públicas:

* Home.
* About.
* Levels.
* Admission.
* News.
* Announcements.
* Gallery.
* Contact.

Debe incluir contenido institucional simulado pero realista.

---

### Fase 6: Login, auth simulado y guards

Crear:

* Página Login.
* Servicio de autenticación mock.
* Interfaces de usuario y rol.
* Guard para rutas privadas.
* Simulación de sesión.
* Redirección según autenticación.

No usar backend.

---

### Fase 7: Dashboard e intranet tipo ERP

Crear:

* Dashboard con métricas.
* Cards estadísticas.
* Resumen académico.
* Tablas Bootstrap.
* Componentes reutilizables.
* Layout administrativo funcional.

---

### Fase 8: Módulos académicos

Crear páginas y lógica mock para:

* Estudiantes.
* Docentes.
* Padres.
* Usuarios.
* Cursos.
* Notas.
* Horarios.
* Tareas.
* Recursos.
* Asistencia.
* Seguimiento de padres.
* Configuración.

No todos necesitan CRUD completo, pero deben estar visualmente funcionales y estructurados.

---

### Fase 9: Formularios con Signal Forms o Angular Signals

Aplicar formularios principales con Angular Signals o Signal Forms.

Formularios sugeridos:

* Login.
* Contacto.
* Registro/edición de estudiante.
* Registro/edición de docente.
* Registro/edición de curso.
* Registro de tarea o recurso.

Deben tener:

* Validaciones visibles.
* Mensajes de error claros.
* Estado del formulario.
* Botones deshabilitados cuando corresponda.
* Código entendible.

---

### Fase 10: Pruebas Cypress

Agregar Cypress más adelante.

Preparar pruebas para:

* Carga de página pública.
* Login mock.
* Acceso protegido a dashboard.
* Visualización de tabla.
* Validación de formulario.

---

### Fase 11: Revisión final para rúbrica

Revisar:

* Frontend desarrollado al 80% o más.
* Estructura de carpetas.
* Modularización.
* Uso de Angular 21.
* Uso de Bootstrap 5.
* Uso de guards.
* Uso de servicios mock.
* Uso de interfaces.
* Uso de Signals o Signal Forms.
* Validaciones visibles.
* Responsive.
* Documentación.
* Limpieza del código.

---

## 7. Roles simulados

El sistema puede manejar roles mock:

```txt
ADMIN
DIRECTOR
TEACHER
STUDENT
PARENT
```

Uso sugerido:

* ADMIN: acceso general.
* DIRECTOR: visión institucional y académica.
* TEACHER: cursos, notas, asistencia y tareas.
* STUDENT: notas, horarios, tareas y recursos.
* PARENT: seguimiento académico, comunicados y asistencia.

En el MVP inicial puede bastar con un login mock de ADMIN y luego ampliar roles si es necesario.

---

## 8. Datos simulados sugeridos

Crear datos mock para:

* Estudiantes.
* Docentes.
* Padres.
* Cursos.
* Notas.
* Horarios.
* Tareas.
* Recursos.
* Asistencia.
* Noticias.
* Comunicados.
* Galería.
* Métricas del dashboard.

Los datos deben estar en servicios mock o archivos dentro de `data/`, según convenga.

---

## 9. Componentes reutilizables sugeridos

Crear componentes reutilizables simples:

* Navbar.
* Footer.
* Sidebar.
* PageHeader.
* StatCard.
* DataTable.
* EmptyState.

Estos componentes deben evitar duplicación y ayudar a que el proyecto se vea profesional.

---

## 10. Criterios de calidad

El código debe ser:

* Claro.
* Ordenado.
* Defendible académicamente.
* Modular sin exagerar.
* Fácil de explicar.
* Con nombres descriptivos.
* Sin lógica innecesariamente compleja.
* Sin dependencias innecesarias.
* Sin backend.
* Sin servicios externos.
* Sin inteligencia artificial integrada.

Cada fase debe dejar evidencia en documentación.

---

## 11. Modo de trabajo con Cursor

Cursor no debe generar todo el sistema de una sola vez.

Debe esperar instrucciones por fase.

En cada fase debe:

1. Leer el contexto del proyecto.
2. Identificar el objetivo de la fase.
3. Crear o modificar solo los archivos necesarios.
4. Documentar lo realizado.
5. Explicar brevemente qué cambió.
6. Indicar qué falta para la siguiente fase.
7. No avanzar a otra fase sin autorización.

---

## 12. Estado actual del proyecto

El proyecto se empezará desde cero.

Antes de programar, se debe crear la documentación inicial.

No debe generarse código Angular en la primera fase.

---

## 13. Restricciones técnicas actuales

No usar todavía:

* Backend.
* Supabase.
* Firebase.
* Base de datos real.
* Machine Learning.
* Tutor inteligente.
* API externa.
* Arquitectura compleja.
* Librerías visuales pesadas.
* Angular Material, salvo que se autorice después.

Usar:

* Angular 21.
* Bootstrap 5.
* TypeScript.
* Interfaces.
* Servicios mock.
* Guards.
* Angular Signals o Signal Forms.
* CSS/SCSS simple.
* Cypress más adelante.

---

## 14. Objetivo académico

El proyecto debe servir para demostrar dominio de:

* Angular moderno.
* Componentes.
* Servicios.
* Interfaces.
* Guards.
* Routing.
* Formularios.
* Validaciones.
* Organización de carpetas.
* Separación de responsabilidades.
* Diseño frontend profesional.
* Documentación técnica básica.
* Desarrollo por fases.

El sistema debe verse suficientemente completo para una exposición académica y debe poder defenderse explicando cada módulo.
