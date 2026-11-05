import { FC } from 'react'
import moment from 'moment'
import { humanReadableTime } from '../../app/formatters'
import { AllTimeInsights as Insights } from '../../app/allTimeInsights'
import { Card } from '../Card'
import { Tile, TileGroup } from './Tiles'

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`
const days = (n: number) => `${n} day${n == 1 ? '' : 's'}`
const dayText = (date: string) => moment(date).format('ddd D MMM YYYY')
const shortDay = (date: string) => moment(date).format('D MMM YY')

export const AllTimeInsights: FC<{ insights: Insights }> = ({ insights }) => {
    const change = insights.last30DaysChange
    const busiestWeekday = insights.weekdayTotals.indexOf(Math.max(...insights.weekdayTotals))
    const activeShare = insights.spanDays > 0 ? insights.activeDays / insights.spanDays : 0

    return (
        <Card title="All time insights">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    {humanReadableTime(insights.total)}
                </div>
                {insights.firstDay && (
                    <div style={{ opacity: 0.6 }}>since {dayText(insights.firstDay)}</div>
                )}
            </div>

            <TileGroup title="Recent form">
                <Tile label="Last 30 days" value={humanReadableTime(insights.last30Days)} />
                {change !== undefined && (
                    <Tile
                        label="vs previous 30 days"
                        value={`${change >= 0 ? '▲' : '▼'} ${percent(Math.abs(change))}`}
                        hint={change >= 0 ? 'more than before' : 'less than before'}
                    />
                )}
                <Tile
                    label="Current streak"
                    value={days(insights.currentStreak)}
                    hint={insights.currentStreak > 0 ? 'keep it going' : 'not playing right now'}
                />
            </TileGroup>

            <TileGroup title="Averages">
                <Tile label="Per day" value={humanReadableTime(insights.dailyAverage)} />
                <Tile label="Per week" value={humanReadableTime(insights.weeklyAverage)} />
                <Tile label="Per month" value={humanReadableTime(insights.monthlyAverage)} />
                <Tile
                    label="On days played"
                    value={humanReadableTime(insights.averageOnActiveDays)}
                />
            </TileGroup>

            <TileGroup title="Records">
                {insights.bestDay && (
                    <Tile
                        label="Best day"
                        value={humanReadableTime(insights.bestDay.time)}
                        hint={dayText(insights.bestDay.date)}
                    />
                )}
                {insights.bestWeek && (
                    <Tile
                        label="Best week"
                        value={humanReadableTime(insights.bestWeek.time)}
                        hint={`from ${shortDay(insights.bestWeek.start)}`}
                    />
                )}
                {insights.bestMonth && (
                    <Tile
                        label="Best month"
                        value={humanReadableTime(insights.bestMonth.time)}
                        hint={moment(insights.bestMonth.month, 'YYYY-MM').format('MMMM YYYY')}
                    />
                )}
                <Tile
                    label="Longest streak"
                    value={days(insights.longestStreak.days)}
                    hint={
                        insights.longestStreak.start && insights.longestStreak.end
                            ? `${shortDay(insights.longestStreak.start)} – ${shortDay(
                                  insights.longestStreak.end
                              )}`
                            : undefined
                    }
                />
                <Tile label="Longest break" value={days(insights.longestBreak)} />
                <Tile label="Marathon days" value={`${insights.marathonDays}`} hint="4h or more" />
            </TileGroup>

            <TileGroup title="Habits">
                <Tile
                    label="Days played"
                    value={`${insights.activeDays} of ${insights.spanDays}`}
                    hint={percent(activeShare)}
                />
                {insights.total > 0 && (
                    <Tile
                        label="Busiest weekday"
                        value={moment().isoWeekday(busiestWeekday + 1).format('dddd')}
                        hint={`${percent(
                            insights.weekdayTotals[busiestWeekday] / insights.total
                        )} of your time`}
                    />
                )}
                <Tile label="Games played" value={`${insights.gamesCount}`} />
                {insights.mostGamesDay && (
                    <Tile
                        label="Most games in a day"
                        value={`${insights.mostGamesDay.count}`}
                        hint={dayText(insights.mostGamesDay.date)}
                    />
                )}
            </TileGroup>
        </Card>
    )
}
