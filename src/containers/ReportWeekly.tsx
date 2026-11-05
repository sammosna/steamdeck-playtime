import { VFC } from 'react'
import { DailyStatistics, convertDailyStatisticsToGameWithTime } from '../app/model'
import { useLocator } from '../locator'
import { Pager } from '../components/Pager'
import { DailyChart } from '../components/statistics/DailyChart'
import { ChartStyle } from '../app/settings'
import { GamesDoughnut } from '../components/statistics/GamesDoughnut'
import { PeriodInsights } from '../components/statistics/PeriodInsights'
import { formatWeekInterval } from '../app/formatters'
import { GamesTimeBarView } from '../components/statistics/GamesTimeBarView'
import { PanelSection } from 'decky-frontend-lib'
import { usePeriodReport } from './usePeriodReport'

export const ReportWeekly: VFC = () => {
    const { reports, currentSettings: settings } = useLocator()
    const { isLoading, page, previous, onNext, onPrev } = usePeriodReport(() =>
        reports.weeklyStatistics()
    )

    const data: DailyStatistics[] = page.current().data
    const isAnyGames = data.some((it) => it.games.length > 0)

    return (
        <div>
            <Pager
                onNext={onNext}
                onPrev={onPrev}
                currentText={formatWeekInterval(page.current().interval)}
                hasNext={page.hasNext()}
                hasPrev={page.hasPrev()}
            />
            {isLoading && <div>Loading...</div>}
            {!isLoading && (
                <div>
                    <PeriodInsights statistics={data} previous={previous} />
                    <PanelSection title="By day">
                        <DailyChart statistics={data} labels="weekday" />
                    </PanelSection>
                    {isAnyGames && (
                        <PanelSection title="By game">
                            <GamesTimeBarView
                                data={convertDailyStatisticsToGameWithTime(data)}
                            />
                            {settings.gameChartStyle == ChartStyle.PIE_AND_BARS && (
                                <GamesDoughnut statistics={data} />
                            )}
                        </PanelSection>
                    )}
                </div>
            )}
        </div>
    )
}
