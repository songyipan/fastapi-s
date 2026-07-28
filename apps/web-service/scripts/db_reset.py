"""删除并重建开发数据库（读取项目根目录 .env 中的 DB_* 配置）。"""

from contextlib import contextmanager

import psycopg2
from dotenv import load_dotenv

load_dotenv()

from app.core.config import db_settings  # noqa: E402


@contextmanager
def _admin_cursor():
    conn = psycopg2.connect(
        host=db_settings.host,
        port=db_settings.port,
        user=db_settings.user,
        password=db_settings.password,
        dbname="postgres",
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        yield cur
    finally:
        cur.close()
        conn.close()


def main() -> None:
    db_name = db_settings.name
    with _admin_cursor() as cur:
        cur.execute(
            "SELECT pg_terminate_backend(pid) "
            "FROM pg_stat_activity "
            "WHERE datname = %s AND pid <> pg_backend_pid()",
            (db_name,),
        )
        cur.execute(f"DROP DATABASE IF EXISTS {db_name}")
        cur.execute(f"CREATE DATABASE {db_name}")
    print(f"Database '{db_name}' has been reset.")


if __name__ == "__main__":
    main()
