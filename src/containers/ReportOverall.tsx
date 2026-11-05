import { VFC, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { DailyStatistics, Game, GameWithTime } from '../app/model'
import { useLocator } from '../locator'
import { GamesTable } from '../components/statistics/GamesTable'
import { AllTimeInsights } from '../components/statistics/AllTimeInsights'
import { BarsChart } from '../components/statistics/BarsChart'
import { gameRowsFromTotals } from '../app/insights'
import { computeAllTimeInsights } from '../app/allTimeInsights'
import { excludeHiddenFromDays, excludeHiddenFromTotals } from '../app/hiddenGames'
import { HiddenGames } from '../components/statistics/HiddenGames'
import { useHiddenGames } from './useHiddenGames'
import { report_stack } from '../styles'

export const ReportOverall: VFC<{ onSelectGame?: (game: Game) => void }> = ({
    onSelectGame,
}) => {
    const { reports } = useLocator()
    const [allGames, setGames] = useState<GameWithTime[]>([])
    const [allDays, setDays] = useState<DailyStatistics[]>([])
    const { hidden, hiddenIds, hide, show } = useHiddenGames()
    const games = useMemo(
        () => excludeHiddenFromTotals(allGames, hiddenIds),
        [allGames, hiddenIds]
    )
    const days = useMemo(
        () => excludeHiddenFromDays(allDays, hiddenIds),
        [allDays, hiddenIds]
    )
    const [isLoading, setLoading] = useState<Boolean>(false)

    useEffect(() => {
        setLoading(true)
        Promise.all([reports.overallStatistics(), reports.allTimeDailyStatistics()]).then(
            ([overall, daily]) => {
                setGames(overall)
                setDays(daily)
                setLoading(false)
            }
        )
    }, [])

    const insights = useMemo(() => computeAllTimeInsights(days), [days])
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
    const weekdayHighlight = insights.weekdayTotals.indexOf(
        Math.max(...insights.weekdayTotals)
    )

    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <div style={report_stack}>
            {insights.activeDays > 0 && (
                <>
                    <AllTimeInsights insights={insights} />
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
                        highlight={weekdayHighlight}
                    />
                </>
            )}
            <GamesTable
                rows={gameRowsFromTotals(games)}
                defaultExpanded
                onHide={hide}
                onSelect={onSelectGame}
            />
            <HiddenGames games={hidden} onShow={show} />
        </div>
    )
}
