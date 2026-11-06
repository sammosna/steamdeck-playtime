import { buildDayTimelines, buildTimeline, clock } from '../src/app/timeline'

const a = { id: 'a', name: 'A' }
const b = { id: 'b', name: 'B' }
const h = 3600

describe('buildTimeline', () => {
    test('merges back to back sessions of the same game', () => {
        const [cluster, ...rest] = buildTimeline([
            { date: 'd', game: a, start: 10 * h, duration: h },
            { date: 'd', game: a, start: 11 * h + 120, duration: h },
        ])
        expect(rest).toHaveLength(0)
        expect(cluster.segments).toEqual([{ game: a, start: 10 * h, end: 12 * h + 120 }])
    })

    test('keeps different games apart and cuts long pauses', () => {
        const clusters = buildTimeline([
            { date: 'd', game: b, start: 20 * h, duration: h },
            { date: 'd', game: a, start: 9 * h, duration: h },
            { date: 'd', game: b, start: 10 * h + 600, duration: 1800 },
        ])
        expect(clusters.map((c) => [c.start, c.end])).toEqual([
            [9 * h, 10 * h + 600 + 1800],
            [20 * h, 21 * h],
        ])
        expect(clusters[0].segments.map((s) => s.game.id)).toEqual(['a', 'b'])
    })

    test('ignores empty sessions and handles no sessions', () => {
        expect(buildTimeline([])).toEqual([])
        expect(buildTimeline([{ date: 'd', game: a, start: 0, duration: 0 }])).toEqual([])
    })

    test('clock', () => {
        expect(clock(9 * h + 5 * 60)).toBe('09:05')
        expect(clock(0)).toBe('00:00')
    })
})

describe('buildDayTimelines', () => {
    test('groups by day, most recent first, one lane per game', () => {
        const days = buildDayTimelines([
            { date: '2024-05-01', game: a, start: 9 * h, duration: h },
            { date: '2024-05-02', game: b, start: 9 * h, duration: h },
            { date: '2024-05-02', game: a, start: 15 * h, duration: 600 },
            { date: '2024-05-02', game: b, start: 20 * h, duration: 600 },
        ])
        expect(days.map((d) => d.date)).toEqual(['2024-05-02', '2024-05-01'])
        expect(days[0].lanes.map((g) => g.id)).toEqual(['b', 'a'])
        expect(days[0].clusters).toHaveLength(3)
        expect(days[0].total).toBe(h + 1200)
    })
})
