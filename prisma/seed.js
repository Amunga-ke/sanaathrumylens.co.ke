// Prisma seed file
import { PrismaClient, Role, PostStatus, EventStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'music' },
      update: {},
      create: {
        name: 'Music',
        slug: 'music',
        description: 'Explore the vibrant music scene of Kenya and Africa',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'arts-culture' },
      update: {},
      create: {
        name: 'Arts & Culture',
        slug: 'arts-culture',
        description: 'Cultural analysis and artistic expressions',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'events' },
      update: {},
      create: {
        name: 'Events',
        slug: 'events',
        description: 'Upcoming events and happenings',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'artist-spotlight' },
      update: {},
      create: {
        name: 'Artist Spotlight',
        slug: 'artist-spotlight',
        description: 'In-depth profiles of artists and creators',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'video-reviews' },
      update: {},
      create: {
        name: 'Video Reviews',
        slug: 'video-reviews',
        description: 'Reviews of music videos and visual content',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sanaathrumylens.co.ke' },
    update: {},
    create: {
      email: 'admin@sanaathrumylens.co.ke',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create author profile for admin
  const author = await prisma.author.upsert({
    where: { slug: 'admin-user' },
    update: {},
    create: {
      name: adminUser.name || 'Admin User',
      slug: 'admin-user',
      bio: 'Site administrator and content creator.',
      userId: adminUser.id,
      isPublic: true,
    },
  });

  console.log('✅ Created author profile:', author.name);

  // Create sample post
  const samplePost = await prisma.post.upsert({
    where: { slug: 'welcome-to-sanaathrumylens' },
    update: {},
    create: {
      title: 'Welcome to SanaaThruMyLens',
      slug: 'welcome-to-sanaathrumylens',
      excerpt: 'Discover Kenya\'s creative scene through our unique lens. We bring you stories of art, music, and culture from across Africa.',
      content: `# Welcome to SanaaThruMyLens

We are thrilled to have you here! SanaaThruMyLens is your window into Kenya's vibrant creative ecosystem.

## Our Mission

We aim to:

- **Spotlight** emerging and established artists
- **Analyze** cultural trends and movements
- **Celebrate** the diversity of African creativity
- **Educate** through insightful content

## What to Expect

From music reviews to artist interviews, event coverage to cultural commentary, we've got it all covered.

### Music

Discover new sounds, read album reviews, and get insights into the music industry.

### Arts & Culture

Explore the rich tapestry of African art, from traditional crafts to contemporary expressions.

### Events

Stay updated on concerts, exhibitions, festivals, and more.

---

*Thank you for being part of our community!*`,
      authorId: author.id,
      categoryId: categories[0].id,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      featured: true,
      tags: 'welcome,introduction,africa,creativity',
    },
  });

  console.log('✅ Created sample post:', samplePost.title);

  // Create sample event
  const sampleEvent = await prisma.event.upsert({
    where: { slug: 'creative-arts-summit-2024' },
    update: {},
    create: {
      title: 'Creative Arts Summit 2024',
      slug: 'creative-arts-summit-2024',
      description: 'Join us for the biggest creative arts gathering in East Africa. Network with artists, designers, and creative professionals.',
      venue: 'Kenya International Conference Centre',
      address: 'Kenyatta Avenue',
      city: 'Nairobi',
      country: 'Kenya',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
      status: EventStatus.PUBLISHED,
      featured: true,
      isFree: false,
      price: 50.00,
      currency: 'USD',
    },
  });

  console.log('✅ Created sample event:', sampleEvent.title);

  // Create site settings
  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: { value: 'Sanaathrumylens' },
    create: {
      key: 'site_name',
      value: 'Sanaathrumylens',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'site_description' },
    update: { value: 'Exploring Kenya\'s and Africa\'s creative scene' },
    create: {
      key: 'site_description',
      value: 'Exploring Kenya\'s and Africa\'s creative scene',
    },
  });

  console.log('✅ Created site settings');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Admin Credentials:');
  console.log('   Email: admin@sanaathrumylens.co.ke');
  console.log('   Password: Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
