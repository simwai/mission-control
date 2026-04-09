'use client'

import { Button } from '@/components/ui/button'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

export function NavButton({ item, active, expanded, onClick, onPrefetch }: {
  item: NavItem
  active: boolean
  expanded: boolean
  onClick: () => void
  onPrefetch?: () => void
}) {
  if (expanded) {
    return (
      <Button
        variant={active ? 'navItemActive' : 'navItem'}
        onClick={onClick}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
        aria-current={active ? 'page' : undefined}
      >
        {active && (
          <span className="absolute left-0 w-0.5 h-5 bg-void-cyan rounded-r glow-cyan" />
        )}
        <div className="shrink-0 w-5 h-5">{item.icon}</div>
        <span className="truncate text-sm">{item.label}</span>
      </Button>
    )
  }

  return (
    <Button
      variant={active ? 'navItemActive' : 'ghost'}
      size="icon-lg"
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      title={item.label}
      aria-current={active ? 'page' : undefined}
      className="rounded-lg w-10 h-10"
    >
      <div className="w-5 h-5">{item.icon}</div>
    </Button>
  )
}
