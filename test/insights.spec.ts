import { computeInsights, timePerGame } from '../src/app/insights'
import { convertDailyStatisticsToGameWithTime, DailyStatistics } from '../src/app/model'

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
    convertDailyStatisticsToGameWithTime(week)
    expect(week[0].games[0].time).toBe(3600)
    expect(timePerGame(week).map((it) => [it.game.id, it.time])).toEqual([
        ['b', 9000],
        ['a', 5400],
    ])
})
