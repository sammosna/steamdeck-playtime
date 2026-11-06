import { Game, Session } from './model'

export interface TimelineSegment {
    game: Game
    /** Seconds since local midnight */
    start: number
    end: number
}

/** Segments close enough to be played "in one go"; long pauses end a cluster. */
export interface TimelineCluster {
    start: number
    end: number
    segments: TimelineSegment[]
}

const MERGE_GAP = 5 * 60
const CUT_GAP = 30 * 60

/**
 * Lays the sessions of a day on a timeline. Back to back sessions of the same game
 * (the plugin commits an interval at every suspend/resume) are merged, and a pause
 * of at least `cutGap` splits the day in clusters so the idle time can be cut out.
 */
export function buildTimeline(
    sessions: Session[],
    mergeGap: number = MERGE_GAP,
    cutGap: number = CUT_GAP
): TimelineCluster[] {
    const segments: TimelineSegment[] = []
    const sorted = [...sessions]
        .filter((it) => it.duration > 0)
        .sort((a, b) => a.start - b.start)
    for (const it of sorted) {
        const last = segments[segments.length - 1]
        const end = it.start + it.duration
        if (last && last.game.id === it.game.id && it.start - last.end <= mergeGap) {
            last.end = Math.max(last.end, end)
        } else {
            segments.push({ game: it.game, start: it.start, end })
        }
    }

    const clusters: TimelineCluster[] = []
    for (const segment of segments) {
        const last = clusters[clusters.length - 1]
        if (last && segment.start - last.end < cutGap) {
            last.segments.push(segment)
            last.end = Math.max(last.end, segment.end)
        } else {
            clusters.push({ start: segment.start, end: segment.end, segments: [segment] })
        }
    }
    return clusters
}

/** Seconds since midnight as HH:MM. */
export function clock(seconds: number): string {
    const minutes = Math.floor(seconds / 60) % (24 * 60)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export interface DayTimeline {
    date: string
    /** Games of the day in order of first play: one lane each */
    lanes: Game[]
    clusters: TimelineCluster[]
    /** Seconds played */
    total: number
}

/** Timelines of the days present in `sessions`, most recent day first. */
export function buildDayTimelines(sessions: Session[]): DayTimeline[] {
    const byDate = new Map<string, Session[]>()
    for (const it of sessions) {
        byDate.set(it.date, [...(byDate.get(it.date) ?? []), it])
    }
    return [...byDate.keys()]
        .sort()
        .reverse()
        .map((date) => {
            const day = byDate.get(date)!.sort((a, b) => a.start - b.start)
            const lanes = new Map<string, Game>()
            day.forEach((it) => lanes.has(it.game.id) || lanes.set(it.game.id, it.game))
            return {
                date,
                lanes: [...lanes.values()],
                clusters: buildTimeline(day),
                total: day.reduce((acc, it) => acc + it.duration, 0),
            }
        })
}
