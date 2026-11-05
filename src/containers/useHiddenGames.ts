import { useEffect, useMemo, useState } from 'react'
import { Game } from '../app/model'
import { useLocator } from '../locator'

/** Games hidden from the dashboard, persisted in the backend. */
export function useHiddenGames() {
    const { reports } = useLocator()
    const [hidden, setHidden] = useState<Game[]>([])

    useEffect(() => {
        reports.hiddenGames().then(setHidden)
    }, [])

    const hiddenIds = useMemo(() => new Set(hidden.map((it) => it.id)), [hidden])

    const setGameHidden = async (game: Game, value: boolean) => {
        if (await reports.setGameHidden(game, value)) {
            setHidden((current) => [
                ...current.filter((it) => it.id !== game.id),
                ...(value ? [game] : []),
            ])
        }
    }

    return {
        hidden,
        hiddenIds,
        hide: (game: Game) => setGameHidden(game, true),
        show: (game: Game) => setGameHidden(game, false),
    }
}
