import { LegalPage } from '@/components/legal/LegalPage';

const RefundPolicyPage = () => (
  <LegalPage
    title="Kebijakan Refund dan Pembatalan"
    path="/refund-policy"
    description="Kondisi dan proses pemeriksaan permintaan pengembalian dana SMASHSTREAM."
    sections={[
      { title: 'Kondisi yang dapat dipertimbangkan', content: <p>Permintaan dapat dipertimbangkan apabila pembayaran terpotong tetapi entitlement tidak diberikan, terdapat transaksi duplikat, atau terjadi kegagalan teknis yang dapat diverifikasi. Pemeriksaan tidak berarti seluruh permintaan otomatis disetujui.</p> },
      { title: 'Kondisi yang umumnya tidak dapat direfund', content: <p>Refund umumnya tidak tersedia jika konten telah ditonton secara material, rental telah digunakan, atau coin telah dibelanjakan, dengan tetap tunduk pada hak konsumen dan ketentuan penyedia pembayaran yang berlaku.</p> },
      { title: 'Pembelian melalui app store', content: <p>Pembelian melalui Google Play atau Apple mengikuti mekanisme refund masing-masing store jika diwajibkan oleh kebijakan platform tersebut.</p> },
      { title: 'Bukti dan proses', content: <p>Sertakan identitas akun, nomor transaksi, tanggal, jumlah, metode pembayaran, uraian masalah, serta bukti pendukung yang tidak memuat data kartu lengkap. Ajukan melalui formulir Contact dengan kategori Refund atau email@smashstream.id. Waktu pemeriksaan: <strong>[BELUM DITETAPKAN BISNIS]</strong>.</p> },
    ]}
  />
);

export default RefundPolicyPage;
