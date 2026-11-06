import { afterPatch, Focusable, RoutePatch, ServerAPI } from 'decky-frontend-lib'
import { createElement, CSSProperties, Fragment, ReactElement } from 'react'
import { FaClock } from 'react-icons/fa'
import { DETAILED_REPORT_ROUTE, navigateToPage } from '../pages/navigation'
import { AppDetails, AppOverview } from '../app/model'
import { Mountable } from '../app/system'
import { Cache } from '../app/cache'
import { runInAction } from 'mobx'

function routePatch(serverAPI: ServerAPI, path: string, patch: RoutePatch): Mountable {
    return {
        mount() {
            serverAPI.routerHook.addPatch(path, patch)
        },
        unMount() {
            serverAPI.routerHook.removePatch(path, patch)
        },
    }
}

export function patchAppPage(
    serverAPI: ServerAPI,
    timeCache: Cache<Map<string, number>>
): Mountable {
    return routePatch(
        serverAPI,
        '/library/app/:appid',
        (props: { path: string; children: ReactElement }) => {
            afterPatch(props.children.props, 'renderFunc', (_, ret1) => {
                const overview: AppOverview = ret1.props.children.props.overview
                const details: AppDetails = ret1.props.children.props.details
                const app_id: number = overview.appid

                // just getting value - it fixes blinking issue
                details.nPlaytimeForever
                if (overview.app_type == 1073741824) {
                    if (details && timeCache.isReady()) {
                        runInAction(() => {
                            let time = timeCache.get()!.get(app_id.toString()) || 0
                            details.nPlaytimeForever = +(time / 60.0).toFixed(1)
                        })
                    }
                }
                // just getting value - it fixes blinking issue
                details.nPlaytimeForever
                return ret1
            })
            return props
        }
    )
}

// Adds a "PlayTime" pill to the library home, bottom right, that opens the full-screen
// report. Sizes and colors mirror Steam's own footer hints (Menu / Select / Back),
// measured from the footer's computed styles.
const FOOTER_PILL: CSSProperties = {
    position: 'fixed',
    right: 16,
    bottom: 9,
    zIndex: 7000,
    display: 'flex',
    alignItems: 'center',
    height: 34,
    padding: '0 8px',
    borderRadius: 999,
    background: 'rgba(16, 16, 20, 0.28)',
    backdropFilter: 'blur(24px)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
}

const FOOTER_CHIP: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    fontSize: 11,
    fontWeight: 650,
    lineHeight: '22px',
    color: 'rgba(255, 255, 255, 0.85)',
}

// When the Toolbar plugin is installed it hosts this entry in its own footer row (so the
// d-pad can move between the two), and reads the route published here. Skip our own pill then.
export function patchLibraryHome(serverAPI: ServerAPI): Mountable {
    const route = routePatch(serverAPI, '/library/home', (props: { children: ReactElement }) => {
        if ((window as any).__toolbarHostsHomeEntries) return props
        const chip = createElement(
            'div',
            { style: FOOTER_CHIP },
            createElement(FaClock, { size: 13 }),
            'PlayTime'
        )
        const entry = createElement(Focusable, {
            key: 'playtime-entry',
            style: FOOTER_PILL,
            onActivate: () => navigateToPage(DETAILED_REPORT_ROUTE),
            children: chip,
        })
        return { ...props, children: createElement(Fragment, null, props.children, entry) }
    })
    return {
        mount() {
            ;(window as any).__playtimeHomeEntryRoute = DETAILED_REPORT_ROUTE
            route.mount()
        },
        unMount() {
            delete (window as any).__playtimeHomeEntryRoute
            route.unMount()
        },
    }
}
