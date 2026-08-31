import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('organization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  @Get('pending')
  @Roles('super_admin')
  findPending() {
    return this.organizationService.findPending();
  }

  @Get('approved')
  findApproved() {
    return this.organizationService.findApproved();
  }

  @Patch(':id/approve')
  @Roles('super_admin')
  approve(@Param('id') id: string) {
    return this.organizationService.approve(id);
  }

  @Patch(':id/reject')
  @Roles('super_admin')
  reject(@Param('id') id: string) {
    return this.organizationService.reject(id);
  }
}