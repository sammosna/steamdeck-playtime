import sqlite3
from python.db.migration import DbMigration
from python.tests.helpers import AbstractDatabaseTest


class TestDbMigration(AbstractDatabaseTest):

    def get_migration(self):
        return DbMigration(self.database)

    def test_database_schema(self):
        self.get_migration().migrate()
        self.assertEqual(
            self._get_table_meta('play_time'),
            [
                (0, 'date_time', 'TEXT', 0, None, 0, 0),
                (1, 'duration', 'INT', 0, None, 0, 0),
                (2, 'game_id', 'TEXT', 0, None, 0, 0),
                (3, 'migrated', 'TEXT', 0, None, 0, 0)
            ]
        )
        self.assertEqual(
            self._get_table_meta('game_dict'),
            [
                (0, 'game_id', 'TEXT', 0, None, 1, 0),
                (1, 'name', 'TEXT', 0, None, 0, 0)
            ]
        )
        self.assertEqual(
            self._get_table_meta('overall_time'),
            [
                (0, 'game_id', 'TEXT', 0, None, 1, 0),
                (1, 'duration', 'INT', 0, None, 0, 0)
            ]
        )
        self.assertEqual(
            self._get_table_meta('hidden_game'),
            [(0, 'game_id', 'TEXT', 0, None, 1, 0)]
        )
        # TODO Check indexes as well

    def _get_table_meta(self, table: str):
        with sqlite3.connect(self.database_file) as connection:
            return connection.execute(
                f"PRAGMA table_xinfo({table})"
            ).fetchall()

    def test_should_accept_database_migrated_by_newer_version(self):
        with sqlite3.connect(self.database_file) as connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS migration (id INT PRIMARY KEY)"
            )
            connection.execute(
                "INSERT INTO migration (id) VALUES (999999)"
            )
        self.get_migration().migrate()
        with sqlite3.connect(self.database_file) as connection:
            versions = connection.execute("SELECT id FROM migration").fetchall()
        self.assertEqual(versions, [(999999,)])
        self.assertEqual(len(self._get_table_meta('hidden_game')), 1)
