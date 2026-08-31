import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  /**
   * GET /audit-log/organization
   * Admin-only: returns immutable audit logs for the admin's organization.
   * Read-only — no POST/PATCH/DELETE endpoints exposed.
   */
  @Get('organization')
  @Roles('admin')
  getOrganizationLogs(@Req() req: any) {
    return this.auditLogService.getLogsForOrganization(req.user.organizationId);
  }
}
