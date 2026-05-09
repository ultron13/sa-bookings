import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../types/enums';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email, password, phone, role } = req.body;
      const result = await authService.register({ firstName, lastName, email, password, phone, role });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshAccessToken(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }
}
