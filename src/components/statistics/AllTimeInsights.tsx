import { FC } from 'react'
import moment from 'moment'
import { humanReadableTime } from '../../app/formatters'
import { AllTimeInsights as Insights } from '../../app/allTimeInsights'
import { Card } from '../Card'
import {
    MdBolt,
    MdCalendarMonth,
    MdDateRange,
    MdEmojiEvents,
    MdEventAvailable,
    MdLayers,
    MdLibraryBooks,
    MdLocalCafe,
    MdLocalFireDepartment,
    MdMilitaryTech,
    MdSchedule,
    MdSpeed,
    MdStar,
    MdTimer,
    MdTrendingDown,
    MdTrendingUp,
    MdWorkspacePremium,
} from 'react-icons/md'
import { Tile, TileGroup } from './Tiles'

const GREEN = '#9dd866'
const RED = '#ca472f'

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
                <Tile icon={MdSchedule} label="Last 30 days" value={humanReadableTime(insights.last30Days)} />
                {change !== undefined && (
                    <Tile
                        icon={change >= 0 ? MdTrendingUp : MdTrendingDown}
                        valueColor={change >= 0 ? GREEN : RED}
                        label="vs previous 30 days"
                        value={`${change >= 0 ? '▲' : '▼'} ${percent(Math.abs(change))}`}
                        hint={change >= 0 ? 'more than before' : 'less than before'}
                    />
                )}
                <Tile
                    icon={MdLocalFireDepartment}
                    label="Current streak"
                    value={days(insights.currentStreak)}
                    hint={insights.currentStreak > 0 ? 'keep it going' : 'not playing right now'}
                />
            </TileGroup>

            <TileGroup title="Averages">
                <Tile icon={MdSpeed} label="Per day" value={humanReadableTime(insights.dailyAverage)} />
                <Tile icon={MdDateRange} label="Per week" value={humanReadableTime(insights.weeklyAverage)} />
                <Tile icon={MdCalendarMonth} label="Per month" value={humanReadableTime(insights.monthlyAverage)} />
                <Tile
                    icon={MdTimer}
                    label="On days played"
                    value={humanReadableTime(insights.averageOnActiveDays)}
                />
            </TileGroup>

            <TileGroup title="Records">
                {insights.bestDay && (
                    <Tile
                        icon={MdEmojiEvents}
                        label="Best day"
                        value={humanReadableTime(insights.bestDay.time)}
                        hint={dayText(insights.bestDay.date)}
                    />
                )}
                {insights.bestWeek && (
                    <Tile
                        icon={MdMilitaryTech}
                        label="Best week"
                        value={humanReadableTime(insights.bestWeek.time)}
                        hint={`from ${shortDay(insights.bestWeek.start)}`}
                    />
                )}
                {insights.bestMonth && (
                    <Tile
                        icon={MdWorkspacePremium}
                        label="Best month"
                        value={humanReadableTime(insights.bestMonth.time)}
                        hint={moment(insights.bestMonth.month, 'YYYY-MM').format('MMMM YYYY')}
                    />
                )}
                <Tile
                    icon={MdLocalFireDepartment}
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
                <Tile icon={MdLocalCafe} label="Longest break" value={days(insights.longestBreak)} />
                <Tile icon={MdBolt} label="Marathon days" value={`${insights.marathonDays}`} hint="4h or more" />
            </TileGroup>

            <TileGroup title="Habits">
                <Tile
                    icon={MdEventAvailable}
                    label="Days played"
                    value={`${insights.activeDays} of ${insights.spanDays}`}
                    hint={percent(activeShare)}
                />
                {insights.total > 0 && (
                    <Tile
                        icon={MdStar}
                        label="Busiest weekday"
                        value={moment().isoWeekday(busiestWeekday + 1).format('dddd')}
                        hint={`${percent(
                            insights.weekdayTotals[busiestWeekday] / insights.total
                        )} of your time`}
                    />
                )}
                <Tile icon={MdLibraryBooks} label="Games played" value={`${insights.gamesCount}`} />
                {insights.mostGamesDay && (
                    <Tile
                        icon={MdLayers}
                        label="Most games in a day"
                        value={`${insights.mostGamesDay.count}`}
                        hint={dayText(insights.mostGamesDay.date)}
                    />
                )}
            </TileGroup>
        </Card>
    )
}
