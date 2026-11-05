import { FC } from 'react'
import moment from 'moment'
import { humanReadableTime } from '../../app/formatters'
import { AllTimeInsights } from '../../app/allTimeInsights'
import { GameOverview } from '../../app/gameInsights'
import { Card } from '../Card'
import {
    MdBolt,
    MdCalendarMonth,
    MdDateRange,
    MdEmojiEvents,
    MdEventAvailable,
    MdHistory,
    MdLayers,
    MdLocalFireDepartment,
    MdMilitaryTech,
    MdPieChart,
    MdSchedule,
    MdSpeed,
    MdTimer,
    MdTrendingDown,
    MdTrendingUp,
    MdWorkspacePremium,
    MdLeaderboard,
    MdUpdate,
} from 'react-icons/md'
import { Tile, TileGroup } from './Tiles'

const GREEN = '#9dd866'
const RED = '#ca472f'

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`
const days = (n: number) => `${n} day${n == 1 ? '' : 's'}`
const dayText = (date: string) => moment(date).format('ddd D MMM YYYY')
const shortDay = (date: string) => moment(date).format('D MMM YY')

function sinceText(count: number) {
    if (count <= 0) {
        return 'today'
    }
    return count === 1 ? 'yesterday' : `${count} days ago`
}

/** Insights of one game. `insights` covers only that game, `overview` compares it with the library. */
export const GameInsights: FC<{ insights: AllTimeInsights; overview: GameOverview }> = ({
    insights,
    overview,
}) => {
    const change = insights.last30DaysChange
    const activeShare =
        insights.spanDays > 0 ? insights.activeDays / insights.spanDays : 0
    const otherGamesShare =
        insights.activeDays > 0 ? overview.daysWithOtherGames / insights.activeDays : 0

    return (
        <Card title="Insights">
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '12px',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    {humanReadableTime(insights.total)}
                </div>
                {insights.firstDay && (
                    <div style={{ opacity: 0.6 }}>since {dayText(insights.firstDay)}</div>
                )}
            </div>

            <TileGroup title="In your library">
                <Tile
                    icon={MdPieChart}
                    label="Share of all play time"
                    value={percent(overview.share)}
                />
                {overview.rank !== undefined && (
                    <Tile
                        icon={MdLeaderboard}
                        label="Rank"
                        value={`#${overview.rank}`}
                        hint={`of ${overview.gamesCount} games`}
                    />
                )}
                {overview.lastPlayed && overview.daysSinceLastPlayed !== undefined && (
                    <Tile
                        icon={MdUpdate}
                        label="Last played"
                        value={sinceText(overview.daysSinceLastPlayed)}
                        hint={dayText(overview.lastPlayed)}
                    />
                )}
                {insights.firstDay && (
                    <Tile
                        icon={MdHistory}
                        label="First played"
                        value={shortDay(insights.firstDay)}
                        hint={`${days(insights.spanDays)} ago`}
                    />
                )}
            </TileGroup>

            <TileGroup title="Recent form">
                <Tile
                    icon={MdSchedule}
                    label="Last 30 days"
                    value={humanReadableTime(insights.last30Days)}
                />
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
                />
            </TileGroup>

            <TileGroup title="Averages">
                <Tile
                    icon={MdTimer}
                    label="Per day played"
                    value={humanReadableTime(insights.averageOnActiveDays)}
                />
                <Tile
                    icon={MdSpeed}
                    label="Per day"
                    value={humanReadableTime(insights.dailyAverage)}
                />
                <Tile
                    icon={MdDateRange}
                    label="Per week"
                    value={humanReadableTime(insights.weeklyAverage)}
                />
                <Tile
                    icon={MdCalendarMonth}
                    label="Per month"
                    value={humanReadableTime(insights.monthlyAverage)}
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
                        hint={moment(insights.bestMonth.month, 'YYYY-MM').format(
                            'MMMM YYYY'
                        )}
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
                <Tile
                    icon={MdBolt}
                    label="Marathon days"
                    value={`${insights.marathonDays}`}
                    hint="4h or more"
                />
            </TileGroup>

            <TileGroup title="Habits">
                <Tile
                    icon={MdEventAvailable}
                    label="Days played"
                    value={`${insights.activeDays} of ${insights.spanDays}`}
                    hint={`${percent(activeShare)} of days since the first`}
                />
                <Tile
                    icon={MdLayers}
                    label="Played alongside others"
                    value={percent(otherGamesShare)}
                    hint="of the days you played it"
                />
            </TileGroup>
        </Card>
    )
}
