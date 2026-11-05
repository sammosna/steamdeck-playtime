import { useEffect, useState } from 'react'
import { DailyStatistics } from '../app/model'
import { Paginated, empty } from '../app/reports'

/**
 * Pageable per-day report. Also loads the preceding period so views can
 * compare the current one against it.
 */
export function usePeriodReport(load: () => Promise<Paginated<DailyStatistics>>) {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [page, setPage] = useState<Paginated<DailyStatistics>>(empty())
    const [previous, setPrevious] = useState<DailyStatistics[]>([])

    const show = async (loading: Promise<Paginated<DailyStatistics>>) => {
        setLoading(true)
        const current = await loading
        const before = current.hasPrev() ? (await current.prev()).current().data : []
        setPage(current)
        setPrevious(before)
        setLoading(false)
    }

    useEffect(() => {
        show(load())
    }, [])

    return {
        isLoading,
        page,
        previous,
        onNext: () => show(page.next()),
        onPrev: () => show(page.prev()),
    }
}
