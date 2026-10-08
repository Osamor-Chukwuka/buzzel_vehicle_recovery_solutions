import { Logo } from '@/components/logo'
import { EmergencyLocator } from '@/components/emergency-locator'

export default function EmergencyPage() {
  return <main className="min-h-screen bg-[#f7f8fa]"><header className="bg-[#d92f2f] px-4 py-4 text-white"><div className="mx-auto flex max-w-md items-center justify-between"><Logo compact /><span className="text-xs font-bold">Emergency assistance</span></div></header><div className="mx-auto max-w-md px-5 py-12"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-[#d92f2f]">Panic moment</p><h1 className="mt-2 text-3xl font-black tracking-tight">Emergency?</h1><p className="mt-2 text-sm text-slate-500">Tap the button to capture your location, then continue to request immediate assistance.</p></div><div className="mt-12"><EmergencyLocator /></div><p className="mt-10 text-center text-xs leading-5 text-slate-400">If you are in immediate danger, contact the appropriate local emergency service first.</p></div></main>
}
