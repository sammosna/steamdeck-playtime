import { Plugin } from 'chart.js'
import { humanReadableMinutes } from '../../app/formatters'

/** Dashed line across the whole chart area at `average` (in the y scale's unit, minutes). */
export function averageLinePlugin(average: number): Plugin {
    return {
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
            ctx.fillText(`Avg ${humanReadableMinutes(average)}`, chartArea.right - 4, y - 4)
            ctx.restore()
        },
    }
}
