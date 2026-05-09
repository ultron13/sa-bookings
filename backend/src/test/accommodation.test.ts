import { AccommodationService } from '../services/AccommodationService';

const store: { accommodations: Record<string, any> } = { accommodations: {} };

jest.mock('../repositories/AccommodationRepository', () => ({
  AccommodationRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockImplementation(async (id: string) => store.accommodations[id] || null),
    findByIdPublic: jest.fn().mockImplementation(async (id: string) => store.accommodations[id] || null),
    findAll: jest.fn().mockImplementation(async (params: any) => {
      let results = Object.values(store.accommodations).filter((a: any) => a.isActive);
      if (params.province) {
        results = results.filter((a: any) => a.province === params.province);
      }
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const paginated = results.slice((page - 1) * pageSize, page * pageSize);
      return [paginated, results.length];
    }),
    findByHost: jest.fn().mockImplementation(async (hostId: string, page: number = 1, pageSize: number = 20) => {
      const hostAccs = Object.values(store.accommodations).filter((a: any) => a.hostId === hostId);
      return [hostAccs, hostAccs.length];
    }),
    create: jest.fn().mockImplementation(async (data: any) => {
      const acc = { id: `acc-${Date.now()}-${Math.random()}`, averageRating: 0, reviewCount: 0, isActive: true, isAvailable: true, ...data };
      store.accommodations[acc.id] = acc;
      return acc;
    }),
    update: jest.fn().mockImplementation(async (id: string, data: any) => {
      if (store.accommodations[id]) store.accommodations[id] = { ...store.accommodations[id], ...data };
      return store.accommodations[id] || null;
    }),
    softDelete: jest.fn().mockImplementation(async (id: string) => {
      if (store.accommodations[id]) store.accommodations[id].isActive = false;
    }),
    getFeatured: jest.fn().mockResolvedValue([
      { id: 'featured-1', name: 'Featured Lodge', isFeatured: true },
      { id: 'featured-2', name: 'Featured Villa', isFeatured: true },
    ]),
    getProvinceCounts: jest.fn().mockResolvedValue([
      { province: 'Western Cape', count: 5 },
      { province: 'Gauteng', count: 3 },
    ]),
    updateRating: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('AccommodationService', () => {
  let accommodationService: AccommodationService;

  beforeEach(() => {
    accommodationService = new AccommodationService();
    store.accommodations = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleAccommodation: Record<string, any> = {
    name: 'Mountain Lodge',
    description: 'Beautiful mountain views',
    type: 'lodge',
    province: 'Western Cape',
    city: 'Cape Town',
    address: '123 Mountain Rd',
    latitude: -33.9628,
    longitude: 18.4108,
    pricePerNight: 2500,
    cleaningFee: 300,
    serviceFee: 250,
    maxGuests: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    amenities: ['wifi', 'pool', 'parking'],
    images: [],
    hostId: 'host-123',
    cancellationPolicy: {
      type: 'flexible',
      description: 'Free cancellation',
      refundPercentage: 100,
    },
  };

  describe('create', () => {
    it('should create a new accommodation', async () => {
      const acc = await accommodationService.create(sampleAccommodation);
      expect(acc).toHaveProperty('id');
      expect(acc.name).toBe('Mountain Lodge');
      expect(acc.hostId).toBe('host-123');
    });
  });

  describe('getById', () => {
    it('should return null for non-existent accommodation', async () => {
      const result = await accommodationService.getById('non-existent');
      expect(result).toBeNull();
    });

    it('should return accommodation by id', async () => {
      const created = await accommodationService.create(sampleAccommodation);
      const found = await accommodationService.getById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });
  });

  describe('getByIdPublic', () => {
    it('should return public accommodation data', async () => {
      const created = await accommodationService.create(sampleAccommodation);
      const found = await accommodationService.getByIdPublic(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent public accommodation', async () => {
      const result = await accommodationService.getByIdPublic('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should return paginated results', async () => {
      await accommodationService.create(sampleAccommodation);
      await accommodationService.create({ ...sampleAccommodation, name: 'Beach House', pricePerNight: 3500 });

      const results = await accommodationService.search({ page: 1, pageSize: 10 });
      expect(results.data).toHaveLength(2);
      expect(results.total).toBe(2);
    });

    it('should filter by province', async () => {
      await accommodationService.create(sampleAccommodation);
      await accommodationService.create({ ...sampleAccommodation, name: 'Joburg Pad', province: 'Gauteng' as any, hostId: 'host-123' });

      const westernCape = await accommodationService.search({ province: 'Western Cape' });
      expect(westernCape.data).toHaveLength(1);
      expect(westernCape.data[0].province).toBe('Western Cape');

      const gauteng = await accommodationService.search({ province: 'Gauteng' });
      expect(gauteng.data).toHaveLength(1);
      expect(gauteng.data[0].province).toBe('Gauteng');
    });
  });

  describe('getByHost', () => {
    it('should return accommodations for a specific host', async () => {
      await accommodationService.create(sampleAccommodation);
      await accommodationService.create({ ...sampleAccommodation, name: 'Second Place', hostId: 'host-123' });

      const result = await accommodationService.getByHost('host-123');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update accommodation owned by the host', async () => {
      const created = await accommodationService.create(sampleAccommodation);
      const updated = await accommodationService.update(created.id, 'host-123', { pricePerNight: 3000 });
      expect(updated!.pricePerNight).toBe(3000);
    });

    it('should throw error when host does not own the accommodation', async () => {
      const created = await accommodationService.create(sampleAccommodation);
      await expect(
        accommodationService.update(created.id, 'other-host', { pricePerNight: 3000 })
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error for non-existent accommodation', async () => {
      await expect(
        accommodationService.update('non-existent', 'host-123', { pricePerNight: 3000 })
      ).rejects.toThrow('Accommodation not found');
    });
  });

  describe('delete', () => {
    it('should soft delete accommodation owned by the host', async () => {
      const created = await accommodationService.create(sampleAccommodation);
      await accommodationService.delete(created.id, 'host-123');
    });

    it('should throw error when host does not own the accommodation', async () => {
      const created = await accommodationService.create(sampleAccommodation);
      await expect(
        accommodationService.delete(created.id, 'other-host')
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error for non-existent accommodation', async () => {
      await expect(
        accommodationService.delete('non-existent', 'host-123')
      ).rejects.toThrow('Accommodation not found');
    });
  });

  describe('getFeatured', () => {
    it('should return featured accommodations', async () => {
      const featured = await accommodationService.getFeatured();
      expect(featured).toHaveLength(2);
      expect(featured[0]).toHaveProperty('isFeatured', true);
    });
  });

  describe('getProvinceCounts', () => {
    it('should return counts by province', async () => {
      const counts = await accommodationService.getProvinceCounts();
      expect(counts).toHaveLength(2);
      expect(counts[0]).toHaveProperty('province');
      expect(counts[0]).toHaveProperty('count');
    });
  });
});
