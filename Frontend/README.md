# Horizonte Digital

Frontend real del Portal Academico Horizonte para la I.E.P. Horizonte. La aplicacion publica informa a visitantes y la intranet permite gestion academica por roles usando un backend FastAPI real conectado a Supabase.

## Stack

- Angular 21
- Bootstrap 5 y Bootstrap Icons
- Guards de autenticacion y roles
- Interceptor HTTP con token Bearer
- FastAPI como backend
- Supabase Auth y PostgreSQL mediante backend
- GitHub Pages como destino de despliegue frontend

## Regla del portal

No existe registro publico de usuarios. Estudiantes, docentes, apoderados y personal administrativo solo inician sesion. La creacion de cuentas es interna y debe vincular Supabase Auth, perfil institucional, rol activo y entidad academica correspondiente.

## Entornos

Desarrollo:

```ts
apiUrl: 'http://localhost:8000'
```

Produccion:

```ts
apiUrl: 'https://colegio-horizonte-backend.up.railway.app'
```

Actualizar `src/environments/environment.prod.ts` con la URL final de Railway si cambia.

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm start
```

Frontend local: `http://localhost:4200`

Backend esperado: `http://localhost:8000`

## Build

Build normal:

```bash
npm run build
```

Build para GitHub Pages del repositorio `colegio-horizonte`:

```bash
npm run build:gh-pages
```

El archivo `public/404.html` permite fallback de rutas SPA en GitHub Pages.

## Modulos

- Publico: inicio, nosotros, niveles, admision, plataforma, noticias, comunicados, galeria y contacto.
- Intranet: dashboard, perfil, usuarios, estudiantes, docentes, padres, cursos, matriculas, horarios, tareas, notas, asistencia, recursos, comunicados internos, pensiones, pagos, ventas, reportes y configuracion.

## Performance frontend

Los catalogos frecuentes se cachean en `CatalogService` con `shareReplay(1)` para evitar llamadas repetidas al backend al abrir formularios o cambiar de pantalla. Si una accion administrativa modifica catalogos, llamar `catalogService.invalidate()`.

## Seguridad frontend

El frontend guarda la sesion en `localStorage` y envia el token mediante interceptor. Ante `401` cierra sesion y vuelve a login; ante `403` redirige al dashboard. La seguridad definitiva esta en FastAPI, no en los guards de Angular.
