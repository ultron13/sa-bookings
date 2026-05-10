import { Repository, Brackets, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Accommodation } from '../entities/Accommodation';
import { SearchParams } from '../types/interfaces';
import { AccommodationType, Province } from '../types/enums';

export class AccommodationRepository {
  private repo: Repository<Accommodation>;

  constructor() {
    this.repo = AppDataSource.getRepository(Accommodation);
  }

  async findById(id: string): Promise<Accommodation | null> {
    return this.repo.findOne({
      where: { id, isActive: true },
      relations: ['host', 'reviews'],
    });
  }

  async findByIdPublic(id: string): Promise<Accommodation | null> {
    return this.repo.findOne({
      where: { id, isActive: true, isAvailable: true },
      relations: ['reviews'],
    });
  }

  async findAll(params: SearchParams): Promise<[Accommodation[], number]> {
    const query = this.repo.createQueryBuilder('acc')
      .where('acc.isActive = :isActive', { isActive: true })
      .andWhere('acc.isAvailable = :isAvailable', { isAvailable: true });

    if (params.province) {
      query.andWhere('acc.province = :province', { province: params.province });
    }

    if (params.type) {
      query.andWhere('acc.type = :type', { type: params.type });
    }

    if (params.minPrice !== undefined) {
      query.andWhere('acc.pricePerNight >= :minPrice', { minPrice: params.minPrice });
    }

    if (params.maxPrice !== undefined) {
      query.andWhere('acc.pricePerNight <= :maxPrice', { maxPrice: params.maxPrice });
    }

    if (params.guests) {
      query.andWhere('acc.maxGuests >= :guests', { guests: params.guests });
    }

    if (params.amenities && params.amenities.length > 0) {
      params.amenities.forEach((amenity, index) => {
        query.andWhere(`acc.amenities LIKE :amenity${index}`, { [`amenity${index}`]: `%${amenity}%` });
      });
    }

    if (params.rating) {
      query.andWhere('acc.averageRating >= :minRating', { minRating: params.rating });
    }

    if ((params as any).query) {
      query.andWhere(
        "to_tsvector('english', acc.name || ' ' || acc.description || ' ' || acc.city) @@ plainto_tsquery('english', :ftsQuery)",
        { ftsQuery: (params as any).query }
      );
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'DESC';
    query.orderBy(`acc.${sortBy}`, sortOrder);

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    query.skip((page - 1) * pageSize).take(pageSize);

    return query.getManyAndCount();
  }

  async findByHost(hostId: string, page: number = 1, pageSize: number = 20): Promise<[Accommodation[], number]> {
    return this.repo.findAndCount({
      where: { hostId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
  }

  async findByProvince(province: Province, page: number = 1, pageSize: number = 20): Promise<[Accommodation[], number]> {
    return this.repo.findAndCount({
      where: { province, isActive: true, isAvailable: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { averageRating: 'DESC' },
    });
  }

  async create(data: Partial<Accommodation>): Promise<Accommodation> {
    const accommodation = this.repo.create(data);
    return this.repo.save(accommodation);
  }

  async update(id: string, data: Partial<Accommodation>): Promise<Accommodation | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }

  async getFeatured(): Promise<Accommodation[]> {
    return this.repo.find({
      where: { isFeatured: true, isActive: true, isAvailable: true },
      take: 10,
      order: { averageRating: 'DESC' },
    });
  }

  async getProvinceCounts(): Promise<{ province: string; count: number }[]> {
    return this.repo.createQueryBuilder('acc')
      .select('acc.province', 'province')
      .addSelect('COUNT(acc.id)', 'count')
      .where('acc.isActive = true')
      .groupBy('acc.province')
      .getRawMany();
  }

  async getSimilar(accommodationId: string, limit: number = 6): Promise<Accommodation[]> {
    const target = await this.repo.findOne({ where: { id: accommodationId } });
    if (!target) return [];
    const price = Number(target.pricePerNight);
    return this.repo.createQueryBuilder('acc')
      .where('acc.id != :id', { id: accommodationId })
      .andWhere('acc.isActive = true AND acc.isAvailable = true')
      .andWhere('acc.province = :province', { province: target.province })
      .andWhere('acc.pricePerNight BETWEEN :min AND :max', { min: price * 0.5, max: price * 2 })
      .orderBy('acc.averageRating', 'DESC')
      .take(limit)
      .getMany();
  }

  async getPopular(limit: number = 8): Promise<Accommodation[]> {
    return this.repo.find({
      where: { isActive: true, isAvailable: true },
      order: { reviewCount: 'DESC', averageRating: 'DESC' },
      take: limit,
    });
  }

  async updateRating(id: string): Promise<void> {
    const result = await this.repo.createQueryBuilder('acc')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .leftJoin('acc.reviews', 'review')
      .where('acc.id = :id', { id })
      .getRawOne();

    if (result) {
      await this.repo.update(id, {
        averageRating: parseFloat(result.avg) || 0,
        reviewCount: parseInt(result.count) || 0,
      });
    }
  }
}
