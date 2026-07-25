import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Film, LogOut, Calendar, Clock } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: rentals, isLoading } = useQuery({ queryKey: ['user-rentals'], queryFn: () => paymentService.getUserRentals() });
  const expired = (date: string) => new Date(date) <= new Date();

  return <div className="min-h-screen bg-warm-charcoal-100 px-6 pb-16 pt-24">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-start justify-between rounded-2xl border border-accent-500/30 bg-warm-charcoal-50 p-8">
        <div className="flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-500/20"><User className="h-10 w-10 text-accent-400"/></div>
          <div><h1 className="text-3xl font-bold text-cream-50">{user?.full_name || user?.username || user?.email?.split('@')[0] || 'Pengguna'}</h1><p className="text-cream-100">{user?.email || user?.phone}</p></div></div>
        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 rounded-xl border border-cream-100/20 px-4 py-2 text-cream-50"><LogOut size={17}/>Logout</button>
      </div>
      <div className="mb-6 flex items-center gap-3"><Film className="text-accent-400"/><div><h2 className="text-2xl font-bold text-cream-50">Riwayat Sewa Film</h2><p className="text-sm text-cream-100">Akses film hanya berlaku selama periode sewa masing-masing.</p></div></div>
      {isLoading ? <div className="rounded-2xl bg-warm-charcoal-50 p-8 text-cream-100">Memuat...</div> :
      rentals?.length ? <div className="space-y-4">{rentals.map((rental) => <div key={rental.id} className={`rounded-2xl border-2 bg-warm-charcoal-50 p-6 ${expired(rental.expired_at) ? 'border-warm-charcoal-100 opacity-70' : 'border-accent-500/30'}`}>
        <div className="flex gap-4"><img src={rental.content.thumbnail_url} alt="" className="h-36 w-24 rounded-xl object-cover"/>
          <div className="flex-1"><div className="mb-3 flex justify-between"><h3 className="text-xl font-bold text-cream-50">{rental.content.title}</h3><span className={expired(rental.expired_at) ? 'text-red-400' : 'text-green-400'}>{expired(rental.expired_at) ? 'Berakhir' : 'Aktif'}</span></div>
            <div className="mb-4 space-y-2 text-sm text-cream-100"><p className="flex gap-2"><Calendar size={16}/>Disewa {new Date(rental.rented_at).toLocaleString('id-ID')}</p><p className="flex gap-2"><Clock size={16}/>Berakhir {new Date(rental.expired_at).toLocaleString('id-ID')}</p><p className="flex gap-2"><CreditCard size={16}/>Rp {Number(rental.rental_price.price).toLocaleString('id-ID')} · {rental.rental_price.duration_hours} jam</p></div>
            <button onClick={() => navigate(expired(rental.expired_at) ? '/' : `/watch/${rental.content_id}`)} className="rounded-xl bg-accent-500 px-6 py-2 font-semibold text-cream-50">{expired(rental.expired_at) ? 'Sewa Lagi' : 'Tonton Sekarang'}</button>
          </div></div></div>)}</div> :
      <div className="rounded-2xl bg-warm-charcoal-50 p-12 text-center"><Film className="mx-auto mb-4 h-12 w-12 text-cream-100"/><h3 className="text-xl font-bold text-cream-50">Belum ada film yang disewa</h3><button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-accent-500 px-8 py-3 font-bold text-cream-50">Jelajahi Film</button></div>}
    </div>
  </div>;
}
