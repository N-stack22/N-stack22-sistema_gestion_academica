# Checklist de entrega - Portal Academico Horizonte

Lista de verificacion para presentar el proyecto como portal academico real integrado.

## Integracion

- [ ] Frontend Angular levanta en `http://localhost:4200`.
- [ ] Backend FastAPI levanta en `http://localhost:8000`.
- [ ] `/api/health` responde `status: ok`.
- [ ] Login consume `POST /api/auth/login`.
- [ ] Las pantallas privadas consumen endpoints reales del backend.
- [ ] No hay claves Supabase en Angular.

## Seguridad

- [ ] No existe boton ni formulario publico de registro.
- [ ] Usuarios se crean solo por administracion interna.
- [ ] Usuario sin perfil institucional no inicia sesion.
- [ ] Usuario sin rol activo no inicia sesion.
- [ ] Usuario inactivo no inicia sesion.
- [ ] Endpoints privados validan `Authorization: Bearer`.
- [ ] ADMIN/DIRECTOR acceden a gestion institucional.
- [ ] TEACHER solo consulta informacion de sus cursos.
- [ ] STUDENT solo consulta su informacion.
- [ ] PARENT solo consulta hijos asociados.
- [ ] 401 cierra sesion y vuelve a login.
- [ ] 403 bloquea acceso no permitido.
- [ ] XSS mitigado: Angular renderiza datos por interpolacion y no se usa `innerHTML` ni `bypassSecurityTrust`.
- [ ] SQL Injection mitigado: consultas Supabase usan query builder y SQL directo solo ejecuta funciones `fn_*` con parametros separados.
- [ ] Endpoints privados protegidos por middleware backend que exige `Authorization: Bearer`.
- [ ] ADMIN/DIRECTOR pueden restablecer contrasenas desde Gestion de usuarios sin ver la contrasena anterior.
- [ ] Cada usuario puede cambiar su propia contrasena validando la contrasena actual.
- [ ] Cabeceras de seguridad activas: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y CSP para API.
- [ ] HTTPS aplicado en despliegue Railway/GitHub Pages y HSTS habilitable con `ENABLE_HSTS=true`.

### Vulnerabilidades identificadas y contramedidas

| Vulnerabilidad comun | Riesgo en el sistema | Contramedida aplicada |
| --- | --- | --- |
| XSS | Inyeccion de HTML o scripts desde campos visibles. | Angular interpola contenido, no se usa HTML dinamico inseguro y el API responde con CSP para rutas JSON. |
| SQL Injection | Manipulacion de consultas por parametros de usuario. | Supabase query builder parametriza filtros; funciones PostgreSQL aceptan parametros separados y nombres `fn_*` validados. |
| Acceso no autorizado | Llamadas directas al backend sin pasar por guards del frontend. | Middleware global valida token Bearer en rutas privadas y mantiene 401/403 para control de sesion. |
| Exposicion de sesion | Cache o reutilizacion accidental de respuestas de autenticacion. | Respuestas de `/api/auth/*` usan `Cache-Control: no-store`. |
| Clickjacking y sniffing | Embebido del API en iframes o interpretacion incorrecta de contenido. | Cabeceras `X-Frame-Options: DENY` y `X-Content-Type-Options: nosniff`. |
| Transporte inseguro | Credenciales o tokens enviados por HTTP en produccion. | Railway y GitHub Pages usan HTTPS; HSTS puede forzarse con `ENABLE_HSTS=true`. |

## Base de datos

- [ ] Supabase Auth contiene usuarios institucionales.
- [ ] Cada usuario tiene registro en `perfiles`.
- [ ] Cada usuario tiene registro activo en `usuarios_roles`.
- [ ] STUDENT tiene entidad `estudiantes`.
- [ ] TEACHER tiene entidad `docentes`.
- [ ] PARENT tiene entidad `apoderados`.
- [ ] Ejecutado `Backend/sql/17_funciones_listados.sql`.
- [ ] Ejecutado `Backend/sql/18_funciones_dashboard.sql`.
- [ ] Ejecutado `Backend/sql/19_indices_performance.sql`.
- [ ] `DATABASE_URL` esta configurado para usar RPCs optimizadas.

## Performance

- [ ] Dashboard admin usa `fn_dashboard_admin`.
- [ ] Dashboard docente usa `fn_dashboard_docente`.
- [ ] Dashboard estudiante/padre usa `fn_dashboard_student`.
- [ ] Listados pesados usan funciones SQL cuando `DATABASE_URL` esta disponible.
- [ ] Catalogos frontend se cachean con `shareReplay(1)`.
- [ ] El backend usa pool PostgreSQL configurable.
- [ ] No se observan consultas por cada fila en dashboards principales.

## Despliegue

- [ ] `environment.ts` apunta a `http://localhost:8000`.
- [ ] `environment.prod.ts` apunta al backend Railway.
- [ ] Railway tiene `SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL` y `CORS_ORIGINS`.
- [ ] Railway usa `uvicorn src.main:app --host 0.0.0.0 --port $PORT`.
- [ ] GitHub Pages usa `npm run build:gh-pages`.
- [ ] `public/404.html` permite fallback SPA.
- [ ] CORS permite localhost y GitHub Pages.

## Validacion final

- [ ] `npm run build` compila.
- [ ] Backend compila con `py_compile`.
- [ ] Intranet carga por rol.
- [ ] No hay textos visibles que digan que el sistema no tiene backend real.
- [ ] README de frontend y backend describen el sistema real.
