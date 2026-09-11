import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_PLAN_KEY, SubscriptionPlanTier } from '../decorators/require-plan.decorator';

const PLAN_LEVELS: Record<SubscriptionPlanTier, number> = {
  basic: 1,
  professional: 2,
  enterprise: 3,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<SubscriptionPlanTier>(
      REQUIRE_PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific plan requirement set on route, grant access
    if (!requiredPlan) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin or users without org binding bypass (or handle appropriately)
    if (!user || user.role === 'superadmin') {
      return true;
    }

    if (!user.organizationId) {
      throw new ForbiddenException(
        'User is not associated with an organization.',
      );
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    });

    if (!organization) {
      throw new ForbiddenException('Organization not found.');
    }

    const orgPlan = (organization.subscriptionPlan?.toLowerCase() ||
      'basic') as SubscriptionPlanTier;
    const currentLevel = PLAN_LEVELS[orgPlan] || 1;
    const requiredLevel = PLAN_LEVELS[requiredPlan] || 1;

    if (currentLevel < requiredLevel) {
      throw new ForbiddenException(
        `This feature requires the '${requiredPlan.toUpperCase()}' subscription plan. Your organization is currently on '${orgPlan.toUpperCase()}'.`,
      );
    }

    return true;
  }
}
