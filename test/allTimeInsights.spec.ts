import { computeAllTimeInsights } from '../src/app/allTimeInsights'
import { DailyStatistics } from '../src/app/model'

const a = { id: 'a', name: 'A' }
const b = { id: 'b', name: 'B' }

function day(date: string, ...games: [typeof a, number][]): DailyStatistics {
    return {
        date,
        games: games.map(([game, time]) => ({ game, time })),
        total: games.reduce((acc, [, time]) => acc + time, 0),
    }
}

// 2024-05-06 is a Monday
const history = [
    day('2024-05-06', [a, 3600]),
    day('2024-05-07', [a, 1800], [b, 1800]),
    day('2024-05-08', [b, 3600]),
    day('2024-05-13', [a, 18000]), // Monday after a 4 day break
    day('2024-06-02', [b, 1800]),
]
const today = new Date(2024, 5, 3, 12) // 2024-06-03

describe('computeAllTimeInsights', () => {
    const r = computeAllTimeInsights(history, today)

    test('totals and averages', () => {
        expect(r.total).toBe(3600 + 3600 + 3600 + 18000 + 1800)
        expect(r.activeDays).toBe(5)
        expect(r.firstDay).toBe('2024-05-06')
        expect(r.spanDays).toBe(29)
        expect(r.dailyAverage).toBeCloseTo(r.total / 29)
        expect(r.averageOnActiveDays).toBeCloseTo(r.total / 5)
        expect(r.weeklyAverage).toBeCloseTo((r.total / 29) * 7)
        // histories shorter than a month are not extrapolated: the span counts as 30 days
        expect(r.monthlyAverage).toBeCloseTo((r.total / 30) * 30.4375)
    })

    test('records', () => {
        expect(r.bestDay).toEqual({ date: '2024-05-13', time: 18000 })
        expect(r.bestWeek).toEqual({ start: '2024-05-13', time: 18000 })
        expect(r.bestMonth).toEqual({ month: '2024-05', time: 28800 })
        expect(r.longestStreak).toEqual({ days: 3, start: '2024-05-06', end: '2024-05-08' })
        expect(r.longestBreak).toBe(19)
        expect(r.marathonDays).toBe(1)
        expect(r.mostGamesDay).toEqual({ date: '2024-05-07', count: 2 })
        expect(r.gamesCount).toBe(2)
    })

    test('current streak counts only up to today or yesterday', () => {
        expect(r.currentStreak).toBe(1) // played 2024-06-02, today is the 3rd
        expect(computeAllTimeInsights(history, new Date(2024, 5, 10)).currentStreak).toBe(0)
    })

    test('weekday totals start on Monday and months are zero filled', () => {
        expect(r.weekdayTotals[0]).toBe(3600 + 18000) // Mondays
        expect(r.weekdayTotals[6]).toBe(1800) // Sunday 2024-06-02
        expect(r.monthlyTotals).toEqual([
            { month: '2024-05', time: 28800 },
            { month: '2024-06', time: 1800 },
        ])
    })

    test('last 30 days vs the 30 before', () => {
        expect(r.last30Days).toBe(28800 + 1800)
        expect(r.last30DaysChange).toBeUndefined()
        const withBaseline = computeAllTimeInsights(
            [day('2024-04-20', [a, 3600]), ...history],
            today
        )
        expect(withBaseline.last30DaysChange).toBeCloseTo((30600 - 3600) / 3600)
    })

    test('no history', () => {
        const empty = computeAllTimeInsights([], today)
        expect(empty.total).toBe(0)
        expect(empty.spanDays).toBe(0)
        expect(empty.dailyAverage).toBe(0)
        expect(empty.monthlyTotals).toEqual([])
        expect(empty.currentStreak).toBe(0)
    })
})
