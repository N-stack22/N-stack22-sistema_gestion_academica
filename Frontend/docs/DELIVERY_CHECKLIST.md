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
