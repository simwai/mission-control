'use client'

import { useEffect } from 'react'
import { loadPlugins } from '@/lib/plugin-loader'

export function PluginInitializer() {
  useEffect(() => {
    loadPlugins()
  }, [])

  return null
}
