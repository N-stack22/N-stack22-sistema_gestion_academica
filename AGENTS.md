# Colegio Horizonte

Monorepo del Portal Académico Horizonte (I.E.P. Horizonte).

## Estructura

La raíz solo contiene estas carpetas y este archivo:

```
colegio-horizonte/
├── AGENTS.md
├── Frontend/   # Angular 21 - portal público e intranet
└── Backend/    # FastAPI + Supabase
```

No agregar archivos sueltos en la raíz (`node_modules`, `dist`, `.git`, etc. van dentro de `Frontend/` o `Backend/`).

## Arranque local

```bash
# Backend
cd Backend
cp .env.example .env   # configurar SUPABASE_KEY
uv run uvicorn src.main:app --reload

# Frontend
cd Frontend
npm start
```

Frontend: http://localhost:4200  
Backend: http://localhost:8000

## Stack

- Frontend: Angular 21, Bootstrap 5, HTTP al backend
- Backend: FastAPI, supabase-py, PostgreSQL en Supabase
- Flujo backend: main -> apis -> services -> repository
