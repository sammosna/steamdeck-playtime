from datetime import datetime, date, time, timedelta
from typing import Dict, List
from python.db.dao import DailyGameTimeDto, Dao
from python.helpers import format_date
from python.models import DayStatistics, Game, GameWithTime, PagedDayStatistics


class Statistics:
    dao: Dao

    def __init__(self, dao: Dao) -> None:
        self.dao = dao

    def daily_statistics_for_period(self,
                                    start: date,
                                    end: date) -> PagedDayStatistics:
        start_time = datetime.combine(
            start, time(00, 00, 00))
        end_time = datetime.combine(
            end, time(23, 59, 59, 999999))
        data = self.dao.fetch_per_day_time_report(start_time, end_time)

        data_as_dict = self._group_by_day(data)

        result: List[DayStatistics] = []
        date_range = self._generate_date_range(start, end)
        for day in date_range:
            date_str = format_date(day)
            if date_str in data_as_dict:
                result.append(self._to_day_statistics(
                    date_str, data_as_dict[date_str]))
            else:
                result.append(DayStatistics(date_str, [], 0))
        return PagedDayStatistics(
            data=result,
            hasPrev=self.dao.is_there_is_data_before(start_time),
            hasNext=self.dao.is_there_is_data_after(end_time)
        )

    def all_time_daily_statistics(self) -> List[DayStatistics]:
        """Every day with recorded playtime, oldest first (days without play are omitted)."""
        # The DAO compares unix timestamps as text, so both bounds must have
        # the same number of digits (10: 2001-09-09 .. 2286-11-20).
        data = self.dao.fetch_per_day_time_report(
            datetime(2001, 9, 10), datetime(2200, 1, 1))
        by_day = self._group_by_day(data)
        return [self._to_day_statistics(date_str, by_day[date_str])
                for date_str in sorted(by_day)]

    def per_game_overall_statistic(self) -> List[GameWithTime]:
        data = self.dao.fetch_overall_playtime()
        result: List[GameWithTime] = []
        for g in data:
            result.append({
                "game": {
                    "id": g.game_id,
                    "name": g.game_name
                },
                "time": g.time
            })
        return result

    def hidden_games(self) -> List[Game]:
        """Games the user chose to hide from the dashboard (tracking is unaffected)."""
        return [Game(g.game_id, g.game_name or "")
                for g in self.dao.fetch_hidden_games()]

    def set_game_hidden(self, game_id: str, hidden: bool) -> None:
        self.dao.set_game_hidden(game_id, hidden)

    def _group_by_day(self, rows: List[DailyGameTimeDto]) -> Dict[str, List[DailyGameTimeDto]]:
        grouped: Dict[str, List[DailyGameTimeDto]] = {}
        for it in rows:
            grouped.setdefault(it.date, []).append(it)
        return grouped

    def _to_day_statistics(self, date_str: str, rows: List[DailyGameTimeDto]) -> DayStatistics:
        return DayStatistics(
            date=date_str,
            games=[GameWithTime(Game(el.game_id, el.game_name), el.time)
                   for el in rows],
            total=sum(el.time for el in rows)
        )

    def _generate_date_range(self, start_date, end_date):
        date_list = []
        curr_date = start_date
        while curr_date <= end_date:
            date_list.append(curr_date)
            curr_date += timedelta(days=1)
        return date_list
