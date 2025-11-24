import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InvestorType } from '../entities/investor.entity';

@Injectable()
export class OjAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const investor = req.investor;
    if (!investor) {
      throw new ForbiddenException('Accès non autorisé');
    }

    // Only HOLDING type investors can access admin functions
    if (investor.investorType !== InvestorType.HOLDING) {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    return true;
  }
}
