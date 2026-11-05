import { FC } from 'react'
import moment from 'moment'
import { Field, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { computeInsights } from '../../app/insights'
import { FocusableExt } from '../FocusableExt'

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`

export const PeriodInsights: FC<{
    statistics: DailyStatistics[]
    previous: DailyStatistics[]
}> = (props) => {
    const insights = computeInsights(props.statistics, props.previous)
    const delta = insights.deltaVsPrevious
    const rows: [string, string][] = [
        [
            'Total',
            delta === undefined
                ? humanReadableTime(insights.total)
                : `${humanReadableTime(insights.total)} (${delta >= 0 ? '+' : '-'}${percent(
                      Math.abs(delta)
                  )} vs previous)`,
        ],
        ['Daily average', humanReadableTime(insights.dailyAverage)],
        ['Days played', `${insights.activeDays} of ${insights.elapsedDays}`],
        ['Average on days played', humanReadableTime(insights.averageOnActiveDays)],
        ['Longest streak', `${insights.longestStreak} day${insights.longestStreak == 1 ? '' : 's'}`],
    ]
    if (insights.bestDay) {
        rows.push([
            'Best day',
            `${moment(insights.bestDay.date).format('ddd D MMM')} · ${humanReadableTime(
                insights.bestDay.time
            )}`,
        ])
    }
    if (insights.topGame) {
        rows.push([
            'Most played',
            `${insights.topGame.game.name} · ${percent(insights.topGame.share)}`,
        ])
    }
    return (
        <FocusableExt>
            <PanelSection title="Insights">
                {rows.map(([label, value]) => (
                    <PanelSectionRow key={label}>
                        <Field label={label} bottomSeparator="none">
                            {value}
                        </Field>
                    </PanelSectionRow>
                ))}
            </PanelSection>
        </FocusableExt>
    )
}
