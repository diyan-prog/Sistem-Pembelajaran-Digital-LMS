import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, HelpCircle, Megaphone } from 'lucide-react'
import { Badge, Card, CardTitle, Empty, cn } from '@/components/ui'
import { useApp } from '@/context'
import { supabase } from '@/lib/supabase'
import { fmtTglPendek, siswaOfferings } from '@/mocks'
import { adminList, fetchPengumumanGo } from '@/services/api-go';
import { fetchSiswaClassesGo } from '@/services/siswa';
import { fromPengampuToOffering } from '@/services/akademik'
import { ClassBrowser, ScheduleCard } from '@/pages/shared'
import { shortBatas } from './deadline'

export function PerluDikerjakan({ limit }: { limit?: number }) {
  const { userData, toast } = useApp()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!userData?.id) return
    try {
      const [ts, ks] = await Promise.all([
        adminList<any>('tugas'),
        adminList<any>('kuis')
      ])

      const all = [
        ...(ts || []).map(t => ({ k: 'tugas', id: t.id_tugas, judul: t.judul, off: t.id_pengampu, batas: t.deadline, mapel: t.pengampu?.subjects?.name })),
        ...(ks || []).map(k => ({ k: 'kuis', id: k.id_kuis, judul: k.judul, off: k.id_pengampu, batas: k.waktu_selesai, mapel: k.pengampu?.subjects?.name }))
      ].sort((a, b) => a.batas.localeCompare(b.batas))
      
      setItems(all)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    const c1 = supabase.channel('tugas-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tugas' }, fetch).subscribe()
    const c2 = supabase.channel('kuis-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'kuis' }, fetch).subscribe()
    return () => { supabase.removeChannel(c1); supabase.removeChannel(c2) }
  }, [userData?.id])

  if (loading) return <Card><div className="animate-pulse h-40 bg-gray-100 rounded-2xl" /></Card>

  return (
    <Card>
      <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold flex items-center gap-2">Perlu Dikerjakan<span className="min-w-6 h-6 px-2 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center">{items.length}</span></h3><Link to="/siswa/tugas" className="text-sm font-bold text-accent hover:underline">Lihat Semua</Link></div>
      {items.length === 0 ? <Empty title="Semua beres!" text="Tidak ada tugas atau kuis yang perlu dikerjakan." /> : <ul className="space-y-1">{items.slice(0, limit ?? 5).map((t) => (
        <li key={t.id}><Link to={t.k === 'tugas' ? `/siswa/tugas/${t.id}` : `/siswa/kuis/${t.id}`} className="flex gap-3 p-3 -mx-3 rounded-2xl hover:bg-gray-50"><span className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', t.k === 'kuis' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-accent')}>{t.k === 'kuis' ? <HelpCircle size={19} /> : <ClipboardList size={19} />}</span>
          <span className="min-w-0"><span className="block font-bold text-sm leading-snug">{t.judul}</span><span className="block text-xs text-muted uppercase mt-0.5">{t.mapel}</span><span className="block text-xs text-danger font-semibold mt-1">{shortBatas(t.batas)}</span></span></Link></li>))}</ul>}
    </Card>
  )
}

export function SiswaBeranda() {
  const { userData } = useApp()
  const [news, setNews] = useState<any[]>([])
  const [offerings, setOfferings] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [pengumuan, siswaClasses] = await Promise.all([
          fetchPengumumanGo('siswa'),
          userData?.id ? fetchSiswaClassesGo(userData.id) : Promise.resolve([])
        ]);
        setNews(pengumuan.slice(0, 3));

        const offs = siswaClasses.length > 0 ? siswaClasses : siswaOfferings('k2');
        setOfferings(offs);
      } catch (err) {
        console.error('Fetch error:', err)
        setOfferings(siswaOfferings('k2'))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    const channel = supabase.channel('news-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'pengumuman' }, fetchAll).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userData?.id])

  return (
    <div>
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        <div className="space-y-6"><ScheduleCard offs={offerings} mode="siswa" loading={loading} /><PerluDikerjakan /></div>
        <div className="space-y-8 min-w-0"><ClassBrowser mode="siswa" to="/siswa/kelas" />
          <Card><CardTitle icon={<Megaphone size={20} className="text-primary" />} right={<Link to="/siswa/pengumuman" className="text-sm font-bold text-accent hover:underline">Lihat Semua</Link>}>Pengumuman Terbaru</CardTitle>
            <ul className="divide-y divide-line">{news.map((p) => <li key={p.id}><Link to={`/siswa/pengumuman/${p.id}`} className="flex items-start gap-3 py-3 hover:text-primary-dark"><div className="flex-1"><div className="font-bold text-sm">{p.judul}</div><div className="text-xs text-muted mt-0.5">{p.dibuat_oleh} â€¢ {p.created_at ? fmtTglPendek(new Date(p.created_at)) : ''}</div></div>{p.penting && <Badge tone="red">Penting</Badge>}</Link></li>)}</ul></Card></div>
      </div>
    </div>
  )
}