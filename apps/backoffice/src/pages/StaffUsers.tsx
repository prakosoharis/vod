import { useEffect, useState } from 'react'
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { publishersApi, staffApi } from '../services/api'
import type { Publisher, User } from '../types'

type EditableRole = 'ADMIN' | 'PUBLISHER'
const blankForm = {
  full_name: '', email: '', password: '', role: 'ADMIN' as EditableRole,
  publisher_id: '', is_active: true,
}

export default function StaffUsers() {
  const [staff, setStaff] = useState<User[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(blankForm)

  const load = async () => {
    try {
      const [staffData, publisherData] = await Promise.all([staffApi.getAll(), publishersApi.getAll()])
      setStaff(staffData)
      setPublishers(publisherData)
    } catch {
      toast.error('Gagal memuat akun backoffice')
    }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm)
    setOpen(true)
  }
  const openEdit = (item: User) => {
    setEditing(item)
    setForm({
      full_name: item.full_name || '',
      email: item.email,
      password: '',
      role: item.role === 'PUBLISHER' ? 'PUBLISHER' : 'ADMIN',
      publisher_id: item.publisher_id || '',
      is_active: item.is_active ?? true,
    })
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    setEditing(null)
    setForm(blankForm)
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      if (editing) {
        await staffApi.update(editing.id, {
          email: form.email,
          full_name: form.full_name,
          ...(form.password ? { password: form.password } : {}),
          ...(editing.role !== 'SUPERUSER' ? {
            role: form.role,
            publisher_id: form.role === 'PUBLISHER' ? form.publisher_id : null,
            is_active: form.is_active,
          } : {}),
        })
        toast.success('Akun backoffice berhasil diperbarui')
      } else {
        await staffApi.create({
          ...form,
          publisher_id: form.role === 'PUBLISHER' ? form.publisher_id : null,
        })
        toast.success('Akun backoffice berhasil dibuat')
      }
      close()
      await load()
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Gagal ${editing ? 'memperbarui' : 'membuat'} akun`)
    }
  }

  return <div>
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Akun Backoffice</h1>
        <p className="mt-2 text-sm text-gray-600">Hanya superuser yang dapat membuat dan mengubah akun admin atau publisher.</p>
      </div>
      <button className="btn-primary flex items-center" onClick={openCreate}><PlusIcon className="mr-2 h-5 w-5"/>Buat Akun</button>
    </div>
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50"><tr><th className="p-4 text-left">Nama</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Role</th><th className="p-4 text-left">Publisher</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Aksi</th></tr></thead>
        <tbody>{staff.map(item => <tr key={item.id} className="border-t">
          <td className="p-4 font-semibold">{item.full_name}</td>
          <td className="p-4">{item.email}</td>
          <td className="p-4">{item.role}</td>
          <td className="p-4">{item.publisher?.name || '—'}</td>
          <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{item.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
          <td className="p-4 text-right"><button title="Edit akun" onClick={() => openEdit(item)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"><PencilIcon className="h-5 w-5"/></button></td>
        </tr>)}</tbody>
      </table>
    </div>

    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6">
        <div><h2 className="text-xl font-bold">{editing ? 'Edit Akun Backoffice' : 'Buat Akun Backoffice'}</h2>{editing && <p className="mt-1 text-sm text-gray-500">Kosongkan password jika tidak ingin menggantinya.</p>}</div>
        <label className="block text-sm font-medium">Nama lengkap<input required className="input-field mt-1" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}/></label>
        <label className="block text-sm font-medium">Email<input required type="email" className="input-field mt-1" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/></label>
        <label className="block text-sm font-medium">Password {editing ? '(opsional)' : '(minimal 10 karakter)'}<input required={!editing} minLength={form.password ? 10 : undefined} type="password" className="input-field mt-1" value={form.password} onChange={e => setForm({...form, password: e.target.value})}/></label>
        {editing?.role === 'SUPERUSER'
          ? <div className="rounded-lg border bg-gray-50 p-3 text-sm"><b>Role: SUPERUSER</b><p className="mt-1 text-gray-500">Role dan status superuser utama tidak dapat diubah dari form ini.</p></div>
          : <>
            <label className="block text-sm font-medium">Role<select className="input-field mt-1" value={form.role} onChange={e => setForm({...form, role: e.target.value as EditableRole, publisher_id: ''})}><option value="ADMIN">Admin</option><option value="PUBLISHER">Publisher</option></select></label>
            {form.role === 'PUBLISHER' && <label className="block text-sm font-medium">Publisher<select required className="input-field mt-1" value={form.publisher_id} onChange={e => setForm({...form, publisher_id: e.target.value})}><option value="">Pilih publisher</option>{publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
            {editing && <label className="flex items-center gap-2 rounded-lg border p-3"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}/><span className="text-sm font-medium">Akun aktif dan dapat login</span></label>}
          </>}
        <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={close}>Batal</button><button className="btn-primary">{editing ? 'Simpan Perubahan' : 'Buat Akun'}</button></div>
      </form>
    </div>}
  </div>
}
