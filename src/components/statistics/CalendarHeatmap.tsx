import { CSSProperties, FC, useMemo } from 'react'
import moment from 'moment'
import { buildCalendar, heatLevel } from '../../app/calendar'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { Focusable } from 'decky-frontend-lib'
import { Card } from '../Card'

const BLUE = '26, 159, 255'
const ALPHA = [0.06, 0.3, 0.5, 0.75, 1]
const color = (level: 0 | 1 | 2 | 3 | 4) =>
    level === 0 ? 'rgba(255, 255, 255, 0.06)' : `rgba(${BLUE}, ${ALPHA[level]})`

const weekdayNames = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    moment()
        .isoWeekday(i + 1)
        .format('ddd')
)

/**
 * Calendar heatmap: a cell per day, shaded by play time (relative to the busiest
 * day shown). Weeks run left to right with Monday on top, or, when `horizontal`,
 * weeks top to bottom with Monday on the left.
 */
export const CalendarHeatmap: FC<{
    title: string
    days: DailyStatistics[]
    /** First and last day (YYYY-MM-DD) to show */
    start: string
    end: string
    /** Largest cell size in px */
    cellSize?: number
    horizontal?: boolean
    /** Write the day of the month inside each cell */
    showDayNumbers?: boolean
    /** Write the play time inside each cell */
    showTime?: boolean
    /** When set, days become focusable and activating one reports its date */
    onSelect?: (date: string) => void
    /** Date (YYYY-MM-DD) to highlight */
    selected?: string
}> = (props) => {
    const cells = useMemo(
        () => buildCalendar(props.days, props.start, props.end),
        [props.days, props.start, props.end]
    )
    const max = Math.max(0, ...cells.filter((it) => !it.outside).map((it) => it.seconds))
    const weeks = cells.length / 7
    const size = props.cellSize ?? 22
    const gap = 3

    const col = (c: { week: number; weekday: number }) =>
        props.horizontal ? c.weekday : c.week
    const row = (c: { week: number; weekday: number }) =>
        props.horizontal ? c.week : c.weekday
    const columns = props.horizontal ? 7 : weeks
    const rows = props.horizontal ? weeks : 7

    const grid: CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `${props.horizontal ? '' : 'auto '}repeat(${columns}, minmax(0, ${size}px))`,
        gridTemplateRows: `repeat(${rows}, auto)`,
        gap,
    }

    return (
        <Card title={props.title}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {props.horizontal && (
                        <div
                            style={{
                                ...grid,
                                gridTemplateRows: 'auto',
                                marginBottom: gap,
                                fontSize: '10px',
                                opacity: 0.6,
                            }}
                        >
                            {weekdayNames.map((name) => (
                                <div key={name} style={{ textAlign: 'center' }}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={grid}>
                        {!props.horizontal &&
                            weekdayNames.map((name, i) => (
                                <div
                                    key={name}
                                    style={{
                                        gridColumn: 1,
                                        gridRow: i + 1,
                                        alignSelf: 'center',
                                        paddingRight: 5,
                                        fontSize: '10px',
                                        opacity: 0.6,
                                        visibility: i % 2 === 0 ? 'visible' : 'hidden',
                                    }}
                                >
                                    {name}
                                </div>
                            ))}
                        {cells.map((cell) => {
                            const style: CSSProperties = {
                                gridColumn: col(cell) + (props.horizontal ? 1 : 2),
                                gridRow: row(cell) + 1,
                                aspectRatio: '1',
                                borderRadius: 4,
                                background: cell.outside
                                    ? 'transparent'
                                    : color(heatLevel(cell.seconds, max)),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                color: '#fff',
                                boxShadow:
                                    cell.date === props.selected ? 'inset 0 0 0 2px #fff' : undefined,
                            }
                            const content = (
                                <>
                                    {!cell.outside && props.showDayNumbers && (
                                        <span style={{ opacity: 0.8 }}>
                                            {moment(cell.date).format('D')}
                                        </span>
                                    )}
                                    {!cell.outside && props.showTime && cell.seconds > 0 && (
                                        <span style={{ fontWeight: 600 }}>
                                            {humanReadableTime(cell.seconds)}
                                        </span>
                                    )}
                                </>
                            )
                            const title = `${moment(cell.date).format('ddd D MMM YYYY')} · ${humanReadableTime(
                                cell.seconds
                            )}`
                            return props.onSelect && !cell.outside ? (
                                <Focusable
                                    key={cell.date}
                                    // @ts-ignore: title is passed through to the DOM node
                                    title={title}
                                    style={style}
                                    onActivate={() => props.onSelect!(cell.date)}
                                    onClick={() => props.onSelect!(cell.date)}
                                >
                                    {content}
                                </Focusable>
                            ) : (
                                <div key={cell.date} title={title} style={style}>
                                    {content}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    opacity: 0.7,
                    justifyContent: 'flex-end',
                }}
            >
                Less
                {([0, 1, 2, 3, 4] as const).map((level) => (
                    <div
                        key={level}
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: color(level),
                        }}
                    />
                ))}
                More
            </div>
        </Card>
    )
}
