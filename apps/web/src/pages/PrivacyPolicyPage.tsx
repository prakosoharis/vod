import { LegalPage } from '@/components/legal/LegalPage';

const PrivacyPolicyPage = () => (
  <LegalPage
    title="Kebijakan Privasi"
    path="/privacy"
    description="Penjelasan mengenai cara SMASHSTREAM memproses dan melindungi data pribadi pengguna."
    sections={[
      {
        title: 'Identitas pengelola',
        content: <p>SMASHSTREAM dikelola oleh <strong>PT SEGITIGA MATA SEMESTA</strong>, dengan alamat terdaftar <strong>Jalan Karyasari Nomor 90 B, Kembangan, Kota Administrasi Jakarta Barat, DKI Jakarta</strong>. Pertanyaan privasi dapat dikirim ke <a href="mailto:email@smashstream.id">email@smashstream.id</a>.</p>,
      },
      {
        title: 'Data yang kami proses',
        content: <><p>Data dapat meliputi nama, email, nomor HP/WhatsApp, password dalam bentuk hash, foto profil, identitas social login, serta status verifikasi OTP email dan WhatsApp.</p><p>Kami juga dapat memproses data perangkat, alamat IP, sesi, cookies, log keamanan, aktivitas login, riwayat tontonan dan pencarian, watchlist, preferensi, interaksi, pembelian coin, rental, entitlement, invoice, dan riwayat transaksi.</p></>,
      },
      {
        title: 'Pembayaran',
        content: <p>Informasi pembayaran tertentu diproses oleh payment gateway atau app store. SMASHSTREAM tidak menyimpan nomor kartu pembayaran lengkap sepanjang data tersebut memang ditangani langsung oleh penyedia pembayaran.</p>,
      },
      {
        title: 'Tujuan dan dasar pemrosesan',
        content: <p>Data digunakan untuk membuat dan menjaga akun, menyediakan VOD/live/rental/coin, memproses transaksi, memverifikasi pengguna, mencegah fraud, menjaga keamanan, memenuhi permintaan dukungan, memberikan rekomendasi, serta memenuhi kewajiban yang berlaku. Pemrosesan didasarkan pada persetujuan, pelaksanaan layanan yang diminta, kepentingan keamanan yang wajar, dan kewajiban hukum yang relevan.</p>,
      },
      {
        title: 'Autentikasi dan komunikasi',
        content: <p>Jika tersedia, Facebook Login dan penyedia autentikasi lain dapat mengirim identitas dasar sesuai izin pengguna. Meta WhatsApp Cloud API dapat digunakan untuk OTP nomor HP dan pemulihan akun. Layanan email dapat digunakan untuk OTP, pemulihan akun, invoice, dan notifikasi layanan.</p>,
      },
      {
        title: 'Penyedia layanan dan transfer data',
        content: <p>Kami dapat menggunakan penyedia infrastruktur, CDN, storage, DRM, analytics, payment gateway, pengiriman pesan, dan layanan teknis lain yang benar-benar digunakan. Data mungkin diproses di luar Indonesia apabila penyedia terkait beroperasi lintas negara, dengan perlindungan yang sesuai ketentuan berlaku.</p>,
      },
      {
        title: 'Retensi dan keamanan',
        content: <p>Data disimpan selama <strong>[MASA RETENSI YANG DISETUJUI BISNIS/LEGAL]</strong> atau selama diperlukan untuk layanan, transaksi, antifraud, sengketa, audit, dan kewajiban hukum. Kami menerapkan langkah teknis dan organisasi yang wajar, tetapi tidak menjanjikan keamanan absolut.</p>,
      },
      {
        title: 'Cookies',
        content: <p>Website memakai cookies atau teknologi serupa untuk autentikasi, keamanan, preferensi, dan—setelah pilihan pengguna jika diperlukan—analytics atau marketing. Pilihan dapat diubah melalui Cookie Preferences.</p>,
      },
      {
        title: 'Hak pengguna',
        content: <p>Sesuai ketentuan yang berlaku, pengguna dapat meminta akses, koreksi, penghapusan, pembatasan, atau menarik persetujuan. Permintaan dapat diajukan melalui halaman Account Deletion atau email resmi.</p>,
      },
      {
        title: 'Anak dan batas usia',
        content: <p>Layanan ditujukan kepada pengguna yang memenuhi batas usia <strong>[BATAS USIA YANG DISETUJUI LEGAL]</strong>. Pengguna di bawah batas yang berlaku harus memperoleh persetujuan orang tua atau wali.</p>,
      },
      {
        title: 'Perubahan kebijakan',
        content: <p>Kebijakan dapat diperbarui untuk mencerminkan perubahan layanan atau ketentuan. Perubahan material akan diinformasikan melalui kanal yang sesuai.</p>,
      },
    ]}
  />
);

export default PrivacyPolicyPage;
