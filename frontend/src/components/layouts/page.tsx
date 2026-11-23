import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PageSkeleton } from '@/components/ui'

const seen = new Set<string>()
export function Page() {
  const { pathname } = useLocation()
  const [ready, setReady] = useState(pathname)
  const loading = !seen.has(pathname) && ready !== pathname
  useEffect(() => {
    window.scrollTo(0, 0)
    if (seen.has(pathname)) return
    const t = setTimeout(() => { seen.add(pathname); setReady(pathname) }, 450)
    return () => clearTimeout(t)
  }, [pathname])
  return loading ? <PageSkeleton /> : <div key={pathname} className="fade"><Outlet /></div>
}
