import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  fallback: string
  status?: 'online' | 'offline' | 'busy' | 'away' | 'local' | 'connected' | 'disconnected'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, fallback, status, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-[11px]',
    lg: 'w-10 h-10 text-[13px]',
  }

  const statusColors = {
    online: 'bg-green-500',
    connected: 'bg-green-500',
    local: 'bg-void-cyan',
    busy: 'bg-red-500',
    disconnected: 'bg-red-500',
    away: 'bg-yellow-500',
    offline: 'bg-muted-foreground',
  }

  return (
    <div className={cn("shrink-0 rounded-full flex items-center justify-center font-semibold relative", sizeClasses[size], !src && "bg-primary/20 text-primary", className)}>
      {src ? (
        <Image src={src} alt="" width={40} height={40} unoptimized className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
      {status && (
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card",
          size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          statusColors[status as keyof typeof statusColors] || 'bg-muted'
        )} />
      )}
    </div>
  )
}
