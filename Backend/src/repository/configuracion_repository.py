from src.repository.catalogo_repository import CatalogoRepository
from src.repository.helpers import deduplicar_metodos_pago, nombre_completo
from src.services.database import get_supabase


class ConfiguracionRepository:
    def __init__(self):
        self._catalogo = CatalogoRepository()

    def institucional(self) -> dict:
        client = get_supabase()
        anios = (
            client.table("anios_academicos")
            .select("id,anio,fecha_inicio,fecha_fin,activo")
            .order("anio", desc=True)
            .execute()
        ).data or []
        periodos = (
            client.table("periodos_academicos")
            .select("id,nombre,orden,fecha_inicio,fecha_fin,anio_academico_id")
            .order("orden")
            .execute()
        ).data or []
        roles = client.table("roles").select("id,codigo,nombre").execute().data or []
        tipos_eval = client.table("tipos_evaluacion").select("id,codigo,nombre").execute().data or []
        metodos = deduplicar_metodos_pago(
            (
                client.table("metodos_pago")
                .select("id,codigo,nombre,activo")
                .order("nombre")
                .execute()
            ).data
            or []
        )
        conceptos = (
            client.table("conceptos_pago").select("id,codigo,nombre").eq("activo", True).execute()
        ).data or []
        tipos_recurso = client.table("tipos_recurso").select("id,codigo,nombre").execute().data or []
        niveles = self._catalogo.listar_niveles()
        anio_activo = next((a for a in anios if a.get("activo")), anios[0] if anios else None)
        secciones = self._catalogo.listar_secciones(
            anio_id=anio_activo["id"] if anio_activo else None
        )
        return {
            "academicYears": anios,
            "periods": periodos,
            "roles": roles,
            "evaluationTypes": tipos_eval,
            "paymentMethods": metodos,
            "paymentConcepts": conceptos,
            "resourceTypes": tipos_recurso,
            "levels": niveles,
            "sections": secciones,
            "activeYearId": anio_activo["id"] if anio_activo else None,
        }

    def crear_anio(self, data: dict) -> dict:
        client = get_supabase()
        anio = data["anio"]
        existing = (
            client.table("anios_academicos")
            .select("id")
            .eq("anio", anio)
            .limit(1)
            .execute()
        )
        if existing.data:
            raise ValueError(f"Ya existe el año académico {anio}")

        activo = bool(data.get("activo"))
        if activo:
            client.table("anios_academicos").update({"activo": False}).eq("activo", True).execute()

        payload = {
            "anio": anio,
            "fecha_inicio": data["fecha_inicio"],
            "fecha_fin": data["fecha_fin"],
            "activo": activo,
        }
        resp = client.table("anios_academicos").insert(payload).execute()
        if not resp.data:
            raise ValueError("No se pudo crear el año académico")
        return resp.data[0]

    def actualizar_anio(self, anio_id: str, data: dict) -> dict:
        client = get_supabase()
        update = {k: v for k, v in data.items() if v is not None}
        if update.get("activo") is True:
            client.table("anios_academicos").update({"activo": False}).eq("activo", True).execute()
        if update:
            client.table("anios_academicos").update(update).eq("id", anio_id).execute()
        resp = (
            client.table("anios_academicos")
            .select("id,anio,fecha_inicio,fecha_fin,activo")
            .eq("id", anio_id)
            .limit(1)
            .execute()
        )
        if not resp.data:
            raise ValueError("Año académico no encontrado")
        return resp.data[0]

    def crear_periodo(self, data: dict) -> dict:
        client = get_supabase()
        anio_id = data["anio_academico_id"]
        nombre = data["nombre"].strip()
        if not nombre:
            raise ValueError("El nombre del periodo es obligatorio")

        anio_resp = (
            client.table("anios_academicos").select("id").eq("id", anio_id).limit(1).execute()
        )
        if not anio_resp.data:
            raise ValueError("Año académico no encontrado")

        dup = (
            client.table("periodos_academicos")
            .select("id")
            .eq("anio_academico_id", anio_id)
            .eq("nombre", nombre)
            .limit(1)
            .execute()
        )
        if dup.data:
            raise ValueError("Ya existe un periodo con ese nombre para el año indicado")

        payload = {
            "anio_academico_id": anio_id,
            "nombre": nombre,
            "orden": data["orden"],
            "fecha_inicio": data["fecha_inicio"],
            "fecha_fin": data["fecha_fin"],
        }
        resp = client.table("periodos_academicos").insert(payload).execute()
        if not resp.data:
            raise ValueError("No se pudo crear el periodo académico")
        return resp.data[0]

    def crear_metodo_pago(self, data: dict) -> dict:
        from src.repository.helpers import buscar_metodo_pago_por_codigo

        client = get_supabase()
        codigo = data["codigo"].strip().upper().replace(" ", "_")
        nombre = data["nombre"].strip()
        if not codigo or not nombre:
            raise ValueError("Código y nombre del método de pago son obligatorios")

        existing = buscar_metodo_pago_por_codigo(codigo)
        if existing:
            if existing.get("activo"):
                raise ValueError("Ya existe un método de pago activo con ese código")
            client.table("metodos_pago").update(
                {"nombre": nombre, "activo": True, "codigo": codigo}
            ).eq("id", existing["id"]).execute()
            resp = (
                client.table("metodos_pago")
                .select("id,codigo,nombre,activo")
                .eq("id", existing["id"])
                .limit(1)
                .execute()
            )
            return resp.data[0]

        resp = (
            client.table("metodos_pago")
            .insert({"codigo": codigo, "nombre": nombre, "activo": True})
            .execute()
        )
        if not resp.data:
            raise ValueError("No se pudo crear el método de pago")
        return resp.data[0]

    def actualizar_metodo_pago(self, metodo_id: str, data: dict) -> dict:
        client = get_supabase()
        update = {k: v for k, v in data.items() if v is not None}
        if not update:
            raise ValueError("No hay cambios para guardar")
        client.table("metodos_pago").update(update).eq("id", metodo_id).execute()
        resp = (
            client.table("metodos_pago")
            .select("id,codigo,nombre,activo")
            .eq("id", metodo_id)
            .limit(1)
            .execute()
        )
        if not resp.data:
            raise ValueError("Método de pago no encontrado")
        return resp.data[0]

    def actualizar_seccion(self, seccion_id: str, data: dict) -> dict:
        client = get_supabase()
        update = {
            k: v
            for k, v in {
                "nombre": data.get("nombre"),
                "aula": data.get("aula"),
                "capacidad": data.get("capacidad"),
            }.items()
            if v is not None
        }
        if update:
            client.table("secciones").update(update).eq("id", seccion_id).execute()
        secciones = self._catalogo.listar_secciones()
        match = next((s for s in secciones if s["id"] == seccion_id), None)
        if not match:
            raise ValueError("Sección no encontrada")
        return match

    def crear_seccion(self, data: dict) -> dict:
        client = get_supabase()
        payload = {
            "anio_academico_id": data["anio_academico_id"],
            "grado_id": data["grado_id"],
            "nombre": data["nombre"],
            "aula": data.get("aula") or "Aula",
            "capacidad": data.get("capacidad") or 30,
        }
        existing = (
            client.table("secciones")
            .select("id")
            .eq("anio_academico_id", payload["anio_academico_id"])
            .eq("grado_id", payload["grado_id"])
            .eq("nombre", payload["nombre"])
            .limit(1)
            .execute()
        )
        if existing.data:
            raise ValueError("Ya existe una sección con ese nombre para el grado y año indicados")
        resp = client.table("secciones").insert(payload).execute()
        if not resp.data:
            raise ValueError("No se pudo crear la sección")
        secciones = self._catalogo.listar_secciones(anio_id=payload["anio_academico_id"])
        return next((s for s in secciones if s["id"] == resp.data[0]["id"]), resp.data[0])

    def personal(self, perfil_id: str) -> dict:
        client = get_supabase()
        resp = (
            client.table("configuraciones_usuario")
            .select("id,perfil_id,tema,notificaciones_activas,preferencias")
            .eq("perfil_id", perfil_id)
            .limit(1)
            .execute()
        )
        if resp.data:
            row = resp.data[0]
            prefs = row.get("preferencias") or {}
            if not isinstance(prefs, dict):
                prefs = {}
            tema_oscuro = (row.get("tema") or "claro").lower() == "oscuro"
            if "tema_oscuro" in prefs:
                tema_oscuro = bool(prefs.get("tema_oscuro"))
            result = {
                "id": row.get("id"),
                "perfil_id": perfil_id,
                "tema_oscuro": tema_oscuro,
                "notificaciones_email": prefs.get(
                    "notificaciones_email", row.get("notificaciones_activas", True)
                ),
                "notificaciones_push": prefs.get("notificaciones_push", True),
            }
        else:
            result = {
                "perfil_id": perfil_id,
                "tema_oscuro": False,
                "notificaciones_email": True,
                "notificaciones_push": True,
            }

        perfil_resp = (
            client.table("perfiles")
            .select("nombres,apellidos,correo_institucional,telefono,foto_url")
            .eq("id", perfil_id)
            .limit(1)
            .execute()
        )
        if perfil_resp.data:
            perfil = perfil_resp.data[0]
            result["nombre_completo"] = nombre_completo(perfil)
            result["email"] = perfil.get("correo_institucional", "")
            result["telefono"] = perfil.get("telefono", "")
            result["foto_url"] = perfil.get("foto_url", "")

        roles_resp = (
            client.table("usuarios_roles")
            .select("roles(codigo,nombre)")
            .eq("perfil_id", perfil_id)
            .eq("activo", True)
            .limit(1)
            .execute()
        )
        if roles_resp.data:
            rol = roles_resp.data[0].get("roles") or {}
            result["rol_codigo"] = rol.get("codigo", "")
            result["rol_nombre"] = rol.get("nombre", "")

        return result

    def guardar_personal(self, perfil_id: str, data: dict) -> dict:
        client = get_supabase()
        existing = (
            client.table("configuraciones_usuario")
            .select("id,tema,notificaciones_activas,preferencias")
            .eq("perfil_id", perfil_id)
            .limit(1)
            .execute()
        )
        current = existing.data[0] if existing.data else {}
        prefs = current.get("preferencias") or {}
        if not isinstance(prefs, dict):
            prefs = {}

        tema_actual = (current.get("tema") or "claro").lower() == "oscuro"
        if "tema_oscuro" in prefs:
            tema_actual = bool(prefs.get("tema_oscuro"))

        tema_oscuro = data.get("tema_oscuro", tema_actual)
        notificaciones_email = data.get(
            "notificaciones_email", prefs.get("notificaciones_email", current.get("notificaciones_activas", True))
        )
        notificaciones_push = data.get("notificaciones_push", prefs.get("notificaciones_push", True))

        payload = {
            "perfil_id": perfil_id,
            "tema": "oscuro" if tema_oscuro else "claro",
            "notificaciones_activas": notificaciones_email,
            "preferencias": {
                "tema_oscuro": tema_oscuro,
                "notificaciones_email": notificaciones_email,
                "notificaciones_push": notificaciones_push,
            },
        }
        if existing.data:
            client.table("configuraciones_usuario").update(payload).eq("id", existing.data[0]["id"]).execute()
        else:
            client.table("configuraciones_usuario").insert(payload).execute()
        return self.personal(perfil_id)
