import { CSSProperties } from 'react'

export const BLUE_COLOR = '#1A9FFF'

export const pager_container: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}

export const focus_panel_no_padding: CSSProperties = {
    padding: '0px 0px',
}

export const TableCSS = {
    table__container: {
        overflow: 'scroll',
        height: '100%',
    } as CSSProperties,

    header__row: {
        display: 'grid',
    } as CSSProperties,

    header__col: {
        padding: '10px 10px',
        textAlign: 'center',
        fontWeight: 600,
    } as CSSProperties,

    table__row: {
        padding: '10px 10px 10px 0px',
        textAlign: 'center',
        display: 'grid',
    } as CSSProperties,

    table__row_correct: {
        backgroundColor: '#0c270c',
    } as CSSProperties,

    table__row_not_correct: {
        backgroundColor: '#4d0000',
    } as CSSProperties,
}

export const RADIUS = '14px'
export const RADIUS_SMALL = '10px'
export const GAP = '16px'

export const CardCSS = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: GAP,
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.045)',
        borderRadius: RADIUS,
    } as CSSProperties,

    title: {
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: 0.65,
    } as CSSProperties,
}

/** Vertical stack with consistent breathing room between report blocks. */
export const report_stack: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: GAP,
    padding: `${GAP} 0`,
}
