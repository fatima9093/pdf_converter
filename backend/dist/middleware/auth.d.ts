import { Request, Response, NextFunction } from 'express';
import { Role } from '../lib/auth';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: Role;
    };
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (roles: Role[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const userOnly: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const adminOrUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map