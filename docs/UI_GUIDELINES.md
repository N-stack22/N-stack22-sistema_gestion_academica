# Guía de interfaz — HORIZONTE DIGITAL

## Sistema web institucional con intranet académica para la I.E.P. Horizonte

Este documento define la **identidad visual** y los **criterios de diseño** del proyecto. Debe aplicarse de forma consistente en la web pública y en la intranet académica.

---

## 1. Identidad visual institucional

HORIZONTE DIGITAL representa a la **I.E.P. Horizonte**. La interfaz debe transmitir:

- Seriedad institucional.
- Modernidad y profesionalismo.
- Confianza para padres, estudiantes y docentes.
- Claridad funcional en la intranet tipo ERP.

---

## 2. Paleta de colores

### Colores principales

| Nombre | Hex | Uso sugerido |
|--------|-----|--------------|
| Azul marino | `#0B1F3A` | Header público, sidebar intranet, fondos principales |
| Azul oscuro | `#071527` | Fondos profundos, hover en navegación, contraste |
| Rojo institucional | `#C1121F` | Acentos, CTAs importantes, alertas críticas |
| Amarillo institucional | `#F4C430` | Destacados, badges, elementos de énfasis |
| Blanco | `#FFFFFF` | Texto sobre fondos oscuros, fondos de cards |

### Colores neutros (plomo)

| Nombre | Hex | Uso sugerido |
|--------|-----|--------------|
| Plomo claro | `#F3F4F6` | Fondos de sección, cards secundarias |
| Plomo medio | `#9CA3AF` | Texto secundario, bordes suaves, placeholders |
| Plomo oscuro | `#4B5563` | Texto principal en fondos claros, subtítulos |

### Ejemplo de aplicación

```css
:root {
  --color-navy: #0B1F3A;
  --color-navy-dark: #071527;
  --color-red: #C1121F;
  --color-yellow: #F4C430;
  --color-gray-light: #F3F4F6;
  --color-gray-medium: #9CA3AF;
  --color-gray-dark: #4B5563;
  --color-white: #FFFFFF;
}
```

*(Implementación real en SCSS/CSS durante Fase 3.)*

---

## 3. Tipografía y legibilidad

- Usar fuentes del sistema o fuentes web legibles (sin librerías pesadas innecesarias).
- Jerarquía clara: títulos de página, subtítulos, cuerpo, etiquetas de formulario.
- Contraste suficiente entre texto y fondo (accesibilidad básica).
- En intranet: densidad informativa moderada; evitar páginas sobrecargadas.

---

## 4. Estilo visual esperado

### 4.1 Página pública premium

La web institucional debe sentirse como el sitio oficial de un colegio privado de calidad:

- **Hero moderno** en inicio con imagen o gradiente institucional y mensaje claro.
- **Header fijo o sticky** con logo/nombre institucional y navegación principal.
- **Secciones amplias** con buen espaciado (whitespace).
- **Cards profesionales** para niveles, noticias, comunicados y admisión.
- **Llamados a la acción (CTA)** visibles: “Admisión”, “Contacto”, “Ingresar”.
- **Footer institucional** con datos de contacto, enlaces y copyright.
- **Responsive:** mobile-first; menú colapsable en móvil (Bootstrap navbar).

### 4.2 Intranet tipo ERP

La zona privada debe parecer un **sistema académico real**:

- **Sidebar administrativo** con iconos o texto para cada módulo.
- **Navbar interno** con nombre de usuario, rol simulado y opción de cerrar sesión.
- **Dashboard** con panel ejecutivo: hero interno, StatCards (4–6), alertas, eventos compactos y accesos rápidos. Sin tablas largas en el dashboard.
- **Tablas Bootstrap** para listados (estudiantes, docentes, cursos, etc.).
- **Formularios claros** con labels, validaciones visibles y botones de acción.
- **Estados vacíos** (EmptyState) cuando no hay registros.
- Fondo general claro (`#F3F4F6` o blanco) con sidebar en azul marino.
- **Layout shell (Fase 8E):** sidebar sticky `100vh`, contenido principal con fondo gris claro continuo.
- **Portales por rol:** badge de portal con acento sutil (no fondos de color distintos por rol); banner contextual para estudiante/apoderado.
- **Identidad institucional (Fase 8F):** azul marino, blanco, gris claro; rojo/amarillo solo para alertas y acentos pequeños.
- **Clases globales:** `.admin-page-header`, `.admin-card`, `.admin-table-card`, `.status-badge`, `.erp-section-title`, `.erp-hero`, `.erp-metric-grid`, `.erp-alert-card`, `.erp-event-list`, `.erp-quick-access`, `.erp-payment-summary`, `.erp-payment-timeline`.
- **Pagos:** header profesional, cards métricas, badges de estado (Pagado, Pendiente, Observado), aviso de módulo informativo.
- **Formularios (Fase 9):** patrón Signals (`signal`, `computed`, `submitted`), clases `.form-panel*`, `.form-success-card`, mensajes `invalid-feedback`.
- **Visibilidad formularios:** ADMIN/DIRECTOR ven formularios de estudiante, docente y curso; TEACHER solo tarea y recurso; STUDENT/PARENT no ven formularios administrativos.

---

## 5. Bootstrap 5 como base

- Usar **Bootstrap 5** para grid, utilidades, componentes y responsive.
- Personalizar colores institucionales sobre variables Bootstrap o CSS custom.
- Componentes Bootstrap frecuentes:
  - `container`, `row`, `col-*`
  - `card`, `card-body`, `card-header`
  - `table`, `table-striped`, `table-hover`
  - `form-control`, `form-label`, `form-select`
  - `btn`, `btn-primary`, `btn-outline-*`
  - `navbar`, `nav`, `dropdown`
  - `alert`, `badge`
  - `modal` (si se requiere confirmación)

**No usar Angular Material** salvo autorización explícita posterior.

---

## 6. Componentes UI reutilizables

| Componente | Descripción visual |
|------------|-------------------|
| Navbar | Logo + enlaces; fondo azul marino en público; variante compacta en intranet |
| Footer | Fondo oscuro, texto claro, columnas de enlaces |
| Sidebar | Ancho fijo, fondo `#0B1F3A`, ítem activo resaltado |
| PageHeader | Título H1/H2, subtítulo opcional, breadcrumb |
| StatCard | Card con número grande, etiqueta y color de acento |
| DataTable | Tabla con encabezado, filas alternadas, acciones por fila |
| EmptyState | Icono o ilustración simple + mensaje + botón opcional |

---

## 7. Formularios y validaciones

Los formularios son críticos para la rúbrica académica:

- Labels visibles sobre cada campo.
- Mensajes de error **debajo del campo** en color de alerta (rojo institucional o Bootstrap `text-danger`).
- Campos inválidos con borde rojo (`is-invalid` de Bootstrap).
- Botón submit **deshabilitado** cuando el formulario es inválido (Signal Forms / Signals).
- Agrupación lógica en cards o secciones.

Formularios principales: Login, Contacto, estudiante, docente, curso, tarea/recurso.

---

## 8. Responsive design

| Breakpoint | Comportamiento |
|------------|----------------|
| Móvil (< 768px) | Navbar colapsable; sidebar oculto o drawer; tablas con scroll horizontal |
| Tablet (768px – 991px) | Grid de 2 columnas en cards; sidebar reducido opcional |
| Escritorio (≥ 992px) | Layout completo; sidebar visible; dashboard en grid amplio |

Usar clases responsive de Bootstrap (`col-md-*`, `d-none d-lg-block`, etc.).

---

## 9. Iconografía e imágenes

### Bootstrap Icons (Fase 7.1)

El proyecto usa **Bootstrap Icons** como librería de iconografía oficial.

- Import global en `src/styles.scss`:
  ```scss
  @import 'bootstrap-icons/font/bootstrap-icons.css';
  ```
- Uso en plantillas:
  ```html
  <i class="bi bi-mortarboard-fill" aria-hidden="true"></i>
  ```
- En componentes reutilizables (`StatCard`, `EmptyState`), el input `icon` recibe la clase Bootstrap (ej. `bi-people-fill`) y se renderiza con `[ngClass]`.
- Clases utilitarias del proyecto:
  - `.horizonte-icon-circle` — icono dentro de contenedor suave.
  - `.horizonte-icon-inline` — espaciado junto a texto.

**Criterios:**

- Uso moderado; no saturar la interfaz.
- Preferir iconos `fill` en navbar, sidebar y métricas.
- No usar FontAwesome ni librerías pesadas adicionales.
- Marcar iconos decorativos con `aria-hidden="true"`.

### Imágenes

- Imágenes institucionales: placeholders o assets locales; evitar dependencias externas frágiles.
- Galería: grid con placeholders visuales o gradientes institucionales.

---

## 10. Estados de interfaz

| Estado | Tratamiento visual |
|--------|-------------------|
| Carga | Spinner Bootstrap o skeleton simple |
| Vacío | Componente EmptyState |
| Error | Alert Bootstrap con mensaje claro |
| Éxito | Alert verde o toast simple (opcional) |
| Hover / Active | Transiciones suaves en botones y enlaces del sidebar |

---

## 11. Lo que evitar

- Paletas de colores ajenas a la institución.
- Animaciones excesivas o distractoras.
- Tipografías decorativas difíciles de leer.
- Layouts sobrecargados con demasiados colores simultáneos.
- Librerías UI adicionales que compitan con Bootstrap.
- Diseño que no funcione en móvil.

---

## 12. Clases utilitarias web pública premium (v1.1.0)

Clases globales en `src/styles.scss` para páginas públicas:

| Clase | Uso |
|-------|-----|
| `.public-hero` | Hero principal con gradiente azul marino |
| `.public-section` | Sección con padding vertical estándar |
| `.public-section--muted` | Fondo gris claro alternado |
| `.public-card-premium` | Card con sombra y hover sutil |
| `.public-gradient-panel` | Panel semitransparente sobre hero |
| `.public-stat` | Métrica en franja de confianza |
| `.public-cta` | Bloque CTA (rojo o `.public-cta--blue`) |
| `.public-badge` | Badge institucional (`--important`, `--info`, `--academic`) |
| `.public-trust-strip` | Franja blanca con estadísticas |
| `.public-gallery-tile` | Tile de galería con gradiente placeholder |

**Navbar público (v1.1.0):** fondo blanco, sombra ligera, `.public-navbar`.

**Intranet:** mantiene sidebar y estilos admin existentes; no usar clases `.public-*` en `/admin/*`.

---

## 13. Estado actual

Guía aplicada en MVP v1.0.0, mejora v1.1.0 y **v1.2.0** (web pública premium ERP). La intranet conserva el diseño ERP de fases 7–9.

### Clases v1.2 (referencia)

| Clase | Uso |
|-------|-----|
| `.public-hero-premium` | Hero grande con gradiente y orbes decorativos |
| `.public-dashboard-mock` | Mockup ERP flotante en hero |
| `.public-metric-card` | Métricas institucionales en cards |
| `.public-card-lift` | Card con sombra premium y hover |
| `.public-cta-premium` | CTA con gradiente institucional |
| `.public-login-shell` | Contenedor login público premium |
| `.public-login-benefits` | Panel lateral de beneficios intranet |

---

## Referencia

- Colores y criterios generales: `SYSTEM_REQUIREMENTS.md` (sección 4)
- Arquitectura de componentes: `ARCHITECTURE.md`
