import { FC } from 'react'
import moment from 'moment'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { computeInsights } from '../../app/insights'
import { Card } from '../Card'
import { Tile, TileGroup } from './Tiles'

const GREEN = '#9dd866'
const RED = '#ca472f'

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`

export const PeriodInsights: FC<{
    statistics: DailyStatistics[]
    previous: DailyStatistics[]
}> = (props) => {
    const insights = computeInsights(props.statistics, props.previous)
    const delta = insights.deltaVsPrevious
    const days = (n: number) => `${n} day${n == 1 ? '' : 's'}`
    return (
        <Card title="Insights">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    {humanReadableTime(insights.total)}
                </div>
                {delta !== undefined && (
                    <div
                        style={{
                            padding: '2px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: delta >= 0 ? GREEN : RED,
                            background: 'rgba(255, 255, 255, 0.07)',
                        }}
                    >
                        {delta >= 0 ? '▲' : '▼'} {percent(Math.abs(delta))} vs previous
                    </div>
                )}
            </div>
            <TileGroup>
                <Tile label="Daily average" value={humanReadableTime(insights.dailyAverage)} />
                <Tile
                    label="Days played"
                    value={`${insights.activeDays} of ${insights.elapsedDays}`}
                />
                <Tile
                    label="Average on days played"
                    value={humanReadableTime(insights.averageOnActiveDays)}
                />
                <Tile label="Longest streak" value={days(insights.longestStreak)} />
                {insights.bestDay && (
                    <Tile
                        label="Best day"
                        value={humanReadableTime(insights.bestDay.time)}
                        hint={moment(insights.bestDay.date).format('ddd D MMM')}
                    />
                )}
                {insights.topGame && (
                    <Tile
                        label="Most played"
                        value={`${insights.topGame.game.name} · ${percent(
                            insights.topGame.share
                        )}`}
                    />
                )}
            </TileGroup>
        </Card>
    )
}
