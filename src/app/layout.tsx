import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Buzzel Vehicle Recovery Solutions',
  description: 'Roadside assistance, vehicle recovery and annual vehicle coverage.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
