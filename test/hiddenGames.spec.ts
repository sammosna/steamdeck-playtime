import { excludeHiddenFromDays, excludeHiddenFromTotals } from '../src/app/hiddenGames'

const a = { id: 'a', name: 'A' }
const b = { id: 'b', name: 'B' }

describe('hidden games', () => {
    test('removes hidden games from days and recomputes totals', () => {
        const days = [
            { date: '2024-05-06', games: [{ game: a, time: 100 }, { game: b, time: 50 }], total: 150 },
            { date: '2024-05-07', games: [{ game: b, time: 70 }], total: 70 },
        ]
        const result = excludeHiddenFromDays(days, new Set(['b']))
        expect(result.map((d) => d.total)).toEqual([100, 0])
        expect(result[1].games).toEqual([])
        expect(days[0].total).toBe(150)
    })

    test('keeps input untouched when nothing is hidden', () => {
        const days = [{ date: '2024-05-06', games: [{ game: a, time: 1 }], total: 1 }]
        expect(excludeHiddenFromDays(days, new Set())).toBe(days)
    })

    test('filters overall totals', () => {
        const games = [{ game: a, time: 1 }, { game: b, time: 2 }]
        expect(excludeHiddenFromTotals(games, new Set(['a']))).toEqual([{ game: b, time: 2 }])
    })
})
