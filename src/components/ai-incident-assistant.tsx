'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from './icon'
import { riskLabels, serviceLabels, type RecoveryAssessment } from '@/lib/ai/assessment'
import { saveAIRecoveryDraft } from '@/lib/ai/draft'

type SpeechRecognitionResultLike = { 0?: { transcript?: string } }
type SpeechRecognitionEventLike = { results?: { 0?: SpeechRecognitionResultLike } }
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const riskTone: Record<RecoveryAssessment['riskLevel'], string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  moderate: 'border-amber-200 bg-amber-50 text-amber-800',
  high: 'border-orange-200 bg-orange-50 text-orange-800',
  urgent: 'border-red-200 bg-red-50 text-red-800',
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unable to read image'))
    reader.onerror = () => reject(new Error('Unable to read image'))
    reader.readAsDataURL(file)
  })
}

export function AIIncidentAssistant({ context = 'emergency' }: { context?: 'landing' | 'emergency' | 'launcher' }) {
  const fieldId = useId()
  const fileId = useId()
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [assessment, setAssessment] = useState<RecoveryAssessment | null>(null)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const isCollapsible = context === 'emergency'
  const [isExpanded, setIsExpanded] = useState(!isCollapsible)

  useEffect(() => () => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    recognition.stop()
  }, [])

  const chooseImage = async (file?: File) => {
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPEG, PNG or WebP image.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('The image must be smaller than 3 MB.')
      return
    }
    try {
      setImage(await readFile(file))
      setImageName(file.name)
      setAssessment(null)
    } catch {
      setError('We could not read that image. Please choose another one.')
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const speechWindow = window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setError('Voice input is not supported by this browser. You can type the incident instead.')
      return
    }
    setError('')
    const recognition = new Recognition()
    recognition.lang = 'en-GB'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) setDescription((current) => current ? `${current} ${transcript}` : transcript)
    }
    recognition.onerror = () => setError('We could not capture your voice. Please try again or type what happened.')
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }

  const analyse = async () => {
    if (description.trim().length < 10) {
      setError('Tell us a little more about what happened before running the assessment.')
      return
    }
    setIsAnalysing(true)
    setError('')
    setAssessment(null)
    try {
      const response = await fetch('/api/ai/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), image: image || undefined }),
      })
      const result = await response.json() as { assessment?: RecoveryAssessment; error?: string }
      if (!response.ok || !result.assessment) throw new Error(result.error || 'Assessment failed')
      setAssessment(result.assessment)
      saveAIRecoveryDraft(description.trim(), result.assessment)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Buzzel AI could not complete this assessment.')
    } finally {
      setIsAnalysing(false)
    }
  }

  const toggleExpanded = () => {
    if (isExpanded && isListening) recognitionRef.current?.stop()
    setIsExpanded((current) => !current)
  }

  return <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[#101827] text-white shadow-[0_28px_70px_rgba(15,23,42,.2)]" aria-labelledby={`${fieldId}-title`}>
    <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-red-500/20 blur-3xl" aria-hidden="true"/>
    <div className="pointer-events-none absolute -bottom-16 left-1/4 size-48 rounded-full bg-blue-500/15 blur-3xl" aria-hidden="true"/>
    <div className={`relative p-5 sm:p-6 ${isExpanded ? 'border-b border-white/10' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="inline-flex items-center gap-1.5 rounded-full border border-red-300/20 bg-red-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em] text-red-200"><Icon name="spark" className="size-3.5"/>Powered by Gemini</p><h2 id={`${fieldId}-title`} className={`${isExpanded ? 'mt-3 text-2xl' : 'mt-2 text-xl'} font-black tracking-tight`}>Buzzel AI Rescue Copilot</h2><p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">{isExpanded ? 'Describe the problem, speak it aloud or add a vehicle photo for a preliminary recovery assessment.' : 'Optional: get an AI-assisted preliminary assessment before continuing.'}</p></div>
        {isCollapsible ? <button type="button" onClick={toggleExpanded} aria-expanded={isExpanded} aria-controls={`${fieldId}-content`} className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:self-center"><span>{isExpanded ? 'Collapse' : 'Open AI Copilot'}</span><Icon name="chevron-down" className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}/></button> : <span className="hidden size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-red-300 sm:grid"><Icon name="spark" className="size-6"/></span>}
      </div>
    </div>

    {isExpanded && <div id={`${fieldId}-content`} className="relative space-y-4 p-5 sm:p-6">
      <div>
        <label htmlFor={fieldId} className="text-xs font-extrabold text-slate-200">What happened?</label>
        <div className="relative mt-2">
          <textarea id={fieldId} value={description} onChange={(event) => { setDescription(event.target.value); setAssessment(null) }} maxLength={1500} rows={4} placeholder="For example: My car will not start, the dashboard lights are flickering and I am parked on the roadside…" className="w-full resize-y rounded-2xl border border-white/10 bg-white/[.07] px-4 py-3 pr-14 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/15"/>
          <button type="button" onClick={toggleVoice} aria-pressed={isListening} aria-label={isListening ? 'Stop voice input' : 'Describe the incident by voice'} className={`absolute bottom-3 right-3 grid size-10 cursor-pointer place-items-center rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'}`}><Icon name="mic" className="size-5"/></button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500"><span>{isListening ? 'Listening… speak clearly' : 'Type or use the microphone'}</span><span>{description.length}/1500</span></div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input id={fileId} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void chooseImage(event.target.files?.[0])}/>
        <label htmlFor={fileId} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[.07] px-4 py-2 text-xs font-extrabold text-slate-200 transition-colors hover:bg-white/12"><Icon name="camera" className="size-4"/>{image ? 'Replace photo' : 'Add vehicle photo'}</label>
        {image && <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-1.5 pr-3"><Image src={image} alt="Selected vehicle issue" width={40} height={40} unoptimized className="size-10 rounded-lg object-cover"/><span className="max-w-36 truncate text-xs font-semibold text-slate-300">{imageName}</span><button type="button" onClick={() => { setImage(null); setImageName(''); setAssessment(null) }} aria-label="Remove vehicle photo" className="grid size-7 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"><Icon name="x" className="size-4"/></button></div>}
      </div>

      <button type="button" onClick={() => void analyse()} disabled={isAnalysing || description.trim().length < 10} className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--buzzel-red)] px-5 py-3 text-sm font-black text-white shadow-[0_15px_35px_rgba(201,35,47,.28)] transition-all hover:bg-[var(--buzzel-red-dark)] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50">
        {isAnalysing ? <><span className="size-4 animate-spin rounded-full border-2 border-white/35 border-r-white"/>Gemini is assessing…</> : <><Icon name="spark" className="size-4"/>Create AI recovery assessment</>}
      </button>

      {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-xs font-semibold leading-5 text-red-100">{error}</div>}
      <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500"><Icon name="lock" className="mt-0.5 size-3.5 shrink-0"/>Photos are sent to Gemini for this assessment and are not stored by Buzzel. AI results must be confirmed by the customer and recovery team.</p>

      {assessment && <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--buzzel-red)]">Preliminary assessment</p><h3 className="mt-1 text-lg font-black">{assessment.likelyIssue}</h3></div>
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${riskTone[assessment.riskLevel]}`}>{riskLabels[assessment.riskLevel]}</span>
        </div>
        <div className="space-y-4 p-4">
          <p className="text-sm leading-6 text-slate-600">{assessment.summary}</p>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recommended response</p><p className="mt-1 text-sm font-extrabold">{serviceLabels[assessment.recommendedService]}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assessment confidence</p><p className="mt-1 text-sm font-extrabold">{Math.round(assessment.confidence)}%</p></div></div>
          {assessment.visibleObservations.length > 0 && <div><p className="text-xs font-black text-slate-900">Visible in the photo</p><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">{assessment.visibleObservations.map((item) => <li key={item} className="flex gap-2"><Icon name="check" className="mt-0.5 size-3.5 shrink-0 text-emerald-600"/>{item}</li>)}</ul></div>}
          <div><p className="text-xs font-black text-slate-900">Do this now</p><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">{assessment.safetyActions.map((item) => <li key={item} className="flex gap-2"><Icon name="shield" className="mt-0.5 size-3.5 shrink-0 text-[var(--buzzel-red)]"/>{item}</li>)}</ul></div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800">Assessment saved. It will prefill the details in your recovery request.</div>
          {context === 'landing' && <Link href="/emergency" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white hover:bg-slate-800">Continue to emergency request<Icon name="arrow-right" className="size-4"/></Link>}
        </div>
      </div>}
    </div>}
  </section>
}
