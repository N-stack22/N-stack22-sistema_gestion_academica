"""Aplica sql/17_funciones_listados.sql usando DATABASE_URL."""

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)

from src.services.db_connection import get_connection, has_database_url


def main() -> None:
    if not has_database_url():
        print("Configure DATABASE_URL en Backend/.env antes de ejecutar este script.")
        return

    sql_path = Path(__file__).resolve().parents[1] / "sql" / "17_funciones_listados.sql"
    sql = sql_path.read_text(encoding="utf-8")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()

    print("Funciones de listado aplicadas correctamente.")


if __name__ == "__main__":
    main()
