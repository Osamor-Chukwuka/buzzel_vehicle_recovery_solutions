import type { RecoveryAssessment } from './assessment'

const AI_DRAFT_KEY = 'buzzel_ai_recovery_assessment'
const AI_DRAFT_EVENT = 'buzzel-ai-draft-change'
const LIFETIME_MS = 60 * 60 * 1000

export type AIRecoveryDraft = {
  version: 1
  description: string
  assessment: RecoveryAssessment
  assistanceDetails: string
  expiresAt: number
}

function formatAssistanceDetails(description: string, assessment: RecoveryAssessment) {
  const lines = [
    description.trim(),
    `Buzzel AI preliminary assessment: ${assessment.summary}`,
    `Likely issue: ${assessment.likelyIssue}.`,
    assessment.recommendedEquipment.length ? `Suggested equipment: ${assessment.recommendedEquipment.join(', ')}.` : '',
  ].filter(Boolean)
  return lines.join('\n').slice(0, 1000)
}

export function saveAIRecoveryDraft(description: string, assessment: RecoveryAssessment) {
  if (typeof window === 'undefined') return
  const draft: AIRecoveryDraft = {
    version: 1,
    description,
    assessment,
    assistanceDetails: formatAssistanceDetails(description, assessment),
    expiresAt: Date.now() + LIFETIME_MS,
  }
  window.localStorage.setItem(AI_DRAFT_KEY, JSON.stringify(draft))
  window.dispatchEvent(new Event(AI_DRAFT_EVENT))
}

export function getAIRecoveryDraftSnapshot() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(AI_DRAFT_KEY)
}

export function parseAIRecoveryDraft(value: string | null) {
  try {
    if (!value) return null
    const draft = JSON.parse(value) as AIRecoveryDraft
    if (draft.version !== 1 || !draft.description || !draft.assessment || !draft.assistanceDetails || draft.expiresAt <= Date.now()) {
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function readAIRecoveryDraft() {
  return parseAIRecoveryDraft(getAIRecoveryDraftSnapshot())
}

export function subscribeAIRecoveryDraft(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener(AI_DRAFT_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(AI_DRAFT_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function clearAIRecoveryDraft() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AI_DRAFT_KEY)
    window.dispatchEvent(new Event(AI_DRAFT_EVENT))
  }
}
