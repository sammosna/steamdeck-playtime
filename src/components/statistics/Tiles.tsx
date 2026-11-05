import { CSSProperties, FC } from 'react'
import { IconType } from 'react-icons'
import { RADIUS_SMALL } from '../../styles'

const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
}

const tile: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS_SMALL,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
}

/** Large, faint grey filled icon in the top right corner. */
const WatermarkIcon: FC<{ icon: IconType }> = ({ icon: Icon }) => (
    <div
        style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            color: '#ffffff',
            opacity: 0.08,
            pointerEvents: 'none',
        }}
    >
        <Icon size={44} />
    </div>
)

export const Tile: FC<{
    icon: IconType
    label: string
    value: string
    hint?: string
    valueColor?: string
}> = (props) => (
    <div style={tile}>
        <WatermarkIcon icon={props.icon} />
        <div style={{ fontSize: '11px', opacity: 0.6 }}>{props.label}</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: props.valueColor }}>
            {props.value}
        </div>
        {props.hint && <div style={{ fontSize: '11px', opacity: 0.6 }}>{props.hint}</div>}
    </div>
)

/** Titled, responsive grid of Tiles. */
export const TileGroup: FC<{ title?: string }> = ({ title, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {title && <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8 }}>{title}</div>}
        <div style={grid}>{children}</div>
    </div>
)
