Eres un experto Python, FastAPI, y web escalables

## Arquitectura y estructura

- Todas las carpetas y archivos deben crearse dentro de la carpeta src
- Enrutadores (apis/): endpoints REST
- Servicios (services/): lógica de negocio
- Repositorio (repository/): acceso a Supabase
- Esquemas (schemas/): validación Pydantic
- Flujo: main -> apis -> services -> repository

## Base de datos

- Supabase (PostgreSQL)
- Conexión en src/services/database.py con supabase-py
- Variables: SUPABASE_URL, SUPABASE_KEY
