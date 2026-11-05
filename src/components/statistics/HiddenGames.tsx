import { FC, useState } from 'react'
import { DialogButton } from 'decky-frontend-lib'
import { Game } from '../../app/model'
import { Card } from '../Card'
import { RADIUS_SMALL } from '../../styles'

/** Lists games hidden from the dashboard so they can be shown again. */
export const HiddenGames: FC<{ games: Game[]; onShow: (game: Game) => void }> = (props) => {
    const [expanded, setExpanded] = useState<boolean>(false)
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
                {expanded ? '▾' : '▸'} Hidden games ({props.games.length})
            </DialogButton>
            {expanded && props.games.length === 0 && (
                <div style={{ opacity: 0.65, fontSize: '12px' }}>
                    Nothing hidden. Use "Hide" in the games table; play time is still tracked.
                </div>
            )}
            {expanded &&
                props.games.map((game) => (
                    <div
                        key={game.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                        }}
                    >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {game.name || game.id}
                        </span>
                        <DialogButton
                            style={{
                                width: 'auto',
                                minWidth: 0,
                                padding: '6px 14px',
                                borderRadius: RADIUS_SMALL,
                            }}
                            onClick={() => props.onShow(game)}
                        >
                            Show
                        </DialogButton>
                    </div>
                ))}
        </Card>
    )
}
