import { VFC, useEffect, useState } from 'react'
import { GameWithTime } from '../app/model'
import { useLocator } from '../locator'
import { GamesTable } from '../components/statistics/GamesTable'
import { gameRowsFromTotals } from '../app/insights'
import { report_stack } from '../styles'

export const ReportOverall: VFC = () => {
    const { reports } = useLocator()
    const [data, setData] = useState<GameWithTime[]>([])
    const [isLoading, setLoading] = useState<Boolean>(false)

    useEffect(() => {
        setLoading(true)
        reports.overallStatistics().then((it) => {
            setData(it)
            setLoading(false)
        })
    }, [])

    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!data) {
        return <div>Error while loading data</div>
    }
    return (
        <div style={report_stack}>
            <GamesTable rows={gameRowsFromTotals(data)} defaultExpanded />
        </div>
    )
}
