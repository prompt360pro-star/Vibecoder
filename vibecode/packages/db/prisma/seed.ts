// Seed do banco de dados — cria dados iniciais para desenvolvimento
import { PrismaClient, SubscriptionTier, MissionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A semear base de dados...')

  // Criar user de teste
  const testUser = await prisma.user.upsert({
    where: { clerkId: 'user_test_vibecode_001' },
    update: {},
    create: {
      clerkId: 'user_test_vibecode_001',
      email: 'dev@vibecode.app',
      name: 'VibeCode Dev',
      username: 'vibedev',
      currentLevel: 1,
      totalXp: 0,
      streakDays: 0,
      subscriptionTier: SubscriptionTier.PRO,
      locale: 'pt',
      timezone: 'Europe/Lisbon',
      dnaProfile: {
        techRelation: 'curious',
        experience: 'zero',
        codeFeeling: 'excited',
        aiUsage: 'basic',
        buildGoals: ['saas', 'portfolio'],
        learningStyle: 'doing',
        dailyTime: '15-30',
        mainGoal: 'build-product',
        hasComputer: true,
        currentArea: 'business',
      },
      buildGoals: ['saas', 'portfolio'],
    },
  })

  console.log(`✅ User de teste criado: ${testUser.name} (${testUser.email})`)

  // Criar missões iniciais da Ilha Básica — Zona 1: Fundamentos
  const initialMissions = [
    { missionId: 'm01-what-is-vibe-coding', status: MissionStatus.AVAILABLE },
    { missionId: 'm02-meet-vi', status: MissionStatus.LOCKED },
    { missionId: 'm03-first-prompt', status: MissionStatus.LOCKED },
    { missionId: 'm04-anatomy-of-prompt', status: MissionStatus.LOCKED },
    { missionId: 'm05-prompt-patterns', status: MissionStatus.LOCKED },
    { missionId: 'm06-ai-tools-landscape', status: MissionStatus.LOCKED },
    { missionId: 'm07-setup-workspace', status: MissionStatus.LOCKED },
    { missionId: 'm08-html-css-basics', status: MissionStatus.LOCKED },
    { missionId: 'm09-javascript-intro', status: MissionStatus.LOCKED },
    { missionId: 'm10-build-landing-page', status: MissionStatus.LOCKED },
  ]

  for (const mission of initialMissions) {
    await prisma.missionProgress.upsert({
      where: {
        userId_missionId: {
          userId: testUser.id,
          missionId: mission.missionId,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        missionId: mission.missionId,
        status: mission.status,
      },
    })
  }

  console.log(`✅ ${initialMissions.length} missões iniciais criadas`)
  console.log('🎉 Seed completo!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
