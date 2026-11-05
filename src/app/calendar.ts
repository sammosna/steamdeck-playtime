import moment from 'moment'
import { DailyStatistics } from './model'

const DATE_FORMAT = 'YYYY-MM-DD'

export interface CalendarCell {
    date: string
    seconds: number
    /** Monday-first week index, counted from the first (Monday-aligned) week */
    week: number
    /** 0 = Monday */
    weekday: number
    /** Padding days of the first/last week that fall outside the range */
    outside: boolean
}

/**
 * One cell per day from `start` to `end` (inclusive), padded to whole Monday-first
 * weeks. `days` may be sparse; missing days count as zero.
 */
export function buildCalendar(
    days: DailyStatistics[],
    start: string,
    end: string
): CalendarCell[] {
    const seconds = new Map(days.map((it) => [it.date, it.total]))
    const first = moment.utc(start, DATE_FORMAT).startOf('isoWeek')
    const last = moment.utc(end, DATE_FORMAT).endOf('isoWeek')
    const rangeStart = moment.utc(start, DATE_FORMAT)
    const rangeEnd = moment.utc(end, DATE_FORMAT)
    const cells: CalendarCell[] = []
    for (const day = first.clone(); day.isSameOrBefore(last); day.add(1, 'day')) {
        const date = day.format(DATE_FORMAT)
        cells.push({
            date,
            seconds: seconds.get(date) ?? 0,
            week: Math.floor(day.diff(first, 'days') / 7),
            weekday: day.isoWeekday() - 1,
            outside: day.isBefore(rangeStart, 'day') || day.isAfter(rangeEnd, 'day'),
        })
    }
    return cells
}

/** Intensity 0 (no play) to 4, relative to the busiest day of the range. */
export function heatLevel(seconds: number, max: number): 0 | 1 | 2 | 3 | 4 {
    if (seconds <= 0 || max <= 0) {
        return 0
    }
    const ratio = seconds / max
    return ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1
}
