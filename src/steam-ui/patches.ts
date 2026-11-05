import { afterPatch, DialogButton, RoutePatch, ServerAPI } from 'decky-frontend-lib'
import { createElement, Fragment, ReactElement } from 'react'
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

// Adds a floating "PlayTime" button over the library home that opens the full-screen
// report, so stats are reachable without opening the Decky panel.
export function patchLibraryHome(serverAPI: ServerAPI): Mountable {
    return routePatch(serverAPI, '/library/home', (props: { children: ReactElement }) => {
        const button = createElement(
            DialogButton,
            {
                key: 'playtime-entry',
                onClick: () => navigateToPage(DETAILED_REPORT_ROUTE),
                style: {
                    position: 'fixed',
                    top: 50,
                    right: 16,
                    zIndex: 100,
                    width: 'auto',
                    minWidth: 0,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                },
            },
            createElement(FaClock),
            'PlayTime'
        )
        return { ...props, children: createElement(Fragment, null, props.children, button) }
    })
}
