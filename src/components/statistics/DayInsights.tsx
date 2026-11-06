import { FC } from 'react'
import moment from 'moment'
import { MdEmojiEvents, MdSpeed, MdSportsEsports, MdTimer } from 'react-icons/md'
import { DailyStatistics, Game } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { computeDayInsights, gameRowsFromTotals } from '../../app/insights'
import { Card } from '../Card'
import { GamesTable } from './GamesTable'
import { Tile, TileGroup } from './Tiles'

const GREEN = '#9dd866'
const RED = '#ca472f'

/** Insights and per game breakdown of one day, compared against its period. */
export const DayInsights: FC<{
    day: DailyStatistics
    period: DailyStatistics[]
    onSelectGame?: (game: Game) => void
}> = ({ day, period, onSelectGame }) => {
    const insights = computeDayInsights(day, period)
    const title = moment(day.date).format('dddd D MMMM YYYY')
    if (insights.total <= 0) {
        return (
            <Card title={title}>
                <div style={{ opacity: 0.7 }}>Nothing played.</div>
            </Card>
        )
    }
    const delta = insights.vsAverage
    return (
        <>
            <Card title={title}>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    {humanReadableTime(insights.total)}
                </div>
                <TileGroup>
                    <Tile
                        icon={MdSportsEsports}
                        label="Games played"
                        value={`${insights.gamesCount}`}
                    />
                    {insights.rank !== undefined && (
                        <Tile
                            icon={MdEmojiEvents}
                            label="Rank in period"
                            value={`#${insights.rank} of ${insights.playedDays}`}
                            hint={insights.rank === 1 ? 'Busiest day' : undefined}
                        />
                    )}
                    {delta !== undefined && (
                        <Tile
                            icon={MdSpeed}
                            label="vs average day played"
                            value={`${delta >= 0 ? '+' : '-'}${Math.abs(Math.round(delta * 100))}%`}
                            valueColor={delta >= 0 ? GREEN : RED}
                        />
                    )}
                    {insights.topGame && (
                        <Tile
                            icon={MdTimer}
                            label="Most played"
                            value={`${insights.topGame.game.name} · ${Math.round(
                                insights.topGame.share * 100
                            )}%`}
                        />
                    )}
                </TileGroup>
            </Card>
            <GamesTable rows={gameRowsFromTotals(day.games)} defaultExpanded onSelect={onSelectGame} />
        </>
    )
}
