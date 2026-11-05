import { useEffect, useState } from 'react'
import { GamepadButton, GamepadEvent } from 'decky-frontend-lib'
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

    const onNext = () => show(page.next())
    const onPrev = () => show(page.prev())
    const canPrev = !isLoading && page.hasPrev()
    const canNext = !isLoading && page.hasNext()

    // L2 / R2 switch to the previous / next period; spread onto a Focusable
    // wrapping the report so it works wherever the focus is inside it.
    const triggerPaging = {
        onButtonDown: (evt: GamepadEvent) => {
            if (evt.detail.is_repeat) {
                return
            }
            if (evt.detail.button === GamepadButton.TRIGGER_LEFT && canPrev) {
                onPrev()
            } else if (evt.detail.button === GamepadButton.TRIGGER_RIGHT && canNext) {
                onNext()
            }
        },
        actionDescriptionMap: {
            ...(canPrev && { [GamepadButton.TRIGGER_LEFT]: 'Previous' }),
            ...(canNext && { [GamepadButton.TRIGGER_RIGHT]: 'Next' }),
        },
    }

    return { isLoading, page, previous, onNext, onPrev, triggerPaging }
}
