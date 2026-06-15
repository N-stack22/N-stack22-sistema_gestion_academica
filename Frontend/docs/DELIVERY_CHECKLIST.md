# Checklist de entrega — HORIZONTE DIGITAL

Lista de verificación antes de entregar o presentar el proyecto.

---

## Instalación y build

- [ ] `npm install` ejecuta sin errores
- [ ] `npm start` levanta la app en `http://localhost:4200`
- [ ] `npm run build` compila sin errores
- [ ] `npm run e2e:local` — **16/16 pruebas passing**

---

## Web pública

- [ ] `/` — Home carga con navbar y footer
- [ ] `/nosotros` — Página institucional
- [ ] `/contacto` — Formulario con validaciones y envío simulado
- [ ] `/login` — Acceso desde navbar «Intranet»

---

## Autenticación

- [ ] Login ADMIN funciona (`admin@horizonte.edu.pe` / `Admin123`)
- [ ] Credenciales incorrectas muestran error
- [ ] `/admin/dashboard` sin sesión redirige a `/login`
- [ ] Logout cierra sesión y vuelve a login

---

## Roles (probar al menos 3)

- [ ] **ADMIN** — Dashboard ejecutivo + sidebar institucional
- [ ] **TEACHER** — Panel docente + formulario tareas/recursos
- [ ] **STUDENT** — Portal estudiante sin formularios admin
- [ ] **PARENT** — Portal familia + datos de Lucía Torres
- [ ] **DIRECTOR** — Similar a ADMIN (opcional)

Credenciales en [`SETUP.md`](SETUP.md) o [`README.md`](../README.md).

---

## Formularios

- [ ] Contacto: errores visibles al enviar vacío
- [ ] Contacto: éxito con datos válidos
- [ ] ADMIN: formulario estudiantes visible en `/admin/estudiantes`
- [ ] TEACHER: no ve formulario estudiantes; sí tareas
- [ ] Registro simulado muestra mensaje de éxito

---

## Módulos clave (visual)

- [ ] `/admin/dashboard` — Panel ejecutivo
- [ ] `/admin/pagos` — Vista premium simulada
- [ ] `/admin/horarios` — Horario (estudiante/apoderado)
- [ ] `/admin/notas` — Notas contextuales

---

## Documentación

- [ ] [`README.md`](../README.md) actualizado
- [ ] [`FINAL_REVIEW.md`](FINAL_REVIEW.md) revisado
- [ ] [`PRESENTATION_GUIDE.md`](PRESENTATION_GUIDE.md) revisado
- [ ] [`CHANGELOG.md`](CHANGELOG.md) con Fase 11
- [ ] [`PROJECT_PHASES.md`](PROJECT_PHASES.md) — Fase 11 completada

---

## Repositorio (si aplica)

- [ ] Último commit incluye Fase 11
- [ ] Push al repositorio remoto realizado
- [ ] No hay archivos sensibles (.env, credenciales reales)

---

## Advertencias conocidas (no bloqueantes)

- Warning Sass `@import` deprecado — documentado
- Bundle ~797 kB supera budget 500 kB — Bootstrap completo; aceptable para MVP

---

## Firma de entrega

| Campo | Valor |
|-------|-------|
| Proyecto | HORIZONTE DIGITAL |
| Versión final | 1.0.0 |
| Fase | 11 — Revisión final |
| Build | OK |
| Cypress | 16/16 |
| Fecha | 2026-05-31 |
