import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Check, ChevronDown, Globe2, Ticket, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '@/components/navbar/Logo'
import { useAuthStore } from '@/stores/authStore'

const steps = [
  {
    number: '01',
    eyebrow: 'PILIH CERITANYA',
    title: 'Temukan Tontonan',
    copy: 'Jelajahi film, serial, dan acara pilihan tanpa biaya bulanan atau paket berulang.',
  },
  {
    number: '02',
    eyebrow: 'BAYAR SEPERLUNYA',
    title: 'Sewa per Film',
    copy: 'Bayar hanya untuk judul yang ingin ditonton, dengan harga dan masa akses yang jelas.',
  },
  {
    number: '03',
    eyebrow: 'HADIR DI MOMENNYA',
    title: 'Tiket Live',
    copy: 'Beli tiket musik, budaya, dan pertunjukan dari berbagai kota saat acaranya berlangsung.',
  },
]

const faqs = [
  {
    question: 'Bagaimana cara menyewa film atau serial?',
    answer: 'Masuk ke akun, pilih tayangan, periksa harga dan masa akses, lalu selesaikan pembayaran. Tayangan akan langsung tersedia di koleksi Anda.',
  },
  {
    question: 'Berapa lama masa akses sewa?',
    answer: 'Masa akses ditentukan untuk setiap tayangan dan selalu ditampilkan sebelum pembayaran. Waktunya dapat mulai dihitung sejak transaksi atau pemutaran pertama.',
  },
  {
    question: 'Perangkat apa saja yang dapat digunakan?',
    answer: 'SMASH dapat dinikmati melalui browser desktop dan mobile serta aplikasi Android. Gunakan akun yang sama untuk melanjutkan tontonan.',
  },
  {
    question: 'Apakah satu akun dapat memiliki profil keluarga?',
    answer: 'Dukungan profil mengikuti fitur akun yang tersedia. Riwayat sewa dan hak akses tetap tersimpan aman pada akun utama.',
  },
]

const PublicLandingPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [showLogin, setShowLogin] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!showLogin) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setShowLogin(false)
    document.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', close)
      document.body.style.overflow = ''
    }
  }, [showLogin])

  const openLogin = () => setShowLogin(true)

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await login(email, password)
      setShowLogin(false)
      navigate('/', { replace: true })
    } catch {
      // Error state is presented by the auth store below.
    }
  }

  return (
    <div className="smash-guest">
      <header className="smash-guest__nav">
        <Logo />
        <nav aria-label="Navigasi halaman pengenalan">
          <a href="#tentang">Tentang</a>
          <a href="#cara-menonton">Cara Menonton</a>
          <a href="#pilihan-akses">Pilihan Akses</a>
          <a href="#bantuan">Bantuan</a>
        </nav>
        <div>
          <span className="smash-guest__language"><Globe2 /> ID</span>
          <button onClick={openLogin}>Masuk</button>
        </div>
      </header>

      <main>
        <section className="smash-guest__hero" id="tentang">
          <div className="smash-guest__hero-art" />
          <article>
            <p>RUMAH BAGI CERITA INDONESIA</p>
            <h1>Cerita dari tanah kita,<br /><em>untuk layar di mana saja.</em></h1>
            <span>Temukan film, serial, dan panggung langsung yang membawa suara Nusantara lebih dekat.</span>
            <div>
              <button className="smash-guest__primary" onClick={openLogin}>Mulai Menyewa <ArrowRight /></button>
              <a href="#cara-menonton">Lihat cara menonton</a>
            </div>
            <small>Bayar hanya untuk tayangan yang Anda pilih.</small>
          </article>
          <aside><b>01</b><i /><small>SMASH · CERITA INDONESIA</small></aside>
        </section>

        <section className="smash-guest__intro" id="cara-menonton">
          <p>CARA MENONTON</p>
          <h2>Satu pilihan.<br />Satu cerita.<br />Tanpa biaya bulanan.</h2>
          <span>Pilih tayangan yang benar-benar ingin Anda nikmati. Harga dan masa akses selalu ditampilkan dengan jelas sebelum Anda membayar.</span>
        </section>

        <section className="smash-guest__steps">
          {steps.map((step) => (
            <article key={step.number}>
              <b>{step.number}</b>
              <small>{step.eyebrow}</small>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </section>

        <section className="smash-guest__story">
          <div className="smash-guest__story-art" />
          <article>
            <p>KURASI NUSANTARA</p>
            <h2>Setiap daerah punya suara. Kami membantu Anda menemukannya.</h2>
            <span>Dari kota besar hingga sudut kepulauan, SMASH menghadirkan karya yang dekat dengan pengalaman kita—dipilih dengan perhatian, bukan sekadar mengikuti keramaian.</span>
            <ul>
              <li><Check /> Kurasi Indonesia lintas daerah dan generasi</li>
              <li><Check /> Subtitle, kualitas gambar, dan audio adaptif</li>
              <li><Check /> Lanjutkan menonton di perangkat berbeda</li>
            </ul>
          </article>
        </section>

        <section className="smash-guest__access" id="pilihan-akses">
          <div>
            <p>PILIHAN AKSES</p>
            <h2>Bayar untuk momen yang Anda pilih.</h2>
            <span>Tidak ada paket bulanan. Tidak ada biaya tersembunyi. Anda memegang kendali atas setiap tontonan.</span>
          </div>
          <div className="smash-guest__access-cards">
            <article>
              <small>UNTUK FILM & SERIAL</small>
              <h3>Sewa Tontonan</h3>
              <p>Nikmati satu judul dalam masa akses yang tertera. Harga setiap tayangan selalu terlihat sebelum transaksi.</p>
              <button onClick={openLogin}>Jelajahi tayangan <ArrowRight /></button>
            </article>
            <article>
              <Ticket />
              <small>UNTUK ACARA LANGSUNG</small>
              <h3>Tiket Live</h3>
              <p>Beli akses hanya untuk pertunjukan langsung yang ingin Anda saksikan.</p>
              <button onClick={openLogin}>Lihat acara live <ArrowRight /></button>
            </article>
          </div>
        </section>

        <section className="smash-guest__faq" id="bantuan">
          <div>
            <p>PERTANYAAN UMUM</p>
            <h2>Sebelum layar menyala.</h2>
          </div>
          <div>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <article key={faq.question}>
                  <button
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    {faq.question}
                    <ChevronDown className={isOpen ? 'is-open' : ''} />
                  </button>
                  {isOpen && <p>{faq.answer}</p>}
                </article>
              )
            })}
          </div>
        </section>

        <section className="smash-guest__final">
          <p>WAKTUNYA MENONTON</p>
          <h2>Satu layar, banyak jalan pulang<br />bagi cerita Indonesia.</h2>
          <button className="smash-guest__primary" onClick={openLogin}>Masuk ke SMASH <ArrowRight /></button>
        </section>
      </main>

      <footer className="smash-guest__footer">
        <Logo />
        <p>Hiburan Indonesia, dalam cerita terbaiknya.</p>
        <nav>
          <Link to="/contact">Kontak</Link>
          <Link to="/terms">Syarat</Link>
          <Link to="/privacy">Privasi</Link>
          <Link to="/refund-policy">Refund</Link>
          <Link to="/account-deletion">Hapus Akun</Link>
          <button type="button" onClick={() => window.dispatchEvent(new Event('smash-open-cookie-preferences'))}>Cookie Preferences</button>
        </nav>
        <small>© {new Date().getFullYear()} SMASH. Seluruh hak dilindungi.</small>
      </footer>

      {showLogin && (
        <div className="smash-login" role="dialog" aria-modal="true" aria-labelledby="smash-login-title" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowLogin(false)
        }}>
          <form onSubmit={handleLogin}>
            <button type="button" className="smash-login__close" onClick={() => setShowLogin(false)} aria-label="Tutup"><X /></button>
            <Logo />
            <small>SELAMAT DATANG KEMBALI</small>
            <h2 id="smash-login-title">Masuk ke SMASH</h2>
            <p>Gunakan akun Anda untuk melanjutkan menonton.</p>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" autoComplete="email" required autoFocus />
            </label>
            <label>
              Kata sandi
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" autoComplete="current-password" required />
            </label>
            {error && <div className="smash-login__error">{error}</div>}
            <button className="smash-guest__primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'} {!isLoading && <ArrowRight />}
            </button>
            <span>Belum punya akun? <Link to="/register">Daftar sekarang</Link></span>
          </form>
        </div>
      )}
    </div>
  )
}

export default PublicLandingPage
