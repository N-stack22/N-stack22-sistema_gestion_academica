from src.services.database import get_supabase


class NivelEducativoRepository:
    def find_all(self) -> list[dict]:
        client = get_supabase()
        response = client.table("niveles_educativos").select("id,codigo,nombre,descripcion").execute()
        return response.data or []
