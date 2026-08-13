import { PrismaClient } from '@prisma/client';
import { FEATURE_CODES, PLAN_CODES } from '@aarambh360/types';

export async function seedSubscriptionPlans(prisma: PrismaClient): Promise<void> {
  const features = [
    {
      code: FEATURE_CODES.MAINS_EVAL,
      name: 'Mains AI Evaluation',
      description: 'Server-side Mains answer evaluation quota',
    },
    {
      code: FEATURE_CODES.REMOVE_ADS,
      name: 'Ad-free Experience',
      description: 'Remove banner ads from the app',
    },
  ];

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      create: feature,
      update: { name: feature.name, description: feature.description },
    });
  }

  const mainsEval = await prisma.feature.findUniqueOrThrow({
    where: { code: FEATURE_CODES.MAINS_EVAL },
  });
  const removeAds = await prisma.feature.findUniqueOrThrow({
    where: { code: FEATURE_CODES.REMOVE_ADS },
  });

  const plans = [
    {
      code: PLAN_CODES.FREE,
      name: 'Free',
      description: 'Limited Mains evaluations with ads',
      priceInPaise: 0,
      billingPeriod: 'weekly',
      sortOrder: 0,
      features: [{ featureId: mainsEval.id, quota: 1, unlimited: false }],
    },
    {
      code: PLAN_CODES.PLUS,
      name: 'Plus',
      description: 'More Mains evaluations each month',
      priceInPaise: 19900,
      billingPeriod: 'monthly',
      sortOrder: 1,
      features: [{ featureId: mainsEval.id, quota: 5, unlimited: false }],
    },
    {
      code: PLAN_CODES.PREMIUM,
      name: 'Premium',
      description: 'Unlimited evaluations and ad-free experience',
      priceInPaise: 49900,
      billingPeriod: 'monthly',
      sortOrder: 2,
      features: [
        { featureId: mainsEval.id, quota: null, unlimited: true },
        { featureId: removeAds.id, quota: null, unlimited: true },
      ],
    },
  ];

  for (const plan of plans) {
    const saved = await prisma.plan.upsert({
      where: { code: plan.code },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        priceInPaise: plan.priceInPaise,
        billingPeriod: plan.billingPeriod,
        sortOrder: plan.sortOrder,
      },
      update: {
        name: plan.name,
        description: plan.description,
        priceInPaise: plan.priceInPaise,
        billingPeriod: plan.billingPeriod,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
    });

    const featureIds = plan.features.map((feature) => feature.featureId);
    await prisma.planFeature.deleteMany({
      where: {
        planId: saved.id,
        featureId: { notIn: featureIds },
      },
    });

    for (const feature of plan.features) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureId: {
            planId: saved.id,
            featureId: feature.featureId,
          },
        },
        create: {
          planId: saved.id,
          featureId: feature.featureId,
          quota: feature.quota,
          unlimited: feature.unlimited,
        },
        update: {
          quota: feature.quota,
          unlimited: feature.unlimited,
        },
      });
    }
  }
}
