import { z } from 'zod'

export const recoveryAssessmentSchema = z.object({
  summary: z.string().min(10).max(280),
  likelyIssue: z.string().min(3).max(120),
  riskLevel: z.enum(['low', 'moderate', 'high', 'urgent']),
  recommendedService: z.enum(['roadside_assistance', 'vehicle_recovery', 'emergency_services']),
  confidence: z.number().min(0).max(100),
  visibleObservations: z.array(z.string().max(140)).max(5),
  recommendedEquipment: z.array(z.string().max(100)).max(5),
  safetyActions: z.array(z.string().max(180)).min(1).max(6),
  followUpQuestions: z.array(z.string().max(180)).max(4),
})

export type RecoveryAssessment = z.infer<typeof recoveryAssessmentSchema>

export const riskLabels: Record<RecoveryAssessment['riskLevel'], string> = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
  urgent: 'Urgent',
}

export const serviceLabels: Record<RecoveryAssessment['recommendedService'], string> = {
  roadside_assistance: 'Roadside assistance',
  vehicle_recovery: 'Vehicle recovery',
  emergency_services: 'Contact emergency services',
}
