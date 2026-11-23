import { useState } from 'react'
import { Camera, Info, Save } from 'lucide-react'
import { Avatar, Badge, Btn, Card, CardTitle, Input, PageHeader, Tabs, Textarea, isRO, useCrumbs, useTab } from '@/components/ui'
import { useApp, useRole } from '@/context'
import { updateProfile } from '@/services/profil'
import { PasswordForm } from '@/pages/auth'

// ---------- Akun ----------
export function AkunPage() {
  const { cfg, role, userData } = useRole(); const { toast, refreshUser } = useApp(); const [tab, setTab] = useTab('profil'); const ro = isRO(role)
  const [f, setF] = useState({ 
    nama: userData?.full_name || '', 
    email: userData?.email || '', 
    hp: userData?.hp || '', 
    alamat: userData?.alamat || '' 
  }); 
  const [e, setE] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const save = async () => { 
    const x: Record<string, string> = {}; 
    if (f.nama.trim().length < 3) x.nama = 'Nama minimal 3 karakter'; 
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Format email tidak valid'; 
    if (!/^[0-9-]{9,}$/.test(f.hp)) x.hp = 'Nomor telepon tidak valid'; 
    setE(x); 
    if (Object.keys(x).length) return; 
    
    setSaving(true);
    try {
      await updateProfile(userData?.id, {
        full_name: f.nama,
        hp: f.hp,
        alamat: f.alamat
      });
      await refreshUser();
      toast('Data diri berhasil disimpan');
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast(err.message || 'Gagal menyimpan data', 'err');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Kelola Akun' })} title="Kelola Akun" subtitle="Atur foto, data diri, dan keamanan akunmu" />
      <Tabs className="mb-6" tabs={[{ v: 'profil', l: 'Data Diri' }, { v: 'foto', l: 'Foto Profil' }, { v: 'sandi', l: 'Ganti Kata Sandi' }]} value={tab} onChange={setTab} />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6"><Card className="text-center h-fit"><div className="relative inline-block"><Avatar name={userData?.full_name || 'User'} size={104} /><span className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-white"><Camera size={16} /></span></div><h3 className="font-bold text-lg mt-3">{userData?.full_name || 'User'}</h3><p className="text-muted text-sm">{userData?.role || 'Siswa'}</p><Badge tone="green" className="mt-3">{userData?.role?.toUpperCase() || 'SISWA'}</Badge></Card>
        <Card>{tab === 'profil' && <div className="space-y-4 max-w-xl"><Input label="Nama Lengkap" value={f.nama} disabled={ro} onChange={(x) => setF({ ...f, nama: x.target.value })} error={e.nama} /><Input label="Email" value={f.email} disabled onChange={(x) => setF({ ...f, email: x.target.value })} error={e.email} /><Input label="Nomor Telepon" value={f.hp} disabled={ro} onChange={(x) => setF({ ...f, hp: x.target.value })} error={e.hp} /><Textarea label="Alamat" value={f.alamat} disabled={ro} onChange={(x) => setF({ ...f, alamat: x.target.value })} />{ro ? <p className="text-sm text-muted flex items-center gap-2"><Info size={16} />Data diri dikelola oleh Tata Usaha.</p> : <Btn icon={<Save size={18} />} loading={saving} onClick={save}>Simpan Perubahan</Btn>}</div>}
          {tab === 'foto' && <div className="max-w-xl"><CardTitle>Foto Profil</CardTitle><p className="text-sm text-muted mb-4">Gunakan foto formal berukuran maksimal 2 MB (JPG atau PNG).</p><div className="flex gap-3"><Btn icon={<Camera size={18} />} onClick={() => toast('Fitur unggah foto dalam pengembangan', 'info')}>Unggah Foto Baru</Btn><Btn variant="outline" onClick={() => toast('Fitur hapus foto dalam pengembangan', 'info')}>Hapus Foto</Btn></div></div>}
          {tab === 'sandi' && <div className="max-w-md"><CardTitle>Ganti Kata Sandi</CardTitle><PasswordForm onDone={() => toast('Kata sandi berhasil diubah')} /></div>}</Card></div></div>
  )
}
