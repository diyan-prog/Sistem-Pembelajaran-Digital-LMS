import { useEffect, useState } from 'react'
import { KeyRound, Save, UserPlus } from 'lucide-react'
import { Btn, Card, DataTable, Input, Modal, NameCell, PageHeader, Select, Tabs, Toggle, useCrumbs, useTab } from '@/components/ui'
import { DEFAULT_PERMISSIONS, normalizePermissions, ROLE_OPTIONS, ROLE_ORDER, roleLabel, roleValue, type PermissionRow } from '@/config/akses'
import { useApp } from '@/context'
import { DEFAULT_PASSWORD, fetchPengaturanGo, fetchUsersGo, setPengaturanGo, userAction, type PengaturanGo } from '@/services/api-go'

export function ManajemenPengguna() {
  const { toast, confirm } = useApp(); const [tab, setTab] = useTab('pengguna');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [perm, setPerm] = useState<PermissionRow[]>(() => DEFAULT_PERMISSIONS.map((p) => [...p] as PermissionRow));
  const [savingPerm, setSavingPerm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [data, rows] = await Promise.all([fetchUsersGo(), fetchPengaturanGo()]);
      setUsers(data.map((u: any) => ({
        id: u.id,
        nama: u.full_name,
        ident: u.email,
        role: roleLabel(u.role),
        aktif: u.status === 'aktif'
      })));
      setPerm(normalizePermissions(rows.find((r: PengaturanGo) => r.key === 'hak_akses')?.value));
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const updateRole = async (id: string, role: string) => {
    try {
      await userAction({ action: 'update-role', id, role: roleValue(role) });
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      toast('Role pengguna berhasil diperbarui');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const savePermissions = async () => {
    setSavingPerm(true);
    try {
      await setPengaturanGo('hak_akses', perm);
      toast('Hak akses berhasil disimpan');
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setSavingPerm(false);
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
      await userAction({
        action: 'create',
        email: newEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: { nama_lengkap: newName, role: roleValue(newRole) }
      });
      toast('Pengguna dan peran baru berhasil ditambahkan');
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      setNewRole('Tata Usaha');
      setNewPassword(DEFAULT_PASSWORD);
      await load();
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setIsSubmitting(false);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<string>('Tata Usaha');
  const [newPassword, setNewPassword] = useState(DEFAULT_PASSWORD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Manajemen Pengguna & Hak Akses' })} title="Manajemen Pengguna & Hak Akses" subtitle="Atur peran, status akun, dan izin setiap peran (Sinkron backend Go)" actions={<Btn icon={<UserPlus size={18} />} onClick={() => setShowAddModal(true)}>Tambah Pengguna</Btn>} />
      <Tabs className="mb-6" tabs={[{ v: 'pengguna', l: 'Pengguna' }, { v: 'hak', l: 'Matriks Hak Akses' }]} value={tab} onChange={setTab} />
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Pengguna & Peran Baru" footer={<><Btn variant="outline" onClick={() => setShowAddModal(false)}>Batal</Btn><Btn loading={isSubmitting} icon={<Save size={16} />} onClick={handleAddUser}>Simpan Pengguna</Btn></>}>
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input label="Nama Lengkap" placeholder="Contoh: Budi Santoso" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <Input label="Alamat Email (Akun Login)" placeholder="budi@smkn2.sch.id" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <Select label="Peran / Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} options={[...ROLE_OPTIONS]} />
          <Input label="Kata Sandi Awal" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </form>
      </Modal>
      {tab === 'pengguna' ? <DataTable rows={users} loading={loading} pageSize={10} searchText={(u) => u.nama + u.ident} searchPlaceholder="Cari nama atau email" filters={null} cols={[{ key: 'nama', header: 'Pengguna', sort: (u: any) => u.nama, render: (u: any) => <NameCell name={u.nama} sub={u.ident} /> }, { key: 'role', header: 'Peran', render: (u: any) => <select aria-label={`Peran ${u.nama}`} value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} className="h-10 rounded-xl border border-line px-3 text-sm bg-white">{ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select> }, { key: 'aktif', header: 'Status', render: (u: any) => <Toggle on={u.aktif} label={`Aktif ${u.nama}`} onChange={async (v) => {
          setUsers(users.map((x) => (x.id === u.id ? { ...x, aktif: v } : x)));
          try {
            await userAction({ action: 'update-status', id: u.id, status: v ? 'aktif' : 'nonaktif' });
            toast(v ? 'Akun diaktifkan' : 'Akun dinonaktifkan', 'info');
          } catch (err: any) {
            setUsers(users.map((x) => (x.id === u.id ? { ...x, aktif: !v } : x)));
            toast(err.message, 'err');
          }
        }} /> }]}
        actions={(u: any) => [{ l: 'Reset Kata Sandi', icon: <KeyRound size={16} />, onClick: () => confirm({ title: 'Reset Kata Sandi?', message: `Kata sandi ${u.nama} akan diatur ulang.`, okLabel: 'Ya, Reset', onOk: async () => {
          await userAction({ action: 'reset-password', id: u.id, password: DEFAULT_PASSWORD });
          toast('Kata sandi berhasil direset', 'info');
        }}) }]} />
        : <Card pad={false} className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-gray-50 text-xs uppercase text-muted"><tr><th className="p-4 text-left">Izin</th>{ROLE_ORDER.map((r) => <th key={r} className="text-center">{r}</th>)}</tr></thead><tbody>{perm.map((p, i) => <tr key={i} className="border-t border-line h-14 hover:bg-gray-50"><td className="p-4 font-semibold">{p[0]}</td>{[1, 2, 3, 4, 5].map((c) => <td key={c} className="text-center"><input type="checkbox" aria-label={`${p[0]} ${ROLE_ORDER[c - 1]}`} checked={!!p[c]} onChange={() => setPerm(perm.map((x, j) => (j === i ? x.map((v, k) => (k === c ? !v : v)) as PermissionRow : x)))} className="w-5 h-5 accent-[#0B3D5F]" /></td>)}</tr>)}</tbody></table></div><div className="p-4 border-t border-line flex justify-end"><Btn icon={<Save size={18} />} loading={savingPerm} onClick={savePermissions}>Simpan Hak Akses</Btn></div></Card>}</div>
  )
}
