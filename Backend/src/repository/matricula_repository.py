from src.repository.helpers import nombre_completo, normalizar_grado_nombre
from src.services.database import get_supabase

_ESTADOS_MATRICULA_PERMITIDOS = frozenset({"ACTIVA", "PENDIENTE", "RETIRADA"})
_ESTADOS_OCUPAN_CUPO = frozenset({"ACTIVA", "PENDIENTE"})


class MatriculaRepository:
    def find_all(
        self,
        anio_id: str | None = None,
        nivel_id: str | None = None,
        grado_id: str | None = None,
        seccion_id: str | None = None,
        estado_codigo: str | None = None,
        estudiante_id: str | None = None,
    ) -> list[dict]:
        client = get_supabase()
        query = client.table("matriculas").select(
            "id,fecha_matricula,estudiante_id,"
            "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos)),"
            "anios_academicos(anio),"
            "estados_matricula(codigo,nombre),"
            "secciones(nombre,grados(id,nombre,niveles_educativos(id,nombre,codigo)))"
        )
        if anio_id:
            query = query.eq("anio_academico_id", anio_id)
        if seccion_id:
            query = query.eq("seccion_id", seccion_id)
        if estudiante_id:
            query = query.eq("estudiante_id", estudiante_id)
        estado_esperado = estado_codigo.upper() if estado_codigo else None
        if estado_esperado:
            estado_resp = (
                client.table("estados_matricula")
                .select("id")
                .eq("codigo", estado_esperado)
                .limit(1)
                .execute()
            )
            if not estado_resp.data:
                return []
            query = query.eq("estado_id", estado_resp.data[0]["id"])

        response = query.execute()
        rows = []
        for row in response.data or []:
            estado = row.get("estados_matricula") or {}
            if estado_esperado and estado.get("codigo", "").upper() != estado_esperado:
                continue
            mapped = self._map_row(row)
            seccion = row.get("secciones") or {}
            grado = seccion.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            if nivel_id and nivel.get("id") != nivel_id:
                continue
            if grado_id and grado.get("id") != grado_id:
                continue
            rows.append(mapped)
        return rows

    def find_by_id(self, matricula_id: str) -> dict | None:
        client = get_supabase()
        response = (
            client.table("matriculas")
            .select(
                "id,fecha_matricula,estudiante_id,seccion_id,anio_academico_id,"
                "estudiantes(id,codigo_estudiante,perfiles(nombres,apellidos)),"
                "anios_academicos(id,anio),"
                "estados_matricula(id,codigo,nombre),"
                "secciones(id,nombre,grados(id,nombre,niveles_educativos(id,nombre)))"
            )
            .eq("id", matricula_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return self._map_detail(response.data[0])

    def crear(self, data: dict) -> dict:
        client = get_supabase()
        estado_codigo = data.get("estado_codigo", "ACTIVA").upper()
        if estado_codigo not in _ESTADOS_OCUPAN_CUPO:
            raise ValueError("Al matricular solo se permite estado Activa o Pendiente.")
        estado_resp = (
            client.table("estados_matricula")
            .select("id")
            .eq("codigo", estado_codigo)
            .limit(1)
            .execute()
        )
        if not estado_resp.data:
            raise ValueError("Estado de matrícula no encontrado")

        self._validar_sin_matricula_vigente(client, data["estudiante_id"])

        if estado_codigo in _ESTADOS_OCUPAN_CUPO:
            self._validar_cupo_disponible(
                client,
                data["seccion_id"],
                data["anio_academico_id"],
            )

        resp = (
            client.table("matriculas")
            .insert(
                {
                    "estudiante_id": data["estudiante_id"],
                    "seccion_id": data["seccion_id"],
                    "anio_academico_id": data["anio_academico_id"],
                    "estado_id": estado_resp.data[0]["id"],
                }
            )
            .execute()
        )
        return self.find_by_id(resp.data[0]["id"])

    def actualizar(self, matricula_id: str, data: dict) -> dict:
        client = get_supabase()
        actual = self.find_by_id(matricula_id)
        if not actual:
            raise ValueError("Matrícula no encontrada")

        update_data = {}
        nueva_seccion = data.get("seccion_id") or actual.get("sectionId")
        nuevo_anio = data.get("anio_academico_id") or actual.get("academicYearId")
        nuevo_estado = (data.get("estado_codigo") or actual.get("statusCode") or "ACTIVA").upper()
        if data.get("estado_codigo") and nuevo_estado not in _ESTADOS_MATRICULA_PERMITIDOS:
            raise ValueError("Estado no válido. Use Activa, Pendiente o Retirada.")

        if data.get("anio_academico_id"):
            update_data["anio_academico_id"] = data["anio_academico_id"]
        if data.get("seccion_id"):
            update_data["seccion_id"] = data["seccion_id"]
        if data.get("estado_codigo"):
            estado_resp = (
                client.table("estados_matricula")
                .select("id")
                .eq("codigo", nuevo_estado)
                .limit(1)
                .execute()
            )
            if not estado_resp.data:
                raise ValueError("Estado de matrícula no encontrado")
            update_data["estado_id"] = estado_resp.data[0]["id"]

        estado_actual = (actual.get("statusCode") or "").upper()
        ocupara_cupo = nuevo_estado in _ESTADOS_OCUPAN_CUPO
        ya_ocupaba = estado_actual in _ESTADOS_OCUPAN_CUPO
        cambia_seccion = data.get("seccion_id") and data["seccion_id"] != actual.get("sectionId")
        cambia_anio = data.get("anio_academico_id") and data["anio_academico_id"] != actual.get("academicYearId")
        pasa_a_ocupar = ocupara_cupo and not ya_ocupaba

        if pasa_a_ocupar and actual.get("studentId"):
            self._validar_sin_matricula_vigente(
                client,
                actual["studentId"],
                excluir_matricula_id=matricula_id,
            )

        if ocupara_cupo and (cambia_seccion or cambia_anio or pasa_a_ocupar):
            self._validar_cupo_disponible(
                client,
                nueva_seccion,
                nuevo_anio,
                excluir_matricula_id=matricula_id,
            )

        if update_data:
            client.table("matriculas").update(update_data).eq("id", matricula_id).execute()

        result = self.find_by_id(matricula_id)
        if not result:
            raise ValueError("Matrícula no encontrada")
        return result

    @staticmethod
    def contar_ocupados_por_seccion(
        seccion_ids: list[str],
        anio_id: str | None = None,
    ) -> dict[str, int]:
        if not seccion_ids:
            return {}
        client = get_supabase()
        query = client.table("matriculas").select(
            "seccion_id, anio_academico_id, estados_matricula(codigo)"
        ).in_("seccion_id", seccion_ids)
        if anio_id:
            query = query.eq("anio_academico_id", anio_id)
        response = query.execute()
        conteos: dict[str, int] = {}
        for row in response.data or []:
            estado = (row.get("estados_matricula") or {}).get("codigo", "")
            if estado in _ESTADOS_OCUPAN_CUPO:
                sid = row.get("seccion_id")
                if not sid:
                    continue
                clave = sid if anio_id else f"{sid}::{row.get('anio_academico_id')}"
                conteos[clave] = conteos.get(clave, 0) + 1
        return conteos

    def _validar_cupo_disponible(
        self,
        client,
        seccion_id: str,
        anio_id: str,
        excluir_matricula_id: str | None = None,
    ) -> None:
        sec_resp = (
            client.table("secciones")
            .select("capacidad,nombre")
            .eq("id", seccion_id)
            .limit(1)
            .execute()
        )
        if not sec_resp.data:
            raise ValueError("Sección no encontrada")
        capacidad = sec_resp.data[0].get("capacidad") or 0
        if capacidad <= 0:
            return

        query = (
            client.table("matriculas")
            .select("id, estados_matricula(codigo)")
            .eq("seccion_id", seccion_id)
            .eq("anio_academico_id", anio_id)
        )
        resp = query.execute()
        ocupados = 0
        for row in resp.data or []:
            if excluir_matricula_id and row.get("id") == excluir_matricula_id:
                continue
            estado = (row.get("estados_matricula") or {}).get("codigo", "")
            if estado in _ESTADOS_OCUPAN_CUPO:
                ocupados += 1

        if ocupados >= capacidad:
            nombre = sec_resp.data[0].get("nombre", "")
            raise ValueError(
                f"La sección {nombre} no tiene cupos disponibles ({ocupados}/{capacidad} ocupados)"
            )

    def _validar_sin_matricula_vigente(
        self,
        client,
        estudiante_id: str,
        excluir_matricula_id: str | None = None,
    ) -> None:
        resp = (
            client.table("matriculas")
            .select(
                "id, anios_academicos(anio), estados_matricula(codigo,nombre),"
                "secciones(nombre, grados(nombre, niveles_educativos(nombre)))"
            )
            .eq("estudiante_id", estudiante_id)
            .execute()
        )
        for row in resp.data or []:
            if excluir_matricula_id and row.get("id") == excluir_matricula_id:
                continue
            estado = (row.get("estados_matricula") or {}).get("codigo", "")
            if estado not in _ESTADOS_OCUPAN_CUPO:
                continue
            anio = (row.get("anios_academicos") or {}).get("anio", "")
            sec = row.get("secciones") or {}
            grado = sec.get("grados") or {}
            nivel = grado.get("niveles_educativos") or {}
            grado_nombre = normalizar_grado_nombre(grado.get("nombre", ""))
            nivel_nombre = nivel.get("nombre", "")
            sec_nombre = sec.get("nombre", "")
            ubicacion = " ".join(p for p in [nivel_nombre, grado_nombre, sec_nombre] if p)
            estado_nombre = (row.get("estados_matricula") or {}).get("nombre", estado)
            raise ValueError(
                f"El estudiante ya tiene una matrícula vigente ({estado_nombre}) "
                f"en {anio} — {ubicacion}. Debe retirarla antes de matricularlo en otro nivel o sección."
            )


    def _map_row(self, row: dict) -> dict:
        estudiante = row.get("estudiantes") or {}
        perfil = estudiante.get("perfiles") or {}
        seccion = row.get("secciones") or {}
        grado = seccion.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        anio = row.get("anios_academicos") or {}
        estado = row.get("estados_matricula") or {}

        return {
            "id": row["id"],
            "studentId": estudiante.get("id", ""),
            "studentCode": estudiante.get("codigo_estudiante", ""),
            "studentName": nombre_completo(perfil),
            "academicYear": str(anio.get("anio", "")),
            "level": nivel.get("nombre", ""),
            "grade": normalizar_grado_nombre(grado.get("nombre", "")),
            "section": seccion.get("nombre", ""),
            "status": estado.get("nombre", ""),
            "statusCode": estado.get("codigo", ""),
            "enrollmentDate": row.get("fecha_matricula", ""),
        }

    def _map_detail(self, row: dict) -> dict:
        base = self._map_row(row)
        seccion = row.get("secciones") or {}
        grado = seccion.get("grados") or {}
        nivel = grado.get("niveles_educativos") or {}
        anio = row.get("anios_academicos") or {}
        estado = row.get("estados_matricula") or {}
        return {
            **base,
            "studentId": row.get("estudiante_id") or base.get("studentId", ""),
            "academicYearId": anio.get("id"),
            "sectionId": seccion.get("id"),
            "gradeId": grado.get("id"),
            "levelId": nivel.get("id"),
            "statusCode": estado.get("codigo"),
            "statusId": estado.get("id"),
        }
