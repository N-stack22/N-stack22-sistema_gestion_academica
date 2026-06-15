#!/usr/bin/env python3
"""Unifica catálogos duplicados (mayúsculas/minúsculas). Uso: python scripts/fix_catalogos_duplicados.py"""

from __future__ import annotations

import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.services.database import get_supabase

LEGACY_MAP: dict[str, dict[str, str]] = {
    "estados_asistencia": {
        "presente": "PRESENTE",
        "tarde": "TARDE",
        "falta": "FALTA",
        "justificado": "JUSTIFICADO",
    },
    "estados_tarea": {
        "borrador": "BORRADOR",
        "publicado": "PUBLICADA",
        "publicada": "PUBLICADA",
        "cerrado": "CERRADA",
        "cerrada": "CERRADA",
    },
    "estados_entrega_tarea": {
        "pendiente": "PENDIENTE",
        "entregado": "ENTREGADA",
        "entregada": "ENTREGADA",
        "calificado": "CALIFICADA",
        "calificada": "CALIFICADA",
        "tarde": "ENTREGADA",
    },
    "estados_pago": {
        "pendiente": "PENDIENTE",
        "pagado": "PAGADO",
        "vencido": "VENCIDA",
        "vencida": "VENCIDA",
        "anulado": "ANULADO",
        "observado": "ANULADO",
    },
    "conceptos_pago": {
        "pension": "PENSION",
        "matricula": "MATRICULA",
        "material": "MATERIAL",
    },
    "estados_seguimiento": {
        "bueno": "BIEN",
        "regular": "REGULAR",
        "en_observacion": "OBSERVACION",
        "observacion": "OBSERVACION",
    },
}

FK_UPDATES: list[tuple[str, str, str]] = [
    ("estados_asistencia", "asistencia", "estado_id"),
    ("estados_tarea", "tareas", "estado_id"),
    ("estados_entrega_tarea", "entregas_tareas", "estado_id"),
    ("tipos_evaluacion", "calificaciones", "tipo_evaluacion_id"),
    ("tipos_recurso", "recursos_academicos", "tipo_recurso_id"),
    ("estados_pago", "pagos", "estado_pago_id"),
    ("estados_pago", "pensiones", "estado_pago_id"),
    ("conceptos_pago", "pensiones", "concepto_pago_id"),
    ("estados_seguimiento", "seguimiento_academico", "estado_id"),
]


def _canonical_code(table: str, codigo: str) -> str:
    raw = (codigo or "").strip()
    legacy = LEGACY_MAP.get(table, {})
    return legacy.get(raw.lower(), raw.upper())


def _normalize_catalog_table(client, table: str) -> None:
    rows = client.table(table).select("id,codigo,nombre").execute().data or []
    groups: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        canon = _canonical_code(table, row.get("codigo", ""))
        if canon:
            groups[canon].append({**row, "canon": canon})

    for canon, items in groups.items():
        if len(items) < 2:
            if items and items[0].get("codigo") != canon:
                client.table(table).update({"codigo": canon}).eq("id", items[0]["id"]).execute()
            continue

        keeper = next((i for i in items if i.get("codigo") == canon), items[0])
        keeper_id = keeper["id"]
        for item in items:
            if item["id"] == keeper_id:
                continue
            dupe_id = item["id"]
            for cat_table, ref_table, fk_col in FK_UPDATES:
                if cat_table != table:
                    continue
                client.table(ref_table).update({fk_col: keeper_id}).eq(fk_col, dupe_id).execute()
            client.table(table).delete().eq("id", dupe_id).execute()
            print(f"  {table}: {canon} duplicado {dupe_id} -> {keeper_id}")

        if keeper.get("codigo") != canon:
            client.table(table).update({"codigo": canon}).eq("id", keeper_id).execute()


def main() -> None:
    client = get_supabase()
    tables = sorted({t for t, _, _ in FK_UPDATES})
    print("Unificando catálogos duplicados...")
    for table in tables:
        print(f"- {table}")
        _normalize_catalog_table(client, table)
    print("Listo.")


if __name__ == "__main__":
    main()
