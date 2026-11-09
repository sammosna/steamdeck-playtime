import { VFC } from 'react'
import { PageWrapper } from '../components/PageWrapper'
import { Tab } from '../components/Tab'
import { GamePage } from '../containers/GamePage'
import { currentGameInsightsAppId, navigateBack } from './navigation'

/** Full-screen insights of the game whose Steam page the user came from. */
export const GameInsightsPage: VFC = () => {
    const appId = currentGameInsightsAppId()
    if (appId === null) return null
    const name = appStore.GetAppOverviewByAppID(appId)?.display_name ?? ''
    return (
        <PageWrapper>
            <Tab>
                <GamePage game={{ id: `${appId}`, name }} onBack={navigateBack} />
            </Tab>
        </PageWrapper>
    )
}
