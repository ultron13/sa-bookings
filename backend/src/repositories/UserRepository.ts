import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export class UserRepository {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, select: ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'phone', 'isActive'] });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email }, select: ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'phone', 'isActive'] });
  }

  async findAll(page: number = 1, pageSize: number = 20): Promise<[User[], number]> {
    return this.repo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }

  async countByRole(role: string): Promise<number> {
    return this.repo.count({ where: { role: role as any } });
  }
}
