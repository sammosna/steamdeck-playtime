import { VFC, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { DialogButton, Focusable } from 'decky-frontend-lib'
import { DailyStatistics, Game } from '../app/model'
import { useLocator } from '../locator'
import { computeAllTimeInsights } from '../app/allTimeInsights'
import { computeGameOverview, daysForGame } from '../app/gameInsights'
import { excludeHiddenFromDays } from '../app/hiddenGames'
import { GameInsights } from '../components/statistics/GameInsights'
import { BarsChart } from '../components/statistics/BarsChart'
import { Card } from '../components/Card'
import { useHiddenGames } from './useHiddenGames'
import { RADIUS_SMALL, report_stack } from '../styles'

const RECENT_DAYS = 30

/** Statistics and insights of a single game. */
export const GamePage: VFC<{ game: Game; onBack: () => void }> = ({ game, onBack }) => {
    const { reports } = useLocator()
    const { hiddenIds } = useHiddenGames()
    const [allDays, setAllDays] = useState<DailyStatistics[]>([])
    const [isLoading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        reports.allTimeDailyStatistics().then((it) => {
            setAllDays(it)
            setLoading(false)
        })
    }, [])

    // Other games the user hid are left out of the comparison, this game never is.
    const library = useMemo(() => {
        const ids = new Set(hiddenIds)
        ids.delete(game.id)
        return excludeHiddenFromDays(allDays, ids)
    }, [allDays, hiddenIds, game.id])
    const gameDays = useMemo(() => daysForGame(allDays, game.id), [allDays, game.id])
    const insights = useMemo(() => computeAllTimeInsights(gameDays), [gameDays])
    const overview = useMemo(
        () => computeGameOverview(library, game.id),
        [library, game.id]
    )

    const monthLabels = useMemo(
        () =>
            insights.monthlyTotals.map((it) =>
                moment(it.month, 'YYYY-MM').format("MMM 'YY")
            ),
        [insights]
    )
    const monthSeconds = useMemo(
        () => insights.monthlyTotals.map((it) => it.time),
        [insights]
    )
    const weekdayLabels = useMemo(
        () =>
            [0, 1, 2, 3, 4, 5, 6].map((i) =>
                moment()
                    .isoWeekday(i + 1)
                    .format('ddd')
            ),
        []
    )
    const recent = useMemo(() => {
        const byDate = new Map(gameDays.map((it) => [it.date, it.total]))
        const dates = Array.from({ length: RECENT_DAYS }, (_, i) =>
            moment().subtract(RECENT_DAYS - 1 - i, 'days')
        )
        return {
            labels: dates.map((it) => it.format('D')),
            seconds: dates.map((it) => byDate.get(it.format('YYYY-MM-DD')) ?? 0),
        }
    }, [gameDays])

    const busiestWeekday = Math.max(...insights.weekdayTotals)
    return (
        <Focusable
            style={report_stack}
            onCancel={onBack}
            onCancelActionDescription="Back to games"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <DialogButton
                    style={{
                        width: 'auto',
                        minWidth: 0,
                        padding: '8px 16px',
                        borderRadius: RADIUS_SMALL,
                    }}
                    onClick={onBack}
                >
                    ← Back
                </DialogButton>
                <div
                    style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {game.name || game.id}
                </div>
            </div>
            {isLoading && <div>Loading...</div>}
            {!isLoading && insights.activeDays === 0 && (
                <Card>No play time recorded for this game.</Card>
            )}
            {insights.activeDays > 0 && (
                <>
                    <GameInsights insights={insights} overview={overview} />
                    <BarsChart
                        title={`Last ${RECENT_DAYS} days`}
                        labels={recent.labels}
                        seconds={recent.seconds}
                        averageSeconds={insights.averageOnActiveDays}
                        highlight={
                            recent.seconds.some((it) => it > 0)
                                ? recent.seconds.indexOf(Math.max(...recent.seconds))
                                : undefined
                        }
                    />
                    <BarsChart
                        title="By month"
                        labels={monthLabels}
                        seconds={monthSeconds}
                        averageSeconds={insights.monthlyAverage}
                        highlight={monthSeconds.indexOf(Math.max(...monthSeconds))}
                    />
                    <BarsChart
                        title="By weekday"
                        labels={weekdayLabels}
                        seconds={insights.weekdayTotals}
                        highlight={insights.weekdayTotals.indexOf(busiestWeekday)}
                    />
                </>
            )}
        </Focusable>
    )
}
