import moment from 'moment'
import { DailyStatistics } from './model'

const DATE_FORMAT = 'YYYY-MM-DD'
const DAYS_IN_MONTH = 30.4375
const MARATHON_SECONDS = 4 * 3600

export interface AllTimeInsights {
    total: number
    activeDays: number
    firstDay?: string
    /** Calendar days from the first played day to today, inclusive */
    spanDays: number
    dailyAverage: number
    averageOnActiveDays: number
    weeklyAverage: number
    monthlyAverage: number
    bestDay?: { date: string; time: number }
    /** Week starts on Monday; `start` is that Monday */
    bestWeek?: { start: string; time: number }
    /** `month` is formatted as YYYY-MM */
    bestMonth?: { month: string; time: number }
    longestStreak: { days: number; start?: string; end?: string }
    /** Consecutive days played up to today (or yesterday, if today is not played yet) */
    currentStreak: number
    /** Longest stretch of days without playing between two played days */
    longestBreak: number
    /** Days with 4h or more */
    marathonDays: number
    mostGamesDay?: { date: string; count: number }
    gamesCount: number
    /** Seconds per weekday, Monday first */
    weekdayTotals: number[]
    /** Total per calendar month from the first played month until now, empty months included */
    monthlyTotals: { month: string; time: number }[]
    /** Last 30 days (today included) */
    last30Days: number
    /** Relative change of the last 30 days vs the 30 before, undefined without a baseline */
    last30DaysChange?: number
}

function utcDay(date: string | Date): moment.Moment {
    if (typeof date === 'string') {
        return moment.utc(date, DATE_FORMAT)
    }
    return moment.utc([date.getFullYear(), date.getMonth(), date.getDate()])
}

function maxEntry<T extends { time: number }>(entries: Map<string, number>, build: (key: string, time: number) => T) {
    let best: T | undefined
    entries.forEach((time, key) => {
        if (!best || time > best.time) {
            best = build(key, time)
        }
    })
    return best
}

/**
 * Insights over the whole history. `days` may be sparse: days without playtime
 * are not required (and ignored if present).
 */
export function computeAllTimeInsights(
    days: DailyStatistics[],
    today: Date = new Date()
): AllTimeInsights {
    const played = days
        .filter((it) => it.total > 0)
        .sort((a, b) => a.date.localeCompare(b.date))
    const now = utcDay(today)
    const total = played.reduce((acc, it) => acc + it.total, 0)
    const first = played.length > 0 ? utcDay(played[0].date) : undefined
    const spanDays = first ? now.diff(first, 'days') + 1 : 0

    const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
    const perWeek = new Map<string, number>()
    const perMonth = new Map<string, number>()
    const games = new Set<string>()
    let bestDay: AllTimeInsights['bestDay']
    let mostGamesDay: AllTimeInsights['mostGamesDay']
    let marathonDays = 0
    let longestStreak: AllTimeInsights['longestStreak'] = { days: 0 }
    let longestBreak = 0
    let run = 0
    let runStart = ''
    let previousDay: moment.Moment | undefined
    let last30 = 0
    let previous30 = 0

    for (const day of played) {
        const date = utcDay(day.date)
        weekdayTotals[date.isoWeekday() - 1] += day.total
        const week = date.clone().startOf('isoWeek').format(DATE_FORMAT)
        perWeek.set(week, (perWeek.get(week) ?? 0) + day.total)
        const month = date.format('YYYY-MM')
        perMonth.set(month, (perMonth.get(month) ?? 0) + day.total)
        day.games.forEach((it) => games.add(it.game.id))
        if (!bestDay || day.total > bestDay.time) {
            bestDay = { date: day.date, time: day.total }
        }
        if (day.total >= MARATHON_SECONDS) {
            marathonDays++
        }
        const count = day.games.filter((it) => it.time > 0).length
        if (!mostGamesDay || count > mostGamesDay.count) {
            mostGamesDay = { date: day.date, count }
        }

        const gap = previousDay ? date.diff(previousDay, 'days') - 1 : 0
        if (gap === 0 && previousDay) {
            run++
        } else {
            run = 1
            runStart = day.date
        }
        longestBreak = Math.max(longestBreak, gap)
        if (run > longestStreak.days) {
            longestStreak = { days: run, start: runStart, end: day.date }
        }
        previousDay = date

        const ago = now.diff(date, 'days')
        if (ago >= 0 && ago < 30) {
            last30 += day.total
        } else if (ago >= 30 && ago < 60) {
            previous30 += day.total
        }
    }

    const monthlyTotals: AllTimeInsights['monthlyTotals'] = []
    if (first) {
        for (
            const month = first.clone().startOf('month');
            month.isSameOrBefore(now);
            month.add(1, 'month')
        ) {
            const key = month.format('YYYY-MM')
            monthlyTotals.push({ month: key, time: perMonth.get(key) ?? 0 })
        }
    }

    return {
        total,
        activeDays: played.length,
        firstDay: played[0]?.date,
        spanDays,
        dailyAverage: spanDays > 0 ? total / spanDays : 0,
        averageOnActiveDays: played.length > 0 ? total / played.length : 0,
        weeklyAverage: spanDays > 0 ? total / (Math.max(spanDays, 7) / 7) : 0,
        monthlyAverage: spanDays > 0 ? total / (Math.max(spanDays, 30) / DAYS_IN_MONTH) : 0,
        bestDay,
        bestWeek: maxEntry(perWeek, (start, time) => ({ start, time })),
        bestMonth: maxEntry(perMonth, (month, time) => ({ month, time })),
        longestStreak,
        currentStreak:
            previousDay && now.diff(previousDay, 'days') <= 1 ? run : 0,
        longestBreak,
        marathonDays,
        mostGamesDay,
        gamesCount: games.size,
        weekdayTotals,
        monthlyTotals,
        last30Days: last30,
        last30DaysChange: previous30 > 0 ? (last30 - previous30) / previous30 : undefined,
    }
}
