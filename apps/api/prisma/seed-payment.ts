import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPayment() {
  console.log('🌱 Seeding payment data...');

  // Create subscription plan
  const plan = await prisma.subscriptionPlan.upsert({
    where: { id: 'default-vod-plan' },
    update: {},
    create: {
      id: 'default-vod-plan',
      name: 'VOD Unlimited',
      description: 'Akses unlimited ke semua film dan serial. Nonton sepuasnya tanpa batas!',
      price: 50000, // Rp 50.000
      duration_days: 30, // 30 days
      features: {
        vod: true,
        live_discount: 0,
      },
      is_active: true,
    },
  });

  console.log('✅ Subscription plan created:', plan.name);

  // Get all contents
  const contents = await prisma.content.findMany();

  console.log(`📺 Found ${contents.length} contents. Creating rental prices...`);

  // Create rental prices for all contents (Rp 10.000 for 24 hours)
  let rentalCount = 0;
  for (const content of contents) {
    try {
      await prisma.rentalPrice.upsert({
        where: { content_id: content.id },
        update: {},
        create: {
          content_id: content.id,
          price: 10000, // Rp 10.000
          duration_hours: 24, // 24 hours
          is_active: true,
        },
      });
      rentalCount++;
    } catch (error) {
      console.error(`Error creating rental price for ${content.title}:`, error);
    }
  }

  console.log(`✅ Created ${rentalCount} rental prices`);

  // Update some live events with ticket prices (example)
  const events = await prisma.liveEvent.findMany();

  if (events.length > 0) {
    let eventCount = 0;
    for (const event of events) {
      try {
        // Set random ticket prices (Rp 15.000 - 50.000)
        const ticketPrice = [15000, 20000, 25000, 30000, 50000][Math.floor(Math.random() * 5)];

        await prisma.liveEvent.update({
          where: { id: event.id },
          data: { ticket_price: ticketPrice },
        });
        eventCount++;
      } catch (error) {
        console.error(`Error updating event ${event.title}:`, error);
      }
    }
    console.log(`✅ Updated ${eventCount} events with ticket prices`);
  } else {
    console.log('ℹ️  No events found to update');
  }

  console.log('✅ Payment data seeding complete!');
}

seedPayment()
  .catch((error) => {
    console.error('❌ Error seeding payment data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
