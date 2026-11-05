import { buildCalendar, heatLevel } from '../src/app/calendar'

describe('calendar', () => {
    test('pads to whole Monday-first weeks and fills gaps', () => {
        // Wed 2024-05-08 .. Fri 2024-05-17
        const cells = buildCalendar(
            [{ date: '2024-05-09', games: [], total: 600 }],
            '2024-05-08',
            '2024-05-17'
        )
        expect(cells).toHaveLength(14)
        expect(cells[0]).toMatchObject({ date: '2024-05-06', weekday: 0, week: 0, outside: true })
        expect(cells[3]).toMatchObject({ date: '2024-05-09', seconds: 600, outside: false })
        expect(cells[13]).toMatchObject({ date: '2024-05-19', weekday: 6, week: 1, outside: true })
        expect(cells.filter((c) => !c.outside)).toHaveLength(10)
    })

    test('heat levels', () => {
        expect(heatLevel(0, 100)).toBe(0)
        expect(heatLevel(10, 100)).toBe(1)
        expect(heatLevel(40, 100)).toBe(2)
        expect(heatLevel(60, 100)).toBe(3)
        expect(heatLevel(100, 100)).toBe(4)
    })
})
