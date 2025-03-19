import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        content: 'This is the first post in our system.',
        published: true,
      },
      {
        title: 'Getting Started with NestJS',
        content: 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
        published: true,
      },
      {
        title: 'Introduction to Prisma',
        content: 'Prisma is an open-source ORM for Node.js and TypeScript.',
        published: false,
      },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 