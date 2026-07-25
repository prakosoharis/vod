import { LegalPage } from '@/components/legal/LegalPage';

const TermsPage = () => (
  <LegalPage
    title="Syarat dan Ketentuan"
    path="/terms"
    description="Ketentuan penggunaan layanan VOD, live streaming, rental, dan coin SMASHSTREAM."
    sections={[
      { title: 'Penerimaan dan kelayakan', content: <p>Dengan membuat akun atau menggunakan layanan, Anda menyetujui Terms ini. Pengguna harus memenuhi <strong>[BATAS USIA YANG DISETUJUI LEGAL]</strong> atau menggunakan layanan dengan persetujuan orang tua/wali sesuai ketentuan.</p> },
      { title: 'Akun dan autentikasi', content: <p>Registrasi menggunakan verifikasi email. Login rutin dapat memakai email dan password, Facebook Login, atau sesi perangkat yang sah jika fitur tersedia. Anda wajib menjaga keamanan akun dan dilarang menjual, berbagi, atau menyalahgunakannya.</p> },
      { title: 'VOD, live, dan rental', content: <p>Hak akses, periode rental, harga, wilayah, perangkat, concurrent stream, kualitas video, serta ketersediaan konten dapat berbeda dan ditampilkan sebelum transaksi. Akses berakhir ketika entitlement atau periode rental berakhir.</p> },
      { title: 'Coin', content: <p>Coin adalah saldo virtual untuk penggunaan di SMASHSTREAM. Coin bukan uang atau simpanan, tidak menghasilkan bunga, tidak dapat diperdagangkan, dan tidak dapat diuangkan kembali kecuali diwajibkan ketentuan yang berlaku.</p> },
      { title: 'Harga dan pembayaran', content: <p>Harga dan pajak yang berlaku ditampilkan sebelum pembayaran. Transaksi dapat diproses melalui payment gateway, Google Play Billing, atau Apple In-App Purchase jika benar-benar tersedia. Refund mengikuti Refund Policy dan kebijakan penyedia pembayaran/app store.</p> },
      { title: 'Perlindungan konten', content: <p>Anda dilarang merekam, mengunduh secara ilegal, membagikan, menyiarkan ulang, membypass DRM/perlindungan konten, atau menggunakan layanan untuk pelanggaran hak kekayaan intelektual.</p> },
      { title: 'Ketersediaan layanan', content: <p>Layanan dapat terganggu karena pemeliharaan, jaringan, perangkat, force majeure, atau penyedia pihak ketiga. Kami tidak menjanjikan layanan tanpa gangguan, namun akan mengambil langkah wajar untuk pemulihan.</p> },
      { title: 'Penangguhan dan penghapusan akun', content: <p>Akun dapat ditangguhkan untuk pelanggaran, fraud, risiko keamanan, atau kewajiban hukum. Pengguna dapat mengajukan penghapusan akun; konsekuensinya dijelaskan pada halaman Account Deletion.</p> },
      { title: 'Tanggung jawab dan hak konsumen', content: <p>Batas tanggung jawab diterapkan secara wajar dan tidak menghapus hak konsumen yang tidak dapat dikesampingkan berdasarkan hukum yang berlaku.</p> },
      { title: 'Perubahan dan perselisihan', content: <p>Layanan dan Terms dapat diperbarui. Keluhan dapat diajukan melalui email@smashstream.id. Pilihan hukum, mekanisme penyelesaian sengketa, dan yurisdiksi belum ditetapkan dan harus disetujui penasihat hukum sebelum dokumen ini diberlakukan.</p> },
    ]}
  />
);

export default TermsPage;
