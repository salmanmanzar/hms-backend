import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  organizationId: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  targetId?: string;
  targetName?: string;
  targetRole?: string;
  action: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Append a new immutable audit log entry.
   * There is intentionally NO update or delete method.
   */
  async log(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({ data });
  }

  /**
   * Retrieve all audit logs for a specific organization, newest first.
   */
  async getLogsForOrganization(organizationId: string) {
    return this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
