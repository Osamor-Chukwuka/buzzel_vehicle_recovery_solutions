import { CUSTOMER_VISIBLE_STATUS_ORDER, STATUS_LABELS } from '@/lib/constants'
import type { RequestStatus } from '@/lib/types'

export function RequestTimeline({ status }: { status: RequestStatus }) {
  const current = CUSTOMER_VISIBLE_STATUS_ORDER.indexOf(status)
  return <ol className="grid gap-3">{CUSTOMER_VISIBLE_STATUS_ORDER.filter((s) => s !== 'awaiting_payment' || status === 'awaiting_payment').map((item) => {
    const index = CUSTOMER_VISIBLE_STATUS_ORDER.indexOf(item)
    const reached = current >= index && current >= 0
    return <li key={item} className="flex items-center gap-3"><span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${reached ? 'bg-[#d92f2f] text-white' : 'bg-slate-100 text-slate-400'}`}>{reached ? '✓' : '•'}</span><span className={`text-sm font-semibold ${reached ? 'text-slate-900' : 'text-slate-400'}`}>{STATUS_LABELS[item]}</span></li>
  })}</ol>
}
