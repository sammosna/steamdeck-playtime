import { VFC, useEffect, useMemo, useState } from 'react'
import { Focusable } from 'decky-frontend-lib'
import { Session } from '../app/model'
import { useLocator } from '../locator'
import { excludeHiddenFromDays } from '../app/hiddenGames'
import { useHiddenGames } from './useHiddenGames'
import { Pager } from '../components/Pager'
import { Card } from '../components/Card'
import { DayTimeline } from '../components/statistics/DayTimeline'
import { buildSeries } from '../components/charts/gameSeries'
import { formatMonthInterval } from '../app/formatters'
import { buildDayTimelines } from '../app/timeline'
import { usePeriodReport } from './usePeriodReport'
import { report_stack } from '../styles'

/** Month of play, one vertical timeline per day, most recent day first. */
export const ReportTimeline: VFC = () => {
    const { reports } = useLocator()
    const { isLoading, page, onNext, onPrev, triggerPaging } = usePeriodReport(() =>
        reports.monthlyStatistics()
    )
    const { hiddenIds } = useHiddenGames()
    const interval = page.current().interval
    const [sessions, setSessions] = useState<Session[]>([])
    useEffect(() => {
        let current = true
        reports.sessions(interval.start, interval.end).then((it) => current && setSessions(it))
        return () => {
            current = false
        }
    }, [page])

    const days = useMemo(
        () => buildDayTimelines(sessions.filter((it) => !hiddenIds.has(it.game.id))),
        [sessions, hiddenIds]
    )
    const series = useMemo(
        () => buildSeries(excludeHiddenFromDays(page.current().data, hiddenIds)),
        [page, hiddenIds]
    )
    const colorOf = (gameId: string) =>
        series.find((it) => it.gameIds.has(gameId))?.color ?? '#6b7280'

    return (
        <Focusable style={{ ...report_stack, opacity: isLoading ? 0.5 : 1 }} {...triggerPaging}>
            <Pager
                onNext={onNext}
                onPrev={onPrev}
                currentText={formatMonthInterval(interval)}
                hasNext={page.hasNext()}
                hasPrev={page.hasPrev()}
            />
            {days.length === 0 && !isLoading && (
                <Card>
                    <div style={{ opacity: 0.7 }}>Nothing played.</div>
                </Card>
            )}
            {days.map((day) => (
                <DayTimeline key={day.date} day={day} colorOf={colorOf} />
            ))}
        </Focusable>
    )
}
