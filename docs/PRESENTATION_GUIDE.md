# Guía de exposición — HORIZONTE DIGITAL

Guía para defender el proyecto ante el docente (5–8 minutos).

---

## 1. Introducción breve

> «HORIZONTE DIGITAL es un sistema web institucional con intranet académica para la I.E.P. Horizonte. Es un frontend Angular 21 que simula un ERP escolar: web pública, login multirol, dashboard y módulos académicos con datos mock.»

---

## 2. Problema que resuelve

Las instituciones educativas necesitan:

- Comunicación pública (admisión, niveles, contacto).
- Intranet para docentes, estudiantes y familias.
- Visibilidad de notas, tareas, horarios y pagos.

El proyecto demuestra cómo estructurar esa experiencia en un **frontend moderno** sin depender aún de un backend real.

---

## 3. Solución propuesta

Un SPA Angular con:

- Zona pública institucional.
- Zona privada `/admin/*` protegida por guard.
- Experiencia diferenciada por 5 roles simulados.
- Servicios mock que separan datos de vistas.

---

## 4. Arquitectura

Mostrar diagrama verbal:

```txt
Web pública (PublicLayout)
    ↓ login
AuthService (mock + localStorage)
    ↓ authGuard
Intranet ERP (AdminLayout + Sidebar)
    ↓
Pages + Services mock + RoleContextService
```

Referencia: [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 5. Página pública

Demostrar:

- Home con identidad Horizonte.
- Navbar responsive.
- `/contacto` con formulario Signals y envío simulado.

> «La web pública transmite confianza institucional; el contacto ya tiene validaciones reales con Angular Signals.»

---

## 6. Login y guards

Demostrar:

- `/login` con credenciales de la tabla demo.
- Intentar `/admin/dashboard` sin sesión → redirige a login.
- Login como ADMIN → entra al dashboard.

Frase clave:

> «Los guards protegen la intranet privada. La autenticación es mock con localStorage, adecuada para el alcance académico.»

---

## 7. Intranet por roles

Demostrar 2–3 roles rápidamente:

| Rol | Qué mostrar |
|-----|-------------|
| ADMIN | Dashboard ejecutivo + sidebar institucional |
| TEACHER | Panel docente + formulario de tareas |
| PARENT | Portal familia + pagos del estudiante |

> «Cada rol ve un panel y menú distinto. STUDENT y PARENT ven datos contextuales de Lucía Torres.»

---

## 8. Servicios mock

Abrir brevemente un servicio (ej. `student.service.ts`):

> «El proyecto no usa backend porque el alcance actual es frontend académico. Los servicios mock permiten simular datos y separar la lógica de las vistas.»

---

## 9. Formularios con Signals

Mostrar `/admin/estudiantes` o `/contacto`:

- Campos con `signal()` y errores con `computed()`.
- Botón deshabilitado si hay errores.
- Mensaje de éxito simulado.

> «Angular Signals se usó para manejar estado de formularios y validaciones visibles, sin Reactive Forms complejos.»

---

## 10. Pruebas Cypress

Mencionar:

```bash
npm run e2e:local
```

> «Cypress valida los flujos principales del sistema: web pública, login, contacto, dashboard por rol y visibilidad de formularios. Son 16 pruebas automatizadas.»

---

## 11. Limitaciones

Ser transparente:

- No hay backend ni base de datos.
- No hay pagos reales.
- No hay Supabase/Firebase.
- CRUD es simulado (sin persistencia real).

> «Estas limitaciones son intencionales y están documentadas en el MVP.»

---

## 12. Mejoras futuras

- API REST + base de datos.
- `roleGuard` por ruta.
- Pasarela de pago (si el negocio lo requiere).
- Más pruebas E2E.

---

## 13. Guion sugerido (5–8 min)

| Min | Acción |
|-----|--------|
| 0:00 | Presentación del proyecto y problema |
| 0:45 | Web pública + contacto |
| 1:30 | Login + guard + logout |
| 2:30 | Dashboard ADMIN + un módulo (pagos o estudiantes) |
| 3:30 | Cambio a TEACHER o PARENT (rol contrastante) |
| 4:30 | Formulario Signals (30 s) |
| 5:00 | Mencionar servicios mock y arquitectura |
| 5:30 | Cypress `e2e:local` (resultado 16/16) |
| 6:00 | Limitaciones y cierre |
| 6:30 | Preguntas |

---

## Frases defendibles (resumen)

- El proyecto no usa backend porque el alcance actual es frontend académico.
- Los servicios mock permiten simular datos y separar la lógica de las vistas.
- Los guards protegen la intranet privada.
- Angular Signals se usó para manejar estado de formularios y validaciones visibles.
- Cypress valida los flujos principales del sistema.

---

## Documentos de apoyo

- [`FINAL_REVIEW.md`](FINAL_REVIEW.md) — Cumplimiento de rúbrica
- [`DELIVERY_CHECKLIST.md`](DELIVERY_CHECKLIST.md) — Checklist de entrega
- [`MVP_SCOPE.md`](MVP_SCOPE.md) — Alcance
- [`README.md`](../README.md) — Inicio rápido
