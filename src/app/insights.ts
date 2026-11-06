import moment from 'moment'
import { DailyStatistics, Game, GameWithTime } from './model'

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

export interface GameRow {
    game: Game
    time: number
    /** Share of the total time of the listed games */
    share: number
    /** The fields below are only known for per-day statistics */
    activeDays?: number
    averagePerActiveDay?: number
    bestDay?: { date: string; time: number }
    lastPlayed?: string
    /** Relative change vs the previous period, 'new' if it was not played back then */
    change?: number | 'new'
}

/** Per game breakdown of a period, sorted by time descending. */
export function gameRowsForPeriod(
    statistics: DailyStatistics[],
    previous: DailyStatistics[] = []
): GameRow[] {
    const byId = new Map<string, GameRow>()
    for (const day of statistics) {
        for (const it of day.games) {
            const row = byId.get(it.game.id) ?? {
                game: it.game,
                time: 0,
                share: 0,
                activeDays: 0,
            }
            row.game = it.game
            row.time += it.time
            if (it.time > 0) {
                row.activeDays = (row.activeDays ?? 0) + 1
                row.lastPlayed = day.date
                if (!row.bestDay || it.time > row.bestDay.time) {
                    row.bestDay = { date: day.date, time: it.time }
                }
            }
            byId.set(it.game.id, row)
        }
    }
    const previousTime = new Map(
        previous.flatMap((day) => day.games).map((it) => [it.game.id, 0] as [string, number])
    )
    previous
        .flatMap((day) => day.games)
        .forEach((it) => previousTime.set(it.game.id, previousTime.get(it.game.id)! + it.time))
    const hasBaseline = previousTime.size > 0

    const rows = [...byId.values()]
    const total = rows.reduce((acc, it) => acc + it.time, 0)
    rows.forEach((row) => {
        row.share = total > 0 ? row.time / total : 0
        row.averagePerActiveDay = row.activeDays ? row.time / row.activeDays : 0
        const before = previousTime.get(row.game.id) ?? 0
        if (before > 0) {
            row.change = (row.time - before) / before
        } else if (hasBaseline) {
            row.change = 'new'
        }
    })
    return rows.sort((a, b) => b.time - a.time)
}

/** Breakdown from plain per game totals (e.g. all time). */
export function gameRowsFromTotals(games: GameWithTime[]): GameRow[] {
    const total = games.reduce((acc, it) => acc + it.time, 0)
    return games
        .map((it) => ({ game: it.game, time: it.time, share: total > 0 ? it.time / total : 0 }))
        .sort((a, b) => b.time - a.time)
}

/** Total time per game, sorted by time descending. */
export function timePerGame(statistics: DailyStatistics[]): GameShare[] {
    return gameRowsForPeriod(statistics).map(({ game, time }) => ({ game, time }))
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

export interface DayInsights {
    total: number
    gamesCount: number
    topGame?: GameShare & { share: number }
    /** 1-based position among the played days of the period (1 = busiest) */
    rank?: number
    playedDays: number
    /** Relative difference vs the average of the played days of the period */
    vsAverage?: number
}

/** Insights of a single day, compared against the days of the period it belongs to. */
export function computeDayInsights(day: DailyStatistics, period: DailyStatistics[]): DayInsights {
    const games = timePerGame([day])
    const played = period.filter((it) => it.total > 0)
    const average = played.length > 0 ? played.reduce((acc, it) => acc + it.total, 0) / played.length : 0
    return {
        total: day.total,
        gamesCount: games.length,
        topGame:
            games.length > 0
                ? { ...games[0], share: day.total > 0 ? games[0].time / day.total : 0 }
                : undefined,
        rank: day.total > 0 ? played.filter((it) => it.total > day.total).length + 1 : undefined,
        playedDays: played.length,
        vsAverage: day.total > 0 && average > 0 ? (day.total - average) / average : undefined,
    }
}
