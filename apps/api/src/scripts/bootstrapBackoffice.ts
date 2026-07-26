import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

async function main() {
  const email = process.env.BACKOFFICE_SUPERUSER_EMAIL?.trim().toLowerCase();
  const password = process.env.BACKOFFICE_SUPERUSER_PASSWORD;
  const fullName = process.env.BACKOFFICE_SUPERUSER_NAME?.trim() || 'Superuser SMASH';
  if (!email || !password) {
    throw new Error('BACKOFFICE_SUPERUSER_EMAIL dan BACKOFFICE_SUPERUSER_PASSWORD wajib diisi');
  }
  if (password.length < 10) throw new Error('Password superuser minimal 10 karakter');

  const existing = await prisma.backofficeUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Akun backoffice ${email} sudah ada; tidak ada password yang diubah.`);
    return;
  }
  await prisma.backofficeUser.create({
    data: {
      email,
      full_name: fullName,
      password_hash: await bcrypt.hash(password, 12),
      role: 'SUPERUSER',
    },
  });
  console.log(`Superuser backoffice ${email} berhasil dibuat.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
