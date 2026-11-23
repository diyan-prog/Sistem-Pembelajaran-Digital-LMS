import { Navigate, Outlet } from 'react-router-dom'
import { ROLES, type Role } from '@/lib/roles'
import { useApp } from '@/context'

export function RoleGate({ role }: { role: Role }) { const a = useApp(); return a.role === role ? <Outlet /> : <Navigate to={a.role ? ROLES[a.role].base + (a.role === 'tu' ? '/dashboard' : '/beranda') : '/login'} replace /> }
