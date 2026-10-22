'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Icon } from './icon'

const AIIncidentAssistant = dynamic(
  () => import('./ai-incident-assistant').then((module) => module.AIIncidentAssistant),
  { loading: () => <div className="grid min-h-72 place-items-center text-sm font-bold text-slate-400"><span className="inline-flex items-center gap-2"><span className="size-4 animate-spin rounded-full border-2 border-slate-600 border-r-red-400"/>Loading Rescue Copilot...</span></div> },
)

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type AssistantPanel = 'menu' | 'chat' | 'rescue'

const greeting: ChatMessage = {
  role: 'assistant',
  content: 'Hi, I’m Buzzel AI. I can help you understand recovery, annual cover, payments or how to start an emergency request.',
}

const suggestions = [
  'I need roadside help',
  'How does annual cover work?',
  'What happens after I request help?',
]

export function BuzzelAICopilot() {
  const pathname = usePathname()
  const hasRescueCopilot = pathname === '/emergency'
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<AssistantPanel>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([greeting])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const menuFirstRef = useRef<HTMLButtonElement | null>(null)
  const rescueBackRef = useRef<HTMLButtonElement | null>(null)
  const launcherRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    if (panel === 'chat') inputRef.current?.focus()
    if (panel === 'menu') menuFirstRef.current?.focus()
    if (panel === 'rescue') rescueBackRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      launcherRef.current?.focus()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, panel])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isSending])

  const send = async (value: string) => {
    const content = value.trim()
    if (!content || isSending) return
    const nextMessages = [...messages, { role: 'user' as const, content }].slice(-10)
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsSending(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const result = await response.json() as { message?: string; error?: string }
      if (!response.ok || !result.message) throw new Error(result.error || 'Buzzel AI could not reply.')
      const reply = result.message
      setMessages((current) => [...current, { role: 'assistant', content: reply }])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Buzzel AI could not reply.')
    } finally {
      setIsSending(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(input)
  }

  const closeLauncher = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  const toggleLauncher = () => {
    if (open) {
      closeLauncher()
      return
    }
    setPanel(hasRescueCopilot ? 'menu' : 'chat')
    setOpen(true)
  }

  return <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
    {open && panel === 'menu' && <section role="dialog" aria-label="Choose a Buzzel AI tool" aria-modal="false" className="mb-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,.28)]">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--buzzel-red)]">Powered by Gemini</p><h2 className="mt-0.5 font-black text-slate-950">How can Buzzel AI help?</h2></div><button type="button" onClick={closeLauncher} aria-label="Close Buzzel AI tools" className="grid size-10 cursor-pointer place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"><Icon name="x" className="size-5"/></button></header>
      <div className="grid gap-3 p-3">
        <button ref={menuFirstRef} type="button" onClick={() => setPanel('chat')} className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition-all hover:border-red-200 hover:bg-red-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Icon name="message" className="size-5"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-slate-950">Ask Buzzel AI</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">Ask about recovery, cover, payments or what happens next.</span></span><Icon name="arrow-right" className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"/></button>
        <button type="button" onClick={() => setPanel('rescue')} className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition-all hover:border-red-200 hover:bg-red-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--buzzel-red)] text-white"><Icon name="spark" className="size-5"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-slate-950">Buzzel AI Rescue Copilot</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">Describe, speak or photograph the vehicle problem for an assessment.</span></span><Icon name="arrow-right" className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"/></button>
      </div>
    </section>}

    {open && panel === 'chat' && <section role="dialog" aria-label="Buzzel AI assistant" aria-modal="false" className="mb-3 flex h-[min(34rem,calc(100dvh-9rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,.28)]">
      <header className="relative overflow-hidden bg-[#101827] px-4 py-4 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-red-500/25 blur-2xl" aria-hidden="true"/>
        <div className="relative flex items-center gap-2">{hasRescueCopilot && <button type="button" onClick={() => setPanel('menu')} aria-label="Back to Buzzel AI options" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><Icon name="chevron-down" className="size-5 rotate-90"/></button>}<span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--buzzel-red)] shadow-lg shadow-red-950/30"><Icon name="spark" className="size-5"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-black">Buzzel AI</h2><span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">Online</span></div><p className="mt-0.5 text-[11px] text-slate-400">Gemini-powered recovery assistant</p></div><button type="button" onClick={closeLauncher} aria-label="Close Buzzel AI" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><Icon name="x" className="size-5"/></button></div>
      </header>

      <div className="bz-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-[var(--buzzel-red)] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'}`}>{message.content}</div></div>)}
        {messages.length === 1 && <div className="flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void send(suggestion)} className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[11px] font-bold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[var(--buzzel-red)]">{suggestion}</button>)}</div>}
        {isSending && <div className="flex justify-start"><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm" aria-label="Buzzel AI is responding"><span className="size-1.5 animate-bounce rounded-full bg-slate-400"/><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]"/><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]"/></div></div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">{error}</div>}
        <div ref={endRef}/>
      </div>

      <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2"><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={800} placeholder="Ask Buzzel AI…" aria-label="Message Buzzel AI" className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"/><button type="submit" disabled={!input.trim() || isSending} aria-label="Send message" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-[var(--buzzel-red)] text-white transition-colors hover:bg-[var(--buzzel-red-dark)] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="send" className="size-4"/></button></div>
        <p className="mt-2 text-center text-[9px] font-semibold text-slate-400">AI can make mistakes. Confirm critical details with the recovery team.</p>
      </form>
    </section>}

    {open && panel === 'rescue' && <section role="dialog" aria-label="Buzzel AI Rescue Copilot" aria-modal="false" className="mb-3 flex h-[min(42rem,calc(100dvh-9rem))] w-[min(32rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.6rem] border border-slate-700 bg-[#101827] shadow-[0_30px_90px_rgba(15,23,42,.32)]">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 text-white"><button ref={rescueBackRef} type="button" onClick={() => setPanel('menu')} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-xs font-extrabold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><Icon name="chevron-down" className="size-4 rotate-90"/>AI options</button><button type="button" onClick={closeLauncher} aria-label="Close Rescue Copilot" className="grid size-10 cursor-pointer place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><Icon name="x" className="size-5"/></button></header>
      <div className="bz-scrollbar flex-1 overflow-y-auto"><AIIncidentAssistant context="launcher"/></div>
    </section>}

    <button ref={launcherRef} type="button" onClick={toggleLauncher} aria-expanded={open} aria-haspopup="dialog" aria-label={open ? 'Close Buzzel AI' : 'Open Buzzel AI'} className="group ml-auto flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-[#101827] p-2 pr-4 text-white shadow-[0_20px_55px_rgba(15,23,42,.3)] transition-all duration-200 hover:-translate-y-1 hover:bg-slate-900">
      <span className="relative grid size-10 place-items-center rounded-xl bg-[var(--buzzel-red)]"><span className="absolute inset-0 animate-ping rounded-xl bg-red-400/30 [animation-duration:2.4s]" aria-hidden="true"/><Icon name={open ? 'x' : 'spark'} className="relative size-5"/></span><span className="text-left"><span className="block text-[9px] font-black uppercase tracking-[.16em] text-red-200">Powered by Gemini</span><span className="block text-sm font-black">Ask Buzzel AI</span></span>
    </button>
  </div>
}
