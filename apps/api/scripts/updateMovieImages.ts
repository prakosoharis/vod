import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

// Search for movie in TMDB using fetch
async function searchMovie(title: string): Promise<any> {
  try {
    const cleanTitle = title.replace(/\([^)]*\)/g, '').trim(); // Remove content in parentheses
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&include_adult=false&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results;

    if (results.length > 0) {
      return results[0]; // Return first result
    }
    return null;
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return null;
  }
}

// Get movie details
async function getMovieDetails(movieId: number): Promise<any> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error getting movie details for ID ${movieId}:`, error);
    return null;
  }
}

// Map TMDB genre IDs to genre names
const genreMap: { [key: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

// Main update function
async function updateContentImages() {
  console.log('🎬 Starting content image update process...');

  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
    console.error('❌ Please set TMDB_API_KEY in your environment variables');
    console.log('💡 Get your API key from: https://www.themoviedb.org/settings/api');
    console.log('📝 Add this to your .env file: TMDB_API_KEY=your_api_key_here');
    return;
  }

  try {
    // Get all content from database
    const allContent = await prisma.content.findMany({
      where: {
        OR: [
          { thumbnail_url: { contains: 'placeholder' } },
          { thumbnail_url: { contains: 'dummy' } },
          { backdrop_url: { contains: 'placeholder' } },
          { backdrop_url: { contains: 'dummy' } },
          { thumbnail_url: { endsWith: '.jpg' } === false && { thumbnail_url: { endsWith: '.png' } === false } }
        ]
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`Found ${allContent.length} items with dummy/placeholder images`);

    if (allContent.length === 0) {
      console.log('✅ All items already have proper images!');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const content of allContent) {
      console.log(`\n📽️ Processing: ${content.title} (${content.type})`);

      try {
        const tmdbData = await searchMovie(content.title);

        if (!tmdbData) {
          console.log(`❌ No TMDB data found for: ${content.title}`);
          skippedCount++;
          continue;
        }

        const details = await getMovieDetails(tmdbData.id);

        if (!details) {
          console.log(`❌ No detailed data found for: ${content.title}`);
          skippedCount++;
          continue;
        }

        // Prepare update data
        const updateData: any = {
          description: details.overview || content.description,
          thumbnail_url: tmdbData.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${tmdbData.poster_path}`
            : content.thumbnail_url,
          backdrop_url: tmdbData.backdrop_path
            ? `${TMDB_BACKDROP_BASE_URL}${tmdbData.backdrop_path}`
            : content.backdrop_url,
          year: tmdbData.release_date
            ? new Date(tmdbData.release_date).getFullYear()
            : content.year,
          rating: tmdbData.vote_average
            ? parseFloat(tmdbData.vote_average.toFixed(1))
            : content.rating,
        };

        // Add genres
        if (tmdbData.genre_ids && tmdbData.genre_ids.length > 0) {
          updateData.genre = tmdbData.genre_ids
            .map(id => genreMap[id])
            .filter(Boolean)
            .slice(0, 5); // Limit to 5 genres
        }

        // Add cast
        if (details.credits && details.credits.cast && details.credits.cast.length > 0) {
          updateData.cast = details.credits.cast
            .slice(0, 10) // Top 10 cast members
            .map((person: any) => ({
              name: person.name,
              role: person.character || person.job || 'Actor'
            }));
        }

        // Add duration
        if (details.runtime) {
          const hours = Math.floor(details.runtime / 60);
          const minutes = details.runtime % 60;
          updateData.duration = `${hours}h ${minutes}m`;
        }

        // Update the content
        await prisma.content.update({
          where: { id: content.id },
          data: updateData
        });

        console.log(`✅ Updated: ${content.title}`);
        console.log(`   - Poster: ${updateData.thumbnail_url}`);
        console.log(`   - Backdrop: ${updateData.backdrop_url}`);
        console.log(`   - Year: ${updateData.year}`);
        console.log(`   - Rating: ${updateData.rating}`);

        updatedCount++;

        // Add delay to avoid TMDB rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        console.error(`❌ Error updating ${content.title}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Update process completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} items`);
    console.log(`⏭️ Skipped: ${skippedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);

  } catch (error) {
    console.error('💥 Fatal error during update process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to check current database status
async function checkDatabaseStatus() {
  console.log('📊 Checking database status...');

  try {
    const totalContent = await prisma.content.count();
    const featuredContent = await prisma.content.count({ where: { featured: true } });
    const movies = await prisma.content.count({ where: { type: 'MOVIE' } });
    const series = await prisma.content.count({ where: { type: 'SERIES' } });

    const dummyImages = await prisma.content.count({
      where: {
        OR: [
          { thumbnail_url: { contains: 'placeholder' } },
          { thumbnail_url: { contains: 'dummy' } },
          { backdrop_url: { contains: 'placeholder' } },
          { backdrop_url: { contains: 'dummy' } }
        ]
      }
    });

    console.log(`\n📈 Database Statistics:`);
    console.log(`Total Content: ${totalContent}`);
    console.log(`Featured Content: ${featuredContent}`);
    console.log(`Movies: ${movies}`);
    console.log(`Series: ${series}`);
    console.log(`Items with dummy images: ${dummyImages}`);

    // Show some examples
    const sampleContent = await prisma.content.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        thumbnail_url: true,
        featured: true
      }
    });

    console.log(`\n📝 Sample Content:`);
    sampleContent.forEach(item => {
      console.log(`- ${item.title} (${item.type}) - Featured: ${item.featured}`);
      console.log(`  Thumbnail: ${item.thumbnail_url}`);
    });

  } catch (error) {
    console.error('❌ Error checking database status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (command === 'check') {
    await checkDatabaseStatus();
  } else if (command === 'update') {
    await updateContentImages();
  } else {
    console.log('🎬 TMDB Movie Image Update Script');
    console.log('');
    console.log('Usage:');
    console.log('  npm run update-movies check     # Check database status');
    console.log('  npm run update-movies update    # Update images with TMDB data');
    console.log('');
    console.log('⚠️  Before running update:');
    console.log('1. Get your TMDB API key from: https://www.themoviedb.org/settings/api');
    console.log('2. Add TMDB_API_KEY=your_key to your .env file');
  }
}

main().catch(console.error);