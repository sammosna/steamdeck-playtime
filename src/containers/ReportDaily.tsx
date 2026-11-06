import { VFC, useEffect, useMemo, useState } from 'react'
import { Focusable } from 'decky-frontend-lib'
import moment from 'moment'
import { DailyStatistics, Game } from '../app/model'
import { useLocator } from '../locator'
import { excludeHiddenFromDays } from '../app/hiddenGames'
import { useHiddenGames } from './useHiddenGames'
import { CalendarHeatmap } from '../components/statistics/CalendarHeatmap'
import { DayInsights } from '../components/statistics/DayInsights'
import { Pager } from '../components/Pager'
import { formatMonthInterval } from '../app/formatters'
import { usePeriodReport } from './usePeriodReport'
import { report_stack } from '../styles'

export const ReportDaily: VFC<{ onSelectGame?: (game: Game) => void }> = ({
    onSelectGame,
}) => {
    const { reports } = useLocator()
    const { isLoading, page, onNext, onPrev, triggerPaging } = usePeriodReport(() =>
        reports.monthlyStatistics()
    )
    const { hiddenIds } = useHiddenGames()
    const data: DailyStatistics[] = useMemo(
        () => excludeHiddenFromDays(page.current().data, hiddenIds),
        [page, hiddenIds]
    )
    const [selected, setSelected] = useState<string>(moment().format('YYYY-MM-DD'))
    // Paging to another month moves the selection to a day of that month: today if
    // it is in there, otherwise its last day.
    useEffect(() => {
        if (data.length > 0 && !data.some((it) => it.date === selected)) {
            const today = moment().format('YYYY-MM-DD')
            setSelected(data.some((it) => it.date === today) ? today : data[data.length - 1].date)
        }
    }, [data])
    const day = data.find((it) => it.date === selected)

    return (
        <Focusable style={{ ...report_stack, opacity: isLoading ? 0.5 : 1 }} {...triggerPaging}>
            <Pager
                onNext={onNext}
                onPrev={onPrev}
                currentText={formatMonthInterval(page.current().interval)}
                hasNext={page.hasNext()}
                hasPrev={page.hasPrev()}
            />
            {data.length > 0 && (
                <CalendarHeatmap
                    title="Calendar"
                    days={data}
                    start={data[0].date}
                    end={data[data.length - 1].date}
                    horizontal
                    cellSize={52}
                    showDayNumbers
                    showTime
                    selected={selected}
                    onSelect={setSelected}
                />
            )}
            {day && <DayInsights day={day} period={data} onSelectGame={onSelectGame} />}
        </Focusable>
    )
}
