import { ServerAPI } from 'decky-frontend-lib'
import logger from '../utils'
import { toIsoDateOnly } from './formatters'
import { DailyStatistics, Session, Game, GameWithTime } from './model'
import { EventBus } from './system'

export interface OverallPlayTimes {
    [gameId: string]: number
}

export interface StatisticForIntervalResponse {
    data: DailyStatistics[]
    hasPrev: boolean
    hasNext: boolean
}

export class Backend {
    private serverApi: ServerAPI
    private eventBus: EventBus

    constructor(eventBus: EventBus, serverApi: ServerAPI) {
        this.eventBus = eventBus
        this.serverApi = serverApi
        let instance = this
        eventBus.addSubscriber(async (event) => {
            switch (event.type) {
                case 'CommitInterval':
                    await instance.addTime(event.startedAt, event.endedAt, event.game)
                    break

                case 'TimeManuallyAdjusted':
                    break
            }
        })
    }

    private async addTime(startedAt: number, endedAt: number, game: Game) {
        await this.serverApi
            .callPluginMethod<
                {
                    started_at: number
                    ended_at: number
                    game_id: string
                    game_name: string
                },
                void
            >('add_time', {
                started_at: startedAt / 1000,
                ended_at: endedAt / 1000,
                game_id: game.id,
                game_name: game.name,
            })
            .then((r) => {
                if (!r.success) {
                    this.errorOnBackend(
                        "Can't save interval, because of backend error (add_time)"
                    )
                }
            })
            .catch((_) => {
                this.errorOnBackend(
                    "Can't save interval, because of backend error (add_time)"
                )
            })
    }

    async fetchDailyStatisticForInterval(
        start: Date,
        end: Date
    ): Promise<StatisticForIntervalResponse> {
        const response = await this.serverApi.callPluginMethod<
            { start_date: string; end_date: string },
            StatisticForIntervalResponse
        >('daily_statistics_for_period', {
            start_date: toIsoDateOnly(start),
            end_date: toIsoDateOnly(end),
        })
        if (!response.success) {
            this.errorOnBackend(
                "Can't fetch statistics for interval, because of backend error (daily_statistics_for_period)"
            )
            return {
                hasNext: false,
                hasPrev: false,
                data: [],
            } as StatisticForIntervalResponse
        }

        return response.result as StatisticForIntervalResponse
    }

    /** Every day with recorded playtime, oldest first. */
    async fetchAllTimeDailyStatistics(): Promise<DailyStatistics[]> {
        const response = await this.serverApi.callPluginMethod<{}, DailyStatistics[]>(
            'all_time_daily_statistics',
            {}
        )
        if (!response.success) {
            this.errorOnBackend(
                "Can't fetch all time daily statistics, because of backend error (all_time_daily_statistics)"
            )
            return []
        }

        return response.result as DailyStatistics[]
    }

    /** Intervals played between two days (inclusive), oldest first. */
    async fetchSessions(start: Date, end: Date): Promise<Session[]> {
        const response = await this.serverApi.callPluginMethod<
            { start_date: string; end_date: string },
            Session[]
        >('sessions_for_period', {
            start_date: toIsoDateOnly(start),
            end_date: toIsoDateOnly(end),
        })
        if (!response.success) {
            this.errorOnBackend(
                "Can't fetch sessions, because of backend error (sessions_for_period)"
            )
            return []
        }
        return response.result as Session[]
    }

    /** Games hidden from the dashboard. They are still tracked. */
    async fetchHiddenGames(): Promise<Game[]> {
        const response = await this.serverApi.callPluginMethod<{}, Game[]>('hidden_games', {})
        if (!response.success) {
            this.errorOnBackend(
                "Can't fetch hidden games, because of backend error (hidden_games)"
            )
            return []
        }
        return response.result as Game[]
    }

    async setGameHidden(gameId: string, hidden: boolean): Promise<boolean> {
        const response = await this.serverApi.callPluginMethod<
            { game_id: string; hidden: boolean },
            boolean
        >('set_game_hidden', { game_id: gameId, hidden })
        if (!response.success) {
            this.errorOnBackend(
                "Can't update hidden games, because of backend error (set_game_hidden)"
            )
            return false
        }
        return true
    }

    async fetchPerGameOverallStatistics(): Promise<GameWithTime[]> {
        const response = await this.serverApi.callPluginMethod<{}, GameWithTime[]>(
            'per_game_overall_statistics',
            {}
        )
        if (!response.success) {
            this.errorOnBackend(
                "Can't fetch per game overall statistics, because of backend error (per_game_overall_statistics)"
            )
            return []
        }

        return response.result as GameWithTime[]
    }

    async applyManualOverallTimeCorrection(games: GameWithTime[]): Promise<boolean> {
        const response = await this.serverApi.callPluginMethod<
            {
                list_of_game_stats: GameWithTime[]
            },
            void
        >('apply_manual_time_correction', {
            list_of_game_stats: games,
        })
        if (!response.success) {
            this.errorOnBackend(
                "Can't apply manual overall time correction, because of backend error (apply_manual_time_correction)"
            )
            return false
        }
        this.eventBus.emit({ type: 'TimeManuallyAdjusted' })
        return true
    }

    private errorOnBackend(message: string) {
        logger.error(`There is an error: ${message}`)
        this.eventBus.emit({
            type: 'NotifyAboutError',
            message: message,
        })
    }
}
