import { useState } from 'react'
import { Card, Chips, Empty, PageHeader, SearchBar, Select, Tabs, useCrumbs, useTab } from '@/components/ui'
import { kuis, offeringById, subjectById, tugas } from '@/data'
import { KuisCard } from '@/pages/shared'
import { TugasRow } from './tugas-row'

export function TugasKuisPage() {
  const [tab, setTab] = useTab('tugas'); const [f, setF] = useState('Semua'); const [q, setQ] = useState(''); const [sort, setSort] = useState('Terdekat')
  const mine = tugas.filter((t) => offeringById(t.off).kelasId === 'k2'); const kz = kuis.filter((k) => offeringById(k.off).kelasId === 'k2')
  const st = ['Belum Dikumpulkan', 'Dikumpulkan', 'Terlambat', 'Dinilai']
  const list = mine.filter((t) => (f === 'Semua' || t.status === f) && (t.judul + subjectById(offeringById(t.off).subjectId).nama).toLowerCase().includes(q.toLowerCase())).sort((a, b) => (sort === 'Terdekat' ? 1 : -1) * a.batas.localeCompare(b.batas))
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tugas & Kuis' })} title="Tugas & Kuis" subtitle="Pantau semua tugas dan kuis dari seluruh kelasmu" />
      <Tabs className="mb-6" tabs={[{ v: 'tugas', l: 'Tugas', n: mine.length }, { v: 'kuis', l: 'Kuis', n: kz.length }]} value={tab} onChange={setTab} />
      {tab === 'tugas' ? <div className="space-y-4">
        <Chips value={f} onChange={setF} options={[{ k: 'Semua', l: 'Semua', n: mine.length }, ...st.map((s) => ({ k: s, l: s, n: mine.filter((t) => t.status === s).length }))]} />
        <div className="flex flex-wrap gap-3"><SearchBar value={q} onChange={setQ} placeholder="Cari judul tugas atau mata pelajaran" className="w-96 max-w-full" /><Select aria-label="Urutkan" value={sort} onChange={(e) => setSort(e.target.value)} options={[{ v: 'Terdekat', l: 'Urutkan: batas terdekat' }, { v: 'Terjauh', l: 'Urutkan: batas terjauh' }]} className="w-56" /></div>
        <Card pad={false} className="overflow-hidden">{list.length ? list.map((t) => <TugasRow key={t.id} t={t} />) : <Empty title="Tugas tidak ditemukan" text="Ubah filter status atau kata kunci pencarian." />}</Card></div>
        : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{kz.map((k) => <KuisCard key={k.id} k={k} />)}</div>}
    </div>
  )
}
