
import dayjs from 'dayjs'
import { useWalletStore } from '@/stores/walletStore'
import { groupEventsByMonth } from '@/utils/months'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

type Snapshot = {
    balanceInitial: number
    months: Array<{
        year: number
        month: number
        name: string
        flow: { income: number; expense: number; monthly: number; global: number }
    }>
    recentEvents: Array<{
        id: string
        name: string
        amount: number
        type: 'ingreso' | 'egreso'
        date: string
    }>
}

// Límite para no inflar el prompt
const MAX_MONTHS = 6
const MAX_EVENTS = 150

export function useWalletSnapshot(): Snapshot {
    const balanceInitial = useWalletStore(s => s.balanceInitial)
    const events = useWalletStore(s => s.events)

    const monthsFull = groupEventsByMonth(events, balanceInitial)
    const months = monthsFull.slice(0, MAX_MONTHS).map(m => ({
        year: m.year,
        month: m.month,
        name: m.name,
        flow: {
            income: round2(m.flow.income),
            expense: round2(m.flow.expense),
            monthly: round2(m.flow.monthly),
            global: round2(m.flow.global),
        },
    }))

    const recentEvents = [...events]
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .slice(0, MAX_EVENTS)
        .map(e => ({
            id: e.id,
            name: e.name,
            amount: round2(e.amount),
            type: e.type,
            date: e.date,
        }))

    return {
        balanceInitial: round2(balanceInitial),
        months,
        recentEvents,
    }
}
