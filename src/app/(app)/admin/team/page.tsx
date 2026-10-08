import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { inviteTeamMemberAction, updateStaffRoleAction } from '@/lib/actions/admin'
import { Button, Card, PageHeader, SuccessNotice } from '@/components/ui'
import { formatDateTime } from '@/lib/format'

export default async function TeamManagementPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams
  const { profile } = await requireRole(['admin', 'super_admin'])
  const supabase = await createClient()
  const [{ data: people }, { data: invites }] = await Promise.all([
    supabase.from('profiles').select('*').in('role', ['team', 'admin', 'super_admin']).order('created_at', { ascending: false }),
    supabase.from('team_invitations').select('*').order('created_at', { ascending: false }).limit(20),
  ])

  return <>
    <PageHeader title="Team management" description="Invite assistance/recovery team members. Super Admins can also invite Admins."/>
    <SuccessNotice message={success}/>
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <Card className="p-5">
        <h2 className="font-black">Send invitation</h2>
        <form action={inviteTeamMemberAction} className="mt-4 grid gap-3">
          <div><label className="bz-label">Email</label><input name="email" type="email" className="bz-input" required/></div>
          <div><label className="bz-label">Role</label><select name="role" className="bz-input"><option value="team">Assistance / Recovery Team</option>{profile.role === 'super_admin' && <option value="admin">Admin</option>}</select></div>
          <Button type="submit" pendingText="Sending invitation…">Send invitation</Button>
        </form>
        <p className="mt-3 text-xs leading-5 text-slate-400">Invitation links expire after 7 days. Email delivery uses Resend when configured.</p>
      </Card>
      <div className="grid gap-5">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-4"><h2 className="font-black">Current users</h2></div>
          {people?.map((person) => <div key={person.id} className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0">
            <div><p className="font-bold">{person.full_name || 'Unnamed user'}</p><p className="text-xs text-slate-500">{person.phone || 'No phone'}</p></div>
            {profile.role === 'super_admin' && (person.role === 'team' || person.role === 'admin') ? <form action={updateStaffRoleAction.bind(null, person.id)} className="flex items-center gap-2"><select name="role" defaultValue={person.role} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold"><option value="team">Team</option><option value="admin">Admin</option></select><Button type="submit" pendingText="Updating…" variant="ghost" className="min-h-8 px-2 py-1 text-xs">Update</Button></form> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize">{person.role.replace('_', ' ')}</span>}
          </div>)}
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-4"><h2 className="font-black">Recent invitations</h2></div>
          {invites?.length ? invites.map((invite) => <div key={invite.id} className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0"><div><p className="font-bold">{invite.email}</p><p className="text-xs text-slate-400">{formatDateTime(invite.created_at)}</p></div><span className="text-xs font-bold capitalize text-slate-600">{invite.status}</span></div>) : <p className="p-5 text-sm text-slate-500">No invitations yet.</p>}
        </Card>
      </div>
    </div>
  </>
}
