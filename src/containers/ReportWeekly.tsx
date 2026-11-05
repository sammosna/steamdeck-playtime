import { VFC } from 'react'
import { DailyStatistics } from '../app/model'
import { gameRowsForPeriod } from '../app/insights'
import { useLocator } from '../locator'
import { Pager } from '../components/Pager'
import { DailyChart } from '../components/statistics/DailyChart'
import { ChartStyle } from '../app/settings'
import { GamesDoughnut } from '../components/statistics/GamesDoughnut'
import { PeriodInsights } from '../components/statistics/PeriodInsights'
import { formatWeekInterval } from '../app/formatters'
import { GamesTable } from '../components/statistics/GamesTable'
import { usePeriodReport } from './usePeriodReport'
import { report_stack } from '../styles'
import { Focusable } from 'decky-frontend-lib'

export const ReportWeekly: VFC = () => {
    const { reports, currentSettings: settings } = useLocator()
    const { isLoading, page, previous, onNext, onPrev, triggerPaging } = usePeriodReport(() =>
        reports.weeklyStatistics()
    )

    const data: DailyStatistics[] = page.current().data

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
            <PeriodInsights statistics={data} previous={previous} />
            <DailyChart statistics={data} labels="weekday" title="By day" />
            <GamesTable rows={gameRowsForPeriod(data, previous)} />
            {settings.gameChartStyle == ChartStyle.PIE_AND_BARS && (
                <GamesDoughnut statistics={data} />
            )}
        </Focusable>
    )
}
