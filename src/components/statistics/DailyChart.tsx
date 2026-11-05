import { FC, useMemo } from 'react'
import { ChartConfiguration } from 'chart.js'
import moment from 'moment'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { computeInsights } from '../../app/insights'
import { Chart } from '../charts/Chart'
import { buildSeries, timeInSeries } from '../charts/gameSeries'
import { Card } from '../Card'

const minutesToText = (minutes: number) => humanReadableTime(minutes * 60, true)

/** Stacked bars per day (one segment per game) with the period's daily average as a line. */
export const DailyChart: FC<{ statistics: DailyStatistics[]; labels: 'weekday' | 'day'; title: string }> = (
    props
) => {
    const config = useMemo<ChartConfiguration>(() => {
        const series = buildSeries(props.statistics)
        const average = computeInsights(props.statistics).dailyAverage / 60
        const labels = props.statistics.map((it) =>
            props.labels === 'weekday'
                ? moment(it.date).format('ddd')
                : moment(it.date).format('D')
        )
        return {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    ...series.map((s) => ({
                        type: 'bar' as const,
                        label: s.name,
                        backgroundColor: s.color,
                        borderRadius: 4,
                        borderSkipped: false,
                        barPercentage: 0.75,
                        stack: 'time',
                        data: props.statistics.map((day) => timeInSeries(day, s) / 60),
                    })),
                    {
                        type: 'line' as const,
                        label: `Avg ${minutesToText(average)}`,
                        data: props.statistics.map(() => average),
                        borderColor: '#ffffff',
                        borderDash: [6, 4],
                        borderWidth: 1.5,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { callback: (v) => minutesToText(Number(v)), maxTicksLimit: 6 },
                    },
                },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 8, padding: 14 } },
                    tooltip: {
                        mode: 'index',
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${minutesToText(ctx.parsed.y)}`,
                        },
                    },
                },
            },
        }
    }, [props.statistics, props.labels])

    return (
        <Card title={props.title}>
            <Chart config={config} height={props.labels === 'weekday' ? 260 : 300} />
        </Card>
    )
}
