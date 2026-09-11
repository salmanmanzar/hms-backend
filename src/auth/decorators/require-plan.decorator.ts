import { SetMetadata } from '@nestjs/common';

export type SubscriptionPlanTier = 'basic' | 'professional' | 'enterprise';

export const REQUIRE_PLAN_KEY = 'requiredPlan';

export const RequirePlan = (plan: SubscriptionPlanTier) =>
  SetMetadata(REQUIRE_PLAN_KEY, plan);
