"""Read-only dev backend: serves the plugin's statistics API from a copy of dev/storage.db.

Mirrors the `Plugin` methods in main.py that the report pages call. Run through
`pnpm dev`, which starts it next to Vite and proxies /api to it.
"""
import dataclasses
import json
import shutil
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "defaults"))

# pylint: disable=wrong-import-position
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.db.sqlite_db import SqlLiteDb
from python.helpers import parse_date
from python.statistics import Statistics

# Work on a throw-away copy: migrations must never touch the original.
db_copy = Path(tempfile.mkdtemp()) / "storage.db"
shutil.copy(ROOT / "dev" / "storage.db", db_copy)
db = SqlLiteDb(str(db_copy))
DbMigration(db).migrate()
statistics = Statistics(Dao(db))

METHODS = {
    "daily_statistics_for_period": lambda a: dataclasses.asdict(
        statistics.daily_statistics_for_period(
            parse_date(a["start_date"]), parse_date(a["end_date"]))),
    "all_time_daily_statistics": lambda a: [
        dataclasses.asdict(day) for day in statistics.all_time_daily_statistics()],
    "per_game_overall_statistics": lambda a: statistics.per_game_overall_statistic(),
}


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):  # pylint: disable=invalid-name
        method = self.path.removeprefix("/api/")
        args = json.loads(self.rfile.read(int(self.headers["Content-Length"])) or b"{}")
        if method in METHODS:
            body = {"success": True, "result": METHODS[method](args)}
        else:  # writes are intentionally not supported in dev
            body = {"success": False, "result": f"{method} is not available in dev"}
        payload = json.dumps(body).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *_):
        pass


if __name__ == "__main__":
    print("Dev backend on http://127.0.0.1:18787", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 18787), Handler).serve_forever()
