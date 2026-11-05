import { DailyStatistics, GameWithTime } from './model'

/** Drops hidden games from per-day statistics, recomputing each day's total. */
export function excludeHiddenFromDays(
    days: DailyStatistics[],
    hiddenIds: ReadonlySet<string>
): DailyStatistics[] {
    if (hiddenIds.size === 0) {
        return days
    }
    return days.map((day) => {
        const games = day.games.filter((it) => !hiddenIds.has(it.game.id))
        return { ...day, games, total: games.reduce((acc, it) => acc + it.time, 0) }
    })
}

export function excludeHiddenFromTotals(
    games: GameWithTime[],
    hiddenIds: ReadonlySet<string>
): GameWithTime[] {
    return hiddenIds.size === 0 ? games : games.filter((it) => !hiddenIds.has(it.game.id))
}
