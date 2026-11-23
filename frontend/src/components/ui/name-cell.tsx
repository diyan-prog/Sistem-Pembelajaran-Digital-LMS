import { Avatar } from './avatar'

export const NameCell = ({ name, sub }: { name: string; sub?: string }) => <div className="flex items-center gap-3 min-w-0"><Avatar name={name} /><div className="min-w-0"><div className="font-bold truncate">{name}</div>{sub && <div className="text-xs text-muted">{sub}</div>}</div></div>
