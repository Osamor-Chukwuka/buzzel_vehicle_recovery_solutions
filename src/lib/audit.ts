import type { AppRole } from '@/lib/types'
import { createAdminClient } from '@/lib/supabase/admin'

export async function writeAudit(input: {
  actorUserId?: string | null
  actorRole?: AppRole | null
  action: string
  entityType: string
  entityId?: string | null
  reason?: string | null
  metadata?: Record<string, unknown>
}) {
  const admin = createAdminClient()
  const { error } = await admin.from('audit_logs').insert({
    actor_user_id: input.actorUserId ?? null,
    actor_role: input.actorRole ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  })
  if (error) throw error
}
