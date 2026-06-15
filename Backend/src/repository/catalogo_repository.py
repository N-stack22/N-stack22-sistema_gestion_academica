from src.repository.helpers import deduplicar_metodos_pago, normalizar_grado_nombre
from src.repository.matricula_repository import MatriculaRepository
from src.services.database import get_supabase

_ESTADOS_MATRICULA_CANONICOS: list[tuple[str, str]] = [
    ("ACTIVA", "Activa"),
    ("PENDIENTE", "Pendiente"),
    ("RETIRADA", "Retirada"),
]

_ESTADOS_MATRICULA_NUEVA = frozenset({"ACTIVA", "PENDIENTE"})


class CatalogoRepository:
    def listar_roles(self) -> list[dict]:
        client = get_supabase()
        response = client.table("roles").select("id,codigo,nombre").execute()
        canonical = {"ADMIN", "DIRECTOR", "DOCENTE", "ESTUDIANTE", "APODERADO"}
        alias_to_canonical = {
            "administrador": "ADMIN",
            "admin": "ADMIN",
            "director": "DIRECTOR",
            "docente": "DOCENTE",
            "teacher": "DOCENTE",
            "estudiante": "ESTUDIANTE",
            "student": "ESTUDIANTE",
            "apoderado": "APODERADO",
            "parent": "APODERADO",
        }
        seen: dict[str, dict] = {}
        for row in response.data or []:
            codigo = (row.get("codigo") or "").upper()
            canon = alias_to_canonical.get(codigo.lower(), codigo)
            if canon not in canonical:
                continue
            if canon not in seen or codigo == canon:
                seen[canon] = {"id": row["id"], "codigo": canon, "nombre": row.get("nombre", canon)}
        order = ["ADMIN", "DIRECTOR", "DOCENTE", "ESTUDIANTE", "APODERADO"]
        return [seen[c] for c in order if c in seen]

    def listar_anios(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("anios_academicos")
            .select("id,anio,fecha_inicio,fecha_fin,activo")
            .order("anio", desc=True)
            .execute()
        )
        return response.data or []

    def listar_niveles(self) -> list[dict]:
        client = get_supabase()
        response = client.table("niveles_educativos").select("id,codigo,nombre").execute()
        orden = ["INICIAL", "PRIMARIA", "SECUNDARIA", "CEBA"]
        vistos: dict[str, dict] = {}
        for row in response.data or []:
            codigo = (row.get("codigo") or "").upper()
            if codigo not in orden:
                continue
            if codigo not in vistos:
                vistos[codigo] = {
                    "id": row["id"],
                    "codigo": codigo,
                    "nombre": row.get("nombre", codigo),
                }
        return [vistos[c] for c in orden if c in vistos]

    def listar_grados(self, nivel_id: str | None = None) -> list[dict]:
        client = get_supabase()
        query = client.table("grados").select(
            "id,nombre,orden,nivel_id,niveles_educativos(nombre,codigo)"
        )
        if nivel_id:
            query = query.eq("nivel_id", nivel_id)
        response = query.order("orden").execute()
        vistos: dict[str, dict] = {}
        for row in response.data or []:
            nivel = row.get("niveles_educativos") or {}
            nombre = normalizar_grado_nombre(row.get("nombre", ""))
            clave = f"{row.get('nivel_id')}::{nombre}"
            if clave in vistos:
                continue
            vistos[clave] = {
                "id": row["id"],
                "nombre": nombre,
                "orden": row.get("orden", 0),
                "nivel_id": row.get("nivel_id"),
                "nivel": nivel.get("nombre", ""),
                "nivelCodigo": nivel.get("codigo", ""),
                "label": f"{nivel.get('nombre', '')} — {nombre}",
            }
        return sorted(vistos.values(), key=lambda x: (x.get("nivelCodigo", ""), x.get("orden", 0)))

    def listar_secciones(
        self, anio_id: str | None = None, grado_id: str | None = None
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("secciones").select(
            "id,nombre,aula,capacidad,anio_academico_id,grado_id,"
            "grados(nombre,orden,niveles_educativos(nombre,codigo)),anios_academicos(anio)"
        )
        if anio_id:
            query = query.eq("anio_academico_id", anio_id)
        if grado_id:
            query = query.eq("grado_id", grado_id)
        response = query.order("nombre").execute()
        filas: list[dict] = []
        vistos: set[str] = set()
        for row in response.data or []:
            grado = row.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            anio = row.get("anios_academicos") or {}
            clave = f"{row.get('anio_academico_id')}::{row.get('grado_id')}::{row.get('nombre')}"
            if clave in vistos:
                continue
            vistos.add(clave)
            aula = row.get("aula") or "—"
            capacidad = row.get("capacidad") or 0
            nivel_nombre = nivel.get("nombre", "")
            grado_nombre = normalizar_grado_nombre(grado.get("nombre", ""))
            filas.append(
                {
                    "id": row["id"],
                    "nombre": row.get("nombre", ""),
                    "aula": aula,
                    "capacidad": capacidad,
                    "grado_id": row.get("grado_id"),
                    "grado": grado_nombre,
                    "nivel": nivel_nombre,
                    "nivelCodigo": nivel.get("codigo", ""),
                    "anio": anio.get("anio"),
                    "anio_academico_id": row.get("anio_academico_id"),
                    "label": "",
                }
            )
        ocupados_map = MatriculaRepository.contar_ocupados_por_seccion(
            [f["id"] for f in filas], anio_id
        )
        for fila in filas:
            clave = (
                fila["id"]
                if anio_id
                else f"{fila['id']}::{fila.get('anio_academico_id')}"
            )
            ocupados = ocupados_map.get(clave, 0)
            capacidad = fila["capacidad"] or 0
            disponibles = max(capacidad - ocupados, 0)
            fila["matriculasActivas"] = ocupados
            fila["cuposDisponibles"] = disponibles
            fila["label"] = (
                f"Sección {fila['nombre']} — {fila['nivel']} {fila['grado']} — "
                f"{fila['aula']} ({disponibles} disponibles de {capacidad})"
            )
        return sorted(filas, key=lambda x: (x.get("nivelCodigo", ""), x.get("grado", ""), x.get("nombre", "")))

    def listar_estados_matricula(self, contexto: str | None = None) -> list[dict]:
        if contexto == "nueva":
            return [
                {"codigo": codigo, "nombre": nombre}
                for codigo, nombre in _ESTADOS_MATRICULA_CANONICOS
                if codigo in _ESTADOS_MATRICULA_NUEVA
            ]
        return [{"codigo": codigo, "nombre": nombre} for codigo, nombre in _ESTADOS_MATRICULA_CANONICOS]

    def listar_asignaturas(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("asignaturas")
            .select("id,nombre,codigo,area,activo")
            .eq("activo", True)
            .execute()
        )
        return response.data or []

    def listar_estados_asistencia(self) -> list[dict]:
        client = get_supabase()
        response = client.table("estados_asistencia").select("id,codigo,nombre").execute()
        return response.data or []

    def listar_tipos_evaluacion(self) -> list[dict]:
        client = get_supabase()
        response = client.table("tipos_evaluacion").select("id,codigo,nombre").execute()
        return response.data or []

    def listar_periodos(self, anio_id: str | None = None) -> list[dict]:
        client = get_supabase()
        query = client.table("periodos_academicos").select("id,nombre,orden,anio_academico_id")
        if anio_id:
            query = query.eq("anio_academico_id", anio_id)
        response = query.order("orden").execute()
        return response.data or []

    def listar_estados_pago(self) -> list[dict]:
        client = get_supabase()
        response = client.table("estados_pago").select("id,codigo,nombre").execute()
        return response.data or []

    def listar_metodos_pago(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("metodos_pago")
            .select("id,codigo,nombre,activo")
            .eq("activo", True)
            .execute()
        )
        return deduplicar_metodos_pago(response.data or [], solo_activos=True)

    def listar_conceptos_pago(self) -> list[dict]:
        client = get_supabase()
        response = (
            client.table("conceptos_pago")
            .select("id,codigo,nombre")
            .eq("activo", True)
            .execute()
        )
        return response.data or []

    def listar_tipos_recurso(self) -> list[dict]:
        client = get_supabase()
        response = client.table("tipos_recurso").select("id,codigo,nombre").execute()
        return response.data or []

    def listar_estados_seguimiento(self) -> list[dict]:
        client = get_supabase()
        response = client.table("estados_seguimiento").select("id,codigo,nombre").execute()
        return response.data or []
