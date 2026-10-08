import Link from 'next/link'
import { Logo } from '@/components/logo'
import { loginAction, googleSignInAction } from '@/lib/actions/auth'
import { Button, ErrorNotice } from '@/components/ui'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams
  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-8"><div className="mx-auto max-w-md"><div className="mb-6 text-center"><Logo/><h1 className="mt-6 text-2xl font-black">Welcome back</h1><p className="mt-1 text-sm text-slate-500">Sign in to manage vehicles and recovery requests.</p></div><div className="bz-card p-5 sm:p-6"><ErrorNotice message={error}/><form action={loginAction} className="grid gap-4"><input type="hidden" name="next" value={next || '/dashboard'}/><div><label className="bz-label">Email</label><input className="bz-input" type="email" name="email" autoComplete="email" required/></div><div><label className="bz-label">Password</label><input className="bz-input" type="password" name="password" autoComplete="current-password" required/></div><Button type="submit" className="w-full">Sign in</Button></form><div className="my-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200"/>or<span className="h-px flex-1 bg-slate-200"/></div><form action={googleSignInAction}><input type="hidden" name="next" value={next || '/dashboard'}/><Button type="submit" variant="ghost" className="w-full">Continue with Google</Button></form><p className="mt-5 text-center text-sm text-slate-500">New to Buzzel? <Link href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-bold text-[#c52626]">Create account</Link></p></div></div></main>
}
