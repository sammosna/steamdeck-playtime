import { computeDayInsights, computeInsights, gameRowsForPeriod, gameRowsFromTotals, timePerGame } from '../src/app/insights'
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

const week = [
    day('2024-05-06', [a, 3600]),
    day('2024-05-07', [a, 1800], [b, 1800]),
    day('2024-05-08'),
    day('2024-05-09', [b, 7200]),
    day('2024-05-10'),
]
const today = new Date(2024, 4, 9, 12)

describe('computeInsights', () => {
    test('aggregates period', () => {
        const r = computeInsights(week, [], today)
        expect(r.total).toBe(14400)
        expect(r.elapsedDays).toBe(4)
        expect(r.activeDays).toBe(3)
        expect(r.dailyAverage).toBe(3600)
        expect(r.averageOnActiveDays).toBe(4800)
        expect(r.bestDay).toEqual({ date: '2024-05-09', time: 7200 })
        expect(r.longestStreak).toBe(2)
        expect(r.topGame?.game.id).toBe('b')
        expect(r.topGame?.share).toBeCloseTo(0.625)
        expect(r.deltaVsPrevious).toBeUndefined()
    })

    test('compares with previous period', () => {
        const r = computeInsights(week, [day('2024-04-29', [a, 7200])], today)
        expect(r.deltaVsPrevious).toBe(1)
    })

    test('empty period', () => {
        const r = computeInsights([], [], today)
        expect(r.total).toBe(0)
        expect(r.dailyAverage).toBe(0)
        expect(r.bestDay).toBeUndefined()
        expect(r.topGame).toBeUndefined()
    })
})

test('per game totals do not mutate the statistics', () => {
    gameRowsForPeriod(week)
    expect(week[0].games[0].time).toBe(3600)
    expect(timePerGame(week).map((it) => [it.game.id, it.time])).toEqual([
        ['b', 9000],
        ['a', 5400],
    ])
})

describe('gameRowsForPeriod', () => {
    test('per game breakdown', () => {
        const [first, second] = gameRowsForPeriod(week)
        expect(first).toMatchObject({
            time: 9000,
            activeDays: 2,
            averagePerActiveDay: 4500,
            bestDay: { date: '2024-05-09', time: 7200 },
            lastPlayed: '2024-05-09',
        })
        expect(first.game.id).toBe('b')
        expect(first.share).toBeCloseTo(9000 / 14400)
        expect(second.game.id).toBe('a')
        expect(second.change).toBeUndefined()
    })

    test('change vs previous period', () => {
        const rows = gameRowsForPeriod(week, [day('2024-04-29', [a, 2700])])
        expect(rows.find((it) => it.game.id === 'a')?.change).toBe(1)
        expect(rows.find((it) => it.game.id === 'b')?.change).toBe('new')
    })

    test('from totals', () => {
        const rows = gameRowsFromTotals([
            { game: a, time: 100 },
            { game: b, time: 300 },
        ])
        expect(rows.map((it) => it.game.id)).toEqual(['b', 'a'])
        expect(rows[0].share).toBe(0.75)
    })
})

describe('computeDayInsights', () => {
    test('ranks and compares a day within its period', () => {
        const r = computeDayInsights(week[3], week)
        expect(r).toMatchObject({ total: 7200, gamesCount: 1, rank: 1, playedDays: 3 })
        expect(r.topGame).toMatchObject({ time: 7200, share: 1 })
        expect(r.vsAverage).toBeCloseTo(0.5) // average of played days: 4800
    })

    test('empty day has no rank or comparison', () => {
        const r = computeDayInsights(week[2], week)
        expect(r).toMatchObject({ total: 0, gamesCount: 0, rank: undefined, vsAverage: undefined })
    })
})
