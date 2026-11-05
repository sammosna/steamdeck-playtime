import moment from 'moment'
import { DailyStatistics } from './model'

/** Days on which the game was played, reduced to that game only. */
export function daysForGame(days: DailyStatistics[], gameId: string): DailyStatistics[] {
    const result: DailyStatistics[] = []
    for (const day of days) {
        const games = day.games.filter((it) => it.game.id === gameId && it.time > 0)
        if (games.length > 0) {
            result.push({
                ...day,
                games,
                total: games.reduce((acc, it) => acc + it.time, 0),
            })
        }
    }
    return result
}

export interface GameOverview {
    /** Share of the time spent on all (visible) games */
    share: number
    /** 1 = most played; undefined if the game has no time */
    rank?: number
    gamesCount: number
    lastPlayed?: string
    /** Whole days between the last session and today */
    daysSinceLastPlayed?: number
    /** Days the game was played on that also had other games */
    daysWithOtherGames: number
}

/** How the game compares to the rest of the library. `days` covers every game. */
export function computeGameOverview(
    days: DailyStatistics[],
    gameId: string,
    today: Date = new Date()
): GameOverview {
    const totals = new Map<string, number>()
    let all = 0
    let lastPlayed: string | undefined
    let daysWithOtherGames = 0
    for (const day of days) {
        let playedToday = false
        let others = false
        for (const it of day.games) {
            if (it.time <= 0) {
                continue
            }
            totals.set(it.game.id, (totals.get(it.game.id) ?? 0) + it.time)
            all += it.time
            if (it.game.id === gameId) {
                playedToday = true
            } else {
                others = true
            }
        }
        if (playedToday) {
            if (!lastPlayed || day.date > lastPlayed) {
                lastPlayed = day.date
            }
            if (others) {
                daysWithOtherGames++
            }
        }
    }
    const own = totals.get(gameId) ?? 0
    const higher = [...totals.values()].filter((it) => it > own).length
    return {
        share: all > 0 ? own / all : 0,
        rank: own > 0 ? higher + 1 : undefined,
        gamesCount: totals.size,
        lastPlayed,
        daysSinceLastPlayed: lastPlayed
            ? moment(today).startOf('day').diff(moment(lastPlayed), 'days')
            : undefined,
        daysWithOtherGames,
    }
}
