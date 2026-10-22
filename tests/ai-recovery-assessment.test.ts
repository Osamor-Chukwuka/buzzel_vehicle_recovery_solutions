import test from 'node:test'
import assert from 'node:assert/strict'
import { recoveryAssessmentSchema } from '../src/lib/ai/assessment.ts'

test('Gemini recovery assessments must match the operational schema', () => {
  const result = recoveryAssessmentSchema.safeParse({
    summary: 'The symptoms are consistent with a battery or electrical starting issue.',
    likelyIssue: 'Battery or electrical failure',
    riskLevel: 'moderate',
    recommendedService: 'roadside_assistance',
    confidence: 82,
    visibleObservations: [],
    recommendedEquipment: ['Battery booster'],
    safetyActions: ['Keep the vehicle safely parked with hazard lights on.'],
    followUpQuestions: ['Do the dashboard lights illuminate?'],
  })
  assert.equal(result.success, true)
})

test('Gemini recovery assessments reject unsupported actions and confidence values', () => {
  const result = recoveryAssessmentSchema.safeParse({
    summary: 'This response should be rejected because it is not operationally safe.',
    likelyIssue: 'Unknown',
    riskLevel: 'catastrophic',
    recommendedService: 'drive_home',
    confidence: 140,
    visibleObservations: [],
    recommendedEquipment: [],
    safetyActions: [],
    followUpQuestions: [],
  })
  assert.equal(result.success, false)
})
