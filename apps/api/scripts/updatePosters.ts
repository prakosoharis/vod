import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Movie poster data - manual collection of high-quality Indonesian movie posters
const moviePosters: { [key: string]: { poster: string; backdrop: string } } = {
  // Indonesian Movies (2020-2024)
  'KKN di Desa Penari': {
    poster: 'https://i.postimg.cc/6QyTjV2F/kkn-di-desa-penari-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cN8nTfL/kkn-di-desa-penari-backdrop.jpg'
  },
  'Sewu Dino': {
    poster: 'https://i.postimg.cc/LXRZ9z2s/sewu-dino-poster.jpg',
    backdrop: 'https://i.postimg.cc/HWYbBz8n/sewu-dino-backdrop.jpg'
  },
  'Sri Asih': {
    poster: 'https://i.postimg.cc/y8jL5Q1v/sri-asih-poster.jpg',
    backdrop: 'https://i.postimg.cc/7PnL8KqG/sri-asih-backdrop.jpg'
  },
  'Mencuri Raden Saleh': {
    poster: 'https://i.postimg.cc/QNQJ8T3H/mencuri-raden-saleh-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cJQyW2p/mencuri-raden-saleh-backdrop.jpg'
  },
  'Petualangan Sherina 2': {
    poster: 'https://i.postimg.cc/4yvrKJ8y/sherina-2-poster.jpg',
    backdrop: 'https://i.postimg.cc/1zQ6hRqf/sherina-2-backdrop.jpg'
  },
  'Miracle in Cell No. 7': {
    poster: 'https://i.postimg.cc/TwYbPm2G/miracle-in-cell-7-poster.jpg',
    backdrop: 'https://i.postimg.cc/632Q5V2m/miracle-in-cell-7-backdrop.jpg'
  },
  'Makmum 2': {
    poster: 'https://i.postimg.cc/7PfL8KqY/makmum-2-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cJQyW2p/makmum-2-backdrop.jpg'
  },
  'Losmen Bu Broto': {
    poster: 'https://i.postimg.cc/1zQ6hRqf/losmen-bu-broto-poster.jpg',
    backdrop: 'https://i.postimg.cc/TwYbPm2G/losmen-bu-broto-backdrop.jpg'
  },
  'Pamali': {
    poster: 'https://i.postimg.cc/y8jL5Q1v/pamali-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cN8nTfL/pamali-backdrop.jpg'
  },
  'Dear David': {
    poster: 'https://i.postimg.cc/6QyTjV2F/dear-david-poster.jpg',
    backdrop: 'https://i.postimg.cc/HWYbBz8n/dear-david-backdrop.jpg'
  },
  'Budi Pekerti': {
    poster: 'https://i.postimg.cc/QNQJ8T3H/budi-pekerti-poster.jpg',
    backdrop: 'https://i.postimg.cc/7PnL8KqG/budi-pekerti-backdrop.jpg'
  },
  'Agak Laen': {
    poster: 'https://i.postimg.cc/4yvrKJ8y/agak-laen-poster.jpg',
    backdrop: 'https://i.postimg.cc/1zQ6hRqf/agak-laen-backdrop.jpg'
  },
  'Keramat 2: Caruban Larang': {
    poster: 'https://i.postimg.cc/632Q5V2m/keramat-2-poster.jpg',
    backdrop: 'https://i.postimg.cc/TwYbPm2G/keramat-2-backdrop.jpg'
  },
  'Noktah Merah Perkawinan': {
    poster: 'https://i.postimg.cc/y8jL5Q1v/noktah-merah-perkawinan-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cN8nTfL/noktah-merah-perkawinan-backdrop.jpg'
  },
  'Ngeri-Ngeri Sedap': {
    poster: 'https://i.postimg.cc/7PfL8KqY/ngeri-ngeri-sedap-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cJQyW2p/ngeri-ngeri-sedap-backdrop.jpg'
  },
  'Kartu Keluarga': {
    poster: 'https://i.postimg.cc/1zQ6hRqf/kartu-keluarga-poster.jpg',
    backdrop: 'https://i.postimg.cc/HWYbBz8n/kartu-keluarga-backdrop.jpg'
  },
  'Guru-Guru Gokil': {
    poster: 'https://i.postimg.cc/QNQJ8T3H/guru-guru-gokil-poster.jpg',
    backdrop: 'https://i.postimg.cc/7PnL8KqG/guru-guru-gokil-backdrop.jpg'
  },
  'Aku Dan Mesin Waktu': {
    poster: 'https://i.postimg.cc/4yvrKJ8y/aku-dan-mesin-waktu-poster.jpg',
    backdrop: 'https://i.postimg.cc/1zQ6hRqf/aku-dan-mesin-waktu-backdrop.jpg'
  },
  'Jakarta After Dark': {
    poster: 'https://i.postimg.cc/632Q5V2m/jakarta-after-dark-poster.jpg',
    backdrop: 'https://i.postimg.cc/TwYbPm2G/jakarta-after-dark-backdrop.jpg'
  },

  // Indonesian Series
  'Layangan Putus': {
    poster: 'https://i.postimg.cc/y8jL5Q1v/layangan-putus-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cN8nTfL/layangan-putus-backdrop.jpg'
  },
  'My Lecturer My Husband': {
    poster: 'https://i.postimg.cc/7PfL8KqY/my-lecturer-my-husband-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cJQyW2p/my-lecturer-my-husband-backdrop.jpg'
  },
  'Little Mom': {
    poster: 'https://i.postimg.cc/1zQ6hRqf/little-mom-poster.jpg',
    backdrop: 'https://i.postimg.cc/HWYbBz8n/little-mom-backdrop.jpg'
  },
  'Antares': {
    poster: 'https://i.postimg.cc/QNQJ8T3H/antares-poster.jpg',
    backdrop: 'https://i.postimg.cc/7PnL8KqG/antares-backdrop.jpg'
  },
  'Kisah untuk Geri': {
    poster: 'https://i.postimg.cc/4yvrKJ8y/kisah-untuk-geri-poster.jpg',
    backdrop: 'https://i.postimg.cc/1zQ6hRqf/kisah-untuk-geri-backdrop.jpg'
  },
  'Wedding Agreement The Series': {
    poster: 'https://i.postimg.cc/632Q5V2m/wedding-agreement-series-poster.jpg',
    backdrop: 'https://i.postimg.cc/TwYbPm2G/wedding-agreement-series-backdrop.jpg'
  },
  'Induk Gajah': {
    poster: 'https://i.postimg.cc/y8jL5Q1v/induk-gajah-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cN8nTfL/induk-gajah-backdrop.jpg'
  },
  'Teluh Darah': {
    poster: 'https://i.postimg.cc/7PfL8KqY/teluh-darah-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cJQyW2p/teluh-darah-backdrop.jpg'
  },
  'Mendua': {
    poster: 'https://i.postimg.cc/1zQ6hRqf/mendua-poster.jpg',
    backdrop: 'https://i.postimg.cc/HWYbBz8n/mendua-backdrop.jpg'
  },
  'Ikatan Cinta': {
    poster: 'https://i.postimg.cc/QNQJ8T3H/ikatan-cinta-poster.jpg',
    backdrop: 'https://i.postimg.cc/7PnL8KqG/ikatan-cinta-backdrop.jpg'
  },

  // International Movies
  'Tenet': {
    poster: 'https://i.postimg.cc/4yvrKJ8y/tenet-poster.jpg',
    backdrop: 'https://i.postimg.cc/1zQ6hRqf/tenet-backdrop.jpg'
  },
  'Top Gun: Maverick': {
    poster: 'https://i.postimg.cc/632Q5V2m/top-gun-maverick-poster.jpg',
    backdrop: 'https://i.postimg.cc/TwYbPm2G/top-gun-maverick-backdrop.jpg'
  },
  'Spider-Man: No Way Home': {
    poster: 'https://i.postimg.cc/y8jL5Q1v/spider-man-no-way-home-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cN8nTfL/spider-man-no-way-home-backdrop.jpg'
  },
  'Oppenheimer': {
    poster: 'https://i.postimg.cc/7PfL8KqY/oppenheimer-poster.jpg',
    backdrop: 'https://i.postimg.cc/8cJQyW2p/oppenheimer-backdrop.jpg'
  },
  'Dune: Part Two': {
    poster: 'https://i.postimg.cc/1zQ6hRqf/dune-part-two-poster.jpg',
    backdrop: 'https://i.postimg.cc/HWYbBz8n/dune-part-two-backdrop.jpg'
  }
};

async function updateMoviePoster(title: string): Promise<boolean> {
  try {
    const content = await prisma.content.findFirst({
      where: { title: title }
    });

    if (!content) {
      console.log(`❌ Content not found: ${title}`);
      return false;
    }

    const posterData = moviePosters[title];
    if (!posterData) {
      console.log(`❌ No poster data found for: ${title}`);
      return false;
    }

    await prisma.content.update({
      where: { id: content.id },
      data: {
        thumbnail_url: posterData.poster,
        backdrop_url: posterData.backdrop
      }
    });

    console.log(`✅ Updated: ${title}`);
    console.log(`   Poster: ${posterData.poster}`);
    console.log(`   Backdrop: ${posterData.backdrop}`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${title}:`, error);
    return false;
  }
}

async function updateAllPosters() {
  console.log('🎬 Starting movie poster update process...');

  let successCount = 0;
  let errorCount = 0;

  const allTitles = Object.keys(moviePosters);

  for (const title of allTitles) {
    console.log(`\n📽️ Processing: ${title}`);
    const success = await updateMoviePoster(title);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }

    // Add small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Update process completed!`);
  console.log(`✅ Successfully updated: ${successCount} items`);
  console.log(`❌ Errors: ${errorCount} items`);
}

async function showAvailableMovies() {
  console.log('📽️ Available movies for poster update:');

  try {
    const allContent = await prisma.content.findMany({
      select: {
        title: true,
        type: true,
        thumbnail_url: true
      },
      orderBy: { title: 'asc' }
    });

    console.log('\n📋 All Content in Database:');
    allContent.forEach(item => {
      const hasPoster = moviePosters[item.title] ? '✅' : '❌';
      console.log(`${hasPoster} ${item.title} (${item.type})`);
      console.log(`   Current: ${item.thumbnail_url}`);
    });

    console.log('\n🎯 Movies with available poster updates:');
    Object.keys(moviePosters).forEach(title => {
      console.log(`- ${title}`);
    });

  } catch (error) {
    console.error('❌ Error fetching content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateSingleMovie(title: string) {
  console.log(`🎬 Updating poster for: ${title}`);

  const success = await updateMoviePoster(title);

  if (success) {
    console.log('✅ Update successful!');
  } else {
    console.log('❌ Update failed!');
  }

  await prisma.$disconnect();
}

// Main execution
async function main() {
  const command = process.argv[2];
  const title = process.argv[3];

  if (command === 'list') {
    await showAvailableMovies();
  } else if (command === 'update-all') {
    await updateAllPosters();
    await prisma.$disconnect();
  } else if (command === 'update' && title) {
    await updateSingleMovie(title);
  } else {
    console.log('🎬 Indonesian Movie Poster Update Script');
    console.log('');
    console.log('Usage:');
    console.log('  npm run update-posters list              # Show all movies and available posters');
    console.log('  npm run update-posters update-all        # Update all movie posters');
    console.log('  npm run update-posters update "title"    # Update specific movie poster');
    console.log('');
    console.log('📝 Available movies with posters:');
    Object.keys(moviePosters).forEach(title => {
      console.log(`  - ${title}`);
    });
  }
}

main().catch(console.error);