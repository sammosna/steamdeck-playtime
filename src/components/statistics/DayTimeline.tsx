import { FC } from 'react'
import moment from 'moment'
import { DayTimeline as DayTimelineData, clock } from '../../app/timeline'
import { humanReadableTime } from '../../app/formatters'
import { Card } from '../Card'

const PX_PER_HOUR = 72
const MIN_BLOCK = 20
const AXIS = 46
const GRID = 'rgba(255, 255, 255, 0.1)'

const label = { position: 'absolute', left: 0, width: AXIS - 8, textAlign: 'right', fontSize: '10px' } as const

/**
 * One day, top to bottom: a time axis on the left and a lane per game. Stretches
 * of play are drawn to scale; pauses of 30 minutes or more are cut out and shown
 * as a separator.
 */
export const DayTimeline: FC<{
    day: DayTimelineData
    colorOf: (gameId: string) => string
}> = ({ day, colorOf }) => (
    <Card title={`${moment(day.date).format('dddd D MMMM')} · ${humanReadableTime(day.total)}`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '11px', marginBottom: 8 }}>
            {day.lanes.map((game) => (
                <div key={game.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: colorOf(game.id) }} />
                    {game.name || 'Unknown'}
                </div>
            ))}
        </div>
        {day.clusters.map((cluster, i) => {
            const px = (seconds: number) => ((seconds - cluster.start) / 3600) * PX_PER_HOUR
            const blocks = cluster.segments.map((segment) => ({
                segment,
                top: px(segment.start),
                height: Math.max(MIN_BLOCK, px(segment.end) - px(segment.start)),
            }))
            const height = Math.max(...blocks.map((it) => it.top + it.height))
            const hours: number[] = []
            for (let h = Math.ceil(cluster.start / 3600); h * 3600 < cluster.end; h++) {
                if (px(h * 3600) > 14 && height - px(h * 3600) > 14) {
                    hours.push(h)
                }
            }
            const laneWidth = 100 / day.lanes.length
            return (
                <div key={cluster.start}>
                    {i > 0 && (
                        <div
                            style={{
                                margin: '10px 0 14px',
                                textAlign: 'center',
                                fontSize: '11px',
                                opacity: 0.5,
                                borderTop: '1px dashed rgba(255, 255, 255, 0.25)',
                                lineHeight: '14px',
                            }}
                        >
                            <span style={{ position: 'relative', top: -8, padding: '0 8px' }}>
                                ⋯ {humanReadableTime(cluster.start - day.clusters[i - 1].end)}{' '}
                                without play
                            </span>
                        </div>
                    )}
                    <div style={{ position: 'relative', height, marginTop: 6 }}>
                        {hours.map((h) => (
                            <div key={h}>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: AXIS,
                                        right: 0,
                                        top: px(h * 3600),
                                        borderTop: `1px dotted ${GRID}`,
                                    }}
                                />
                                <div style={{ ...label, top: px(h * 3600) - 6, opacity: 0.45 }}>
                                    {clock(h * 3600)}
                                </div>
                            </div>
                        ))}
                        <div style={{ ...label, top: -6, opacity: 0.9, fontWeight: 600 }}>
                            {clock(cluster.start)}
                        </div>
                        <div style={{ ...label, top: height - 6, opacity: 0.9, fontWeight: 600 }}>
                            {clock(cluster.end)}
                        </div>
                        <div style={{ position: 'absolute', left: AXIS, right: 0, top: 0, bottom: 0 }}>
                            {blocks.map(({ segment, top, height: h }) => {
                                const lane = day.lanes.findIndex((g) => g.id === segment.game.id)
                                return (
                                    <div
                                        key={segment.start}
                                        title={`${segment.game.name} · ${clock(segment.start)} – ${clock(
                                            segment.end
                                        )}`}
                                        style={{
                                            position: 'absolute',
                                            top,
                                            height: h,
                                            left: `${lane * laneWidth}%`,
                                            width: `calc(${laneWidth}% - 4px)`,
                                            boxSizing: 'border-box',
                                            background: colorOf(segment.game.id),
                                            borderRadius: 5,
                                            color: '#000',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '2px 6px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                            {segment.game.name || 'Unknown'}
                                        </div>
                                        {h >= 40 && (
                                            <div style={{ fontWeight: 400, opacity: 0.75 }}>
                                                {humanReadableTime(segment.end - segment.start)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )
        })}
    </Card>
)
