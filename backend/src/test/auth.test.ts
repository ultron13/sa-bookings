import { AuthService } from '../services/AuthService';

// Shared mock implementations that all UserRepository instances will use
const mockFindByEmail = jest.fn();
const mockFindByEmailWithPassword = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdWithPassword = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindAll = jest.fn();
const mockCountByRole = jest.fn();

jest.mock('../repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: mockFindByEmail,
    findByEmailWithPassword: mockFindByEmailWithPassword,
    findById: mockFindById,
    findByIdWithPassword: mockFindByIdWithPassword,
    create: mockCreate,
    update: mockUpdate,
    findAll: mockFindAll,
    countByRole: mockCountByRole,
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockCreate.mockImplementation(async (data: any) => ({
        id: 'new-user-1',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: 'tourist',
        isActive: true,
      }));
      mockUpdate.mockResolvedValue(undefined);

      const result = await authService.register({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'SecurePass123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toHaveProperty('email', 'jane@example.com');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.role).toBe('tourist');
    });

    it('should throw error for duplicate email', async () => {
      mockFindByEmail.mockResolvedValue({ id: 'existing', email: 'dup@example.com' });

      await expect(
        authService.register({
          firstName: 'Dup',
          lastName: 'User',
          email: 'dup@example.com',
          password: 'SecurePass123',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('SecurePass123', 12);

      mockFindByEmailWithPassword.mockResolvedValue({
        id: 'login-user',
        firstName: 'Login',
        lastName: 'User',
        email: 'login@example.com',
        password: hashedPassword,
        role: 'tourist',
        isActive: true,
        phone: '',
        refreshToken: '',
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await authService.login('login@example.com', 'SecurePass123');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw error for non-existent user', async () => {
      mockFindByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'anypass')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('correctpass', 12);

      mockFindByEmailWithPassword.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'tourist',
        isActive: true,
      });

      await expect(
        authService.login('user@example.com', 'wrongpass')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const jwt = require('jsonwebtoken');
      const validRefreshToken = jwt.sign(
        { userId: 'refresh-user', email: 'refresh@example.com', role: 'tourist' },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change',
        { expiresIn: '30d' }
      );

      mockFindById.mockResolvedValue({
        id: 'refresh-user',
        email: 'refresh@example.com',
        role: 'tourist',
        isActive: true,
        refreshToken: validRefreshToken,
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await authService.refreshAccessToken(validRefreshToken);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken('invalid-token')
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      mockUpdate.mockResolvedValue({ id: 'user-1' });
      await authService.logout('user-1');
      expect(mockUpdate).toHaveBeenCalledWith('user-1', { refreshToken: '' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockFindById.mockResolvedValue({
        id: 'profile-user',
        firstName: 'Profile',
        lastName: 'User',
        email: 'profile@example.com',
        role: 'tourist',
      });

      const profile = await authService.getProfile('profile-user');
      expect(profile).not.toBeNull();
      expect(profile!.email).toBe('profile@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile fields', async () => {
      mockUpdate.mockResolvedValue({
        id: 'update-user',
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+27000000000',
      });

      const updated = await authService.updateProfile('update-user', {
        firstName: 'Updated',
        phone: '+27000000000',
      });

      expect(updated).not.toBeNull();
      expect(updated!.firstName).toBe('Updated');
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      const bcrypt = require('bcryptjs');
      const currentHash = await bcrypt.hash('CurrentPass123', 12);

      mockFindByIdWithPassword.mockResolvedValue({
        id: 'pw-user',
        password: currentHash,
      });
      mockUpdate.mockResolvedValue(undefined);

      await expect(
        authService.changePassword('pw-user', 'CurrentPass123', 'NewPass456')
      ).resolves.not.toThrow();
    });

    it('should throw error with invalid current password', async () => {
      const bcrypt = require('bcryptjs');
      const currentHash = await bcrypt.hash('realpass', 12);

      mockFindByIdWithPassword.mockResolvedValue({
        id: 'pw-user',
        password: currentHash,
      });

      await expect(
        authService.changePassword('pw-user', 'wrongpass', 'newpass')
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
