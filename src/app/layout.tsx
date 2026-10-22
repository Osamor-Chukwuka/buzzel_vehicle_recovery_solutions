import type { Metadata } from 'next'
import './globals.css'
import { BuzzelAICopilot } from '@/components/buzzel-ai-copilot'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Buzzel Vehicle Recovery Solutions',
  description: 'Roadside assistance, vehicle recovery and annual vehicle coverage.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<SiteFooter /><BuzzelAICopilot /></body></html>
}
