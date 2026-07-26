import { useEffect, useState } from 'react'
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { publishersApi } from '../services/api'
import type { Publisher } from '../types'

const blank = { name: '', address: '', pic_name: '', pic_phone: '' }

export default function Publishers() {
  const [items, setItems] = useState<Publisher[]>([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<Publisher | null>(null)
  const [open, setOpen] = useState(false)

  const load = async () => {
    try { setItems(await publishersApi.getAll()) } catch { toast.error('Gagal memuat publisher') }
  }
  useEffect(() => { load() }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      if (editing) await publishersApi.update(editing.id, form)
      else await publishersApi.create(form)
      toast.success(`Publisher berhasil ${editing ? 'diperbarui' : 'ditambahkan'}`)
      setOpen(false); setEditing(null); setForm(blank); await load()
    } catch (error: any) { toast.error(error.response?.data?.error || 'Gagal menyimpan publisher') }
  }
  const edit = (item: Publisher) => {
    setEditing(item)
    setForm({ name: item.name, address: item.address, pic_name: item.pic_name, pic_phone: item.pic_phone })
    setOpen(true)
  }
  return <div>
    <div className="mb-8 flex items-center justify-between">
      <div><h1 className="text-3xl font-bold">Publisher</h1><p className="mt-2 text-sm text-gray-600">Kelola badan usaha/pemilik konten dan PIC.</p></div>
      <button className="btn-primary flex items-center" onClick={() => { setEditing(null); setForm(blank); setOpen(true) }}><PlusIcon className="mr-2 h-5 w-5"/>Tambah Publisher</button>
    </div>
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-4 text-left">Publisher</th><th className="p-4 text-left">PIC</th><th className="p-4 text-left">Alamat</th><th className="p-4 text-left">Konten</th><th className="p-4"/></tr></thead>
        <tbody>{items.map(item => <tr className="border-t" key={item.id}><td className="p-4 font-semibold">{item.name}</td><td className="p-4">{item.pic_name}<div className="text-gray-500">{item.pic_phone}</div></td><td className="max-w-md p-4">{item.address}</td><td className="p-4">{item._count?.contents || 0}</td><td className="p-4 text-right"><button title="Edit publisher" onClick={() => edit(item)} className="rounded p-2 text-primary-600 hover:bg-primary-50"><PencilIcon className="h-5 w-5"/></button></td></tr>)}</tbody>
      </table>
      {!items.length && <p className="p-8 text-center text-gray-500">Belum ada publisher.</p>}
    </div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={save} className="w-full max-w-xl space-y-4 rounded-xl bg-white p-6">
      <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Tambah'} Publisher</h2>
      <label className="block text-sm font-medium">Nama publisher<input required className="input-field mt-1" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label className="block text-sm font-medium">Alamat<textarea required rows={3} className="input-field mt-1" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Nama PIC<input required className="input-field mt-1" value={form.pic_name} onChange={e=>setForm({...form,pic_name:e.target.value})}/></label><label className="text-sm font-medium">Nomor telepon PIC<input required className="input-field mt-1" value={form.pic_phone} onChange={e=>setForm({...form,pic_phone:e.target.value})}/></label></div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={()=>setOpen(false)}>Batal</button><button className="btn-primary">Simpan</button></div>
    </form></div>}
  </div>
}
