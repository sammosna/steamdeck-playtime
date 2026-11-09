import { Navigation } from 'decky-frontend-lib'

export let SETTINGS_ROUTE = '/playtime/settings'
export let DETAILED_REPORT_ROUTE = '/playtime/detailed-report'
export let MANUALLY_ADJUST_TIME = '/playtime/manually-adjust-time'

export let GAME_INSIGHTS_ROUTE = '/playtime/game-insights'

// The route component gets no props, so the game to show is handed over here.
let gameInsightsAppId: number | null = null

export function currentGameInsightsAppId() {
    return gameInsightsAppId
}

export function navigateToGameInsights(appId: number) {
    gameInsightsAppId = appId
    navigateToPage(GAME_INSIGHTS_ROUTE)
}

export function navigateToPage(url: string) {
    Navigation.CloseSideMenus()
    Navigation.Navigate(url)
}

export function navigateBack() {
    Navigation.CloseSideMenus()
    Navigation.NavigateBack()
}
