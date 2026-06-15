from src.repository.helpers import normalizar_grado_nombre
from src.services.database import get_supabase


class EventoRepository:
    def listar(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("eventos")
            .select(
                "id,titulo,descripcion,fecha_inicio,fecha_fin,lugar,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .order("fecha_inicio")
            .execute()
        )
        return [self._map_row(r) for r in response.data or []]

    def obtener(self, evento_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("eventos")
            .select(
                "id,titulo,descripcion,fecha_inicio,fecha_fin,lugar,"
                "roles(codigo,nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .eq("id", evento_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_row(response.data[0])

    def actualizar(self, evento_id: str, data: dict) -> dict:
        client = get_supabase()
        if not self.obtener(evento_id):
            raise ValueError("Evento no encontrado")

        update_data: dict = {}
        if data.get("titulo") is not None:
            update_data["titulo"] = data["titulo"]
        if "descripcion" in data:
            update_data["descripcion"] = data["descripcion"]
        if data.get("fecha_inicio") is not None:
            update_data["fecha_inicio"] = data["fecha_inicio"]
        if "fecha_fin" in data:
            update_data["fecha_fin"] = data["fecha_fin"] or None
        if "lugar" in data:
            update_data["lugar"] = data["lugar"] or None
        if "rol_destinatario_codigo" in data:
            codigo = data["rol_destinatario_codigo"]
            if codigo:
                rol = (
                    client.table("roles")
                    .select("id")
                    .eq("codigo", codigo.upper())
                    .limit(1)
                    .execute()
                )
                if not rol.data:
                    raise ValueError("Rol destinatario no encontrado")
                update_data["rol_destinatario_id"] = rol.data[0]["id"]
            else:
                update_data["rol_destinatario_id"] = None
        if "nivel_id" in data:
            update_data["nivel_id"] = data["nivel_id"] or None
        if "grado_id" in data:
            update_data["grado_id"] = data["grado_id"] or None
        if "seccion_id" in data:
            update_data["seccion_id"] = data["seccion_id"] or None

        if update_data:
            client.table("eventos").update(update_data).eq("id", evento_id).execute()

        result = self.obtener(evento_id)
        if not result:
            raise ValueError("Evento no encontrado")
        return result

    def eliminar(self, evento_id: str) -> None:
        client = get_supabase()
        if not self.obtener(evento_id):
            raise ValueError("Evento no encontrado")
        client.table("eventos").delete().eq("id", evento_id).execute()

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        insert_data = {
            "titulo": data["titulo"],
            "descripcion": data.get("descripcion"),
            "fecha_inicio": data["fecha_inicio"],
            "fecha_fin": data.get("fecha_fin"),
            "lugar": data.get("lugar"),
            "creado_por_perfil_id": data["creado_por_perfil_id"],
        }
        if data.get("rol_destinatario_codigo"):
            rol = (
                client.table("roles")
                .select("id")
                .eq("codigo", data["rol_destinatario_codigo"].upper())
                .limit(1)
                .execute()
            )
            if rol.data:
                insert_data["rol_destinatario_id"] = rol.data[0]["id"]
        if data.get("nivel_id"):
            insert_data["nivel_id"] = data["nivel_id"]
        if data.get("grado_id"):
            insert_data["grado_id"] = data["grado_id"]
        if data.get("seccion_id"):
            insert_data["seccion_id"] = data["seccion_id"]

        resp = client.table("eventos").insert(insert_data).execute()
        if not resp.data:
            raise ValueError("No se pudo crear el evento")
        items = self.listar()
        return next((i for i in items if i["id"] == resp.data[0]["id"]), self._map_row(resp.data[0]))

    def _map_row(self, row: dict) -> dict:
        rol = row.get("roles") or {}
        nivel = row.get("niveles_educativos") or {}
        grado = row.get("grados") or {}
        seccion = row.get("secciones") or {}
        destino = (
            rol.get("nombre")
            or nivel.get("nombre")
            or normalizar_grado_nombre(grado.get("nombre", ""))
            or seccion.get("nombre")
            or "Toda la comunidad"
        )
        fecha_inicio = str(row.get("fecha_inicio", ""))[:16].replace("T", " ")
        fecha_fin = str(row.get("fecha_fin", ""))[:16].replace("T", " ") if row.get("fecha_fin") else ""
        return {
            "id": row["id"],
            "title": row.get("titulo", ""),
            "description": row.get("descripcion", ""),
            "startDate": fecha_inicio,
            "endDate": fecha_fin,
            "place": row.get("lugar", ""),
            "audience": destino,
            "audienceRoleCode": rol.get("codigo", "") or "",
        }
