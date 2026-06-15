from src.repository.helpers import nombre_completo, normalizar_grado_nombre
from src.services.database import get_supabase

_ESTADOS_MATRICULA_VIGENTE = frozenset({"ACTIVA", "PENDIENTE"})


class ReporteRepository:
    def generar(self, tipo: str, filtros: dict | None = None) -> dict:
        filtros = filtros or {}
        generadores = {
            "estudiantes": self._reporte_estudiantes_salon,
            "docentes": self._reporte_docentes,
            "comunicados": self._reporte_comunicados,
            "eventos": self._reporte_eventos,
        }
        generador = generadores.get(tipo)
        if not generador:
            raise ValueError(f"Tipo de reporte no válido: {tipo}")
        rows = generador(filtros)
        return {"tipo": tipo, "total": len(rows), "rows": rows}

    def _reporte_estudiantes_salon(self, filtros: dict) -> list[dict]:
        anio_id = filtros.get("anio_id")
        grado_id = filtros.get("grado_id")
        seccion_id = filtros.get("seccion_id")
        if not anio_id or not grado_id or not seccion_id:
            raise ValueError(
                "Seleccione año académico, grado y sección para el reporte de estudiantes del salón."
            )

        client = get_supabase()
        resp = (
            client.table("matriculas")
            .select(
                "id,fecha_matricula,"
                "estudiantes(codigo_estudiante,perfiles(nombres,apellidos)),"
                "estados_matricula(codigo,nombre),anios_academicos(anio),"
                "secciones(nombre,grados(id,nombre,niveles_educativos(nombre)))"
            )
            .eq("anio_academico_id", anio_id)
            .eq("seccion_id", seccion_id)
            .order("fecha_matricula")
            .execute()
        )
        rows = []
        for r in resp.data or []:
            estado = (r.get("estados_matricula") or {}).get("codigo", "")
            if estado not in _ESTADOS_MATRICULA_VIGENTE:
                continue
            est = r.get("estudiantes") or {}
            sec = r.get("secciones") or {}
            grado = sec.get("grados") or {}
            if grado.get("id") != grado_id:
                continue
            nivel = grado.get("niveles_educativos") or {}
            perfil = est.get("perfiles") or {}
            rows.append(
                {
                    "id": r["id"],
                    "codigo": est.get("codigo_estudiante", ""),
                    "nombre": nombre_completo(perfil),
                    "anio": (r.get("anios_academicos") or {}).get("anio", ""),
                    "nivel": nivel.get("nombre", ""),
                    "grado": normalizar_grado_nombre(grado.get("nombre", "")),
                    "seccion": sec.get("nombre", ""),
                    "estado": (r.get("estados_matricula") or {}).get("nombre", ""),
                }
            )
        return rows

    def _reporte_docentes(self, filtros: dict) -> list[dict]:
        client = get_supabase()
        resp = (
            client.table("docentes")
            .select(
                "id,codigo_docente,especialidad,perfiles(nombres,apellidos),"
                "cursos_asignados(asignaturas(nombre),secciones(nombre,grados(nombre)))"
            )
            .execute()
        )
        rows = []
        for r in resp.data or []:
            perfil = r.get("perfiles") or {}
            cursos = [
                f"{(c.get('asignaturas') or {}).get('nombre', '')} — {(c.get('secciones') or {}).get('nombre', '')}".strip(" —")
                for c in r.get("cursos_asignados") or []
            ]
            rows.append(
                {
                    "id": r["id"],
                    "codigo": r.get("codigo_docente", ""),
                    "nombre": nombre_completo(perfil),
                    "especialidad": r.get("especialidad", ""),
                    "cursos": ", ".join(c for c in cursos if c) or "Sin cursos",
                }
            )
        return rows

    def _reporte_comunicados(self, filtros: dict) -> list[dict]:
        client = get_supabase()
        resp = (
            client.table("comunicados")
            .select(
                "id,titulo,contenido,publicado,publicado_en,creado_en,"
                "roles(nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .order("creado_en", desc=True)
            .execute()
        )
        rows = []
        for r in resp.data or []:
            rol = r.get("roles") or {}
            nivel = r.get("niveles_educativos") or {}
            grado = r.get("grados") or {}
            seccion = r.get("secciones") or {}
            destinatario = (
                rol.get("nombre")
                or nivel.get("nombre")
                or normalizar_grado_nombre(grado.get("nombre", ""))
                or seccion.get("nombre")
                or "Todos"
            )
            contenido = (r.get("contenido") or "").strip()
            rows.append(
                {
                    "id": r["id"],
                    "titulo": r.get("titulo", ""),
                    "destinatario": destinatario,
                    "resumen": contenido[:120] + ("..." if len(contenido) > 120 else ""),
                    "fecha": str(r.get("publicado_en") or r.get("creado_en") or "")[:10],
                    "estado": "Publicado" if r.get("publicado") else "Borrador",
                }
            )
        return rows

    def _reporte_eventos(self, filtros: dict) -> list[dict]:
        client = get_supabase()
        resp = (
            client.table("eventos")
            .select(
                "id,titulo,descripcion,fecha_inicio,fecha_fin,lugar,"
                "roles(nombre),niveles_educativos(nombre),grados(nombre),secciones(nombre)"
            )
            .order("fecha_inicio", desc=True)
            .execute()
        )
        rows = []
        for r in resp.data or []:
            rol = r.get("roles") or {}
            nivel = r.get("niveles_educativos") or {}
            grado = r.get("grados") or {}
            seccion = r.get("secciones") or {}
            destinatario = (
                rol.get("nombre")
                or nivel.get("nombre")
                or normalizar_grado_nombre(grado.get("nombre", ""))
                or seccion.get("nombre")
                or "Toda la comunidad"
            )
            rows.append(
                {
                    "id": r["id"],
                    "titulo": r.get("titulo", ""),
                    "destinatario": destinatario,
                    "inicio": str(r.get("fecha_inicio", ""))[:16].replace("T", " "),
                    "fin": str(r.get("fecha_fin", ""))[:16].replace("T", " ") if r.get("fecha_fin") else "",
                    "lugar": r.get("lugar", ""),
                }
            )
        return rows
