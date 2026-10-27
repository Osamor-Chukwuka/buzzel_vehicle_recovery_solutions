'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAccount } from '@/lib/queries/account'

const schema = z.object({
  registrationNumber: z.string().min(2).max(20),
  vehicleType: z.enum(['motorcycle', 'tricycle', 'car_suv', 'bus_van', 'lorry']),
  make: z.string().max(60).optional(), model: z.string().max(60).optional(), color: z.string().max(40).optional(),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
})

export async function addVehicleAction(formData: FormData) {
  const { user } = await requireRole(['customer'])
  const account = await getCurrentAccount(user.id)
  if (!account) throw new Error('No customer account was found')
  const parsed = schema.safeParse({
    registrationNumber: formData.get('registrationNumber'), vehicleType: formData.get('vehicleType'),
    make: formData.get('make') || undefined, model: formData.get('model') || undefined,
    color: formData.get('color') || undefined, year: formData.get('year') || undefined,
  })
  if (!parsed.success) redirect('/vehicles/new?error=Please+check+the+vehicle+details')
  const supabase = await createClient()
  const { error } = await supabase.from('vehicles').insert({
    account_id: account.id, created_by: user.id,
    registration_number: parsed.data.registrationNumber.toUpperCase().trim(),
    vehicle_type: parsed.data.vehicleType, make: parsed.data.make || null, model: parsed.data.model || null,
    color: parsed.data.color || null, year: parsed.data.year || null,
  })
  if (error?.code === '23505') redirect('/vehicles/new?error=A+vehicle+with+this+registration+number+already+exists')
  if (error) redirect(`/vehicles/new?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/vehicles')
  redirect('/vehicles?success=Vehicle+added+successfully')
}
