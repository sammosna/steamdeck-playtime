import { VFC } from 'react'
import { useLocator } from '../locator'
import { convertDailyStatisticsToGameWithTime } from '../app/model'
import { Pager } from '../components/Pager'
import { PeriodInsights } from '../components/statistics/PeriodInsights'
import { DailyChart } from '../components/statistics/DailyChart'
import { ChartStyle } from '../app/settings'
import { GamesDoughnut } from '../components/statistics/GamesDoughnut'
import { PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { formatMonthInterval } from '../app/formatters'
import { GamesTimeBarView } from '../components/statistics/GamesTimeBarView'
import { usePeriodReport } from './usePeriodReport'

export const ReportMonthly: VFC = () => {
    const { reports, currentSettings: settings } = useLocator()
    const { isLoading, page, previous, onNext, onPrev } = usePeriodReport(() =>
        reports.monthlyStatistics()
    )
    const data = page.current().data

    return (
        <div>
            <PanelSection>
                <PanelSectionRow>
                    <Pager
                        onNext={onNext}
                        onPrev={onPrev}
                        currentText={formatMonthInterval(page.current().interval)}
                        hasNext={page.hasNext()}
                        hasPrev={page.hasPrev()}
                    />
                </PanelSectionRow>
            </PanelSection>
            {isLoading && <div>Loading...</div>}
            {!isLoading && (
                <div>
                    <PeriodInsights statistics={data} previous={previous} />
                    <DailyChart statistics={data} labels="day" />
                    <GamesTimeBarView data={convertDailyStatisticsToGameWithTime(data)} />
                    {settings.gameChartStyle == ChartStyle.PIE_AND_BARS && (
                        <GamesDoughnut statistics={data} />
                    )}
                </div>
            )}
        </div>
    )
}
