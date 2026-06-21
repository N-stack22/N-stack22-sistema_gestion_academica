# Horizonte Backend

API real del Portal Academico Horizonte. Implementa FastAPI como capa segura entre Angular y Supabase PostgreSQL/Auth.

## Stack

- FastAPI
- Supabase Auth y PostgreSQL
- supabase-py para CRUD administrativo
- psycopg pool para consultas SQL/RPC optimizadas
- Railway como destino de despliegue

## Variables de entorno

Crear `Backend/.env` localmente. Este archivo no debe subirse al repositorio.

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_KEY=SERVICE_ROLE_KEY
DATABASE_URL=postgresql://postgres:...
CORS_ORIGINS=http://localhost:4200,https://USUARIO.github.io,https://USUARIO.github.io/colegio-horizonte
ENVIRONMENT=development
DB_POOL_MIN_SIZE=1
DB_POOL_MAX_SIZE=10
DB_FUNCTION_CACHE_TTL_SECONDS=15
```

La `SUPABASE_KEY` debe ser la `service_role` solo en backend local o Railway. Nunca debe existir en Angular.

## Ejecucion local

```bash
uv sync
uv run uvicorn src.main:app --reload
```

API local: `http://localhost:8000`

Health check: `http://localhost:8000/api/health`

## Railway

Start command recomendado:

```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

Configurar en Railway las mismas variables de entorno, usando `ENVIRONMENT=production` y los origenes CORS reales de GitHub Pages o dominio propio.

## Performance

Para que los dashboards y listados carguen rapido:

1. Configurar `DATABASE_URL`.
2. Ejecutar en Supabase SQL Editor:
   - `sql/17_funciones_listados.sql`
   - `sql/18_funciones_dashboard.sql`
   - `sql/19_indices_performance.sql`
3. Mantener `DB_FUNCTION_CACHE_TTL_SECONDS` entre 10 y 30 segundos para cachear respuestas estables sin retener datos por mucho tiempo.

Si `DATABASE_URL` no esta configurada, el backend conserva fallback por Supabase REST, pero sera mas lento.

## Seguridad

El flujo correcto es:

Frontend Angular -> FastAPI -> Supabase

No hay registro publico de usuarios. Los usuarios se crean por administracion interna o scripts controlados y deben tener perfil, rol activo y entidad academica cuando corresponda.

Endpoints privados deben validar token Bearer y permisos de rol en backend. El frontend solo ayuda a ocultar opciones, no es la frontera de seguridad.
