import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { JwtPayload } from '../types/interfaces';
import { UserRole } from '../types/enums';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword,
      role: data.role || UserRole.TOURIST,
    });

    const tokens = this.generateTokens(user);
    await this.userRepo.update(user.id, { refreshToken: tokens.refreshToken });

    const { password, refreshToken, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, ...tokens };
  }

  async login(email: string, password: string): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmailWithPassword(email);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    await this.userRepo.update(user.id, { refreshToken: tokens.refreshToken });

    const { password: _, refreshToken: _r, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, ...tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      const user = await this.userRepo.findById(decoded.userId);
      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      await this.userRepo.update(user.id, { refreshToken: tokens.refreshToken });
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshToken: '' });
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    return this.userRepo.update(userId, updateData);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findByIdWithPassword(userId);
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(userId, { password: hashedPassword } as any);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any,
      } as SignOptions),
      refreshToken: jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn as any,
      } as SignOptions),
    };
  }
}
