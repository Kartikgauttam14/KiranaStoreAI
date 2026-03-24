import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userPhone?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userPhone = decoded.phone;
    next();
  } catch (error: any) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'STORE_OWNER') {
    return res.status(403).json({ success: false, error: 'Store owner access required' });
  }
  next();
};

export const requireCustomer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'CUSTOMER') {
    return res.status(403).json({ success: false, error: 'Customer access required' });
  }
  next();
};
