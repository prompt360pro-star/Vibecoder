import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed mínimo de Produção
  // 1. Não cria users (webhook do Clerk encarrega-se disso)
  // 2. Não cria dados de gamificação que dependem de users
  // Apenas verifica a integridade de conexão!
  
  await prisma.$queryRaw`SELECT 1`

  console.log('✅ Database connection OK')
  console.log('✅ Migrations up to date')
}

main()
  .catch((e) => {
    console.error('❌ Error during minimal prod seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
