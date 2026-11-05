import { FC } from 'react'
import { Focusable } from 'decky-frontend-lib'
import { CardCSS } from '../styles'

/** Rounded, focusable block with an optional title. */
export const Card: FC<{ title?: string }> = ({ title, children }) => (
    <Focusable style={CardCSS.card} onActivate={() => {}}>
        {title && <div style={CardCSS.title}>{title}</div>}
        {children}
    </Focusable>
)
