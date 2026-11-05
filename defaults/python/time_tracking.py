from datetime import datetime
import logging
from typing import Dict, List
from python.db.dao import Dao
from python.helpers import end_of_day


DATE_FORMAT = "%Y-%m-%d"
logger = logging.getLogger()


class TimeTracking:
    dao: Dao

    def __init__(self, dao: Dao) -> None:
        self.dao = dao

    def add_time(self,
                 started_at: int,
                 ended_at: int,
                 game_id: str,
                 game_name: str):
        self.dao.save_game_dict(game_id, game_name)
        for (i_started_at, i_ended_at) in self._split_by_day(
                started_at, ended_at):
            self.dao.save_play_time(
                datetime.fromtimestamp(i_started_at),
                i_ended_at - i_started_at,
                game_id)

    @staticmethod
    def _split_by_day(started_at, ended_at):
        """Split [started_at, ended_at) at every local midnight, so a session
        that spans several days is attributed to each day it really covers.
        Empty or negative intervals produce nothing."""
        intervals = []
        cursor = started_at
        while cursor < ended_at:
            next_midnight = end_of_day(
                datetime.fromtimestamp(cursor)).timestamp() + 1
            if next_midnight >= ended_at:
                intervals.append((cursor, ended_at))
                break
            intervals.append((cursor, next_midnight))
            cursor = next_midnight
        return intervals

    def apply_manual_time_for_games(self,
                                    list_of_game_stats: List[Dict],
                                    source: str):
        now = datetime.now()
        for stat in list_of_game_stats:
            self.dao.apply_manual_time_for_game(
                now,
                stat["game"]["id"],
                stat["game"]["name"],
                stat["time"],
                source
            )
