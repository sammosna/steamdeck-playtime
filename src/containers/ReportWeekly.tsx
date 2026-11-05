import { VFC, useMemo } from 'react'
import { DailyStatistics, Game } from '../app/model'
import { gameRowsForPeriod } from '../app/insights'
import { excludeHiddenFromDays } from '../app/hiddenGames'
import { HiddenGames } from '../components/statistics/HiddenGames'
import { useHiddenGames } from './useHiddenGames'
import { useLocator } from '../locator'
import { Pager } from '../components/Pager'
import { DailyChart } from '../components/statistics/DailyChart'
import { GamesDoughnut } from '../components/statistics/GamesDoughnut'
import { PeriodInsights } from '../components/statistics/PeriodInsights'
import { formatWeekInterval } from '../app/formatters'
import { GamesTable } from '../components/statistics/GamesTable'
import { usePeriodReport } from './usePeriodReport'
import { report_stack } from '../styles'
import { Focusable } from 'decky-frontend-lib'

export const ReportWeekly: VFC<{ onSelectGame?: (game: Game) => void }> = ({
    onSelectGame,
}) => {
    const { reports } = useLocator()
    const { isLoading, page, previous, onNext, onPrev, triggerPaging } = usePeriodReport(
        () => reports.weeklyStatistics()
    )

    const { hidden, hiddenIds, hide, show } = useHiddenGames()
    const data: DailyStatistics[] = useMemo(
        () => excludeHiddenFromDays(page.current().data, hiddenIds),
        [page, hiddenIds]
    )
    const previousVisible = useMemo(
        () => excludeHiddenFromDays(previous, hiddenIds),
        [previous, hiddenIds]
    )

    return (
        <Focusable
            style={{ ...report_stack, opacity: isLoading ? 0.5 : 1 }}
            {...triggerPaging}
        >
            <Pager
                onNext={onNext}
                onPrev={onPrev}
                currentText={formatWeekInterval(page.current().interval)}
                hasNext={page.hasNext()}
                hasPrev={page.hasPrev()}
            />
            <PeriodInsights statistics={data} previous={previousVisible} />
            <DailyChart statistics={data} labels="weekday" title="By day" />
            <GamesTable
                rows={gameRowsForPeriod(data, previousVisible)}
                onHide={hide}
                onSelect={onSelectGame}
            />
            <GamesDoughnut statistics={data} />
            <HiddenGames games={hidden} onShow={show} />
        </Focusable>
    )
}
