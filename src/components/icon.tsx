import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'emergency'
  | 'requests'
  | 'vehicle'
  | 'coverage'
  | 'profile'
  | 'jobs'
  | 'customers'
  | 'finance'
  | 'team'
  | 'disputes'
  | 'audit'
  | 'settings'
  | 'location'
  | 'route'
  | 'message'
  | 'clock'
  | 'check'
  | 'arrow-right'
  | 'phone'
  | 'lock'
  | 'spark'
  | 'camera'
  | 'mic'
  | 'send'
  | 'x'
  | 'shield'
  | 'chevron-down'

const iconPaths: Record<IconName, ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></>,
  emergency: <><path d="M12 22s7-5.5 7-13a7 7 0 1 0-14 0c0 7.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></>,
  requests: <><path d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
  vehicle: <><path d="m5 11 1.6-4.2A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.8L19 11"/><path d="M3 12.5A1.5 1.5 0 0 1 4.5 11h15a1.5 1.5 0 0 1 1.5 1.5V18H3v-5.5Z"/><path d="M6 18v2M18 18v2M7 14h.01M17 14h.01"/></>,
  coverage: <><path d="M12 3 4.5 6v5.5c0 4.7 3 7.7 7.5 9.5 4.5-1.8 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
  jobs: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
  customers: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 15a5 5 0 0 1 3.5 5"/></>,
  finance: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 15h3"/></>,
  team: <><circle cx="8" cy="9" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13.5 14a5 5 0 0 1 7 4.5"/></>,
  disputes: <><path d="M12 3 4 6.5v5c0 4.4 2.8 7.4 8 9.5 5.2-2.1 8-5.1 8-9.5v-5L12 3Z"/><path d="M12 8v5M12 17h.01"/></>,
  audit: <><path d="M4 4h10v16H4z"/><path d="M8 8h2M8 12h2M8 16h2M14 8h6M14 12h6M14 16h6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  location: <><path d="M12 22s7-5.5 7-13a7 7 0 1 0-14 0c0 7.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></>,
  route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3"/></>,
  message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/><path d="M8 9h8M8 13h5"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  'arrow-right': <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  phone: <path d="M7.1 3.5 4.9 5.1c-.8.6-1.1 1.7-.7 2.7 2.6 6.1 7.5 11 13.6 13.6 1 .4 2.1.1 2.7-.7l1.6-2.2c.6-.8.5-2-.2-2.7l-2.8-2.4c-.7-.6-1.7-.7-2.5-.2l-1.7 1.1a14.5 14.5 0 0 1-5.2-5.2l1.1-1.7c.5-.8.4-1.8-.2-2.5L9.8 3.7c-.7-.7-1.9-.8-2.7-.2Z"/>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></>,
  camera: <><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></>,
  send: <><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></>,
  x: <><path d="m6 6 12 12M18 6 6 18"/></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.7 3 7.7 7.5 9.5 4.5-1.8 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="M12 8v4M12 16h.01"/></>,
  'chevron-down': <path d="m6 9 6 6 6-6"/>,
}

export function Icon({ name, className = 'size-5', ...props }: { name: IconName; className?: string } & Omit<SVGProps<SVGSVGElement>, 'children'>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
    {iconPaths[name]}
  </svg>
}
