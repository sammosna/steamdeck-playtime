import * as React from 'react'
import * as ReactDOM from 'react-dom'

// The plugin is compiled against Steam's React exposed as SP_REACT, and Settings
// reads from Steam's storage: provide both before loading app code.
;(window as any).SP_REACT = React
;(window as any).SteamClient = {
    Storage: {
        // ChartStyle.PIE_AND_BARS = 0, so the doughnut is visible while developing
        GetJSON: async (key: string) =>
            localStorage.getItem(key) ??
            JSON.stringify({ gameChartStyle: 0, reminderToTakeBreaksInterval: -1 }),
        SetObject: async (key: string, value: unknown) =>
            localStorage.setItem(key, JSON.stringify(value)),
    },
}

async function start() {
    const { Backend } = await import('../src/app/backend')
    const { EventBus } = await import('../src/app/system')
    const { Reports } = await import('../src/app/reports')
    const { Settings } = await import('../src/app/settings')
    const { SessionPlayTime } = await import('../src/app/SessionPlayTime')
    const { TimeManipulation } = await import('../src/app/time-manipulation')
    const { LocatorProvider } = await import('../src/locator')
    const { DetailedPage } = await import('../src/pages/ReportPage')

    const serverApi = {
        callPluginMethod: async (method: string, args: unknown) =>
            (
                await fetch(`/api/${method}`, {
                    method: 'POST',
                    body: JSON.stringify(args),
                })
            ).json(),
    }
    const eventBus = new EventBus()
    const backend = new Backend(eventBus, serverApi as any)
    ReactDOM.render(
        <LocatorProvider
            reports={new Reports(backend)}
            settings={new Settings()}
            sessionPlayTime={new SessionPlayTime(eventBus)}
            timeManipulation={new TimeManipulation(backend)}
        >
            <DetailedPage />
        </LocatorProvider>,
        document.getElementById('root')
    )
}
start()
