import { DailyStatistics } from '../../app/model'
import { timePerGame } from '../../app/insights'

export interface GameSeries {
    name: string
    color: string
    gameIds: Set<string>
    /** Total seconds in the period */
    time: number
}

const PALETTE = ['#1A9FFF', '#f6c85f', '#9dd866', '#ca472f', '#a77fd4']
const OTHER_COLOR = '#6b7280'

/** Top games of the period (by time) get their own series, the rest is grouped in "Other". */
export function buildSeries(statistics: DailyStatistics[]): GameSeries[] {
    const games = timePerGame(statistics)
    const series: GameSeries[] = games.slice(0, PALETTE.length).map((it, i) => ({
        name: it.game.name || 'Unknown',
        color: PALETTE[i],
        gameIds: new Set([it.game.id]),
        time: it.time,
    }))
    const rest = games.slice(PALETTE.length)
    if (rest.length > 0) {
        series.push({
            name: 'Other',
            color: OTHER_COLOR,
            gameIds: new Set(rest.map((it) => it.game.id)),
            time: rest.reduce((acc, it) => acc + it.time, 0),
        })
    }
    return series
}

/** Seconds played in `day` that belong to `series`. */
export function timeInSeries(day: DailyStatistics, series: GameSeries): number {
    return day.games.reduce(
        (acc, it) => (series.gameIds.has(it.game.id) ? acc + it.time : acc),
        0
    )
}
