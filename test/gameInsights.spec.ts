import { computeGameOverview, daysForGame } from '../src/app/gameInsights'
import { computeAllTimeInsights } from '../src/app/allTimeInsights'

const a = { id: 'a', name: 'A' }
const b = { id: 'b', name: 'B' }
const days = [
    { date: '2024-05-06', games: [{ game: a, time: 3600 }, { game: b, time: 1800 }], total: 5400 },
    { date: '2024-05-07', games: [{ game: b, time: 600 }], total: 600 },
    { date: '2024-05-08', games: [{ game: a, time: 1800 }], total: 1800 },
]

describe('game insights', () => {
    test('daysForGame keeps only the game and its days', () => {
        const result = daysForGame(days, 'a')
        expect(result.map((d) => [d.date, d.total])).toEqual([
            ['2024-05-06', 3600],
            ['2024-05-08', 1800],
        ])
        expect(computeAllTimeInsights(result, new Date(2024, 4, 8)).bestDay).toEqual({
            date: '2024-05-06',
            time: 3600,
        })
    })

    test('overview compares with the library', () => {
        const o = computeGameOverview(days, 'a', new Date(2024, 4, 10, 15))
        expect(o.share).toBeCloseTo(5400 / 7800)
        expect(o.rank).toBe(1)
        expect(o.gamesCount).toBe(2)
        expect(o.lastPlayed).toBe('2024-05-08')
        expect(o.daysSinceLastPlayed).toBe(2)
        expect(o.daysWithOtherGames).toBe(1)
    })

    test('unplayed game has no rank', () => {
        const o = computeGameOverview(days, 'zzz')
        expect(o.rank).toBeUndefined()
        expect(o.share).toBe(0)
    })
})
