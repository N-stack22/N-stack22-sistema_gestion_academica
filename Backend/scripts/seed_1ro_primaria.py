#!/usr/bin/env python3
"""
Genera el aula completa de 1ro de Primaria A (2026) para probar roles docente y estudiante.

Uso (desde Backend/):
  .venv\\Scripts\\python.exe scripts/seed_1ro_primaria.py

Requisitos: SUPABASE_KEY = service_role en Backend/.env
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.repository.asistencia_repository import AsistenciaRepository
from src.repository.calificacion_repository import CalificacionRepository
from src.repository.curso_repository import CursoRepository
from src.repository.docente_repository import DocenteRepository
from src.repository.estudiante_repository import EstudianteRepository
from src.repository.horario_repository import HorarioRepository
from src.repository.matricula_repository import MatriculaRepository
from src.repository.tarea_repository import TareaRepository
from src.services.database import get_supabase

PASSWORD = "Estudiante123"
DOCENTE = {
    "nombres": "Patricia",
    "apellidos": "Vela Ríos",
    "correo_institucional": "docente1ro@horizonte.edu.pe",
    "password": "Docente123",
    "especialidad": "Educación Primaria",
    "telefono": "999111222",
}
ESTUDIANTES = [
    ("Sofía", "Ramos Quispe", "estudiante1ro@horizonte.edu.pe"),
    ("Mateo", "Flores Castro", "alumno1ro2@horizonte.edu.pe"),
    ("Valentina", "Díaz Mendoza", "alumno1ro3@horizonte.edu.pe"),
    ("Diego", "Huamán López", "alumno1ro4@horizonte.edu.pe"),
    ("Camila", "Torres Vega", "alumno1ro5@horizonte.edu.pe"),
]
PADRE = {
    "nombres": "Jorge",
    "apellidos": "Ramos Quispe",
    "correo_institucional": "padre1ro@horizonte.edu.pe",
    "password": "Padre123",
    "telefono": "999333444",
}
ASIGNATURAS = ["MAT", "COM", "CYT", "PSO", "ING"]
HORARIOS = [
    (1, "08:00", "09:30"),
    (1, "10:00", "11:30"),
    (2, "08:00", "09:30"),
    (2, "10:00", "11:30"),
    (3, "08:00", "09:30"),
]
TAREAS = {
    "MAT": ("Práctica de sumas", "Resolver la ficha de operaciones básicas.", "2026-04-20"),
    "COM": ("Lectura: El principito", "Leer el capítulo 1 y responder 3 preguntas.", "2026-04-18"),
    "CYT": ("Experimento con plantas", "Registrar el crecimiento de una semilla.", "2026-04-25"),
    "PSO": ("Mi barrio", "Dibujar y describir los lugares importantes de tu barrio.", "2026-04-22"),
    "ING": ("Vocabulary: Colors", "Aprender y escribir 10 colores en inglés.", "2026-04-19"),
}
ASISTENCIA_FECHAS = ["2026-03-10", "2026-03-11", "2026-03-12"]
ASISTENCIA_ESTADOS = ["PRESENTE", "PRESENTE", "TARDE", "PRESENTE", "FALTA"]


def _catalog_ids(client):
    anio = (
        client.table("anios_academicos").select("id,anio").eq("anio", 2026).limit(1).execute().data
    )
    if not anio:
        raise RuntimeError("No existe el año académico 2026.")
    anio_id = anio[0]["id"]

    grado = (
        client.table("grados")
        .select("id,nombre,niveles_educativos!inner(codigo)")
        .eq("nombre", "1ro")
        .eq("niveles_educativos.codigo", "PRIMARIA")
        .limit(1)
        .execute()
        .data
    )
    if not grado:
        raise RuntimeError("No existe el grado 1ro de Primaria. Ejecute sql/08_fix_grados_secciones.sql")
    grado_id = grado[0]["id"]

    seccion = (
        client.table("secciones")
        .select("id,nombre,aula")
        .eq("anio_academico_id", anio_id)
        .eq("grado_id", grado_id)
        .eq("nombre", "A")
        .limit(1)
        .execute()
        .data
    )
    if not seccion:
        raise RuntimeError("No existe la sección 1ro A para 2026.")
    seccion_id = seccion[0]["id"]
    aula = seccion[0].get("aula") or "Aula A"

    asignaturas = {}
    for codigo in ASIGNATURAS:
        row = (
            client.table("asignaturas").select("id,codigo,nombre").eq("codigo", codigo).limit(1).execute().data
        )
        if not row:
            raise RuntimeError(f"Asignatura {codigo} no encontrada.")
        asignaturas[codigo] = row[0]

    periodo = (
        client.table("periodos_academicos")
        .select("id,nombre")
        .eq("anio_academico_id", anio_id)
        .eq("nombre", "I Bimestre")
        .limit(1)
        .execute()
        .data
    )
    if not periodo:
        periodo = (
            client.table("periodos_academicos")
            .select("id,nombre")
            .eq("anio_academico_id", anio_id)
            .order("orden")
            .limit(1)
            .execute()
            .data
        )
    periodo_id = periodo[0]["id"] if periodo else None

    tipo_examen = (
        client.table("tipos_evaluacion").select("id").eq("codigo", "EXAMEN").limit(1).execute().data
    )
    tipo_tarea = (
        client.table("tipos_evaluacion").select("id").eq("codigo", "TAREA").limit(1).execute().data
    )

    return {
        "anio_id": anio_id,
        "seccion_id": seccion_id,
        "aula": aula,
        "asignaturas": asignaturas,
        "periodo_id": periodo_id,
        "tipo_examen_id": tipo_examen[0]["id"] if tipo_examen else None,
        "tipo_tarea_id": tipo_tarea[0]["id"] if tipo_tarea else None,
    }


def _perfil_id_por_email(client, email: str) -> str | None:
    rows = (
        client.table("perfiles")
        .select("id")
        .eq("correo_institucional", email)
        .limit(1)
        .execute()
        .data
    )
    return rows[0]["id"] if rows else None


def _estudiante_id_por_email(client, email: str) -> str | None:
    perfil_id = _perfil_id_por_email(client, email)
    if not perfil_id:
        return None
    rows = (
        client.table("estudiantes").select("id").eq("perfil_id", perfil_id).limit(1).execute().data
    )
    return rows[0]["id"] if rows else None


def _docente_id_por_email(client, email: str) -> str | None:
    perfil_id = _perfil_id_por_email(client, email)
    if not perfil_id:
        return None
    rows = client.table("docentes").select("id").eq("perfil_id", perfil_id).limit(1).execute().data
    return rows[0]["id"] if rows else None


def _crear_o_obtener_docente(repo: DocenteRepository, client) -> str:
    docente_id = _docente_id_por_email(client, DOCENTE["correo_institucional"])
    if docente_id:
        print(f"  Docente ya existe: {DOCENTE['correo_institucional']}")
        return docente_id
    try:
        doc = repo.crear(DOCENTE)
        print(f"  Docente creado: {DOCENTE['correo_institucional']} ({doc['code']})")
        return doc["id"]
    except Exception as exc:
        docente_id = _docente_id_por_email(client, DOCENTE["correo_institucional"])
        if docente_id:
            return docente_id
        raise RuntimeError(f"No se pudo crear el docente: {exc}") from exc


def _crear_o_obtener_estudiante(repo: EstudianteRepository, client, nombres, apellidos, email) -> str:
    est_id = _estudiante_id_por_email(client, email)
    if est_id:
        print(f"  Estudiante ya existe: {email}")
        return est_id
    try:
        est = repo.crear(
            {
                "nombres": nombres,
                "apellidos": apellidos,
                "correo_institucional": email,
                "password": PASSWORD,
                "fecha_nacimiento": "2018-05-15",
            }
        )
        print(f"  Estudiante creado: {email} ({est['code']})")
        return est["id"]
    except Exception as exc:
        est_id = _estudiante_id_por_email(client, email)
        if est_id:
            return est_id
        raise RuntimeError(f"No se pudo crear estudiante {email}: {exc}") from exc


def _matricular_si_falta(repo: MatriculaRepository, estudiante_id: str, anio_id: str, seccion_id: str) -> None:
    existentes = repo.find_all(anio_id=anio_id, estudiante_id=estudiante_id)
    if existentes:
        return
    repo.crear(
        {
            "estudiante_id": estudiante_id,
            "anio_academico_id": anio_id,
            "seccion_id": seccion_id,
            "estado_codigo": "ACTIVA",
        }
    )


def _crear_padre(client, estudiante_principal_id: str) -> None:
    perfil_id = _perfil_id_por_email(client, PADRE["correo_institucional"])
    if not perfil_id:
        auth = client.auth.admin.create_user(
            {
                "email": PADRE["correo_institucional"],
                "password": PADRE["password"],
                "email_confirm": True,
            }
        )
        perfil_id = auth.user.id
        client.table("perfiles").insert(
            {
                "id": perfil_id,
                "nombres": PADRE["nombres"],
                "apellidos": PADRE["apellidos"],
                "correo_institucional": PADRE["correo_institucional"],
                "telefono": PADRE["telefono"],
                "estado": True,
            }
        ).execute()
        rol = client.table("roles").select("id").eq("codigo", "APODERADO").limit(1).execute().data
        if rol:
            client.table("usuarios_roles").insert(
                {"perfil_id": perfil_id, "rol_id": rol[0]["id"], "activo": True}
            ).execute()
        client.table("apoderados").insert(
            {"perfil_id": perfil_id, "ocupacion": "Contador", "direccion": "Huancayo"}
        ).execute()
        print(f"  Apoderado creado: {PADRE['correo_institucional']}")
    else:
        print(f"  Apoderado ya existe: {PADRE['correo_institucional']}")

    apoderado = (
        client.table("apoderados").select("id").eq("perfil_id", perfil_id).limit(1).execute().data
    )
    if not apoderado:
        return
    apoderado_id = apoderado[0]["id"]
    dup = (
        client.table("apoderado_estudiante")
        .select("id")
        .eq("apoderado_id", apoderado_id)
        .eq("estudiante_id", estudiante_principal_id)
        .limit(1)
        .execute()
        .data
    )
    if not dup:
        client.table("apoderado_estudiante").insert(
            {
                "apoderado_id": apoderado_id,
                "estudiante_id": estudiante_principal_id,
                "parentesco": "Padre",
                "es_principal": True,
            }
        ).execute()


def _curso_existente(client, anio_id, seccion_id, asignatura_id) -> str | None:
    row = (
        client.table("cursos_asignados")
        .select("id")
        .eq("anio_academico_id", anio_id)
        .eq("seccion_id", seccion_id)
        .eq("asignatura_id", asignatura_id)
        .limit(1)
        .execute()
        .data
    )
    return row[0]["id"] if row else None


def main() -> None:
    print("=== Seed: 1ro Primaria A — Colegio Horizonte ===\n")
    client = get_supabase()
    cat = _catalog_ids(client)

    docente_repo = DocenteRepository()
    estudiante_repo = EstudianteRepository()
    matricula_repo = MatriculaRepository()
    curso_repo = CursoRepository()
    horario_repo = HorarioRepository()
    tarea_repo = TareaRepository()
    asistencia_repo = AsistenciaRepository()
    calificacion_repo = CalificacionRepository()

    print("1) Usuarios y matrículas")
    docente_id = _crear_o_obtener_docente(docente_repo, client)
    estudiante_ids: list[str] = []
    for nombres, apellidos, email in ESTUDIANTES:
        est_id = _crear_o_obtener_estudiante(estudiante_repo, client, nombres, apellidos, email)
        _matricular_si_falta(matricula_repo, est_id, cat["anio_id"], cat["seccion_id"])
        estudiante_ids.append(est_id)
    _crear_padre(client, estudiante_ids[0])
    print(f"  {len(estudiante_ids)} estudiantes matriculados en 1ro A\n")

    print("2) Cursos asignados y horarios")
    curso_por_codigo: dict[str, str] = {}
    for i, codigo in enumerate(ASIGNATURAS):
        asig_id = cat["asignaturas"][codigo]["id"]
        curso_id = _curso_existente(client, cat["anio_id"], cat["seccion_id"], asig_id)
        if not curso_id:
            curso = curso_repo.crear_curso(
                {
                    "anio_academico_id": cat["anio_id"],
                    "seccion_id": cat["seccion_id"],
                    "asignatura_id": asig_id,
                    "docente_id": docente_id,
                }
            )
            curso_id = curso["id"]
            print(f"  Curso creado: {codigo}")
        else:
            client.table("cursos_asignados").update({"docente_id": docente_id}).eq("id", curso_id).execute()
            print(f"  Curso existente: {codigo}")
        curso_por_codigo[codigo] = curso_id

        dia, inicio, fin = HORARIOS[i]
        hor_exist = (
            client.table("horarios")
            .select("id")
            .eq("curso_asignado_id", curso_id)
            .eq("dia_semana", dia)
            .limit(1)
            .execute()
            .data
        )
        if not hor_exist:
            horario_repo.crear(
                {
                    "curso_asignado_id": curso_id,
                    "dia_semana": dia,
                    "hora_inicio": inicio,
                    "hora_fin": fin,
                    "aula": cat["aula"],
                }
            )
    print()

    print("3) Tareas publicadas")
    tarea_ids: dict[str, str] = {}
    for codigo, (titulo, desc, fecha) in TAREAS.items():
        curso_id = curso_por_codigo[codigo]
        exist = (
            client.table("tareas")
            .select("id")
            .eq("curso_asignado_id", curso_id)
            .eq("titulo", titulo)
            .limit(1)
            .execute()
            .data
        )
        if exist:
            tarea_ids[codigo] = exist[0]["id"]
            continue
        tarea = tarea_repo.crear(
            {
                "curso_asignado_id": curso_id,
                "docente_id": docente_id,
                "titulo": titulo,
                "descripcion": desc,
                "fecha_entrega": fecha,
            }
        )
        tarea_ids[codigo] = tarea["id"]
        print(f"  Tarea: {titulo} ({codigo})")
    print()

    print("4) Asistencias (Comunicación)")
    curso_com = curso_por_codigo["COM"]
    for fecha in ASISTENCIA_FECHAS:
        for idx, est_id in enumerate(estudiante_ids):
            dup = (
                client.table("asistencia")
                .select("id")
                .eq("estudiante_id", est_id)
                .eq("curso_asignado_id", curso_com)
                .eq("fecha", fecha)
                .limit(1)
                .execute()
                .data
            )
            if dup:
                continue
            estado = ASISTENCIA_ESTADOS[idx % len(ASISTENCIA_ESTADOS)]
            asistencia_repo.registrar(
                {
                    "estudiante_id": est_id,
                    "curso_asignado_id": curso_com,
                    "estado_codigo": estado,
                    "fecha": fecha,
                    "registrado_por_docente_id": docente_id,
                    "observacion": "Registro de prueba" if estado != "PRESENTE" else None,
                }
            )
    print(f"  Asistencias registradas en {len(ASISTENCIA_FECHAS)} fechas\n")

    print("5) Calificaciones (I Bimestre)")
    notas_base = [18, 16, 17, 15, 19]
    if cat["periodo_id"] and cat["tipo_examen_id"]:
        for i, codigo in enumerate(ASIGNATURAS):
            curso_id = curso_por_codigo[codigo]
            for j, est_id in enumerate(estudiante_ids):
                nombre_eval = f"Examen bimestral — {cat['asignaturas'][codigo]['nombre']}"
                dup = (
                    client.table("calificaciones")
                    .select("id")
                    .eq("estudiante_id", est_id)
                    .eq("curso_asignado_id", curso_id)
                    .eq("nombre_evaluacion", nombre_eval)
                    .limit(1)
                    .execute()
                    .data
                )
                if dup:
                    continue
                nota = min(20, notas_base[j] - (i % 2))
                calificacion_repo.crear(
                    {
                        "estudiante_id": est_id,
                        "curso_asignado_id": curso_id,
                        "periodo_academico_id": cat["periodo_id"],
                        "tipo_evaluacion_id": cat["tipo_examen_id"],
                        "nombre_evaluacion": nombre_eval,
                        "nota": nota,
                        "peso": 1,
                        "registrado_por_docente_id": docente_id,
                    }
                )
    print("  Calificaciones registradas\n")

    print("6) Entrega de tarea (estudiante principal)")
    estado_ent = (
        client.table("estados_entrega_tarea").select("id").eq("codigo", "ENTREGADA").limit(1).execute().data
    )
    if estado_ent and "COM" in tarea_ids:
        dup = (
            client.table("entregas_tareas")
            .select("id")
            .eq("tarea_id", tarea_ids["COM"])
            .eq("estudiante_id", estudiante_ids[0])
            .limit(1)
            .execute()
            .data
        )
        if not dup:
            client.table("entregas_tareas").insert(
                {
                    "tarea_id": tarea_ids["COM"],
                    "estudiante_id": estudiante_ids[0],
                    "estado_id": estado_ent[0]["id"],
                    "nota": 18,
                    "fecha_entrega": "2026-04-10",
                }
            ).execute()
            print("  Entrega registrada para Sofía Ramos\n")

    print("7) Pensiones del estudiante principal")
    concepto = client.table("conceptos_pago").select("id").eq("codigo", "PENSION").limit(1).execute().data
    if concepto:
        for mes, estado_codigo in [(3, "PAGADO"), (4, "PENDIENTE")]:
            ep = client.table("estados_pago").select("id").eq("codigo", estado_codigo).limit(1).execute().data
            if not ep:
                continue
            dup = (
                client.table("pensiones")
                .select("id")
                .eq("estudiante_id", estudiante_ids[0])
                .eq("anio", 2026)
                .eq("mes", mes)
                .limit(1)
                .execute()
                .data
            )
            if not dup:
                client.table("pensiones").insert(
                    {
                        "estudiante_id": estudiante_ids[0],
                        "concepto_pago_id": concepto[0]["id"],
                        "estado_pago_id": ep[0]["id"],
                        "anio": 2026,
                        "mes": mes,
                        "monto": 450.0,
                        "fecha_vencimiento": f"2026-0{mes}-10",
                    }
                ).execute()
    print("  Pensiones Mar/Abr 2026\n")

    print("=== Credenciales de prueba ===")
    print(f"Docente:    {DOCENTE['correo_institucional']} / {DOCENTE['password']}")
    print(f"Estudiante: {ESTUDIANTES[0][2]} / {PASSWORD}")
    print(f"Apoderado:  {PADRE['correo_institucional']} / {PADRE['password']}")
    print(f"Salón:      1ro Primaria — Sección A (2026)")
    print(f"Cursos:     {', '.join(ASIGNATURAS)}")
    print("\nListo.")


if __name__ == "__main__":
    main()
