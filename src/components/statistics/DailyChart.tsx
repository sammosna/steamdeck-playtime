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

/** Stacked bars per day (one segment per game) with a line across the chart at the period's daily average. */
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
            plugins: [
                {
                    id: 'averageLine',
                    afterDatasetsDraw: (chart) => {
                        const { ctx, chartArea, scales } = chart
                        if (average <= 0) {
                            return
                        }
                        const y = scales.y.getPixelForValue(average)
                        ctx.save()
                        ctx.strokeStyle = '#ffffff'
                        ctx.lineWidth = 1.5
                        ctx.setLineDash([6, 4])
                        ctx.beginPath()
                        ctx.moveTo(chartArea.left, y)
                        ctx.lineTo(chartArea.right, y)
                        ctx.stroke()
                        ctx.setLineDash([])
                        ctx.fillStyle = '#ffffff'
                        ctx.font = '600 11px sans-serif'
                        ctx.textAlign = 'right'
                        ctx.textBaseline = 'bottom'
                        ctx.fillText(
                            `Avg ${minutesToText(average)}`,
                            chartArea.right - 4,
                            y - 4
                        )
                        ctx.restore()
                    },
                },
            ],
        }
    }, [props.statistics, props.labels])

    return (
        <Card title={props.title}>
            <Chart config={config} height={props.labels === 'weekday' ? 260 : 300} />
        </Card>
    )
}
