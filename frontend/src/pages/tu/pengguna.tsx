import { useEffect, useState } from 'react'
import { KeyRound, Save, UserPlus } from 'lucide-react'
import { Btn, Card, DataTable, Input, Modal, NameCell, PageHeader, Select, Tabs, Toggle, useCrumbs, useTab } from '@/components/ui'
import { useApp } from '@/context'
import { ROLE_ORDER, permissions } from '@/mocks'
import { fetchUsers, updateUserRole } from '@/services/akademik'
import { adminUsers } from '@/services/admin'

export function ManajemenPengguna() {
  const { toast, confirm } = useApp(); const [tab, setTab] = useTab('pengguna');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [perm, setPerm] = useState(() => permissions.map(p => [...p]))

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data.map((u: any) => ({
        id: u.id,
        nama: u.full_name,
        ident: u.email,
        role: u.role || 'Siswa',
        aktif: u.status === 'Aktif'
      })));
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const updateRole = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role);
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      toast('Role pengguna berhasil diperbarui');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      toast('Email dan Nama wajib diisi', 'err');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminUsers({
        action: 'create',
        email: newEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: { nama_lengkap: newName, role: newRole }
      });
      toast('Pengguna dan peran baru berhasil ditambahkan');
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      setNewRole('Siswa');
      setNewPassword('password123');
      fetchUsers();
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setIsSubmitting(false);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Siswa');
  const [newPassword, setNewPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Manajemen Pengguna & Hak Akses' })} title="Manajemen Pengguna & Hak Akses" subtitle="Atur peran, status akun, dan izin setiap peran (Sinkron Supabase)" actions={<Btn icon={<UserPlus size={18} />} onClick={() => setShowAddModal(true)}>Tambah Pengguna</Btn>} />
      <Tabs className="mb-6" tabs={[{ v: 'pengguna', l: 'Pengguna' }, { v: 'hak', l: 'Matriks Hak Akses' }]} value={tab} onChange={setTab} />
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Pengguna & Peran Baru" footer={<><Btn variant="outline" onClick={() => setShowAddModal(false)}>Batal</Btn><Btn loading={isSubmitting} icon={<Save size={16} />} onClick={handleAddUser}>Simpan Pengguna</Btn></>}>
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input label="Nama Lengkap" placeholder="Contoh: Budi Santoso" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <Input label="Alamat Email (Akun Login)" placeholder="budi@smkn2.sch.id" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <Select label="Peran / Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} options={['Tata Usaha', 'Guru Mapel', 'Wali Kelas', 'Kepala Sekolah', 'Siswa']} />
          <Input label="Kata Sandi Awal" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </form>
      </Modal>
      {tab === 'pengguna' ? <DataTable rows={users} pageSize={10} searchText={(u) => u.nama + u.ident} searchPlaceholder="Cari nama atau email" filters={null} cols={[{ key: 'nama', header: 'Pengguna', sort: (u: any) => u.nama, render: (u: any) => <NameCell name={u.nama} sub={u.ident} /> }, { key: 'role', header: 'Peran', render: (u: any) => <select aria-label={`Peran ${u.nama}`} value={u.role} onChange={async (e) => {
        const newRole = e.target.value;
        setUsers(users.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
        // Update melalui Edge Function agar service role tidak berada di frontend
        await adminUsers({ action: 'update-role', id: u.id, role: newRole });
        toast(`Peran ${u.nama} diubah menjadi ${newRole}`);
      }} className="h-10 rounded-xl border border-line px-3 text-sm bg-white">{['Tata Usaha', 'Guru Mapel', 'Wali Kelas', 'Kepala Sekolah', 'Siswa'].map((r) => <option key={r} value={r}>{r}</option>)}</select> }, { key: 'aktif', header: 'Status', render: (u: any) => <Toggle on={u.aktif} label={`Aktif ${u.nama}`} onChange={async (v) => {
        setUsers(users.map((x) => (x.id === u.id ? { ...x, aktif: v } : x)));
        const newStatus = v ? 'aktif' : 'nonaktif';
        await adminUsers({ action: 'update-status', id: u.id, status: newStatus });
        toast(v ? 'Akun diaktifkan di Supabase' : 'Akun dinonaktifkan di Supabase', 'info');
      }} /> }]}
        actions={(u: any) => [{ l: 'Reset Kata Sandi', icon: <KeyRound size={16} />, onClick: () => confirm({ title: 'Reset Kata Sandi?', message: `Kata sandi ${u.nama} akan diatur ulang ke password123.`, okLabel: 'Ya, Reset', onOk: async () => {
          await adminUsers({ action: 'reset-password', id: u.id, password: 'password123' });
          toast('Kata sandi berhasil direset ke password123', 'info');
        }}) }]} />
        : <Card pad={false} className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-gray-50 text-xs uppercase text-muted"><tr><th className="p-4 text-left">Izin</th>{ROLE_ORDER.map((r) => <th key={r} className="text-center">{r}</th>)}</tr></thead><tbody>{perm.map((p, i) => <tr key={i} className="border-t border-line h-14 hover:bg-gray-50"><td className="p-4 font-semibold">{p[0] as string}</td>{[1, 2, 3, 4, 5].map((c) => <td key={c} className="text-center"><input type="checkbox" aria-label={`${p[0]} ${ROLE_ORDER[c - 1]}`} checked={!!p[c]} onChange={() => setPerm(perm.map((x, j) => (j === i ? x.map((v, k) => (k === c ? !v : v)) : x)))} className="w-5 h-5 accent-[#0B3D5F]" /></td>)}</tr>)}</tbody></table></div><div className="p-4 border-t border-line flex justify-end"><Btn icon={<Save size={18} />} onClick={() => toast('Hak akses berhasil disimpan')}>Simpan Hak Akses</Btn></div></Card>}</div>
  )
}
