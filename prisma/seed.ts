// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(data: {
  fullName: string;
  nif: string;
  email: string;
  passwordPlain: string;
  role: any;
  balance?: number;
}) {
  const { fullName, nif, email, passwordPlain, role, balance = 0 } = data;

  // procura por email OU nif
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { nif }],
    },
  });

  if (existing) {
    console.log(
      `🔁 Usuário já existe (email ou nif): ${existing.email} — pulando criação.`
    );
    return existing;
  }

  const hashed = await bcrypt.hash(passwordPlain, 10);
  const created = await prisma.user.create({
    data: {
      fullName,
      nif,
      email,
      password: hashed,
      role,
      balance,
    },
  });

  console.log(`✅ Usuário criado: ${created.email}`);
  return created;
}

async function main() {
  console.log('🚀 Iniciando seed...');

  const admin = await upsertUser({
    fullName: 'Administrador do Sistema',
    nif: '999999999000',
    email: 'admin@reservas.com',
    passwordPlain: 'Admin@123',
    role: 'ADMIN',
    balance: 10000,
  });

  const provider = await upsertUser({
    fullName: 'João Prestador',
    nif: '123456789',
    email: 'provider@servicos.com',
    passwordPlain: 'Provider@123',
    role: 'PROVIDER',
    balance: 5000,
  });

  const client = await upsertUser({
    fullName: 'Maria Cliente',
    nif: '888777666',
    email: 'cliente@teste.com',
    passwordPlain: 'Cliente@123',
    role: 'CLIENT',
    balance: 2000,
  });

  console.log('✅ Cliente criado:', client.email);

  const servicesData = [
    {
      name: 'Corte de Cabelo Masculino',
      description: 'Corte profissional masculino com acabamento.',
      price: 20,
      providerId: provider.id,
    },
    {
      name: 'Limpeza de Carpete',
      description: 'Serviço de limpeza de carpete residencial.',
      price: 50,
      providerId: provider.id,
    },
    {
      name: 'Aulas de Inglês Online',
      description: 'Aulas particulares de inglês via videochamada.',
      price: 15,
      providerId: provider.id,
    },
  ];

  await prisma.service.createMany({
    data: servicesData,
  });

  console.log('Serviços criados com sucesso!');

  console.log('Seed terminado com sucesso!');
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
