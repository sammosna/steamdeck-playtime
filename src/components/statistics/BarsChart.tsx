import { FC, useMemo } from 'react'
import { ChartConfiguration } from 'chart.js'
import { humanReadableMinutes } from '../../app/formatters'
import { Chart } from '../charts/Chart'
import { averageLinePlugin } from '../charts/averageLine'
import { Card } from '../Card'
import { BLUE_COLOR } from '../../styles'

const HIGHLIGHT_COLOR = '#f6c85f'

/** Single series bars (values in seconds), optionally with the average line and one highlighted bar. */
export const BarsChart: FC<{
    title: string
    labels: string[]
    seconds: number[]
    averageSeconds?: number
    highlight?: number
    height?: number
}> = (props) => {
    const config = useMemo<ChartConfiguration>(
        () => ({
            type: 'bar',
            data: {
                labels: props.labels,
                datasets: [
                    {
                        data: props.seconds.map((it) => it / 60),
                        backgroundColor: props.seconds.map((_, i) =>
                            i === props.highlight ? HIGHLIGHT_COLOR : BLUE_COLOR
                        ),
                        borderRadius: 4,
                        borderSkipped: false,
                        barPercentage: 0.75,
                    },
                ],
            },
            options: {
                scales: {
                    x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (v) => humanReadableMinutes(Number(v)),
                            maxTicksLimit: 6,
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (ctx) => humanReadableMinutes(ctx.parsed.y) },
                    },
                },
            },
            plugins: props.averageSeconds ? [averageLinePlugin(props.averageSeconds / 60)] : [],
        }),
        [props.labels, props.seconds, props.averageSeconds, props.highlight]
    )

    return (
        <Card title={props.title}>
            <Chart config={config} height={props.height ?? 220} />
        </Card>
    )
}
