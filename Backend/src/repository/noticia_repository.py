from datetime import datetime

from src.services.database import get_supabase


class NoticiaRepository:
    def find_all(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("noticias")
            .select("id,titulo,contenido,publicado_en,creado_en")
            .eq("publicado", True)
            .order("publicado_en", desc=True)
            .execute()
        )
        return [self._map_row(row) for row in response.data or []]

    def _map_row(self, row: dict) -> dict:
        fecha = row.get("publicado_en") or row.get("creado_en")
        date_text = ""
        if fecha:
            try:
                date_text = datetime.fromisoformat(fecha.replace("Z", "+00:00")).strftime("%d %b %Y")
            except ValueError:
                date_text = str(fecha)[:10]

        contenido = row.get("contenido") or ""
        return {
            "id": row["id"],
            "title": row.get("titulo", ""),
            "date": date_text,
            "category": "Institucional",
            "summary": contenido[:160] + ("..." if len(contenido) > 160 else ""),
        }
