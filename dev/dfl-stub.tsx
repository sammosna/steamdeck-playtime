// Minimal browser stand-ins for the decky-frontend-lib components the report pages use.
import { CSSProperties, FC, ReactNode } from 'react'

export const Focusable: FC<{ style?: CSSProperties }> = ({ children, style }) => (
    <div style={style}>{children}</div>
)

export const PanelSection: FC<{ title?: string }> = ({ title, children }) => (
    <div style={{ padding: '8px 16px' }}>
        {title && (
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '8px 0' }}>
                {title}
            </div>
        )}
        {children}
    </div>
)

export const PanelSectionRow: FC = ({ children }) => <div>{children}</div>

export const Field: FC<{ label: ReactNode }> = ({ label, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
        <span>{label}</span>
        <span>{children}</span>
    </div>
)

export const DialogButton: FC<{
    style?: CSSProperties
    disabled?: boolean
    onClick?: () => void
}> = ({ children, style, disabled, onClick }) => (
    <button
        style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'inherit',
            border: 'none',
            borderRadius: 4,
            font: 'inherit',
            opacity: disabled ? 0.4 : 1,
            ...style,
        }}
        disabled={disabled}
        onClick={onClick}
    >
        {children}
    </button>
)

export const ButtonItem = DialogButton

export const Tabs: FC<{
    activeTab: string
    onShowTab: (id: string) => void
    tabs: { id: string; title: string; content: ReactNode }[]
}> = ({ activeTab, onShowTab, tabs }) => (
    <div>
        <div style={{ display: 'flex', gap: 16, padding: '8px 16px' }}>
            {tabs.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onShowTab(t.id)}
                    style={{ fontWeight: t.id === activeTab ? 700 : 400 }}
                >
                    {t.title}
                </button>
            ))}
        </div>
        {tabs.find((t) => t.id === activeTab)?.content}
    </div>
)

export enum GamepadButton {
    TRIGGER_LEFT = 7,
    TRIGGER_RIGHT = 8,
}
