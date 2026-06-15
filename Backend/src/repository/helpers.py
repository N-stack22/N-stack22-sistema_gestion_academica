import re

from src.services.database import get_supabase

_ESTADOS_MATRICULA_VIGENTE = frozenset({"ACTIVA", "PENDIENTE"})


def normalizar_grado_nombre(nombre: str) -> str:
    """Convierte '3 anos' -> '3 años' en nombres de grado Inicial."""
    if not nombre:
        return nombre
    return re.sub(r"(\d+)\s*anos\b", r"\1 años", nombre, flags=re.IGNORECASE)


def nombre_completo(perfil: dict | None) -> str:
    if not perfil:
        return "Sin nombre"
    return f"{perfil.get('nombres', '').strip()} {perfil.get('apellidos', '').strip()}".strip()


def estado_texto(activo: bool | None) -> str:
    return "Activo" if activo else "Inactivo"


def obtener_anio_activo() -> dict | None:
    client = get_supabase()
    response = (
        client.table("anios_academicos")
        .select("id,anio,fecha_inicio,fecha_fin,activo")
        .eq("activo", True)
        .limit(1)
        .execute()
    )
    if response.data:
        return response.data[0]
    response = (
        client.table("anios_academicos")
        .select("id,anio,fecha_inicio,fecha_fin,activo")
        .order("anio", desc=True)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def generar_codigo(prefijo: str, tabla: str, campo: str) -> str:
    client = get_supabase()
    response = client.table(tabla).select(f"id,{campo}").execute()
    total = len(response.data or []) + 1
    return f"{prefijo}-{total:03d}"


ROLE_ALIASES: dict[str, list[str]] = {
    "ADMIN": ["ADMIN", "ADMINISTRADOR", "administrador"],
    "DIRECTOR": ["DIRECTOR", "director"],
    "DOCENTE": ["DOCENTE", "docente", "TEACHER"],
    "ESTUDIANTE": ["ESTUDIANTE", "estudiante", "STUDENT"],
    "APODERADO": ["APODERADO", "apoderado", "PARENT"],
}


def deduplicar_metodos_pago(rows: list[dict], solo_activos: bool = False) -> list[dict]:
    """Consolida métodos duplicados por código (sin distinguir mayúsculas)."""
    elegidos: dict[str, dict] = {}
    for row in rows:
        if solo_activos and not row.get("activo", True):
            continue
        clave = (row.get("codigo") or "").strip().upper()
        if not clave:
            continue
        actual = elegidos.get(clave)
        if not actual:
            elegidos[clave] = row
            continue
        actual_score = (
            int((actual.get("codigo") or "") == clave),
            int(bool(actual.get("activo"))),
        )
        nuevo_score = (
            int((row.get("codigo") or "") == clave),
            int(bool(row.get("activo"))),
        )
        if nuevo_score > actual_score:
            elegidos[clave] = row
    return sorted(elegidos.values(), key=lambda r: (r.get("nombre") or "").lower())


def buscar_metodo_pago_por_codigo(codigo: str) -> dict | None:
    codigo_norm = (codigo or "").strip().upper()
    if not codigo_norm:
        return None
    client = get_supabase()
    rows = client.table("metodos_pago").select("id,codigo,nombre,activo").execute().data or []
    return next((r for r in rows if (r.get("codigo") or "").upper() == codigo_norm), None)


def obtener_cursos_docente(docente_id: str) -> list[dict]:
    client = get_supabase()
    resp = (
        client.table("cursos_asignados")
        .select("id,seccion_id,anio_academico_id,docente_id")
        .eq("docente_id", docente_id)
        .execute()
    )
    return resp.data or []


def obtener_ids_cursos_docente(docente_id: str) -> list[str]:
    return [c["id"] for c in obtener_cursos_docente(docente_id)]


def curso_pertenece_docente(docente_id: str, curso_id: str) -> bool:
    if not docente_id or not curso_id:
        return False
    client = get_supabase()
    resp = (
        client.table("cursos_asignados")
        .select("id")
        .eq("id", curso_id)
        .eq("docente_id", docente_id)
        .limit(1)
        .execute()
    )
    return bool(resp.data)


def obtener_estudiantes_ids_por_docente(
    docente_id: str,
    curso_id: str | None = None,
    seccion_id: str | None = None,
) -> set[str]:
    cursos = obtener_cursos_docente(docente_id)
    if curso_id:
        cursos = [c for c in cursos if c["id"] == curso_id]
    if seccion_id:
        cursos = [c for c in cursos if c["seccion_id"] == seccion_id]
    if not cursos:
        return set()

    client = get_supabase()
    estudiante_ids: set[str] = set()
    for curso in cursos:
        mats = (
            client.table("matriculas")
            .select("estudiante_id,estados_matricula(codigo)")
            .eq("seccion_id", curso["seccion_id"])
            .eq("anio_academico_id", curso["anio_academico_id"])
            .execute()
        ).data or []
        for m in mats:
            estado = (m.get("estados_matricula") or {}).get("codigo", "")
            if estado in _ESTADOS_MATRICULA_VIGENTE:
                estudiante_ids.add(m["estudiante_id"])
    return estudiante_ids


def obtener_rol_id(codigo_canonico: str) -> str | None:
    """Busca rol por código canónico o alias (mayúsculas/minúsculas)."""
    client = get_supabase()
    aliases = ROLE_ALIASES.get(codigo_canonico.upper(), [codigo_canonico.upper()])
    for alias in aliases:
        resp = client.table("roles").select("id").eq("codigo", alias).limit(1).execute()
        if resp.data:
            return resp.data[0]["id"]
    resp = client.table("roles").select("id,codigo").execute()
    alias_lower = {a.lower() for a in aliases}
    for row in resp.data or []:
        if (row.get("codigo") or "").lower() in alias_lower:
            return row["id"]
    return None


def obtener_matricula_activa(estudiante_id: str) -> dict | None:
    """Matrícula vigente del estudiante (ACTIVA o PENDIENTE) en año activo o más reciente."""
    client = get_supabase()
    anio = obtener_anio_activo()
    query = (
        client.table("matriculas")
        .select(
            "id,fecha_matricula,seccion_id,anio_academico_id,estudiante_id,"
            "estados_matricula(codigo,nombre),"
            "secciones(id,nombre,aula,grado_id,grados(id,nombre,nivel_id,niveles_educativos(id,nombre))),"
            "anios_academicos(id,anio)"
        )
        .eq("estudiante_id", estudiante_id)
    )
    if anio:
        query = query.eq("anio_academico_id", anio["id"])
    resp = query.order("fecha_matricula", desc=True).execute()
    for row in resp.data or []:
        estado = (row.get("estados_matricula") or {}).get("codigo", "")
        if estado in _ESTADOS_MATRICULA_VIGENTE:
            return row
    if resp.data:
        return resp.data[0]
    resp_all = (
        client.table("matriculas")
        .select(
            "id,fecha_matricula,seccion_id,anio_academico_id,estudiante_id,"
            "estados_matricula(codigo,nombre),"
            "secciones(id,nombre,aula,grado_id,grados(id,nombre,nivel_id,niveles_educativos(id,nombre))),"
            "anios_academicos(id,anio)"
        )
        .eq("estudiante_id", estudiante_id)
        .order("fecha_matricula", desc=True)
        .limit(1)
        .execute()
    )
    return resp_all.data[0] if resp_all.data else None


def obtener_ids_cursos_estudiante(estudiante_id: str) -> list[str]:
    mat = obtener_matricula_activa(estudiante_id)
    if not mat:
        return []
    client = get_supabase()
    resp = (
        client.table("cursos_asignados")
        .select("id")
        .eq("seccion_id", mat["seccion_id"])
        .eq("anio_academico_id", mat["anio_academico_id"])
        .execute()
    )
    return [r["id"] for r in resp.data or []]


def curso_pertenece_estudiante(estudiante_id: str, curso_id: str) -> bool:
    if not estudiante_id or not curso_id:
        return False
    return curso_id in obtener_ids_cursos_estudiante(estudiante_id)


def obtener_contexto_academico_estudiante(estudiante_id: str) -> dict | None:
    mat = obtener_matricula_activa(estudiante_id)
    if not mat:
        return None
    sec = mat.get("secciones") or {}
    grado = sec.get("grados") or {}
    nivel = grado.get("niveles_educativos") or {}
    anio = mat.get("anios_academicos") or {}
    estado = mat.get("estados_matricula") or {}
    return {
        "matricula_id": mat["id"],
        "seccion_id": mat.get("seccion_id"),
        "anio_academico_id": mat.get("anio_academico_id"),
        "grado_id": sec.get("grado_id") or grado.get("id"),
        "nivel_id": grado.get("nivel_id") or nivel.get("id"),
        "section": sec.get("nombre", ""),
        "grade": normalizar_grado_nombre(grado.get("nombre", "")),
        "level": nivel.get("nombre", ""),
        "year": anio.get("anio"),
        "enrollmentStatus": estado.get("nombre", ""),
        "enrollmentDate": str(mat.get("fecha_matricula", ""))[:10],
    }


def obtener_apoderado_id_por_perfil(perfil_id: str) -> str | None:
    if not perfil_id:
        return None
    client = get_supabase()
    resp = (
        client.table("apoderados")
        .select("id")
        .eq("perfil_id", perfil_id)
        .limit(1)
        .execute()
    )
    if not resp.data:
        return None
    return resp.data[0]["id"]


def obtener_estudiantes_ids_por_apoderado(apoderado_id: str) -> set[str]:
    if not apoderado_id:
        return set()
    client = get_supabase()
    resp = (
        client.table("apoderado_estudiante")
        .select("estudiante_id")
        .eq("apoderado_id", apoderado_id)
        .execute()
    )
    return {row["estudiante_id"] for row in resp.data or [] if row.get("estudiante_id")}


def estudiante_pertenece_apoderado(apoderado_id: str, estudiante_id: str) -> bool:
    if not apoderado_id or not estudiante_id:
        return False
    return estudiante_id in obtener_estudiantes_ids_por_apoderado(apoderado_id)
