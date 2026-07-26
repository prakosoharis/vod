import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { publishersApi, staffApi } from '../services/api'
import type { Publisher, User } from '../types'

export default function StaffUsers() {
  const [staff, setStaff] = useState<User[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'ADMIN' as 'ADMIN'|'PUBLISHER', publisher_id: '' })
  const load = async () => {
    try { const [s,p] = await Promise.all([staffApi.getAll(), publishersApi.getAll()]); setStaff(s); setPublishers(p) }
    catch { toast.error('Gagal memuat akun backoffice') }
  }
  useEffect(()=>{ load() },[])
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await staffApi.create({ ...form, publisher_id: form.role === 'PUBLISHER' ? form.publisher_id : null })
      toast.success('Akun backoffice berhasil dibuat'); setOpen(false); await load()
    } catch (error:any) { toast.error(error.response?.data?.error || 'Gagal membuat akun') }
  }
  return <div>
    <div className="mb-8 flex items-center justify-between"><div><h1 className="text-3xl font-bold">Akun Backoffice</h1><p className="mt-2 text-sm text-gray-600">Hanya superuser yang dapat membuat akun admin dan publisher.</p></div><button className="btn-primary flex items-center" onClick={()=>setOpen(true)}><PlusIcon className="mr-2 h-5 w-5"/>Buat Akun</button></div>
    <div className="overflow-hidden rounded-xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-4 text-left">Nama</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Role</th><th className="p-4 text-left">Publisher</th><th className="p-4 text-left">Status</th></tr></thead><tbody>{staff.map(item=><tr key={item.id} className="border-t"><td className="p-4 font-semibold">{item.full_name}</td><td className="p-4">{item.email}</td><td className="p-4">{item.role}</td><td className="p-4">{item.publisher?.name || '—'}</td><td className="p-4">{item.is_active ? 'Aktif' : 'Nonaktif'}</td></tr>)}</tbody></table></div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6"><h2 className="text-xl font-bold">Buat Akun Backoffice</h2>
      <label className="block text-sm font-medium">Nama lengkap<input required className="input-field mt-1" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
      <label className="block text-sm font-medium">Email<input required type="email" className="input-field mt-1" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="block text-sm font-medium">Password (minimal 10 karakter)<input required minLength={10} type="password" className="input-field mt-1" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <label className="block text-sm font-medium">Role<select className="input-field mt-1" value={form.role} onChange={e=>setForm({...form,role:e.target.value as any,publisher_id:''})}><option value="ADMIN">Admin</option><option value="PUBLISHER">Publisher</option></select></label>
      {form.role === 'PUBLISHER' && <label className="block text-sm font-medium">Publisher<select required className="input-field mt-1" value={form.publisher_id} onChange={e=>setForm({...form,publisher_id:e.target.value})}><option value="">Pilih publisher</option>{publishers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
      <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={()=>setOpen(false)}>Batal</button><button className="btn-primary">Buat Akun</button></div>
    </form></div>}
  </div>
}
