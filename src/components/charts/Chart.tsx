import { FC, useEffect, useRef } from 'react'
import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartConfiguration,
    DoughnutController,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js'

ChartJS.register(
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    DoughnutController,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip
)
ChartJS.defaults.color = '#c9d1d9'
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.08)'
ChartJS.defaults.animation = false
ChartJS.defaults.maintainAspectRatio = false

/**
 * Canvas rendering of a Chart.js configuration. The chart is rebuilt whenever
 * `config` changes identity, so callers should memoize it.
 */
export const Chart: FC<{ config: ChartConfiguration; height: number }> = (props) => {
    const canvas = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvas.current) {
            return
        }
        const chart = new ChartJS(canvas.current, props.config)
        return () => chart.destroy()
    }, [props.config])

    return (
        <div style={{ position: 'relative', width: '100%', height: props.height }}>
            <canvas ref={canvas} />
        </div>
    )
}
