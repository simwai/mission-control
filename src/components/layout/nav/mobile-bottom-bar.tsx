'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  priority: boolean
}

interface NavGroup {
  id: string
  label?: string
  items: NavItem[]
}

export function MobileBottomBar({ activeTab, navigateToPanel, groups, items }: {
  activeTab: string
  navigateToPanel: (tab: string) => void
  groups: NavGroup[]
  items: NavItem[]
}) {
  const tn = useTranslations('nav')
  const [sheetOpen, setSheetOpen] = useState(false)
  const priorityItems = items.filter(i => i.priority)
  const nonPriorityIds = new Set(items.filter(i => !i.priority).map(i => i.id))
  const moreIsActive = nonPriorityIds.has(activeTab)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-1 h-14">
          {priorityItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'navMobileActive' : 'navMobile'}
              onClick={() => navigateToPanel(item.id)}
            >
              <div className="w-5 h-5">{item.icon}</div>
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Button>
          ))}
          <Button
            variant={moreIsActive ? 'navMobileActive' : 'navMobile'}
            onClick={() => setSheetOpen(true)}
            className="relative"
          >
            <div className="w-5 h-5">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <circle cx="4" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="12" cy="8" r="1.5" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">{tn('more')}</span>
            {moreIsActive && (
              <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Button>
        </div>
      </nav>

      <MobileBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeTab={activeTab}
        navigateToPanel={navigateToPanel}
        groups={groups}
      />
    </>
  )
}

function MobileBottomSheet({ open, onClose, activeTab, navigateToPanel, groups }: {
  open: boolean
  onClose: () => void
  activeTab: string
  navigateToPanel: (tab: string) => void
  groups: NavGroup[]
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
    }
  }, [open])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  if (!open) return null

  return (
    <div className="md:hidden fixed inset-0 z-[60]">
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
      <div className={`absolute bottom-0 left-0 right-0 bg-card rounded-t-lg max-h-[70vh] overflow-y-auto safe-area-bottom transition-transform duration-200 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-muted-foreground/30" /></div>
        <div className="px-4 pb-6">
          {groups.map((group, idx) => (
            <div key={group.id}>
              {idx > 0 && <div className="my-3 border-t border-border" />}
              <div className="px-1 pt-1 pb-2"><span className="text-[10px] tracking-wider text-muted-foreground/60 font-semibold">{group.label || 'CORE'}</span></div>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.flatMap(i => i.children ? i.children : [i]).map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'navMobileActive' : 'navMobile'}
                    onClick={() => { navigateToPanel(item.id); handleClose() }}
                  >
                    <div className="w-5 h-5 shrink-0">{item.icon}</div>
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
