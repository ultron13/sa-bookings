import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Review } from '../entities/Review';

export class ReviewRepository {
  private repo: Repository<Review>;

  constructor() {
    this.repo = AppDataSource.getRepository(Review);
  }

  async findById(id: string): Promise<Review | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'accommodation'],
    });
  }

  async findByAccommodation(accommodationId: string, page: number = 1, pageSize: number = 20): Promise<[Review[], number]> {
    return this.repo.findAndCount({
      where: { accommodationId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findByUser(userId: string, page: number = 1, pageSize: number = 20): Promise<[Review[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['accommodation'],
    });
  }

  async findExisting(userId: string, accommodationId: string): Promise<Review | null> {
    return this.repo.findOne({ where: { userId, accommodationId } });
  }

  async create(data: Partial<Review>): Promise<Review> {
    const review = this.repo.create(data);
    return this.repo.save(review);
  }

  async update(id: string, data: Partial<Review>): Promise<Review | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getAverageRating(accommodationId: string): Promise<number> {
    const result = await this.repo.createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.accommodationId = :accommodationId', { accommodationId })
      .getRawOne();
    return parseFloat(result?.avg || '0');
  }
}
