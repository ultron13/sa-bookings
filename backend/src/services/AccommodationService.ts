import { AccommodationRepository } from '../repositories/AccommodationRepository';
import { Accommodation } from '../entities/Accommodation';
import { SearchParams } from '../types/interfaces';

export class AccommodationService {
  private repo: AccommodationRepository;

  constructor() {
    this.repo = new AccommodationRepository();
  }

  async getById(id: string): Promise<Accommodation | null> {
    return this.repo.findById(id);
  }

  async getByIdPublic(id: string): Promise<Accommodation | null> {
    return this.repo.findByIdPublic(id);
  }

  async search(params: SearchParams): Promise<{ data: Accommodation[]; total: number; page: number; pageSize: number }> {
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 100);
    const [data, total] = await this.repo.findAll({ ...params, page, pageSize });
    return { data, total, page, pageSize };
  }

  async getByHost(hostId: string, page: number = 1, pageSize: number = 20): Promise<{ data: Accommodation[]; total: number }> {
    const [data, total] = await this.repo.findByHost(hostId, page, pageSize);
    return { data, total };
  }

  async create(data: Partial<Accommodation>): Promise<Accommodation> {
    return this.repo.create(data);
  }

  async update(id: string, hostId: string, data: Partial<Accommodation>): Promise<Accommodation | null> {
    const accommodation = await this.repo.findById(id);
    if (!accommodation) throw new Error('Accommodation not found');
    if (accommodation.hostId !== hostId) throw new Error('Unauthorized');

    return this.repo.update(id, data);
  }

  async delete(id: string, hostId: string): Promise<void> {
    const accommodation = await this.repo.findById(id);
    if (!accommodation) throw new Error('Accommodation not found');
    if (accommodation.hostId !== hostId) throw new Error('Unauthorized');

    await this.repo.softDelete(id);
  }

  async getFeatured(): Promise<Accommodation[]> {
    return this.repo.getFeatured();
  }

  async getProvinceCounts(): Promise<{ province: string; count: number }[]> {
    return this.repo.getProvinceCounts();
  }

  async getSimilar(accommodationId: string, limit: number = 6): Promise<Accommodation[]> {
    return this.repo.getSimilar(accommodationId, limit);
  }

  async getPopular(limit: number = 8): Promise<Accommodation[]> {
    return this.repo.getPopular(limit);
  }
}
