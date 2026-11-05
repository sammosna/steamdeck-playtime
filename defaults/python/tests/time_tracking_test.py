import dataclasses
import unittest
from datetime import datetime, timedelta
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.statistics import Statistics
from python.tests.helpers import AbstractDatabaseTest
from python.time_tracking import TimeTracking


class TestPlayTime(AbstractDatabaseTest):
    time_tracking: TimeTracking

    def setUp(self) -> None:
        super().setUp()
        DbMigration(db=self.database).migrate()
        self.time_tracking = TimeTracking(Dao(self.database))
        self.playtime_statistics = Statistics(Dao(self.database))

    def test_should_add_new_interval(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual([dataclasses.asdict(r) for r in result.data], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            }
        ])

    def test_should_list_only_days_with_playtime_for_all_time(self):
        first = datetime(2022, 1, 1, 9, 0)
        later = datetime(2022, 3, 5, 20, 0)
        self.time_tracking.add_time(
            first.timestamp(), (first + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")
        self.time_tracking.add_time(
            later.timestamp(), (later + timedelta(minutes=30)).timestamp(), "200", "Hades")
        self.time_tracking.add_time(
            (later + timedelta(hours=1)).timestamp(),
            (later + timedelta(hours=2)).timestamp(), "100", "Zelda BOTW")

        result = self.playtime_statistics.all_time_daily_statistics()

        self.assertEqual([(r.date, r.total) for r in result],
                         [("2022-01-01", 3600), ("2022-03-05", 5400)])
        self.assertEqual(sorted(g.game.id for g in result[1].games), ["100", "200"])

    def test_should_add_new_interval_to_existing_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(),
            (now + timedelta(hours=1)).timestamp(), "3647351456", "Zelda BOTW")
        self.time_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=2)).timestamp(), "3647351456", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual([dataclasses.asdict(r) for r in result.data], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "3647351456",
                            "name": "Zelda BOTW",
                        },
                        "time": 7200
                    }
                ],
                "total": 7200
            }
        ])

    def test_should_split_interval_in_two_day_in_case_night_session(self):
        now = datetime(2022, 1, 1, 23, 0)
        next_day = now + timedelta(hours=2)
        self.time_tracking.add_time(
            now.timestamp(), next_day.timestamp(), "100", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), next_day.date())
        self.assertEqual([dataclasses.asdict(r) for r in result.data], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            },
            {
                "date": "2022-01-02",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            }
        ])

    def test_should_sum_total_time_per_day(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")
        self.time_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=1, minutes=30)).timestamp(),
            "101",
            "Doom"
        )

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual([dataclasses.asdict(r) for r in result.data], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    },
                    {
                        "game": {
                            "id": "101",
                            "name": "Doom",
                        },
                        "time": 1800
                    }
                ],
                "total": 3600 + 1800
            }
        ])

    def test_return_only_data_in_requested_interval_without_gaps(self):
        date_01 = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(date_01.timestamp(
        ), (date_01 + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        date_02 = datetime(2022, 1, 2, 9, 0)
        self.time_tracking.add_time(
            date_02.timestamp(),
            (date_02 +
             timedelta(
                 hours=1)).timestamp(),
            "101",
            "Doom")

        date_03 = datetime(2022, 1, 3, 9, 0)
        self.time_tracking.add_time(date_03.timestamp(
        ), (date_03 + timedelta(minutes=30)).timestamp(), "102", "Zelda Minish Cap")

        date_04 = datetime(2022, 1, 4, 9, 0)
        self.time_tracking.add_time(date_04.timestamp(
        ), (date_04 + timedelta(minutes=30)).timestamp(), "100", "Zelda BOTW")

        date_08 = datetime(2022, 1, 8, 9, 0)

        result = self.playtime_statistics.daily_statistics_for_period(
            date_02.date(), date_08.date())
        # pylint: disable=C0103
        self.maxDiff = None
        self.assertEqual([dataclasses.asdict(r) for r in result.data], [
            {
                "date": "2022-01-02",
                "games": [
                    {
                        "game": {
                            "id": "101",
                            "name": "Doom",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            },
            {
                "date": "2022-01-03",
                "games": [
                    {
                        "game": {
                            "id": "102",
                            "name": "Zelda Minish Cap",
                        },
                        "time": 1800
                    }
                ],
                "total": 1800
            },
            {
                "date": "2022-01-04",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 1800
                    }
                ],
                "total": 1800
            },
            {
                "date": "2022-01-05",
                "games": [],
                "total": 0
            },
            {
                "date": "2022-01-06",
                "games": [],
                "total": 0
            },
            {
                "date": "2022-01-07",
                "games": [],
                "total": 0
            },
            {
                "date": "2022-01-08",
                "games": [],
                "total": 0
            }
        ])

    def test_should_calculate_overall_time_for_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "101", "Zelda BOTW")
        self.time_tracking.add_time((now + timedelta(hours=1)).timestamp(
        ), (now + timedelta(hours=1, minutes=30)).timestamp(), "101", "Zelda BOTW")

        result = self.playtime_statistics.per_game_overall_statistic()
        self.assertEqual(result[0]["time"], 3600 + 1800)

    def test_should_split_session_across_every_day_it_covers(self):
        start = datetime(2022, 1, 1, 20, 0)
        end = datetime(2022, 1, 4, 10, 0)
        self.time_tracking.add_time(
            start.timestamp(), end.timestamp(), "100", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            start.date(), end.date())
        self.assertEqual(
            [(r.date, r.total) for r in result.data],
            [
                ("2022-01-01", 4 * 3600),
                ("2022-01-02", 24 * 3600),
                ("2022-01-03", 24 * 3600),
                ("2022-01-04", 10 * 3600),
            ])
        overall = self.playtime_statistics.per_game_overall_statistic()
        self.assertEqual(overall[0]["time"], 62 * 3600)

    def test_should_ignore_empty_or_negative_interval(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(), now.timestamp(), "100", "Zelda BOTW")
        self.time_tracking.add_time(
            now.timestamp(),
            (now - timedelta(minutes=5)).timestamp(),
            "100",
            "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual(result.data[0].total, 0)
        self.assertEqual(
            self.playtime_statistics.per_game_overall_statistic(), [])

    def test_should_keep_known_game_name_when_name_is_missing(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.time_tracking.add_time(
            now.timestamp(),
            (now + timedelta(hours=1)).timestamp(),
            "100",
            "Zelda BOTW")
        self.time_tracking.add_time(
            (now + timedelta(hours=2)).timestamp(),
            (now + timedelta(hours=3)).timestamp(),
            "100",
            "")

        result = self.playtime_statistics.per_game_overall_statistic()
        self.assertEqual(result[0]["game"]["name"], "Zelda BOTW")
        self.assertEqual(result[0]["time"], 7200)


if __name__ == '__main__':
    unittest.main()
