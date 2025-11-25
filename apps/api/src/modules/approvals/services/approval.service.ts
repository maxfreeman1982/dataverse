import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval, ApprovalStatus, ApprovalType } from '../entities/approval.entity';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  async createApproval(
    type: ApprovalType,
    entityId: string,
    requestedBy: string,
    metadata?: any,
  ): Promise<Approval> {
    const approval = this.approvalRepository.create({
      type,
      entityId,
      requestedBy,
      metadata,
      status: ApprovalStatus.PENDING,
    });
    return await this.approvalRepository.save(approval);
  }

  async approveRequest(approvalId: string, reviewedBy: string, notes?: string): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval not found');

    approval.status = ApprovalStatus.APPROVED;
    approval.reviewedBy = reviewedBy;
    approval.notes = notes;
    approval.reviewedAt = new Date();

    return await this.approvalRepository.save(approval);
  }

  async rejectRequest(approvalId: string, reviewedBy: string, reason: string): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval not found');

    approval.status = ApprovalStatus.REJECTED;
    approval.reviewedBy = reviewedBy;
    approval.rejectionReason = reason;
    approval.reviewedAt = new Date();

    return await this.approvalRepository.save(approval);
  }

  async getPendingApprovals(type?: ApprovalType): Promise<Approval[]> {
    const where: any = { status: ApprovalStatus.PENDING };
    if (type) where.type = type;
    return await this.approvalRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async getApprovalById(id: string): Promise<Approval> {
    return await this.approvalRepository.findOne({ where: { id } });
  }

  async getApprovalsByEntity(entityId: string): Promise<Approval[]> {
    return await this.approvalRepository.find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
