import { FC, useMemo } from 'react'
import { ChartConfiguration } from 'chart.js'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { Chart } from '../charts/Chart'
import { buildSeries } from '../charts/gameSeries'
import { FocusableExt } from '../FocusableExt'

/** Share of each game in the period, with the total time in the center. */
export const GamesDoughnut: FC<{ statistics: DailyStatistics[] }> = (props) => {
    const config = useMemo<ChartConfiguration>(() => {
        const series = buildSeries(props.statistics)
        const total = series.reduce((acc, it) => acc + it.time, 0)
        return {
            type: 'doughnut',
            data: {
                labels: series.map((s) => s.name),
                datasets: [
                    {
                        data: series.map((s) => s.time),
                        backgroundColor: series.map((s) => s.color),
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                cutout: '62%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const value = ctx.parsed
                                const share = total > 0 ? Math.round((value / total) * 100) : 0
                                return `${humanReadableTime(value)} (${share}%)`
                            },
                        },
                    },
                },
            },
            plugins: [
                {
                    id: 'centerTotal',
                    afterDraw: (chart) => {
                        const { ctx, chartArea } = chart
                        ctx.save()
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillStyle = '#ffffff'
                        ctx.font = 'bold 16px sans-serif'
                        ctx.fillText(
                            humanReadableTime(total),
                            (chartArea.left + chartArea.right) / 2,
                            (chartArea.top + chartArea.bottom) / 2
                        )
                        ctx.restore()
                    },
                },
            ],
        }
    }, [props.statistics])

    return (
        <FocusableExt>
            <Chart config={config} height={220} />
        </FocusableExt>
    )
}
