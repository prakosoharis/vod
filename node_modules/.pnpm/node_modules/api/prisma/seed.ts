import { Prisma, PrismaClient, ContentType } from '@prisma/client';

const prisma = new PrismaClient();

type CastMember = { name: string; role: string };

type SeedContent = {
  title: string;
  description: string;
  genre: string[];
  year: number;
  rating: string; // Prisma Decimal-safe as string
  duration: string; // "120 min" or "10 episodes"
  thumbnail_url: string;
  backdrop_url: string;
  video_url: string | null;
  trailer_url: string | null;
  cast: CastMember[];
  type: ContentType;
  featured?: boolean;
};

function urlSeed(title: string): string {
  return encodeURIComponent(title);
}

function movieDuration(min: number): string {
  return `${min} min`;
}

function seriesDuration(episodes: number): string {
  return `${episodes} episodes`;
}

// Ratings must be between 3.5 and 5.0, and fit Decimal(3,2)
function r(n: number): string {
  return new Prisma.Decimal(n.toFixed(2)).toString();
}

const seedData: SeedContent[] = [
  // 15 Indonesian movies (2020-2024)
  {
    title: 'KKN di Desa Penari',
    description:
      'Sekelompok mahasiswa menjalani KKN di sebuah desa terpencil dan terjebak dalam teror mistis yang mengancam nyawa. Mereka harus mematuhi aturan adat yang misterius untuk bertahan hidup.',
    genre: ['Horror', 'Thriller'],
    year: 2022,
    rating: r(4.20),
    duration: movieDuration(126),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('KKN di Desa Penari')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('KKN di Desa Penari')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Aghniny Haque', role: 'Actress' },
      { name: 'Tissa Biani', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
    featured: true,
  },
  {
    title: 'Sewu Dino',
    description:
      'Seorang gadis menerima pekerjaan misterius merawat pasien yang terkena kutukan seribu hari. Ia segera menyadari bayaran tinggi itu sebanding dengan bahaya tak kasatmata yang mengintainya.',
    genre: ['Horror', 'Thriller'],
    year: 2023,
    rating: r(4.10),
    duration: movieDuration(121),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Sewu Dino')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Sewu Dino')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Mikha Tambayong', role: 'Actress' },
      { name: 'Rio Dewanto', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Sri Asih',
    description:
      'Seorang perempuan menemukan takdirnya sebagai pendekar legendaris Sri Asih. Ia harus menyeimbangkan kehidupan pribadinya dengan tanggung jawab sebagai pelindung keadilan.',
    genre: ['Action', 'Drama'],
    year: 2022,
    rating: r(3.80),
    duration: movieDuration(132),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Sri Asih')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Sri Asih')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Pevita Pearce', role: 'Actress' },
      { name: 'Reza Rahadian', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
    featured: true,
  },
  {
    title: 'Mencuri Raden Saleh',
    description:
      'Sekelompok anak muda merencanakan pencurian lukisan legendaris untuk menyelamatkan orang tercinta. Persahabatan, pengkhianatan, dan aksi menegangkan menyertai misi berisiko tinggi ini.',
    genre: ['Action', 'Thriller'],
    year: 2022,
    rating: r(4.30),
    duration: movieDuration(154),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Mencuri Raden Saleh')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Mencuri Raden Saleh')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Iqbaal Ramadhan', role: 'Actor' },
      { name: 'Angga Yunanda', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
    featured: true,
  },
  {
    title: 'Petualangan Sherina 2',
    description:
      'Sherina dan Sadam kembali bertualang setelah bertahun-tahun berpisah. Persahabatan lama diuji oleh tantangan baru yang menuntut keberanian dan ketulusan.',
    genre: ['Adventure', 'Family', 'Comedy'],
    year: 2023,
    rating: r(4.00),
    duration: movieDuration(120),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Petualangan Sherina 2')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Petualangan Sherina 2')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Sherina Munaf', role: 'Actress' },
      { name: 'Derby Romero', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Miracle in Cell No. 7',
    description:
      'Ayah dengan keterbatasan mental dipenjara atas tuduhan yang tidak dilakukannya. Putrinya berjuang mencari keadilan di tengah keterbatasan dan harapan yang tak pernah padam.',
    genre: ['Drama'],
    year: 2022,
    rating: r(4.50),
    duration: movieDuration(145),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Miracle in Cell No. 7')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Miracle in Cell No. 7')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Vino G. Bastian', role: 'Actor' },
      { name: 'Mawar Eva de Jongh', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
    featured: true,
  },
  {
    title: 'Makmum 2',
    description:
      'Teror makhluk bayangan kembali menghantui setelah kejadian di masa lalu. Keimanan dan keberanian diuji saat rahasia lama mulai terungkap.',
    genre: ['Horror'],
    year: 2021,
    rating: r(3.70),
    duration: movieDuration(100),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Makmum 2')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Makmum 2')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Titi Kamal', role: 'Actress' },
      { name: 'Samuel Rizal', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Losmen Bu Broto',
    description:
      'Kehangatan keluarga di Yogyakarta diuji oleh konflik internal dan pilihan hidup. Tradisi dan modernitas berpadu dalam kisah penuh cinta dan pengorbanan.',
    genre: ['Drama', 'Family'],
    year: 2021,
    rating: r(3.90),
    duration: movieDuration(109),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Losmen Bu Broto')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Losmen Bu Broto')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Maudy Koesnaedi', role: 'Actress' },
      { name: 'Matias Ibo', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Pamali',
    description:
      'Sepasang suami-istri melanggar pamali saat kembali ke kampung halaman. Gangguan gaib mulai terjadi dan rahasia keluarga terkuak satu per satu.',
    genre: ['Horror'],
    year: 2022,
    rating: r(3.60),
    duration: movieDuration(99),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Pamali')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Pamali')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Maroef', role: 'Actor' },
      { name: 'Putri Ayudya', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Dear David',
    description:
      'Seorang siswi dengan kehidupan ganda menulis blog anonim yang sensasional. Saat identitasnya terancam terbongkar, ia belajar tentang kejujuran dan penerimaan diri.',
    genre: ['Drama', 'Romance'],
    year: 2023,
    rating: r(3.80),
    duration: movieDuration(118),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Dear David')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Dear David')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Shenina Cinnamon', role: 'Actress' },
      { name: 'Emir Mahira', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Budi Pekerti',
    description:
      'Kegaduhan media sosial memaksa sebuah keluarga menghadapi konsekuensi moral. Empati dan komunikasi diuji di tengah arus opini publik yang deras.',
    genre: ['Drama'],
    year: 2023,
    rating: r(4.60),
    duration: movieDuration(116),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Budi Pekerti')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Budi Pekerti')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Prilly Latuconsina', role: 'Actress' },
      { name: 'Aji Santosa', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
    featured: true,
  },
  {
    title: 'Agak Laen',
    description:
      'Empat sahabat membuka rumah hantu demi bertahan hidup. Kejadian tak terduga membawa mereka pada popularitas sekaligus masalah baru yang kocak.',
    genre: ['Comedy'],
    year: 2024,
    rating: r(4.10),
    duration: movieDuration(112),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Agak Laen')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Agak Laen')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Bene Dion', role: 'Actor' },
      { name: 'Oki Rengga', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Keramat 2: Caruban Larang',
    description:
      'Tim dokumenter menyelidiki misteri kuno yang berhubungan dengan Caruban Larang. Batas antara realitas dan mitos semakin kabur saat teror meningkat.',
    genre: ['Horror', 'Mystery'],
    year: 2022,
    rating: r(4.00),
    duration: movieDuration(100),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Keramat 2: Caruban Larang')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Keramat 2: Caruban Larang')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Dea Panendra', role: 'Actress' },
      { name: 'Ajil Ditto', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Noktah Merah Perkawinan',
    description:
      'Pernikahan yang tampak harmonis retak oleh hadirnya orang ketiga. Pasangan ini harus memilih antara memperbaiki luka atau melepaskan masa lalu.',
    genre: ['Drama', 'Romance'],
    year: 2022,
    rating: r(3.90),
    duration: movieDuration(119),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Noktah Merah Perkawinan')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Noktah Merah Perkawinan')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Marsha Timothy', role: 'Actress' },
      { name: 'Oka Antara', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Ngeri-Ngeri Sedap',
    description:
      'Kisah keluarga Batak yang penuh tawa dan air mata saat mencoba menyatukan kembali anak-anaknya. Tradisi, cinta, dan kehangatan menyatu dalam cerita menyentuh.',
    genre: ['Comedy', 'Drama'],
    year: 2022,
    rating: r(4.25),
    duration: movieDuration(114),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Ngeri-Ngeri Sedap')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Ngeri-Ngeri Sedap')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Arswendy Bening Swara', role: 'Actor' },
      { name: 'Nirina Zubir', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Kartu Keluarga',
    description:
      'Komedi hangat tentang keluarga yang harus berbagi satu rumah saat krisis melanda. Kejadian konyol membuka mata tentang arti kebersamaan.',
    genre: ['Comedy', 'Family'],
    year: 2021,
    rating: r(3.55),
    duration: movieDuration(98),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Kartu Keluarga')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Kartu Keluarga')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Gading Marten', role: 'Actor' },
      { name: 'Enzy Storia', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Guru-Guru Gokil',
    description:
      'Seorang pria terpaksa menjadi guru dan menemukan panggilan hidupnya. Di tengah kekonyolan sekolah, ia belajar tentang tanggung jawab dan persahabatan.',
    genre: ['Comedy'],
    year: 2020,
    rating: r(3.60),
    duration: movieDuration(101),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Guru-Guru Gokil')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Guru-Guru Gokil')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Gading Marten', role: 'Actor' },
      { name: 'Faradina Mufti', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Aku Dan Mesin Waktu',
    description:
      'Eksperimen mesin waktu membawa dampak yang tak terduga pada kehidupan seorang pemuda. Ia harus memilih antara memperbaiki masa lalu atau menerima kenyataan.',
    genre: ['Drama', 'Romance', 'Sci-Fi'],
    year: 2024,
    rating: r(3.75),
    duration: movieDuration(107),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Aku Dan Mesin Waktu')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Aku Dan Mesin Waktu')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Jefri Nichol', role: 'Actor' },
      { name: 'Caitlin Halderman', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Jakarta After Dark',
    description:
      'Potret kehidupan malam Jakarta yang glamor namun berbahaya. Seorang jurnalis menyelami dunia bawah tanah dan menemukan kebenaran yang pahit.',
      
    genre: ['Thriller', 'Drama'],
    year: 2021,
    rating: r(3.65),
    duration: movieDuration(110),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Jakarta After Dark')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Jakarta After Dark')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Chicco Jerikho', role: 'Actor' },
      { name: 'Tara Basro', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },

  // 10 Indonesian series (2020-2024)
  {
    title: 'Layangan Putus',
    description:
      'Rumah tangga yang tampak sempurna hancur akibat perselingkuhan. Seorang istri mencari kembali harga diri dan masa depannya.',
    genre: ['Drama', 'Romance'],
    year: 2021,
    rating: r(4.40),
    duration: seriesDuration(10),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Layangan Putus')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Layangan Putus')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Reza Rahadian', role: 'Actor' },
      { name: 'Putri Marino', role: 'Actress' },
    ],
    type: ContentType.SERIES,
    featured: true,
  },
  {
    title: 'My Lecturer My Husband',
    description:
      'Mahasiswi yang dijodohkan dengan dosennya berusaha menata hidup. Dari kebencian tumbuh benih cinta di tengah dinamika kampus.',
    genre: ['Romance', 'Comedy'],
    year: 2020,
    rating: r(3.90),
    duration: seriesDuration(8),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('My Lecturer My Husband')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('My Lecturer My Husband')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Reza Rahadian', role: 'Actor' },
      { name: 'Prilly Latuconsina', role: 'Actress' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Little Mom',
    description:
      'Remaja yang hamil di luar rencana harus menghadapi tekanan sekolah dan keluarga. Persahabatan sejati menjadi penopang di masa sulit.',
    genre: ['Drama'],
    year: 2021,
    rating: r(3.85),
    duration: seriesDuration(10),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Little Mom')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Little Mom')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Natasha Wilona', role: 'Actress' },
      { name: 'Al Ghazali', role: 'Actor' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Antares',
    description:
      'Seorang gadis terjebak dalam dunia geng motor dan asmara. Ia harus memilih antara kebebasan pribadi dan loyalitas.',
    genre: ['Romance', 'Drama'],
    year: 2021,
    rating: r(3.70),
    duration: seriesDuration(8),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Antares')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Antares')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Angga Yunanda', role: 'Actor' },
      { name: 'Cut Beby Tsabina', role: 'Actress' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Kisah untuk Geri',
    description:
      'Cinta lama yang rumit kembali bersemi di dunia kampus. Rasa benci dan cinta berselisih dalam perjalanan menuju kedewasaan.',
    genre: ['Romance', 'Drama'],
    year: 2021,
    rating: r(3.75),
    duration: seriesDuration(9),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Kisah untuk Geri')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Kisah untuk Geri')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Angga Yunanda', role: 'Actor' },
      { name: 'Syifa Hadju', role: 'Actress' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Wedding Agreement The Series',
    description:
      'Pernikahan kontrak menuntun pada perasaan yang tak terduga. Dua insan belajar arti komitmen dan pengampunan.',
    genre: ['Romance', 'Drama'],
    year: 2022,
    rating: r(3.95),
    duration: seriesDuration(10),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Wedding Agreement The Series')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Wedding Agreement The Series')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Refal Hady', role: 'Actor' },
      { name: 'Indah Permatasari', role: 'Actress' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Induk Gajah',
    description:
      'Seorang perempuan dewasa yang tinggal bersama ibunya mencari jati diri. Hubungan ibu-anak yang hangat dan penuh canda menjadi pusat cerita.',
    genre: ['Comedy', 'Drama'],
    year: 2023,
    rating: r(4.05),
    duration: seriesDuration(8),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Induk Gajah')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Induk Gajah')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Marshanda', role: 'Actress' },
      { name: 'Tanta Ginting', role: 'Actor' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Teluh Darah',
    description:
      'Seorang perempuan muda terjerat praktik ilmu hitam yang mengancam keluarganya. Ia harus mengungkap pelaku di balik teror tersebut.',
    genre: ['Horror', 'Thriller'],
    year: 2023,
    rating: r(4.10),
    duration: seriesDuration(10),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Teluh Darah')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Teluh Darah')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Mikha Tambayong', role: 'Actress' },
      { name: 'Deva Mahenra', role: 'Actor' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Mendua',
    description:
      'Kisah cinta segitiga yang rumit antara pengusaha, istri, dan selingkuhan. Kejujuran menjadi kunci untuk keluar dari kebuntuan.',
    genre: ['Drama', 'Romance'],
    year: 2022,
    rating: r(3.85),
    duration: seriesDuration(8),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Mendua')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Mendua')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Adinia Wirasti', role: 'Actress' },
      { name: 'Chicco Jerikho', role: 'Actor' },
    ],
    type: ContentType.SERIES,
  },
  {
    title: 'Ikatan Cinta',
    description:
      'Cinta dan intrik keluarga menyelimuti kehidupan pasangan muda. Kepercayaan diuji oleh rahasia masa lalu yang datang menghantui.',
    genre: ['Drama', 'Romance'],
    year: 2020,
    rating: r(3.60),
    duration: seriesDuration(12),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Ikatan Cinta')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Ikatan Cinta')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Arya Saloka', role: 'Actor' },
      { name: 'Amanda Manopo', role: 'Actress' },
    ],
    type: ContentType.SERIES,
  },

  // 5 International movies (2020-2024)
  {
    title: 'Tenet',
    description:
      'Seorang agen rahasia memanipulasi waktu untuk mencegah bencana global. Aksi memukau dengan teka-teki yang menggugah pikiran.',
    genre: ['Action', 'Thriller', 'Sci-Fi'],
    year: 2020,
    rating: r(4.00),
    duration: movieDuration(150),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Tenet')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Tenet')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'John David Washington', role: 'Actor' },
      { name: 'Robert Pattinson', role: 'Actor' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Top Gun: Maverick',
    description:
      'Pilot legendaris kembali melatih generasi baru untuk misi berbahaya. Perpaduan aksi udara spektakuler dan drama emosional.',
    genre: ['Action', 'Drama'],
    year: 2022,
    rating: r(4.70),
    duration: movieDuration(131),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Top Gun: Maverick')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Top Gun: Maverick')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Tom Cruise', role: 'Actor' },
      { name: 'Jennifer Connelly', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
    featured: true,
  },
  {
    title: 'Spider-Man: No Way Home',
    description:
      'Peter Parker menghadapi konsekuensi identitasnya yang terbongkar dan ancaman multiverse. Aliansi tak terduga terbentuk untuk menyelamatkan dunia.',
    genre: ['Action', 'Adventure'],
    year: 2021,
    rating: r(4.50),
    duration: movieDuration(148),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Spider-Man: No Way Home')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Spider-Man: No Way Home')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Tom Holland', role: 'Actor' },
      { name: 'Zendaya', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Oppenheimer',
    description:
      'Biopik tentang ilmuwan di balik proyek bom atom dan dilema moralnya. Sebuah drama sejarah yang intens dan penuh renungan.',
    genre: ['Drama', 'Thriller'],
    year: 2023,
    rating: r(4.85),
    duration: movieDuration(180),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Oppenheimer')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Oppenheimer')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Cillian Murphy', role: 'Actor' },
      { name: 'Emily Blunt', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
  {
    title: 'Dune: Part Two',
    description:
      'Paul Atreides merangkul takdirnya di Arrakis dan memimpin perlawanan. Visual epik dan konflik politik menyatu dalam kisah futuristik.',
    genre: ['Sci-Fi', 'Adventure'],
    year: 2024,
    rating: r(4.60),
    duration: movieDuration(166),
    thumbnail_url: `https://picsum.photos/seed/${urlSeed('Dune: Part Two')}/300/450`,
    backdrop_url: `https://picsum.photos/seed/${urlSeed('Dune: Part Two')}/1920/1080`,
    video_url: null,
    trailer_url: null,
    cast: [
      { name: 'Timothée Chalamet', role: 'Actor' },
      { name: 'Zendaya', role: 'Actress' },
    ],
    type: ContentType.MOVIE,
  },
];

async function main() {
  console.log('Seeding content...');

  for (const item of seedData) {
    try {
      const existing = await prisma.content.findFirst({
        where: {
          title: item.title,
          type: item.type,
        },
      });

      const data = {
        title: item.title,
        description: item.description,
        genre: item.genre,
        year: item.year,
        rating: new Prisma.Decimal(item.rating),
        duration: item.duration,
        thumbnail_url: item.thumbnail_url,
        backdrop_url: item.backdrop_url,
        video_url: item.video_url,
        trailer_url: item.trailer_url,
        cast: item.cast as unknown as Prisma.InputJsonValue,
        type: item.type,
        featured: Boolean(item.featured ?? false),
      } satisfies Prisma.ContentUncheckedCreateInput;

      if (existing) {
        await prisma.content.update({
          where: { id: existing.id },
          data,
        });
        console.log(`Updated: ${item.title} (${item.type})`);
      } else {
        await prisma.content.create({ data });
        console.log(`Created: ${item.title} (${item.type})`);
      }
    } catch (e) {
      console.error(`Error processing ${item.title}:`, e);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    const proc: any = (globalThis as any).process;
    if (proc && typeof proc.exit === 'function') proc.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


