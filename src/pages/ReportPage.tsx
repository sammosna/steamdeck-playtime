import { useState, VFC } from 'react'
import { Tab } from '../components/Tab'
import { Tabs } from 'decky-frontend-lib'
import { PageWrapper } from '../components/PageWrapper'
import { ReportMonthly } from '../containers/ReportMonthly'
import { ReportDaily } from '../containers/ReportDaily'
import { ReportWeekly } from '../containers/ReportWeekly'
import { ReportOverall } from '../containers/ReportOverall'
import { GamePage } from '../containers/GamePage'
import { Game } from '../app/model'

export const DetailedPage: VFC = () => {
    const [currentTabRoute, setCurrentTabRoute] = useState<string>('all-time')
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    if (selectedGame) {
        return (
            <PageWrapper>
                <Tab>
                    <GamePage game={selectedGame} onBack={() => setSelectedGame(null)} />
                </Tab>
            </PageWrapper>
        )
    }
    return (
        <PageWrapper>
            <Tabs
                activeTab={currentTabRoute}
                onShowTab={(tabId: string) => {
                    setCurrentTabRoute(tabId)
                }}
                tabs={[
                    {
                        title: 'All Time',
                        content: (
                            <Tab>
                                <ReportOverall onSelectGame={setSelectedGame} />
                            </Tab>
                        ),
                        id: 'all-time',
                    },
                    {
                        title: 'By Day',
                        content: (
                            <Tab>
                                <ReportDaily onSelectGame={setSelectedGame} />
                            </Tab>
                        ),
                        id: 'by-day',
                    },
                    {
                        title: 'By Week',
                        content: (
                            <Tab>
                                <ReportWeekly onSelectGame={setSelectedGame} />
                            </Tab>
                        ),
                        id: 'by-week',
                    },
                    {
                        title: 'By Month',
                        content: (
                            <Tab>
                                <ReportMonthly onSelectGame={setSelectedGame} />
                            </Tab>
                        ),
                        id: 'by-month',
                    },
                ]}
            />
        </PageWrapper>
    )
}
