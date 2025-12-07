import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEvents() {
  console.log('🌱 Seeding live events...');

  // Clear existing events
  await prisma.liveEvent.deleteMany({});

  // Sample events
  const events = [
    {
      title: 'Gala Premiere: Mencuri Raden Saleh',
      description: 'Nonton bareng premiere film terbaru! Saksikan aksi tim pencuri paling berani di Indonesia.',
      event_type: 'GALA_PREMIERE',
      scheduled_at: new Date('2025-12-15T19:00:00+07:00'),
      duration_minutes: 150,
      thumbnail_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      stream_key: 'premiere-raden-saleh',
      host_name: 'Angga Dwimas Sasongko',
      is_live: false,
    },
    {
      title: 'Stand Up Comedy: Pandji Pragiwaksono Live',
      description: 'Ketawa bareng Pandji! Special session stand up comedy dengan tema "Indonesia Banget"',
      event_type: 'STANDUP_COMEDY',
      scheduled_at: new Date('2025-12-20T20:00:00+07:00'),
      duration_minutes: 90,
      thumbnail_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200',
      stream_key: 'standup-pandji',
      host_name: 'Pandji Pragiwaksono',
      is_live: false,
    },
    {
      title: 'Premiere Spesial: Filosofi Kopi 3',
      description: 'Premiere eksklusif film terbaru dari series Filosofi Kopi. Nikmati aroma kopi virtual bersama kami!',
      event_type: 'GALA_PREMIERE',
      scheduled_at: new Date('2025-12-25T18:00:00+07:00'),
      duration_minutes: 120,
      thumbnail_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200',
      stream_key: 'premiere-filosofi-kopi',
      host_name: 'Angga Sasongko',
      is_live: false,
    },
    {
      title: 'Stand Up: Raditya Dika - Malam Tahun Baru',
      description: 'Tutup tahun dengan tawa! Raditya Dika menghadirkan materi spesial end-of-year comedy.',
      event_type: 'STANDUP_COMEDY',
      scheduled_at: new Date('2025-12-31T21:00:00+07:00'),
      duration_minutes: 75,
      thumbnail_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400',
      backdrop_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200',
      stream_key: 'standup-raditya',
      host_name: 'Raditya Dika',
      is_live: false,
    },
  ];

  for (const event of events) {
    await prisma.liveEvent.create({
      data: event,
    });
    console.log(`✅ Created event: ${event.title}`);
  }

  console.log('✨ Done seeding events!');
}

seedEvents()
  .catch((e) => {
    console.error('❌ Error seeding events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
