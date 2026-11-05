import { CSSProperties, FC, ReactNode, useState } from 'react'
import moment from 'moment'
import { DialogButton } from 'decky-frontend-lib'
import { GameRow } from '../../app/insights'
import { Game } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { Card } from '../Card'
import { RADIUS_SMALL } from '../../styles'

const GREEN = '#9dd866'
const RED = '#ca472f'

const cell: CSSProperties = {
    padding: '10px 10px',
    whiteSpace: 'nowrap',
    textAlign: 'right',
}
const nameCell: CSSProperties = {
    ...cell,
    textAlign: 'left',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`
const dayText = (date: string) => moment(date).format('D MMM')

function change(value: GameRow['change']): ReactNode {
    if (value === undefined) {
        return '–'
    }
    if (value === 'new') {
        return <span style={{ color: GREEN }}>new</span>
    }
    const rounded = Math.round(value * 100)
    return (
        <span style={{ color: rounded >= 0 ? GREEN : RED }}>
            {rounded >= 0 ? '+' : '-'}
            {Math.abs(rounded)}%
        </span>
    )
}

/** Collapsible per game table. Period columns are shown when the rows carry them. */
export const GamesTable: FC<{
    rows: GameRow[]
    defaultExpanded?: boolean
    /** When set, each row gets a button to hide that game from the dashboard */
    onHide?: (game: Game) => void
    /** When set, the game name opens that game's statistics */
    onSelect?: (game: Game) => void
}> = (props) => {
    const [expanded, setExpanded] = useState<boolean>(props.defaultExpanded ?? false)
    const isPeriod = props.rows.some((it) => it.activeDays !== undefined)
    const hasChange = props.rows.some((it) => it.change !== undefined)
    const header = ['#', 'Game', 'Time', 'Share']
    if (isPeriod) {
        header.push('Days', 'Avg/day', 'Best day', 'Last played')
    }
    if (hasChange) {
        header.push('vs prev.')
    }
    if (props.onHide) {
        header.push('')
    }

    return (
        <Card>
            <DialogButton
                style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: RADIUS_SMALL,
                }}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? '▾' : '▸'} Games ({props.rows.length})
            </DialogButton>
            {expanded && (
                <div
                    style={{
                        overflowX: 'auto',
                        fontSize: '12px',
                        borderRadius: RADIUS_SMALL,
                        background: 'rgba(255, 255, 255, 0.03)',
                    }}
                >
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr
                                style={{
                                    opacity: 0.65,
                                    background: 'rgba(255, 255, 255, 0.05)',
                                }}
                            >
                                {header.map((it, i) => (
                                    <th
                                        key={it}
                                        style={{
                                            ...cell,
                                            textAlign: i == 1 ? 'left' : 'right',
                                        }}
                                    >
                                        {it}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {props.rows.map((row, i) => (
                                <tr
                                    key={row.game.id}
                                    style={{
                                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    }}
                                >
                                    <td style={{ ...cell, opacity: 0.6 }}>{i + 1}</td>
                                    <td style={nameCell}>
                                        {props.onSelect ? (
                                            <DialogButton
                                                style={{
                                                    width: 'auto',
                                                    minWidth: 0,
                                                    padding: '4px 8px',
                                                    fontSize: '12px',
                                                    textAlign: 'left',
                                                    background: 'transparent',
                                                    borderRadius: RADIUS_SMALL,
                                                }}
                                                onClick={() => props.onSelect!(row.game)}
                                            >
                                                {row.game.name || 'Unknown'}
                                            </DialogButton>
                                        ) : (
                                            row.game.name || 'Unknown'
                                        )}
                                    </td>
                                    <td style={cell}>{humanReadableTime(row.time)}</td>
                                    <td style={cell}>{percent(row.share)}</td>
                                    {isPeriod && (
                                        <>
                                            <td style={cell}>{row.activeDays}</td>
                                            <td style={cell}>
                                                {humanReadableTime(
                                                    row.averagePerActiveDay ?? 0
                                                )}
                                            </td>
                                            <td style={cell}>
                                                {row.bestDay
                                                    ? `${dayText(row.bestDay.date)} · ${humanReadableTime(
                                                          row.bestDay.time
                                                      )}`
                                                    : '–'}
                                            </td>
                                            <td style={cell}>
                                                {row.lastPlayed
                                                    ? dayText(row.lastPlayed)
                                                    : '–'}
                                            </td>
                                        </>
                                    )}
                                    {hasChange && (
                                        <td style={cell}>{change(row.change)}</td>
                                    )}
                                    {props.onHide && (
                                        <td style={cell}>
                                            <DialogButton
                                                style={{
                                                    width: 'auto',
                                                    minWidth: 0,
                                                    padding: '4px 12px',
                                                    fontSize: '12px',
                                                    borderRadius: RADIUS_SMALL,
                                                }}
                                                onClick={() => props.onHide!(row.game)}
                                            >
                                                Hide
                                            </DialogButton>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}
