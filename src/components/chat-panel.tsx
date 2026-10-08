'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessageAction } from '@/lib/actions/chat'
import { SubmitButton } from '@/components/submit-button'

type Message = { id: number; request_id: string; sender_user_id: string; body: string; created_at: string }
type SenderLabel = { name: string; role: string }

export function ChatPanel({ requestId, currentUserId, initialMessages, senderLabels = {} }: { requestId: string; currentUserId: string; initialMessages: Message[]; senderLabels?: Record<string, SenderLabel> }) {
  const [messages, setMessages] = useState(initialMessages)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const channel = supabase.channel(`request-chat:${requestId}`).on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'request_messages', filter: `request_id=eq.${requestId}`,
    }, (payload) => {
      const next = payload.new as Message
      setMessages((current) => current.some((m) => m.id === next.id) ? current : [...current, next])
    }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [requestId, supabase])

  const action = sendMessageAction.bind(null, requestId)
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-100 px-4 py-3"><h3 className="font-extrabold">Request chat</h3><p className="text-xs text-slate-500">Customer, assigned team and Admin can use this request-specific conversation.</p></div>
    <div className="bz-scrollbar flex max-h-80 min-h-52 flex-col gap-2 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
      {messages.length === 0 && <p className="m-auto text-center text-sm text-slate-400">No messages yet. Use this chat for request-specific updates.</p>}
      {messages.map((message) => {
        const mine = message.sender_user_id === currentUserId
        const sender = senderLabels[message.sender_user_id]
        return <div key={message.id} className={`max-w-[85%] ${mine ? 'ml-auto' : 'mr-auto'}`}>
          {!mine && <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{sender?.name || 'Buzzel participant'}{sender?.role ? ` · ${sender.role.replaceAll('_', ' ')}` : ''}</p>}
          <div className={`rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-[#d92f2f] text-white' : 'border border-slate-200 bg-white text-slate-800'}`}><p>{message.body}</p><p className={`mt-1 text-[10px] ${mine ? 'text-red-100' : 'text-slate-400'}`}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
        </div>
      })}
    </div>
    <form action={action} className="flex gap-2 border-t border-slate-100 p-3"><input name="body" className="bz-input min-w-0" placeholder="Type a message…" maxLength={4000} required aria-label="Chat message"/><SubmitButton pendingText="Sending…" variant="secondary" className="px-4">Send</SubmitButton></form>
  </div>
}
