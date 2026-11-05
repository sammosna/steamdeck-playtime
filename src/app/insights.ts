import moment from 'moment'
import { DailyStatistics, Game } from './model'

export interface GameShare {
    game: Game
    time: number
}

export interface PeriodInsights {
    total: number
    /** Days up to today (inclusive) in the period */
    elapsedDays: number
    activeDays: number
    dailyAverage: number
    averageOnActiveDays: number
    /** Day with most playtime, undefined when nothing was played */
    bestDay?: { date: string; time: number }
    /** Longest run of consecutive active days */
    longestStreak: number
    topGame?: GameShare & { share: number }
    gamesCount: number
    /** Relative change vs previous period total, undefined without a baseline */
    deltaVsPrevious?: number
}

/** Total time per game, sorted by time descending. */
export function timePerGame(statistics: DailyStatistics[]): GameShare[] {
    const byId = new Map<string, GameShare>()
    for (const day of statistics) {
        for (const it of day.games) {
            const entry = byId.get(it.game.id)
            if (entry) {
                entry.time += it.time
                entry.game = it.game
            } else {
                byId.set(it.game.id, { game: it.game, time: it.time })
            }
        }
    }
    return [...byId.values()].sort((a, b) => b.time - a.time)
}

export function computeInsights(
    statistics: DailyStatistics[],
    previous: DailyStatistics[] = [],
    today: Date = new Date()
): PeriodInsights {
    const endOfToday = moment(today).endOf('day')
    const elapsed = statistics.filter((it) => moment(it.date).isSameOrBefore(endOfToday))
    const total = statistics.reduce((acc, it) => acc + it.total, 0)
    const activeDays = statistics.filter((it) => it.total > 0).length

    let best: PeriodInsights['bestDay']
    let longestStreak = 0
    let streak = 0
    for (const day of statistics) {
        if (day.total > 0) {
            streak++
            longestStreak = Math.max(longestStreak, streak)
            if (!best || day.total > best.time) {
                best = { date: day.date, time: day.total }
            }
        } else {
            streak = 0
        }
    }

    const games = timePerGame(statistics)
    const previousTotal = previous.reduce((acc, it) => acc + it.total, 0)

    return {
        total,
        elapsedDays: elapsed.length,
        activeDays,
        dailyAverage: elapsed.length > 0 ? total / elapsed.length : 0,
        averageOnActiveDays: activeDays > 0 ? total / activeDays : 0,
        bestDay: best,
        longestStreak,
        topGame:
            games.length > 0
                ? { ...games[0], share: total > 0 ? games[0].time / total : 0 }
                : undefined,
        gamesCount: games.length,
        deltaVsPrevious:
            previousTotal > 0 ? (total - previousTotal) / previousTotal : undefined,
    }
}
