// apps/backend/src/common/dev-auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class DevAuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.user = {
      user_id: '00000000-0000-0000-0000-000000000002',
      org_id: '00000000-0000-0000-0000-000000000001',
    };
    next();
  }
}